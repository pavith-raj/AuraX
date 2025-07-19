const express = require('express');
const multer = require('multer');
const canvas = require('canvas');
const faceapi = require('face-api.js');
const path = require('path');

const app = express();
const upload = multer();
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_URL = path.join(__dirname, 'models');

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.ageGenderNet.loadFromDisk(MODEL_URL);
}
loadModels();

function getFaceShape(landmarks) {
  // Indices for 68-point model
  const jaw_left = landmarks[0];
  const jaw_right = landmarks[16];
  const chin = landmarks[8];
  const cheek_left = landmarks[3];
  const cheek_right = landmarks[13];
  const forehead_left = landmarks[19];
  const forehead_right = landmarks[24];
  const forehead_top = landmarks[27];

  function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  const jaw_width = dist(jaw_left, jaw_right);
  const cheekbone_width = dist(cheek_left, cheek_right);
  const forehead_width = dist(forehead_left, forehead_right);
  const face_length = dist(forehead_top, chin);

  const length_to_width = face_length / cheekbone_width;
  const jaw_to_cheek = jaw_width / cheekbone_width;
  const forehead_to_cheek = forehead_width / cheekbone_width;

  if (length_to_width > 1.5 && Math.abs(jaw_to_cheek - 1) < 0.15 && Math.abs(forehead_to_cheek - 1) < 0.15) {
    return 'oval';
  } else if (length_to_width < 1.3 && Math.abs(jaw_to_cheek - 1) < 0.15 && Math.abs(forehead_to_cheek - 1) < 0.15) {
    return 'round';
  } else if (Math.abs(jaw_to_cheek - 1.1) < 0.1 && Math.abs(forehead_to_cheek - 1) < 0.15) {
    return 'square';
  } else if (forehead_to_cheek > 1.08 && jaw_to_cheek < 0.95) {
    return 'heart';
  } else if (cheekbone_width > jaw_width && cheekbone_width > forehead_width) {
    return 'diamond';
  } else {
    return 'oval';
  }
}

app.post('/api/face-analysis', upload.single('file'), async (req, res) => {
  try {
    const img = await canvas.loadImage(req.file.buffer);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withAgeAndGender();

    if (!detection) {
      return res.json({ faceShape: 'unknown', gender: 'unknown', error: 'No face detected', source: 'node' });
    }

    const landmarks = detection.landmarks.positions;
    const faceShape = getFaceShape(landmarks);
    const gender = detection.gender === 'male' ? 'male' : 'female';

    res.json({ faceShape, gender, source: 'node' });
  } catch (err) {
    res.json({ faceShape: 'unknown', gender: 'unknown', error: err.message, source: 'node' });
  }
});

app.listen(8000, () => console.log('Face analysis server running on port 8000')); 
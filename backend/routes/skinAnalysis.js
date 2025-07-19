const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

const upload = multer();

// ... existing skin analysis routes ...

// Hairstyle generation forwarding route
router.post('/generate-hairstyle', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('prompt', req.body.prompt);

    const response = await axios.post(
      'http://localhost:8001/generate-hairstyle',
      formData,
      { headers: formData.getHeaders() }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Error forwarding to Python API:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to generate hairstyle.' });
  }
});

module.exports = router; 
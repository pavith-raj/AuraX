const express = require('express');
const multer = require('multer');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');

const upload = multer();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Forward request to Python FastAPI backend (now in HairCLIP directory)
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    
    if (req.body.prompt) {
      formData.append('hairstyle_description', req.body.prompt);
    }
    
    if (req.body.color_description) {
      formData.append('color_description', req.body.color_description);
    }

    const pythonResponse = await axios.post('http://localhost:8001/generate-hairstyle', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });

    // Return the Python backend response
    res.json({
      status: 'success',
      generated_image: pythonResponse.data.generated_image,
      hairstyle_description: pythonResponse.data.hairstyle_description,
      color_description: pythonResponse.data.color_description,
      message: pythonResponse.data.message,
    });

  } catch (error) {
    console.error('Hairstyle generation error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate hairstyle preview',
      error: error.message,
    });
  }
});

module.exports = router; 
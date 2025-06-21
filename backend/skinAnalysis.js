const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Map AI predictions to skin types for product recommendations
const predictionToSkinType = {
  acne: 'oily', // Acne is often associated with oily skin
  bags: 'sensitive', // Under-eye bags can be a sign of sensitivity
  redness: 'sensitive', // Redness is a classic sign of sensitive skin
};

// Load the new, structured product recommendations
let productsBySkinType = {};
try {
  const recommendationsPath = path.join(__dirname, 'products.json'); // Updated path
  if (fs.existsSync(recommendationsPath)) {
    productsBySkinType = JSON.parse(fs.readFileSync(recommendationsPath, 'utf8'));
  } else {
    console.error('products.json not found!');
  }
} catch (error) {
  console.error('Error loading product recommendations:', error);
}

// Correctly define paths at the root level of the backend
const backendRoot = path.join(__dirname, '..'); // This should be the 'backend' directory
const projectRoot = path.join(backendRoot, '..'); // This should be the 'FinalProject' directory

const modelPath = path.join(projectRoot, 'skin_disease_model_simple.pkl');
const scalerPath = path.join(projectRoot, 'skin_disease_scaler.pkl');
const mappingPath = path.join(projectRoot, 'class_mapping_simple.json');

// Python script for inference (modified to accept paths as arguments)
const inferenceScript = `
import sys
import os
import numpy as np
import cv2
import joblib
import json

def extract_features(image_path, img_size=(64, 64)):
    """Extract features from an image"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
            
        img = cv2.resize(img, img_size)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        features = []
        
        # Color features
        features.extend(np.mean(img, axis=(0, 1)))
        
        # Texture features
        features.extend(np.std(img, axis=(0, 1)))
        
        # Histogram features
        for i in range(3):
            hist = cv2.calcHist([img], [i], None, [8], [0, 256])
            features.extend(hist.flatten())
        
        # Edge features
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        features.append(np.sum(edges > 0) / (img_size[0] * img_size[1]))
        
        # Additional texture features
        features.append(np.std(gray))
        features.append(np.mean(gray))
        
        return np.array(features)
        
    except Exception as e:
        print(f"Error processing image: {e}", file=sys.stderr)
        return None

def predict_skin_condition(image_path, model_path, scaler_path, mapping_path):
    """Predict skin condition from image"""
    try:
        if not all(os.path.exists(p) for p in [model_path, scaler_path, mapping_path]):
            return {"error": f"Model files not found. Checked: {model_path}, {scaler_path}, {mapping_path}"}
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        with open(mapping_path, 'r') as f:
            class_mapping = json.load(f)
        
        # Extract features
        features = extract_features(image_path)
        if features is None:
            return {"error": "Could not extract features from image"}
        
        # Scale features
        features_scaled = scaler.transform([features])
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        # Get confidence scores
        confidence_scores = {}
        for i, class_name in enumerate(class_mapping['classes']):
            confidence_scores[class_name] = float(probabilities[i])
        
        return {
            "prediction": prediction,
            "confidence_scores": confidence_scores,
            "success": True
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(json.dumps({"error": "Usage: python script.py <image_path> <model_path> <scaler_path> <mapping_path>"}))
        sys.exit(1)
    
    image_path, model_path, scaler_path, mapping_path = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    result = predict_skin_condition(image_path, model_path, scaler_path, mapping_path)
    print(json.dumps(result))
`;

// Save the inference script
const scriptPath = path.join(__dirname, '../inference_script.py');
fs.writeFileSync(scriptPath, inferenceScript);

// Route to analyze skin condition
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    
    // Run Python inference script with absolute paths as arguments
    const pythonProcess = spawn('py', [
      scriptPath, 
      imagePath,
      modelPath,
      scalerPath,
      mappingPath
    ]);
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up uploaded file
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Error deleting uploaded file:', err);
      }
      
      if (code !== 0) {
        console.error('Python script error:', error);
        return res.status(500).json({ error: 'Analysis failed' });
      }
      
      try {
        const analysisResult = JSON.parse(result);
        
        if (analysisResult.error) {
          return res.status(500).json({ error: analysisResult.error });
        }
        
        // Get product recommendations using the new logic
        const predictedCondition = analysisResult.prediction;
        const targetSkinType = predictionToSkinType[predictedCondition];
        const recommendations = productsBySkinType[targetSkinType] || [];
        
        res.json({
          success: true,
          prediction: analysisResult.prediction,
          confidence_scores: analysisResult.confidence_scores,
          recommendations: { [targetSkinType]: recommendations.slice(0, 5) } // Send top 5 recommendations
        });
        
      } catch (parseError) {
        console.error('Error parsing Python output:', parseError);
        res.status(500).json({ error: 'Invalid analysis result' });
      }
    });
    
  } catch (error) {
    console.error('Skin analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get product recommendations by condition
router.get('/recommendations/:condition', (req, res) => {
  try {
    const condition = req.params.condition.toLowerCase();
    const targetSkinType = predictionToSkinType[condition];
    const recommendations = productsBySkinType[targetSkinType] || [];
    
    res.json({
      success: true,
      condition: condition,
      recommendations: { [targetSkinType]: recommendations.slice(0, 5) } // Send top 5
    });
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get refined recommendations based on a keyword
router.get('/recommendations/refined/:keyword', (req, res) => {
  try {
    const keyword = req.params.keyword.toLowerCase();
    const allProducts = [...productsBySkinType.oily, ...productsBySkinType.sensitive, ...productsBySkinType.normal, ...productsBySkinType.dry, ...productsBySkinType.combination];
    
    const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.name, p])).values());

    const filteredProducts = uniqueProducts.filter(product => 
      product.name.toLowerCase().includes(keyword) || 
      product.description.toLowerCase().includes(keyword)
    );

    res.json({
      success: true,
      condition: req.params.keyword,
      recommendations: { [req.params.keyword]: filteredProducts.slice(0, 10) } // Send top 10 refined
    });

  } catch (error) {
    console.error('Error getting refined recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get all available conditions
router.get('/conditions', (req, res) => {
  try {
    const conditions = Object.keys(predictionToSkinType);
    
    res.json({
      success: true,
      conditions: conditions
    });
    
  } catch (error) {
    console.error('Error getting conditions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
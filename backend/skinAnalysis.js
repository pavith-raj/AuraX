const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const axios = require('axios');

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

// Updated mapping for the new model's 5 skin conditions
const predictionToSkinType = {
  'Acne': 'oily', // Acne is often associated with oily skin
  'Actinic Keratosis': 'sensitive', // Sun damage, sensitive skin
  'Basal Cell Carcinoma': 'sensitive', // Skin cancer, requires medical attention
  'Eczemaa': 'sensitive', // Eczema is a sensitive skin condition
  'Rosacea': 'sensitive', // Rosacea is a sensitive skin condition
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

// Updated paths to point to the correct model files
const projectRoot = path.join(__dirname, '..', '..'); // This should be the 'FinalProject' directory
const modelPath = path.join(projectRoot, 'skin_disease_model_simple.pkl');
const scalerPath = path.join(projectRoot, 'skin_disease_scaler.pkl');
const mappingPath = path.join(projectRoot, 'class_mapping_simple.json');

// Path to acne severity model files
const acneModelPath = path.join(projectRoot, 'acne_severity_model.pkl');
const acneScalerPath = path.join(projectRoot, 'acne_severity_scaler.pkl');
const acneMappingPath = path.join(projectRoot, 'acne_severity_mapping.json');

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

// Python script for acne severity inference
const acneSeverityScript = `
import sys
import os
import numpy as np
import cv2
import joblib
import json

def extract_features(image_path, img_size=(64, 64)):
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
        img = cv2.resize(img, img_size)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        features = []
        features.extend(np.mean(img, axis=(0, 1)))
        features.extend(np.std(img, axis=(0, 1)))
        for i in range(3):
            hist = cv2.calcHist([img], [i], None, [8], [0, 256])
            features.extend(hist.flatten())
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        features.append(np.sum(edges > 0) / (img_size[0] * img_size[1]))
        features.append(np.std(gray))
        features.append(np.mean(gray))
        hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
        red_mask = cv2.inRange(hsv, (0, 50, 50), (10, 255, 255))
        red_ratio = np.sum(red_mask > 0) / (img_size[0] * img_size[1])
        features.append(red_ratio)
        features.append(np.std(gray))
        return np.array(features)
    except Exception as e:
        print(f"Error processing image: {e}", file=sys.stderr)
        return None

def predict_acne_severity(image_path, model_path, scaler_path, mapping_path):
    try:
        if not all(os.path.exists(p) for p in [model_path, scaler_path, mapping_path]):
            return {"error": f"Model files not found. Checked: {model_path}, {scaler_path}, {mapping_path}"}
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        with open(mapping_path, 'r') as f:
            mapping = json.load(f)
        features = extract_features(image_path)
        if features is None:
            return {"error": "Could not extract features from image"}
        features_scaled = scaler.transform([features])
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        confidence_scores = {}
        for i, class_name in enumerate(model.classes_):
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
    result = predict_acne_severity(image_path, model_path, scaler_path, mapping_path)
    print(json.dumps(result))
`;

const acneScriptPath = path.join(__dirname, '../inference_acne_severity.py');
fs.writeFileSync(acneScriptPath, acneSeverityScript);

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
    
    pythonProcess.on('close', async (code) => {
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
        
        // Label correction for known typos
        const labelCorrectionMap = { 'Eczemaa': 'Eczema' };
        const correctedPrediction = labelCorrectionMap[analysisResult.prediction] || analysisResult.prediction;
        let realProducts = await fetchWalmartProducts(correctedPrediction);
        if (!realProducts || realProducts.length === 0) {
          realProducts = await fetchWalmartProducts('skincare');
        }
        
        // Enhanced skin problem detection
        const detectedProblems = [];
        if (correctedPrediction) {
          detectedProblems.push(correctedPrediction);
        }
        if (correctedPrediction === 'Acne') {
          detectedProblems.push('Pimples', 'Blackheads', 'Whiteheads', 'Oiliness');
        } else if (correctedPrediction === 'Eczema') {
          detectedProblems.push('Dryness', 'Irritation', 'Redness', 'Flaking');
        } else if (correctedPrediction === 'Rosacea') {
          detectedProblems.push('Redness', 'Sensitivity', 'Visible Blood Vessels');
        } else if (correctedPrediction === 'Actinic Keratosis') {
          detectedProblems.push('Sun Damage', 'Rough Patches', 'Pre-cancerous Lesions');
        } else if (correctedPrediction === 'Basal Cell Carcinoma') {
          detectedProblems.push('Skin Cancer', 'Medical Attention Required');
        }
        
        res.json({
          success: true,
          prediction: correctedPrediction,
          confidence_scores: analysisResult.confidence_scores,
          skin_type: predictionToSkinType[correctedPrediction] || 'sensitive',
          detected_problems: detectedProblems,
          recommendations: { [correctedPrediction]: realProducts.slice(0, 6) }
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
    const condition = req.params.condition;
    const realProducts = getProductsForCondition(condition);
    
    res.json({
      success: true,
      condition: condition,
      skin_type: predictionToSkinType[condition] || 'sensitive',
      recommendations: { [condition]: realProducts.slice(0, 6) } // Send top 6 real products
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
    const allProducts = [...loadSkincareProducts(), ...loadMPProducts()];
    
    const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.name, p])).values());

    const filteredProducts = uniqueProducts.filter(product => 
      product.name.toLowerCase().includes(keyword) || 
      (product.description && product.description.toLowerCase().includes(keyword)) ||
      (product.effects && product.effects.toLowerCase().includes(keyword))
    );

    res.json({
      success: true,
      condition: req.params.keyword,
      recommendations: { [req.params.keyword]: filteredProducts.slice(0, 10) } // Send top 10 refined real products
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

// Route to analyze acne severity
router.post('/acne-grade', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const imagePath = req.file.path;
    // Run Python inference script with absolute paths as arguments
    const pythonProcess = spawn('py', [
      acneScriptPath,
      imagePath,
      acneModelPath,
      acneScalerPath,
      acneMappingPath
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
        return res.status(500).json({ error: 'Acne severity analysis failed' });
      }
      try {
        const analysisResult = JSON.parse(result);
        if (analysisResult.error) {
          return res.status(500).json({ error: analysisResult.error });
        }
        res.json({
          success: true,
          severity: analysisResult.prediction,
          confidence_scores: analysisResult.confidence_scores
        });
      } catch (parseError) {
        console.error('Error parsing Python output:', parseError);
        res.status(500).json({ error: 'Invalid acne severity result' });
      }
    });
  } catch (error) {
    console.error('Acne severity analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Map skin conditions to Walmart search terms
const walmartSearchTerms = {
  'Acne': 'acne cleanser',
  'Eczema': 'eczema moisturizer',
  'Rosacea': 'rosacea cream',
  'Actinic Keratosis': 'sunscreen',
  'Basal Cell Carcinoma': 'sunscreen',
};

// Fetch products from Walmart API
const fetchWalmartProducts = async (condition) => {
  const searchTerm = walmartSearchTerms[condition] || 'skincare';
  const url = 'https://walmart-api4.p.rapidapi.com/walmart-serp.php';
  const params = { url: `https://www.walmart.com/search?q=${encodeURIComponent(searchTerm)}` };
  const headers = {
    'x-rapidapi-host': 'walmart-api4.p.rapidapi.com',
    'x-rapidapi-key': 'ef25a90676msh148877996cdd513p18addcjsn2629af12ee7a',
  };
  try {
    const response = await axios.get(url, { headers, params });
    if (response.data && response.data.body && Array.isArray(response.data.body.products)) {
      // Map Walmart product fields to your frontend's expected format
      return response.data.body.products.slice(0, 6).map(product => ({
        name: product.title,
        url: product.link,
        type: 'Walmart',
        price: product.price && product.price.currentPrice ? product.price.currentPrice : 'N/A',
        image: product.image,
        brand: 'Walmart',
        description: '',
      }));
    }
    return [];
  } catch (error) {
    console.error('Walmart API error:', error);
    return [];
  }
};

// Skincare products API endpoint (now uses Walmart API)
router.get('/products/:condition', async (req, res) => {
  try {
    const condition = req.params.condition;
    const products = await fetchWalmartProducts(condition);
    if (products.length === 0) {
      res.json({
        success: true,
        products: [],
        condition: condition,
        message: 'No Walmart products found for this condition.'
      });
    } else {
      res.json({
        success: true,
        products: products,
        condition: condition,
        message: `Walmart products recommended for ${condition}`
      });
    }
  } catch (error) {
    console.error('Error fetching Walmart products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Walmart products'
    });
  }
});

module.exports = router; 

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

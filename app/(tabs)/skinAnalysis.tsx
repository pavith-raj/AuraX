import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { analyzeSkinImage, getManualRecommendations, getRefinedRecommendations, analyzeAcneSeverity } from '../../api/skinAnalysis';
import axiosInstance from '../../api/axiosInstance';

interface Product {
  name: string;
  url: string;
  type: string;
  ingredients?: string;
  price: string;
  image?: string;
  brand?: string;
  description?: string;
}

interface AnalysisResult {
  prediction: string;
  confidence_scores: { [key: string]: number };
  recommendations: {
    [key: string]: Product[];
  };
  refined_prediction?: string;
  acne_severity?: string;
  acne_confidence?: { [key: string]: number };
  detected_problems?: string[];
  skin_type?: string;
  top_features?: { name: string; importance: number }[];
}

const subCategories = {
  acne: ['Pimples', 'Blackheads', 'Whiteheads', 'Oiliness', 'Acne Scars'],
  bags: ['Dark Circles', 'Puffiness', 'Under-eye Bags'],
  redness: ['Irritation', 'Sensitivity', 'Rosacea'],
  tan: ['Sun Damage', 'Hyperpigmentation', 'Uneven Skin Tone'],
  dryness: ['Flaky Skin', 'Dehydration', 'Rough Texture'],
};

function isValidPrediction(prediction: string): prediction is keyof typeof subCategories {
  return prediction in subCategories;
}

const conditionDescriptions: { [key: string]: { name: string; description: string; symptoms: string[] } } = {
  acne: {
    name: 'Acne',
    description: 'Acne is a skin condition that occurs when hair follicles become clogged with oil and dead skin cells, causing pimples, blackheads, or whiteheads. It is common among teenagers but can affect people of all ages.',
    symptoms: ['Pimples', 'Blackheads', 'Whiteheads', 'Oiliness', 'Scarring'],
  },
  bags: {
    name: 'Under-eye Bags',
    description: 'Under-eye bags are mild swelling or puffiness under the eyes, often caused by aging, fatigue, or fluid retention.',
    symptoms: ['Dark Circles', 'Puffiness', 'Swelling', 'Loose Skin'],
  },
  redness: {
    name: 'Redness',
    description: 'Redness is a common skin symptom that can be caused by irritation, inflammation, rosacea, or other skin conditions.',
    symptoms: ['Irritation', 'Sensitivity', 'Rosacea', 'Flushing'],
  },
  eczema: {
    name: 'Eczema',
    description: 'Eczema is a condition that makes your skin red, inflamed, and itchy. It is common in children but can occur at any age.',
    symptoms: ['Dryness', 'Itching', 'Redness', 'Flaking', 'Irritation'],
  },
  tan: {
    name: 'Tan',
    description: 'Skin tanning is the darkening of the skin due to exposure to ultraviolet (UV) radiation from the sun or artificial sources.',
    symptoms: ['Sun Damage', 'Hyperpigmentation', 'Uneven Skin Tone'],
  },
  dryness: {
    name: 'Dryness',
    description: 'Dry skin occurs when your skin loses too much water or oil, leading to flakiness, rough texture, and sometimes itching.',
    symptoms: ['Flaky Skin', 'Dehydration', 'Rough Texture'],
  },
};

export default function SkinAnalysis() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualCondition, setManualCondition] = useState('');
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedCorrectLabel, setSelectedCorrectLabel] = useState('');

  const conditions = ['acne', 'bags', 'redness', 'tan', 'dryness'];

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant gallery permissions to select images.');
    }
    return status === 'granted';
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take a photo.');
    }
    return status === 'granted';
  }

  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setAnalysisResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setLoading(true);
    try {
      // Analyze general skin conditions
      const skinResult = await analyzeSkinImage(selectedImage);
      
      // Analyze acne severity specifically
      const acneResult = await analyzeAcneSeverity(selectedImage);

      if (skinResult.success && acneResult.success) {
        const combinedResult = {
          ...skinResult,
          acne_severity: acneResult.severity,
          acne_confidence: acneResult.confidence_scores,
        };
        
        // Fetch products for the detected condition
        if (skinResult.prediction) {
          try {
            const productsResult = await getManualRecommendations(skinResult.prediction.toLowerCase());
            if (productsResult.success) {
              combinedResult.recommendations = { [skinResult.prediction]: productsResult.products };
            }
          } catch (error) {
            console.log('Failed to fetch products:', error);
          }
        }
        
        setAnalysisResult(combinedResult);
      } else {
        Alert.alert('Analysis Failed', 'Could not analyze the image completely.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetManualRecommendations = async (condition: string) => {
    if (!condition) {
      Alert.alert('No Condition', 'Please select a skin condition.');
      return;
    }

    setLoading(true);
    try {
      const result = await getManualRecommendations(condition);

      if (result.success) {
        setAnalysisResult({ ...result, prediction: condition, refined_prediction: result.condition });
      } else {
        Alert.alert('Error', 'Failed to get recommendations.');
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refineSearch = async (refinedCondition: string) => {
    setLoading(true);
    try {
      const result = await getRefinedRecommendations(refinedCondition);
      if (result.success) {
        setAnalysisResult(prev => prev ? ({
          ...prev, 
          recommendations: result.recommendations,
          refined_prediction: result.condition,
        }) : null);
      } else {
        Alert.alert('Error', 'Could not get refined recommendations.');
      }
    } catch (error) {
      console.error('Refine search error:', error);
      Alert.alert('Error', 'Failed to refine search.');
    } finally {
      setLoading(false);
    }
  };

  const openProductUrl = (url: string) => {
    Linking.openURL(url);
  };

  const getDetectedProblems = () => {
    if (!analysisResult) return [];
    
    const problems = [];
    
    // Add detailed problems from backend
    if (analysisResult.detected_problems) {
      problems.push(...analysisResult.detected_problems);
    }
    
    // Add acne severity if detected
    if (analysisResult.acne_severity && analysisResult.acne_severity !== 'mild') {
      problems.push(`Acne (${analysisResult.acne_severity})`);
    }
    
    // Add specific acne-related issues based on confidence scores
    if (analysisResult.acne_confidence) {
      if (analysisResult.acne_confidence.severe > 0.3) {
        problems.push('Severe Acne');
      }
      if (analysisResult.acne_confidence.moderate > 0.4) {
        problems.push('Moderate Acne');
      }
    }
    
    return problems;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>AI Skin Analysis</Text>
        <Text style={styles.subtitle}>Upload a photo to detect skin problems and get personalized skincare recommendations.</Text>
      </View>

      {/* Image Selection Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Upload Your Image</Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={analyzeImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Analyze Skin Problems</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Analysis Results */}
      {analysisResult && (
        <View style={{ marginTop: 16 }}>
          {/* Detected Result */}
          <Text style={[styles.sectionTitle, { color: '#A65E5E', marginBottom: 4 }]}> 
            Detected as: {conditionDescriptions[analysisResult.prediction?.toLowerCase()]?.name || analysisResult.prediction}
          </Text>
          {/* What is this condition? */}
          <Text style={styles.sectionTitle}>
            What is {conditionDescriptions[analysisResult.prediction?.toLowerCase()]?.name}?
          </Text>
          <Text style={styles.sectionDescription}>
            {conditionDescriptions[analysisResult.prediction?.toLowerCase()]?.description}
          </Text>
          {/* Why did we detect this? */}
          <Text style={styles.sectionTitle}>Why did we detect this?</Text>
          <Text style={styles.sectionDescription}>
            The AI detected features such as: {conditionDescriptions[analysisResult.prediction?.toLowerCase()]?.symptoms.join(', ')}.
            {analysisResult.confidence_scores && analysisResult.prediction && (
              `\nConfidence: ${Math.round(analysisResult.confidence_scores[analysisResult.prediction] * 100)}%`
            )}
          </Text>
          {/* Show top features from the model */}
          {analysisResult.top_features && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Most Important Features for This Prediction:</Text>
              {analysisResult.top_features.map((feat: any, idx: number) => (
                <Text key={idx} style={styles.sectionDescription}>
                  {feat.name} ({(feat.importance * 100).toFixed(2)}%)
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Product Recommendations */}
      {analysisResult && analysisResult.recommendations && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommended Products</Text>
          {Object.entries(analysisResult.recommendations).map(([category, products]) => (
            <View key={category} style={styles.recommendationSection}>
              <Text style={styles.categoryTitle}>{category} Products:</Text>
              {products.length === 0 ? (
                <Text style={{ color: '#A65E5E', fontStyle: 'italic', marginTop: 8 }}>
                  No products available for {category}
                </Text>
              ) : (
                products.map((product, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.productCard}
                    onPress={() => product.url ? openProductUrl(product.url) : null}
                  >
                    {product.image && (
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      {product.brand && (
                        <Text style={styles.productBrand}>{product.brand}</Text>
                      )}
                      <Text style={styles.productType}>{product.type}</Text>
                      {product.description && (
                        <Text style={styles.productDescription} numberOfLines={2}>
                          {product.description}
                        </Text>
                      )}
                      <Text style={styles.productPrice}>{product.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ))}
        </View>
      )}

      {/* Disclaimer and Manual Condition Selection */}
      <View style={[styles.card, { borderColor: '#A65E5E', borderWidth: 1, backgroundColor: '#FFF7F7' }]}> 
        <Text style={{ color: '#A65E5E', fontStyle: 'italic', marginBottom: 8, textAlign: 'center' }}>
          AI predictions are for informational purposes only. If you believe the result is incorrect, please select your condition manually below.
        </Text>
        <Text style={styles.sectionTitle}>Or Select a Condition</Text>
        <View style={styles.conditionButtons}>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={styles.conditionButton}
              onPress={() => handleGetManualRecommendations(condition)}
            >
              <Text style={styles.conditionButtonText}>{condition}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Feedback Modal */}
      {feedbackModalVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Help us improve!</Text>
            <Text style={{ marginBottom: 8 }}>What is the correct skin issue?</Text>
            {conditions.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={{ padding: 10, backgroundColor: selectedCorrectLabel === condition ? '#A65E5E' : '#f0f0f0', borderRadius: 8, marginBottom: 6 }}
                onPress={() => setSelectedCorrectLabel(condition)}
              >
                <Text style={{ color: selectedCorrectLabel === condition ? '#fff' : '#333', textAlign: 'center' }}>{condition}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setFeedbackModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: '#A65E5E', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!selectedCorrectLabel) {
                    Alert.alert('Please select the correct issue.');
                    return;
                  }
                  if (!analysisResult) {
                    Alert.alert('Error', 'No analysis result available.');
                    return;
                  }
                  try {
                    await axiosInstance.post('/skin/feedback', {
                      prediction: analysisResult.prediction,
                      image: selectedImage,
                      correctLabel: selectedCorrectLabel,
                    });
                    setFeedbackModalVisible(false);
                    setSelectedCorrectLabel('');
                    Alert.alert('Feedback Received', 'Thank you for your feedback!');
                  } catch (err) {
                    Alert.alert('Error', 'Failed to send feedback.');
                  }
                }}
                style={{ padding: 10 }}
              >
                <Text style={{ color: '#A65E5E', fontWeight: 'bold' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3F3',
    paddingTop: 40,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B3B3B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#A65E5E',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  selectedImage: {
    width: 180,
    height: 180,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#A65E5E',
  },
  analyzeButton: {
    backgroundColor: '#A65E5E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultItem: {
    marginBottom: 15,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  problemText: {
    fontSize: 14,
    color: '#3B3B3B',
  },
  recommendationSection: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A65E5E',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B3B3B',
  },
  productBrand: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  productType: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  productPrice: {
    fontSize: 13,
    color: '#A65E5E',
    fontWeight: '500',
  },
  conditionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  conditionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    margin: 5,
  },
  conditionButtonText: {
    fontSize: 14,
    color: '#3B3B3B',
    fontWeight: '500',
  },
  skinTypeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
}); 
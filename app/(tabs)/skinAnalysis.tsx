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
import { analyzeSkinImage, getManualRecommendations, getRefinedRecommendations } from '../../api/skinAnalysis';

interface Product {
  name: string;
  url: string;
  type: string;
  ingredients: string;
  price: string;
}

interface AnalysisResult {
  prediction: string;
  confidence_scores: { [key: string]: number };
  recommendations: {
    [key: string]: Product[];
  };
  refined_prediction?: string;
}

const subCategories = {
  acne: ['Pimples', 'Blackheads', 'Oiliness'],
  bags: ['Dark Circles', 'Puffiness'],
  redness: ['Irritation', 'Sensitivity'],
};

function isValidPrediction(prediction: string): prediction is keyof typeof subCategories {
  return prediction in subCategories;
}

export default function SkinAnalysis() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualCondition, setManualCondition] = useState('');

  const conditions = ['acne', 'bags', 'redness'];

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
      const result = await analyzeSkinImage(selectedImage);

      if (result.success) {
        setAnalysisResult(result);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze the image.');
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>AI Skin Analysis</Text>
        <Text style={styles.subtitle}>Upload a photo or select a condition to get personalized skincare recommendations.</Text>
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze Image</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Manual Condition Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Or Select Condition Manually</Text>
        <View style={styles.conditionButtons}>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.conditionButton,
                manualCondition === condition && styles.conditionButtonActive,
              ]}
              onPress={() => setManualCondition(condition)}
            >
              <Text
                style={[
                  styles.conditionButtonText,
                  manualCondition === condition && styles.conditionButtonTextActive,
                ]}
              >
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {manualCondition && (
          <TouchableOpacity
            style={[styles.analyzeButton, { alignSelf: 'center' }]}
            onPress={() => handleGetManualRecommendations(manualCondition)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyzeButtonText}>Get Recommendations</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Analysis Results Card */}
      {analysisResult && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Analysis Results</Text>
          <Text style={styles.resultTitle}>
            Detected: <Text style={{ color: '#A65E5E' }}>
              {analysisResult.refined_prediction 
                ? analysisResult.refined_prediction.charAt(0).toUpperCase() + analysisResult.refined_prediction.slice(1)
                : analysisResult.prediction.charAt(0).toUpperCase() + analysisResult.prediction.slice(1)}
            </Text>
          </Text>
          
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceTitle}>Confidence Scores:</Text>
            {Object.entries(analysisResult.confidence_scores).map(([condition, score]) => (
              <View key={condition} style={styles.confidenceItem}>
                 <Text style={styles.confidenceScore}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </Text>
                <View style={styles.progressBar}>
                    <View style={{ backgroundColor: '#A65E5E', width: `${score * 100}%`, height: '100%', borderRadius: 5 }} />
                </View>
                <Text style={styles.confidencePercent}>{(score * 100).toFixed(1)}%</Text>
              </View>
            ))}
          </View>

          {/* Refine Search Section */}
          {isValidPrediction(analysisResult.prediction) && !analysisResult.refined_prediction && (
            <View style={styles.refineSection}>
              <Text style={styles.refineTitle}>Not quite right? Refine your results:</Text>
              <View style={styles.conditionButtons}>
                {subCategories[analysisResult.prediction].map((subCat: string) => (
                  <TouchableOpacity
                    key={subCat}
                    style={styles.conditionButton}
                    onPress={() => refineSearch(subCat)}
                  >
                    <Text style={styles.conditionButtonText}>{subCat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.recommendationsTitle}>Recommended Products:</Text>
          {Object.entries(analysisResult.recommendations).map(([category, products]) => (
            <View key={category} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              {products.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.productCard}
                  onPress={() => openProductUrl(product.url)}
                >
                  <View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productType}>{product.type} - {product.price}</Text>
                    <Text style={styles.productIngredients} numberOfLines={2}>
                      {product.ingredients}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color="#A65E5E" />
                </TouchableOpacity>
              ))}
            </View>
          ))}
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
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  conditionButtonActive: {
    backgroundColor: '#A65E5E',
    borderColor: '#A65E5E',
  },
  conditionButtonText: {
    fontSize: 14,
    color: '#3B3B3B',
    fontWeight: '500',
  },
  conditionButtonTextActive: {
    color: 'white',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 15,
    textAlign: 'center',
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B3B3B',
    marginBottom: 10,
  },
  confidenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  confidenceScore: {
    fontSize: 14,
    color: '#666',
    width: '25%',
  },
  progressBar: {
      flex: 1,
      height: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 5,
      marginHorizontal: 10,
  },
  confidencePercent: {
      fontSize: 14,
      fontWeight: '600',
      color: '#3B3B3B',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 10,
    marginTop: 10,
  },
  categoryContainer: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B3B3B',
  },
  productType: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  productPrice: {
    fontSize: 13,
    color: '#A65E5E',
    fontWeight: '500',
  },
  productIngredients: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    maxWidth: '90%',
  },
  refineSection: {
    marginTop: 15,
    marginBottom: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  refineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B3B3B',
    textAlign: 'center',
    marginBottom: 10,
  },
}); 
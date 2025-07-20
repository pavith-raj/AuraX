import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, TextInput, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import api from '../../api/axiosInstance';

type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'diamond';
type Gender = 'male' | 'female';

const recommendations: Record<FaceShape, Record<Gender, string[]>> = {
  oval: {
    male: ['Pompadour', 'Undercut', 'Buzz Cut'],
    female: ['Long Layers', 'Curtain Bangs', 'High Ponytail'],
  },
  round: {
    male: ['Taper Fade', 'Quiff'],
    female: ['Side Bangs', 'Layered Bob'],
  },
  square: {
    male: ['Crew Cut', 'Classic Taper'],
    female: ['Soft Waves', 'Side Part Bob'],
  },
  heart: {
    male: ['Textured Crop', 'Fringe'],
    female: ['Chin-Length Bob', 'Side Swept Bangs'],
  },
  diamond: {
    male: ['Messy Fringe', 'Slick Back'],
    female: ['Shoulder Length', 'Deep Side Part'],
  },
};

export default function HairstyleSuggestion() {
  const [image, setImage] = useState<string | null>(null);
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceShape, setFaceShape] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    setError('');
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setError('Permission to access gallery is required!');
      return;
    }
    let pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0].uri);
      setAiResultUrl(null);
      setFaceShape('');
      setGender('');
      setSelectedHairstyle('');
      analyzeImage(pickerResult.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setError('');
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      setError('Permission to access camera is required!');
      return;
    }
    let pickerResult = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0].uri);
      setAiResultUrl(null);
      setFaceShape('');
      setGender('');
      setSelectedHairstyle('');
      analyzeImage(pickerResult.assets[0].uri);
    }
  };

  // Helper to upload image to a public image host (imgur, cloudinary, etc.)
  // For demo, this is a placeholder. You must implement your own image upload logic.
  const uploadImageAndGetUrl = async (localUri: string): Promise<string> => {
    const data = new FormData();
    data.append('image', {
      uri: localUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);

    const res = await api.post('/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.data && res.data.url) {
      return res.data.url;
    } else {
      throw new Error('Failed to upload image to server');
    }
  };

  // Analyze image to get face shape and gender
  const analyzeImage = async (imgUri: string) => {
    setUploading(true);
    setError('');
    setFaceShape('');
    setGender('');
    try {
      let formData = new FormData();
      formData.append('file', {
        uri: imgUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
      const res = await api.post('/face-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = res.data;
      if (data.faceShape && data.gender) {
        setFaceShape(data.faceShape);
        setGender(data.gender);
      } else {
        setError('Face analysis failed. Please try another image.');
      }
    } catch (e: any) {
      setError('Face analysis failed. Please try another image.');
    } finally {
      setUploading(false);
    }
  };

  const generateHairstyle = async () => {
    if (!image || !selectedHairstyle) {
      setError('Please select an image and a hairstyle.');
      return;
    }
    setLoading(true);
    setError('');
    setAiResultUrl(null);
    try {
      // 1. Upload the image to get a public URL
      const imageUrl = await uploadImageAndGetUrl(image);
      // 2. Call your backend API
      const res = await api.post('/hairstyle-preview', {
        imageUrl,
        hairstyle: selectedHairstyle,
        color,
      });
      if (res.data && res.data.result) {
        setAiResultUrl(res.data.result);
      } else {
        setError('No result from AI API.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate hairstyle preview.');
    } finally {
      setLoading(false);
    }
  };

  let hairstyleList: string[] = [];
  if (
    faceShape &&
    gender &&
    (['oval', 'round', 'square', 'heart', 'diamond'] as FaceShape[]).includes(faceShape as FaceShape) &&
    (['male', 'female'] as Gender[]).includes(gender as Gender)
  ) {
    hairstyleList = recommendations[faceShape as FaceShape][gender as Gender];
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F4F4' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <Feather name="arrow-left" size={24} color="#A65E5E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Hairstyle Suggestions</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.subtitle}>Upload or capture your photo to get face-based hairstyle suggestions and AI preview!</Text>
        <View style={styles.imageSection}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholder}><Feather name="user" size={60} color="#ccc" /></View>
          )}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Feather name="image" size={18} color="#fff" />
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
        </View>
        {uploading && <ActivityIndicator color="#A65E5E" style={{ marginBottom: 10 }} />}
        {faceShape && gender && (
          <View style={styles.resultSection}>
            <Text style={styles.resultText}>Face Shape: <Text style={{ fontWeight: 'bold' }}>{faceShape}</Text></Text>
            <Text style={styles.resultText}>Gender: <Text style={{ fontWeight: 'bold' }}>{gender}</Text></Text>
            <Text style={styles.suggestionTitle}>Suggested Hairstyles:</Text>
            {hairstyleList.length > 0 ? (
              hairstyleList.map((h, i) => (
                <TouchableOpacity
                  key={i}
                  style={selectedHairstyle === h ? styles.selectedHairstyle : styles.suggestionItemBtn}
                  onPress={() => setSelectedHairstyle(h)}
                >
                  <Text style={selectedHairstyle === h ? styles.selectedHairstyleText : styles.suggestionItem}>{h}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.suggestionItem}>No suggestions found.</Text>
            )}
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Or type a custom hairstyle (optional)"
          value={selectedHairstyle}
          onChangeText={setSelectedHairstyle}
        />
        <TextInput
          style={styles.input}
          placeholder="Hair color (optional)"
          value={color}
          onChangeText={setColor}
        />
        <TouchableOpacity style={styles.generateButton} onPress={generateHairstyle} disabled={loading || !selectedHairstyle}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateText}>Generate AI Preview</Text>}
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {aiResultUrl && (
          <View style={styles.generatedImageSection}>
            <Text style={styles.generatedImageTitle}>AI Hairstyle Preview:</Text>
            <Image source={{ uri: aiResultUrl }} style={styles.generatedImage} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F4F4',
    flexGrow: 1,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  headerBackBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A65E5E',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 16,
  },
  imagePreview: {
    width: 180,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  placeholder: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A65E5E',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  generateButton: {
    backgroundColor: '#A65E5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  generateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSection: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#A65E5E',
  },
  suggestionItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  suggestionItemBtn: {
    backgroundColor: '#f2eaea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 6,
    alignItems: 'center',
  },
  selectedHairstyle: {
    backgroundColor: '#A65E5E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 6,
    alignItems: 'center',
  },
  selectedHairstyleText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  generatedImageSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  generatedImageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 8,
  },
  generatedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#A65E5E',
  },
}); 
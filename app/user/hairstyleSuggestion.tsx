import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosInstance from '../../api/axiosInstance';

const recommendations = {
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

const hairstyleImages = {
  oval: {
    male: {
      Pompadour: require('../../assets/hairstyles/oval/male/pompadour.jpg'),
      Undercut: require('../../assets/hairstyles/oval/male/undercut.jpg'),
      'Buzz Cut': require('../../assets/hairstyles/oval/male/buzzcut.jpg'),
    },
    female: {
      'Long Layers': require('../../assets/hairstyles/oval/female/long_layers.jpg'),
      'Curtain Bangs': require('../../assets/hairstyles/oval/female/curtain_bangs.jpg'),
      'High Ponytail': require('../../assets/hairstyles/oval/female/high_ponytail.jpg'),
    },
  },
  round: {
    male: {
      'Taper Fade': require('../../assets/hairstyles/round/male/taper_fade.jpg'),
      Quiff: require('../../assets/hairstyles/round/male/quiff.jpg'),
    },
    female: {
      'Side Bangs': require('../../assets/hairstyles/round/female/side_bangs.jpg'),
      'Layered Bob': require('../../assets/hairstyles/round/female/layered_bob.jpg'),
    },
  },
  square: {
    male: {
      'Crew Cut': require('../../assets/hairstyles/square/male/crew_cut.jpg'),
      'Classic Taper': require('../../assets/hairstyles/square/male/classic_taper.jpg'),
    },
    female: {
      'Soft Waves': require('../../assets/hairstyles/square/female/soft_waves.jpg'),
      'Side Part Bob': require('../../assets/hairstyles/square/female/side_part_bob.jpg'),
    },
  },
  heart: {
    male: {
      'Textured Crop': require('../../assets/hairstyles/heart/male/textured_crop.jpg'),
      Fringe: require('../../assets/hairstyles/heart/male/fringe.jpg'),
    },
    female: {
      'Chin-Length Bob': require('../../assets/hairstyles/heart/female/chin_length_bob.jpg'),
      'Side Swept Bangs': require('../../assets/hairstyles/heart/female/side_swept_bangs.jpg'),
    },
  },
  diamond: {
    male: {
      'Messy Fringe': require('../../assets/hairstyles/diamond/male/messy_fringe.jpg'),
      'Slick Back': require('../../assets/hairstyles/diamond/male/slick_back.jpg'),
    },
    female: {
      'Shoulder Length': require('../../assets/hairstyles/diamond/female/shoulder_length.jpg'),
      'Deep Side Part': require('../../assets/hairstyles/diamond/female/deep_side_part.jpg'),
    },
  },
};

export default function HairstyleSuggestion() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ faceShape: string; gender: string } | null>(null);
  const [error, setError] = useState('');
  const [selectedHairstyle, setSelectedHairstyle] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
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
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      let formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
      const res = await axiosInstance.post('/face-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = res.data;
      setResult(data);
    } catch (e) {
      setError('Analysis failed. Please try another image.');
    } finally {
      setUploading(false);
    }
  };

  const generateHairstyle = async () => {
    if (!image || !selectedHairstyle) return;
    setGenerating(true);
    setGeneratedImage(null);
    setGenerationMessage(null);
    setError('');
    try {
      let formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('prompt', selectedHairstyle);
      const res = await axiosInstance.post('/hairstyle-generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = res.data;
      if (data.status === 'success' && data.generated_image) {
        setGeneratedImage(`data:image/jpeg;base64,${data.generated_image}`);
        setGenerationMessage(data.message || 'Preview generated successfully!');
      } else {
        setGenerationMessage(data.message || 'Failed to generate preview.');
      }
    } catch (e) {
      console.error('Generation error:', e);
      setGenerationMessage('Error generating hairstyle preview.');
    } finally {
      setGenerating(false);
    }
  };

  let hairstyleList: string[] = [];
  if (
    result &&
    (recommendations as any)[result.faceShape] &&
    (recommendations as any)[result.faceShape][result.gender]
  ) {
    hairstyleList = (recommendations as any)[result.faceShape][result.gender];
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
        <Feather name="arrow-left" size={24} color="#A65E5E" />
      </TouchableOpacity>
      <Text style={styles.title}>Hairstyle Suggestions</Text>
      <Text style={styles.subtitle}>Upload or capture your photo to get personalized hairstyle ideas!</Text>
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
      {image && (
        <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeText}>Analyze</Text>}
        </TouchableOpacity>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {result && (
        <View style={styles.resultSection}>
          <Text style={styles.resultText}>Face Shape: <Text style={{ fontWeight: 'bold' }}>{result.faceShape}</Text></Text>
          <Text style={styles.resultText}>Gender: <Text style={{ fontWeight: 'bold' }}>{result.gender}</Text></Text>
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
          {selectedHairstyle && result &&
            hairstyleImages[result.faceShape] &&
            hairstyleImages[result.faceShape][result.gender] &&
            hairstyleImages[result.faceShape][result.gender][selectedHairstyle] && (
              <View style={styles.generatedImageSection}>
                <Text style={styles.generatedImageTitle}>Hairstyle Preview:</Text>
                <Image
                  source={hairstyleImages[result.faceShape][result.gender][selectedHairstyle]}
                  style={styles.generatedImage}
                />
              </View>
            )}
          {selectedHairstyle && (
            <TouchableOpacity style={styles.generateButton} onPress={generateHairstyle} disabled={generating}>
              {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateText}>Preview Hairstyle</Text>}
            </TouchableOpacity>
          )}
          {generationMessage && (
            <Text style={styles.generationResult}>{generationMessage}</Text>
          )}
          {generatedImage && (
            <View style={styles.generatedImageSection}>
              <Text style={styles.generatedImageTitle}>Generated Preview:</Text>
              <Image source={{ uri: generatedImage }} style={styles.generatedImage} />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F4F4',
    flexGrow: 1,
    alignItems: 'center',
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
  analyzeButton: {
    backgroundColor: '#A65E5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyzeText: {
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
  generateButton: {
    backgroundColor: '#A65E5E',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  generateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  generationResult: {
    marginTop: 8,
    color: '#333',
    fontSize: 15,
    textAlign: 'center',
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
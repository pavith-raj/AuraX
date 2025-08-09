import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getSalonById, updateSalonProfile, addSalonGalleryImage, removeSalonGalleryImage, updateSalonProfileImage } from '../../api/salon';
import api from '../../api/axiosInstance';
import { getToken } from '../../api/storage';
import { useSalon } from '../../context/SalonContext';
import PlacesAutocompleteInput from '../../components/PlacesAutocomplete';

type PlacesAutocompleteInputHandle = {
  setQueryText: (text: string) => void;
  clear: () => void;
  focus: () => void;
  blur: () => void;
};

type GooglePlacePrediction = {
  description: string;
  place_id: string;
  [key: string]: any;
};

export default function EditSalonProfile() {
  const router = useRouter();
  const { salonId } = useSalon();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salonName, setSalonName] = useState('');
  const [address, setAddress] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/100');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locationAddress, setLocationAddress] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationPredictions, setLocationPredictions] = useState<GooglePlacePrediction[]>([]);
  const locationPlacesInputRef = React.useRef<PlacesAutocompleteInputHandle>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Only fetch when salonId is available
  useEffect(() => {
    if (!salonId) return;
    fetchSalonDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  const fetchSalonDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Please login again');
        router.replace('/auth/login');
        return;
      }
      if (!salonId) {
        setError('Salon ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      const salonData = await getSalonById(salonId);
      setSalonName(salonData.salonName || '');
      setAddress(salonData.salonAddress || '');
      setLocationAddress(salonData.locationAddress || '');
      setPhone(salonData.phone || '');
      setEmail(salonData.email || '');
      setOpeningTime(salonData.openingTime || '');
      setClosingTime(salonData.closingTime || '');
      setLocation(salonData.location || { lat: null, lng: null });
      setProfileImage(salonData.profileImage || 'https://via.placeholder.com/100');
      setGalleryImages(salonData.galleryImages || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch salon details.');
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      try {
        // Upload image to backend immediately
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const imageUrl = uploadRes.data.url;
        
        // Update profile image in database
        await updateSalonProfileImage(salonId, imageUrl);
        
        // Update local state
        setProfileImage(imageUrl);
        Alert.alert('Success', 'Profile image updated successfully');
      } catch (err) {
        Alert.alert('Error', 'Failed to upload profile image');
      }
    }
  };

  // PlacesAutocomplete handlers
  const handleLocationPredictionsReady = (predictions: GooglePlacePrediction[]) => setLocationPredictions(predictions);
  const handleLocationQueryChange = (query: string) => {
    setLocationSearchQuery(query);
    if (location.lat !== null || location.lng !== null) setLocation({ lat: null, lng: null });
  };
  const fetchPlaceDetailsForLocation = async (place_id: string) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=AIzaSyD9AOX5rjhxoThJDlVYPtkCtLNg7Vivpls&fields=geometry,formatted_address`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === 'OK' && json.result) return json.result;
    return null;
  };
  const handleLocationPredictionPress = async (item: GooglePlacePrediction) => {
    setLocationPredictions([]);
    const details = await fetchPlaceDetailsForLocation(item.place_id);
    if (details && details.geometry && details.geometry.location) {
      setLocation({ lat: details.geometry.location.lat, lng: details.geometry.location.lng });
      locationPlacesInputRef.current?.setQueryText(details.formatted_address || item.description);
      setLocationAddress(details.formatted_address || item.description);
    } else {
      setLocation({ lat: null, lng: null });
      locationPlacesInputRef.current?.clear();
      Alert.alert('Could not get location coordinates. Please try searching again.');
    }
  };

  // Gallery image upload handler
  const pickGalleryImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setGalleryUploading(true);
      try {
        // Upload image to backend
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          name: 'gallery.jpg',
          type: 'image/jpeg',
        } as any);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const imageUrl = uploadRes.data.url;
        await addSalonGalleryImage(salonId, imageUrl);
        setGalleryImages(prev => [...prev, imageUrl]);
      } catch (err) {
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setGalleryUploading(false);
      }
    }
  };

  // Delete gallery image
  const handleDeleteGalleryImage = async (imageUrl: string) => {
    try {
      await removeSalonGalleryImage(salonId, imageUrl);
      setGalleryImages(prev => prev.filter(url => url !== imageUrl));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete image');
    }
  };

  const handleSave = async () => {
    if (!salonId) {
      Alert.alert('Error', 'Salon ID not found. Please log in again.');
      return;
    }
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Please login again');
        router.replace('/auth/login');
        return;
      }
      const updateData = {
        salonName,
        salonAddress: address,
        locationAddress,
        phone,
        openingTime,
        closingTime,
        location,
      };
      await updateSalonProfile(salonId, updateData);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err) {
      setError('Failed to update profile.');
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!salonId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: 'red', fontSize: 16 }}>Salon ID not found. Please log in again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A65E5E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ height: 32 }} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B2E2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>{error}</Text>
        ) : null}
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
            <View style={styles.editImageOverlay}>
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        {/* Salon Gallery Section */}
        <View style={styles.gallerySection}>
          <Text style={styles.label}>Salon Gallery</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {galleryImages.map((img, idx) => (
              <View key={img} style={styles.galleryImageWrapper}>
                <Image source={{ uri: img }} style={styles.galleryImage} />
                <TouchableOpacity style={styles.deleteGalleryImageBtn} onPress={() => handleDeleteGalleryImage(img)}>
                  <MaterialIcons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addGalleryImageBtn} onPress={pickGalleryImage} disabled={galleryUploading}>
              {galleryUploading ? (
                <ActivityIndicator color="#A65E5E" />
              ) : (
                <MaterialIcons name="add" size={32} color="#A65E5E" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salon Name</Text>
            <TextInput
              style={styles.input}
              value={salonName}
              onChangeText={setSalonName}
              placeholder="Enter salon name"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salon Address (manual)</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter salon address"
              multiline
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (Google Places)</Text>
            <TextInput
              style={styles.input}
              value={locationAddress}
              editable={false}
              placeholder="Select a location from below"
            />
            <Text style={styles.label}>Search & Pin Location</Text>
            <PlacesAutocompleteInput
              ref={locationPlacesInputRef}
              onQueryChange={handleLocationQueryChange}
              onPredictionsReady={handleLocationPredictionsReady}
              initialQuery={locationAddress}
            />
            {locationPredictions.length > 0 && (
              <FlatList
                data={locationPredictions}
                keyExtractor={item => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleLocationPredictionPress(item)} style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 180, backgroundColor: '#fff', borderRadius: 8, marginTop: 4, elevation: 2 }}
              />
            )}
            {location.lat && location.lng && (
              <Text style={{ color: '#6B2E2E', marginTop: 8, fontSize: 13 }}>Lat: {location.lat}, Lng: {location.lng}</Text>
            )}
          </View>
          <View style={styles.timeContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Opening Time</Text>
              <TextInput
                style={styles.input}
                value={openingTime}
                onChangeText={setOpeningTime}
                placeholder="9:00 AM"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Closing Time</Text>
              <TextInput
                style={styles.input}
                value={closingTime}
                onChangeText={setClosingTime}
                placeholder="8:00 PM"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0dede',
  },
  headerRight: {
    width: 40, // To balance the back button
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B2E2E',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding for the bottom button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#A65E5E',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#A65E5E',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  formContainer: {
    padding: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B2E2E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#6B2E2E',
    borderWidth: 1,
    borderColor: '#f0dede',
    ...Platform.select({
      ios: {
        shadowColor: '#A65E5E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0dede',
    ...Platform.select({
      ios: {
        shadowColor: '#A65E5E',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saveButton: {
    backgroundColor: '#A65E5E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D4A5A5',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gallerySection: {
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  galleryImageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A65E5E',
  },
  deleteGalleryImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#A65E5E',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  addGalleryImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A65E5E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7E8E8',
  },
}); 
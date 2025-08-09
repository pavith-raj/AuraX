import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, Modal, FlatList, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSalonById, getSalonReviews, postSalonReview, editSalonReview, deleteSalonReview } from '../../../api/salon';
import api from '../../../api/axiosInstance';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

interface Salon {
  _id: string;
  salonName: string;
  name: string;
  rating: number;
  phone: string;
  salonAddress: string;
  services: { name?: string }[];
  walkInEnabled?: boolean;
  profileImage?: string;
  galleryImages?: string[];
  [key: string]: any;
}

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  text?: string;
  images?: string[];
  createdAt: string;
}

export default function SalonDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // This will capture salon ID when navigating

  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [galleryModalIndex, setGalleryModalIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = React.useContext(AuthContext);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSalonById(id)
      .then(data => {
        setSalon(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch salon details.');
        setLoading(false);
      });
    // Fetch reviews
    setReviewLoading(true);
    getSalonReviews(id)
      .then(data => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setReviewLoading(false));
  }, [id]);

  // Pick and upload review images
  const pickReviewImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied for camera roll');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSubmittingReview(true);
      try {
        const uris = result.assets.map(a => a.uri);
        const uploaded: string[] = [];
        for (const uri of uris) {
          const formData = new FormData();
          formData.append('image', {
            uri,
            name: 'review.jpg',
            type: 'image/jpeg',
          } as any);
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploaded.push(uploadRes.data.url);
        }
        setReviewImages(prev => [...prev, ...uploaded]);
      } catch (e) {
        alert('Failed to upload image');
      } finally {
        setSubmittingReview(false);
      }
    }
  };

  // Start editing a review
  const handleEditReview = (rev: Review & { _id: string }) => {
    setEditingReviewId(rev._id);
    setReviewText(rev.text || '');
    setReviewRating(rev.rating);
    setReviewImages(rev.images || []);
  };

  // Submit review (add or edit)
  const handleSubmitReview = async () => {
    if (!reviewRating) return alert('Please select a rating');
    if (!user || !user._id) return alert('You must be logged in');
    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await editSalonReview(id, editingReviewId, {
          rating: reviewRating,
          text: reviewText,
          images: reviewImages,
        });
      } else {
        await postSalonReview(id, {
          rating: reviewRating,
          text: reviewText,
          images: reviewImages,
        });
      }
      setReviewText('');
      setReviewRating(0);
      setReviewImages([]);
      setEditingReviewId(null);
      // Refresh reviews
      setReviewLoading(true);
      const data = await getSalonReviews(id);
      setReviews(data);
    } catch (e) {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
      setReviewLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setSubmittingReview(true);
    try {
      await deleteSalonReview(id, reviewId);
      // Refresh reviews
      setReviewLoading(true);
      const data = await getSalonReviews(id);
      setReviews(data);
    } catch (e) {
      alert('Failed to delete review');
    } finally {
      setSubmittingReview(false);
      setReviewLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color="#A65E5E" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : salon ? (
          <>
            {/* Salon Profile Image */}
            <View style={styles.imageWrapper}>
              <Image
                source={salon.profileImage ? { uri: salon.profileImage } : require('../../../assets/images/salon1.jpg')}
                style={styles.image}
                resizeMode="cover"
                defaultSource={require('../../../assets/images/salon1.jpg')}
                onError={() => console.log('Failed to load salon image for:', salon.salonName)}
              />
            </View>
            <Text style={styles.salonName}>{salon.salonName}</Text>
            <Text style={styles.title}>{salon.name}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.rating}>⭐ {String(salon.rating || 0)}</Text>
              <Text style={styles.phone}>📞 {String(salon.phone || 'N/A')}</Text>
            </View>
            <Text style={styles.address}>📍 {String(salon.salonAddress || 'N/A')}</Text>
            {/* Add more details if needed */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>
                {/* You can add a description field in your backend and show it here */}
                Welcome to {String(salon.salonName || salon.name || 'Salon')}! We offer the best services in town.
              </Text>
            </View>
            {/* Salon Gallery Section */}
            {salon.galleryImages && salon.galleryImages.length > 0 && (
              <View style={styles.galleryCard}>
                <Text style={styles.galleryTitle}>Gallery</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                  {salon.galleryImages.map((img, idx) => (
                    <TouchableOpacity
                      key={img}
                      onPress={() => {
                        setGalleryModalIndex(idx);
                        setGalleryModalVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: img }}
                        style={styles.galleryImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {/* Gallery Modal */}
            <Modal
              visible={galleryModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setGalleryModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <FlatList
                  data={salon.galleryImages || []}
                  horizontal
                  pagingEnabled
                  initialScrollIndex={galleryModalIndex}
                  getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={{ width: screenWidth, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                      <Image source={{ uri: item }} style={styles.fullscreenImage} resizeMode="contain" />
                    </View>
                  )}
                  keyExtractor={item => item}
                />
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setGalleryModalVisible(false)}>
                  <Text style={{ color: '#fff', fontSize: 32 }}>×</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            {/* Services Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
              {salon.services && salon.services.length > 0 ? (
                salon.services.map((service, idx) => (
                  <Text key={idx} style={styles.serviceItem}>• {service.name || 'Unnamed Service'}</Text>
                ))
              ) : (
                <Text style={styles.sectionText}>No services listed.</Text>
              )}
            </View>
            {/* Reviews Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviewLoading ? <ActivityIndicator color="#A65E5E" /> : null}
              {reviews.length === 0 && !reviewLoading ? (
                <Text style={styles.sectionText}>No reviews yet.</Text>
              ) : (
                reviews.map((rev: Review, idx: number) => (
                  <View key={idx} style={styles.reviewCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontWeight: 'bold', color: '#A65E5E', marginRight: 8 }}>{rev.userName}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        {[1,2,3,4,5].map(star => (
                          <Text key={star} style={{ color: star <= rev.rating ? '#FFD700' : '#ccc', fontSize: 16 }}>★</Text>
                        ))}
                      </View>
                      <Text style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                      {/* Edit/Delete buttons for own review */}
                      {user && rev.userId === user._id && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                          <TouchableOpacity onPress={() => handleEditReview(rev)} style={{ marginRight: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: '#F7E8E8' }}>
                            <Text style={{ color: '#A65E5E', fontWeight: 'bold' }}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteReview(rev._id)}
                            style={{
                              padding: 4,
                              borderRadius: 16,
                              backgroundColor: '#fff0f0',
                              borderWidth: 1,
                              borderColor: '#e57373',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <MaterialIcons name="delete" size={18} color="#e53935" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: '#444', marginBottom: 4 }}>{rev.text}</Text>
                    {rev.images && rev.images.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                        {rev.images.map((img: string, i: number) => (
                          <Image key={i} source={{ uri: img }} style={styles.reviewImage} />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                ))
              )}
              {/* Add Review Form */}
              <View style={styles.addReviewCard}>
                <Text style={{ fontWeight: 'bold', color: '#A65E5E', marginBottom: 6 }}>{editingReviewId ? 'Edit Your Review' : 'Add Your Review'}</Text>
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {[1,2,3,4,5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                      <Text style={{ color: star <= reviewRating ? '#FFD700' : '#ccc', fontSize: 28 }}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write your review..."
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                  {reviewImages.map((img: string, i: number) => (
                    <Image key={i} source={{ uri: img }} style={styles.reviewImage} />
                  ))}
                  <TouchableOpacity style={styles.addReviewImageBtn} onPress={pickReviewImage} disabled={submittingReview}>
                    <Text style={{ fontSize: 32, color: '#A65E5E' }}>+</Text>
                  </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.submitReviewBtn, submittingReview && { backgroundColor: '#ccc' }]}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{submittingReview ? 'Submitting...' : 'Submit Review'}</Text>
                </TouchableOpacity>
                {editingReviewId && (
                  <TouchableOpacity onPress={() => { setEditingReviewId(null); setReviewText(''); setReviewRating(0); setReviewImages([]); }} style={{ marginTop: 8 }}>
                    <Text style={{ color: '#A65E5E', fontWeight: 'bold', textAlign: 'center' }}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {salon?.walkInEnabled && (
              <TouchableOpacity
                style={{ backgroundColor: '#A65E5E', padding: 16, borderRadius: 8, marginTop: 20 }}
                onPress={() => router.push({ pathname: '/(tabs)/queue/queue', params: { salonId: salon._id, salonName: salon.salonName } })}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Join Walk-in Queue</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.errorText}>Salon not found.</Text>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EAD8D8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#EAD8D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 4,
    textAlign: 'center',
  },
  salonName: {
    fontSize: 26,
    color: '#A65E5E',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  rating: {
    fontSize: 16,
    color: '#FF6347',
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 16,
    color: '#A65E5E',
    fontWeight: 'bold',
  },
  address: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  serviceItem: {
    fontSize: 15,
    color: '#444',
    marginLeft: 8,
    marginBottom: 2,
  },
  backButton: {
    backgroundColor: '#A65E5E',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 28,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  galleryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 18,
    marginBottom: 8,
    padding: 12,
    width: '100%',
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B2E2E',
    marginBottom: 8,
  },
  galleryImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A65E5E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
  },
  reviewCard: {
    backgroundColor: '#F7E8E8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#A65E5E',
  },
  addReviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  reviewInput: {
    backgroundColor: '#F7E8E8',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#6B2E2E',
    minHeight: 40,
    marginBottom: 8,
  },
  addReviewImageBtn: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A65E5E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7E8E8',
  },
  submitReviewBtn: {
    backgroundColor: '#A65E5E',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
});
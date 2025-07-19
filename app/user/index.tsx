import React, { useState, useEffect, useContext } from 'react';
import { TextInput } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Modal, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import BottomNavBar from '../../components/BottomNav'; 
import { getMyQueueStatus } from '../../api/apiService';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

const GOOGLE_API_KEY = 'AIzaSyD9AOX5rjhxoThJDlVYPtkCtLNg7Vivpls';

interface Prediction {
  description: string;
  place_id: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);

  // State for location modal
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationPredictions, setLocationPredictions] = useState<Prediction[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Mock: User's current queue status (replace with real fetch/context)
  const [myQueue, setMyQueue] = useState<null | {
    salonId: string;
    salonName: string;
    position: number;
    wait: number;
  }>(null);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch queue status function
  const fetchQueueStatus = async () => {
    if (!user || !user._id) {
      setMyQueue(null);
      return;
    }
    try {
      const entries = await getMyQueueStatus();
      console.log('Queue entries from backend:', entries);
      if (entries && entries.length > 0) {
        // Find the entry with the current user
        const entry = entries.find((e: any) => e.userId === user._id);
        if (entry) {
          // Fetch the full queue for this salon to get position
          const res = await fetch(`/api/queue/${entry.salonId}`);
          const data = await res.json();
          const queue = data.queue || [];
          const myIdx = queue.findIndex((qe: any) => qe.userId === user._id);
          setMyQueue({
            salonId: entry.salonId,
            salonName: entry.salonName || 'Salon',
            position: myIdx >= 0 ? myIdx + 1 : 1,
            wait: myIdx >= 0 ? myIdx * 10 : 10,
          });
        } else {
          setMyQueue(null);
        }
      } else {
        setMyQueue(null);
      }
    } catch (e) {
      setMyQueue(null);
    }
  };

  // Fetch queue status every time the screen is focused and user is available
  useFocusEffect(
    React.useCallback(() => {
      if (!user || !user._id) return;
      let isActive = true;
      const poll = async () => {
        await fetchQueueStatus();
      };
      poll();
      const interval = setInterval(poll, 10000);
      return () => {
        isActive = false;
        clearInterval(interval);
      };
    }, [user && user._id])
  );

  // Fetch predictions from Google Places API
  const fetchPredictions = async (input: string) => {
    setLocationQuery(input);
    if (input.length < 2) {
      setLocationPredictions([]);
      return;
    }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    setLocationPredictions(json.predictions || []);
  };

  // When a prediction is selected
  const handleSelectPrediction = (item: Prediction) => {
    setSelectedLocation(item.description);
    setLocationModalVisible(false);
    setLocationQuery('');
    setLocationPredictions([]);
  };

  return (
    <>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EAD8D8' }}>
    <StatusBar backgroundColor="#EAD8D8" barStyle="dark-content" />

    {/* Header */}
    <View style={styles.header}>
  
      {/* Logo */}
      <Image
        source={require('../../assets/images/AuraX-icon.png')}
        style={styles.logo}
      />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Feather name="search" size={16} color="#888" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search salons or services"
          placeholderTextColor="#888"
        />
      </View>

      {/* Location Dropdown */}
      <TouchableOpacity
            style={styles.locationIconOnly}
            onPress={() => setLocationModalVisible(true)}
          >
            <Feather name="map-pin" size={20} color="#A65E5E" />
          </TouchableOpacity>

    </View>


{/* Location Modal */}
        <Modal
          visible={locationModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              width: '90%',
              maxHeight: '70%'
            }}>
          
          {/* Show selected location below header (optional) */}
          {selectedLocation ? (
            <Text style={{ textAlign: 'center', color: '#A65E5E', marginBottom: 4 }}>
              {selectedLocation}
            </Text>
          ) : null}

            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Choose Location</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12
                }}
                placeholder="Search location"
                value={locationQuery}
                onChangeText={fetchPredictions}
                autoFocus
              />
              <FlatList
                data={locationPredictions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectPrediction(item)}
                    style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  >
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center' }}>Type to search...</Text>}
                keyboardShouldPersistTaps="handled"
              />
              
              <TouchableOpacity
                onPress={() => setLocationModalVisible(false)}
                style={{ marginTop: 12, alignSelf: 'flex-end' }}
              >
                <Text style={{ color: '#A65E5E', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>



    {/* Real-Time Booking */}
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={{ marginTop: 0, marginBottom: 0 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={async () => {
          setRefreshing(true);
          await fetchQueueStatus();
          setRefreshing(false);
        }} />
      }
    >
      <View style={styles.bookingSection}>
        <Text style={styles.sectionTitle}>Book Your Service</Text>
        <View style={styles.serviceCategories}>
          
          <TouchableOpacity style={styles.categoryCard}>
          <Feather name="scissors" size={28} color="#A65E5E" />
            <Text style={styles.categoryText}>Haircuts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
          <Feather name="smile" size={28} color="#A65E5E" />
            <Text style={styles.categoryText}>Facials</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
          <Feather name="heart" size={28} color="#A65E5E" />
            <Text style={styles.categoryText}>Manicures</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.bookNowButton} onPress={() => router.push('/user/salons/salonslist?fromBooking=1')}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* AI-powered Recommendations */}
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.aiCards}>
            <TouchableOpacity style={styles.aiCard} onPress={() => router.push('/user/hairstyleSuggestion')}>
            <Image source={require('../../assets/images/hairstyle2.jpg')} style={styles.aiImage} />
              <View style={styles.overlay}>
                <Text style={styles.aiCardTitle}>Hairstyle Suggestions</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aiCard} onPress={() => router.push('/skinAnalysis')}>
            <Image source={require('../../assets/images/cosmetic.jpg')} style={styles.aiImage} />
              <View style={styles.overlay}>
                <Text style={styles.aiCardTitle}>Personalized Products</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Queue & Walk-In Management */}
      <View style={styles.queueSection}>
        <TouchableOpacity
          style={styles.queueButton}
          onPress={() => router.push('/user/salons/salonslist?fromQueue=1')}
        >
          <Text style={styles.queueText}>Join Walk-In Queue</Text>
        </TouchableOpacity>
        {/* Removed My Queue button */}
      </View>

      {/* Featured Salons */}
      <View style={styles.featuredSalons}>
        <Text style={styles.sectionTitle}>Featured Salons</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.salonsContainer}>
          <View style={styles.salonCard}>
            <Image source={require('../../assets/images/salon1.jpg')} style={styles.salonImage} />
              <View style={styles.salonInfo}>
                <Text style={styles.salonName}>Glamour Hub</Text>
                <Text style={styles.salonLocation}>Kadri, Mangalore</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.salonRating}>⭐⭐⭐⭐☆</Text>
                  <Text style={styles.reviewCount}>(120)</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={() => router.push('/book/appointmentBooking')}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.salonCard}>
              <Image source={require('../../assets/images/salon2.jpg')} style={styles.salonImage} />
              <View style={styles.salonInfo}>
                <Text style={styles.salonName}>Elite Salonb</Text>
                <Text style={styles.salonLocation}>Kadri, Mangalore</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.salonRating}>⭐⭐⭐⭐⭐</Text>
                  <Text style={styles.reviewCount}>(120)</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={() => router.push('/book/appointmentBooking')}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </View>
      
    {/* Promotions */}
    <View style={styles.promotions}>
      <Text style={styles.promotionTitle}>Limited Time Offers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.promotionCards}>
          <View style={styles.promotionCard}>
            <Image source={require('../../assets/images/offer1.jpg')} style={styles.promotionImage} />
            <Text style={styles.promotionText}>50% OFF on First Booking!</Text>
          </View>
          <View style={styles.promotionCard}>
            <Image source={require('../../assets/images/offer2.jpg')} style={styles.promotionImage} />
            <Text style={styles.promotionText}>Free Hair Spa on ₹999+</Text>
          </View>
        </View>
      </ScrollView>
    </View>

    </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="home" />
    </SafeAreaView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAD8D8',
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAD8D8',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 12,
    gap: 2, // optional for spacing
  },
  
  
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'white',
    resizeMode: 'contain',
  },
  
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#000',
    marginLeft: 6,
    paddingVertical: 0,
    includeFontPadding: false, //keeps text within bounds
  },
  
  locationIconOnly: {
    padding: 6,
    borderRadius: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bookingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3B3B3B',
  },
  serviceCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // For Android
  },
  
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A65E5E',
  },
  
  bookNowButton: {
    backgroundColor: '#A65E5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  aiSection: {
    padding: 16,
  },
  aiCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  
  },
  aiCard: {
    width: 160,
    height: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  
  aiCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aiImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // semi-transparent dark overlay
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  queueSection: {
    padding: 16,
  },
  queueButton: {
    backgroundColor: '#A65E5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  queueText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  myQueueButton: {
    backgroundColor: '#fff',
    borderColor: '#A65E5E',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    shadowColor: '#A65E5E',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  myQueueText: {
    color: '#A65E5E',
    fontWeight: 'bold',
    fontSize: 13,
  },
  featuredSalons: {
    padding: 16,
  },
  salonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  salonCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  salonImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  salonName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  salonRating: {
    fontSize: 14,
    color: '#FF6347',
  },
  salonInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  
  salonLocation: {
    fontSize: 12,
    color: '#777',
  },
  
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  
  bookButton: {
    marginTop: 8,
    backgroundColor: '#A65E5E',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  promotions: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B3B3B',
  },

  promotionCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingBottom: 8,
    paddingTop: 4,
  },
  
  promotionCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginRight: 12,
  },
  
  promotionImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  
  promotionText: {
    padding: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A65E5E',
  },
  
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding:10,
  },
  // navText: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   color: '#3B3B3B',
  // },
  scrollContent: {
    paddingBottom: 100, // adjust this to make room for bottom nav
  },
});

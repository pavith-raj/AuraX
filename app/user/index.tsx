import React from 'react';
import { TextInput } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons'; // You can also use Ionicons, FontAwesome, etc.
import BottomNavBar from '../../components/BottomNav';  // adjust the path if needed

export default function HomePage() {
  const router = useRouter();

  return (
    <>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EAD8D8' }}>
    <StatusBar backgroundColor="#EAD8D8" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/AuraX-icon.png')} // Add your logo
          style={styles.logo}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search salons or services"
        />
        <TouchableOpacity style={styles.profileIcon}>
          <Feather name="user" size={24} color="#A65E5E" />
        </TouchableOpacity>
      </View>

    {/* Real-Time Booking */}
    <ScrollView contentContainerStyle={styles.scrollContent} style={{ marginTop: 0, marginBottom: 0 }}>
      <View style={styles.bookingSection}>
        <Text style={styles.sectionTitle}>Book Your Service</Text>
        <View style={styles.serviceCategories}>
          <TouchableOpacity style={styles.categoryCard}>
            <Text style={styles.categoryText}>Haircuts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Text style={styles.categoryText}>Facials</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Text style={styles.categoryText}>Manicures</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.bookNowButton} onPress={() => router.push('/book')}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* AI-powered Recommendations */}
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.aiCards}>
            <View style={styles.aiCard}>
              <Text style={styles.aiCardTitle}>Hairstyle Suggestions</Text>
              {/* AI Image or Sample Hairstyle */}
              {/* <Image source={require('../assets/images/hairstyle.png')} style={styles.aiImage} /> */}
            </View>
            <View style={styles.aiCard}>
              <Text style={styles.aiCardTitle}>Personalized Products</Text>
              {/* AI Image or Sample Product */}
              {/* <Image source={require('../assets/images/cosmetic.png')} style={styles.aiImage} /> */}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Queue & Walk-In Management */}
      <View style={styles.queueSection}>
        <TouchableOpacity style={styles.queueButton} onPress={() => router.push('/queue')}>
          <Text style={styles.queueText}>Join Walk-In Queue</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Salons */}
      <View style={styles.featuredSalons}>
        <Text style={styles.sectionTitle}>Featured Salons</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.salonsContainer}>
            <View style={styles.salonCard}>
              {/* <Image source={require('../assets/images/salon1.jpg')} style={styles.salonImage} /> */}
              <Text style={styles.salonName}>Salon A</Text>
              <Text style={styles.salonRating}>⭐⭐⭐⭐☆</Text>
            </View>
            <View style={styles.salonCard}>
              {/* <Image source={require('../assets/images/salon2.jpg')} style={styles.salonImage} /> */}
              <Text style={styles.salonName}>Salon B</Text>
              <Text style={styles.salonRating}>⭐⭐⭐⭐⭐</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      
      {/* Promotions */}
      <View style={styles.promotions}>
        <Text style={styles.promotionTitle}>Limited Time Offers</Text>
        <View style={styles.promotionBanner}>
          <Text style={styles.promotionText}>50% OFF on First Booking!</Text>
        </View>
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
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#EAD8D8',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android
  },
  searchBar: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginLeft: 10,
    backgroundColor: '#f0f0f0',
  },
  profileIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,  // Optional: add spacing around icon
  },
  // profileText: {
  //   fontSize: 16,
  //   color: '#6C63FF',
  // },
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
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#3B3B3B ',
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
    backgroundColor: '#fff',

    borderRadius: 8,
    padding: 16,
    flex: 1,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
  featuredSalons: {
    padding: 16,
  },
  salonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salonCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: 150,
    alignItems: 'center',
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
  promotionBanner: {
    marginTop: 8,
    marginBottom:40,
    backgroundColor: '#A65E5E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  promotionText: {
    fontSize: 16,
    color: '#fff',
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

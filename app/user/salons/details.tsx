import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSalonById } from '../../../api/salon'; 

export default function SalonDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // This will capture salon ID when navigating

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color="#A65E5E" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : salon ? (
          <>
            {/* Salon Image Placeholder */}
            {/* <View style={styles.imageWrapper}>
              <Image
                source={require('../../../assets/images/salon-placeholder.png')}
                style={styles.image}
                resizeMode="cover"
              />
            </View> */}
            
            <Text style={styles.salonName}>{salon.salonName}</Text>
            <Text style={styles.title}>{salon.name}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.rating}>⭐ {salon.rating || 0}</Text>
              <Text style={styles.phone}>📞 {salon.phone}</Text>
            </View>
            <Text style={styles.address}>📍 {salon.salonAddress}</Text>
            {/* Add more details if needed */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>
                {/* You can add a description field in your backend and show it here */}
                Welcome to {salon.salonName || salon.name}! We offer the best services in town.
              </Text>
            </View>
            {/* Services Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
              {salon.services && salon.services.length > 0 ? (
                salon.services.map((service, idx) => (
                  <Text key={idx} style={styles.serviceItem}>• {service}</Text>
                ))
              ) : (
                <Text style={styles.sectionText}>No services listed.</Text>
              )}
            </View>
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
});
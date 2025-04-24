// /app/salons/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const salons = [
  {
    id: '1',
    name: 'Glamour Hub',
    rating: 4.5,
    // image: require('../../assets/images/salon1.jpg'),
  },
  {
    id: '2',
    name: 'Elite Salon',
    rating: 5,
    // image: require('../../assets/images/salon2.jpg'),
  },
];

export default function SalonList() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Available Salons</Text>
      {salons.map((salon) => (
        <TouchableOpacity
          key={salon.id}
          style={styles.card}
          onPress={() => router.push(`/salons/${salon.id}`)}
        >
          {/* <Image source={salon.image} style={styles.image} /> */}
          <View style={styles.details}>
            <Text style={styles.name}>{salon.name}</Text>
            <Text style={styles.rating}>⭐ {salon.rating}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAD8D8',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rating: {
    marginTop: 4,
    color: '#FF6347',
  },
});

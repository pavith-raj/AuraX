
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavBar from '../../../components/BottomNav';  // adjust the path if needed

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
  {
    id:'3',
    name:'Beauty Bliss',
    rating:4,
  },
  { 
    id: '4', 
    name: 'Hair Affair',
    rating: 3.5 
  },
];

export default function SalonList() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const[selectedRating,setSelectedRating] = useState<number | null>(null);

  const filteredSalons = salons.filter((salon) =>{
    const matchesSearch = salon.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesRating = selectedRating ? salon.rating >= selectedRating : true;
    return matchesSearch && matchesRating;
  });

  return (
    <>

    <View style={styles.header}>
      <Text style={styles.title}>Discover Top Salons</Text>
    </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search salons..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>
    
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedRating === 4 && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedRating(4)}
        >
          <Text style={selectedRating === 4 ? styles.activeFilterText : styles.filterText}>4⭐ & up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedRating === 5 && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedRating(5)}
        >
          <Text style={selectedRating === 5 ? styles.activeFilterText : styles.filterText}>5⭐ only</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedRating === null && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedRating(null)}
        >
          <Text style={selectedRating === null ? styles.activeFilterText :styles.filterText}>All</Text>
        </TouchableOpacity>
      </View>

    {/* Salon List */}
    <ScrollView style={styles.container}>

      {filteredSalons.map((salon) => (
        <TouchableOpacity
          key={salon.id}
          style={styles.card}
          onPress={() => router.push('details?id=' + salon.id)}
        >
          {/* <Image source={salon.image} style={styles.image} /> */}
          <View style={styles.details}>
            <Text style={styles.name}>{salon.name}</Text>
            <Text style={styles.rating}>⭐ {salon.rating}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
    <BottomNavBar activeTab='salons' />
    </>
    
  );
 
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAD8D8',
    padding: 16,
  },
  header:{
    flexDirection: 'row',
    padding: 0,
    paddingTop: 60,
    alignItems:'center',
    justifyContent:'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#A65E5E',
  },
  activeFilterButton: {
    backgroundColor: '#A65E5E',
  },
  filterText: {
    color: '#A65E5E',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#fff', // when button is active
    fontWeight: 'bold',
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

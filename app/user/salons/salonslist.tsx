
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomNavBar from '../../../components/BottomNav'; 
import { getSalons } from '../../../api/salon';

export default function SalonList() {
  const router = useRouter();
  
  const { fromBooking } = useLocalSearchParams();

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const[selectedRating,setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    getSalons()
    .then(data => {
      setSalons(data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);


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
  <View key={salon._id} style={styles.card}>
    {/* <Image source={salon.image} style={styles.image} /> */}
    <TouchableOpacity
      style={styles.details}
      onPress={() => {
        if (fromBooking) {
          // Go to booking screen with salon info
          router.push({
            pathname: '/(tabs)/book/appointmentBooking',
            params: {
              salonId: salon._id,
              salonName: salon.name,
              salonAddress: salon.salonAddress,
              salonRating: salon.rating,
            },
          });
        } else {
          // Normal details navigation
          router.push(`/user/salons/details?id=${salon._id}`);
        }
      }}
    >
      <Text style={styles.salonName}>{salon.salonName}</Text>
      <View style={styles.rowAlign}>
      <Text style={styles.rating}>⭐ {salon.rating}</Text>
      <Text style={styles.salonAddress}>📍{salon.salonAddress}</Text>

    {/* Show Details button only in booking flow */}
    {fromBooking ? (
      <TouchableOpacity
        style={styles.detailsBtn}
        onPress={() => router.push(`/user/salons/details?id=${salon._id}`)}
      >
        <Text style={styles.detailsBtnText}>Details</Text>
    
      </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  </View>
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
salonName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rating: {
    marginTop: 4,
    color: '#FF6347',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  detailsBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 'auto', // pushes button to the right
    marginRight: 0,
    marginTop: 0,
  },
  detailsBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

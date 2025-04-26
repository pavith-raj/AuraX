import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BottomNavBarProps {
  activeTab: string;
}
export default function BottomNav({ activeTab}:BottomNavBarProps) {
  const router = useRouter();

  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => router.push('/user/home')} style={styles.navButton}>
        <Feather name="home" size={24} color={activeTab === 'home' ? '#A65E5E' : '#777'} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/user/salons/salonslist')} style={styles.navButton}>
        <MaterialIcons name="storefront" size={24} color={activeTab === 'salons' ? '#A65E5E' : '#777'} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/products')} style={styles.navButton}>
        <Feather name="shopping-bag" size={24} color={activeTab === 'products' ? '#A65E5E' : '#777'} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/appointments')} style={styles.navButton}>
        <Feather name="calendar" size={24} color={activeTab === 'appointments' ? '#A65E5E' : '#777'} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/profile')} style={styles.navButton}>
        <Feather name="user" size={24} color={activeTab === 'profile' ? '#A65E5E' : '#777'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navButton: {
    padding: 10,
  },
});

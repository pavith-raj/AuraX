import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchSalonAppointments } from '../../api/appointments';
import { useSalon } from '../../context/SalonContext';
import { SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OwnerNotifications() {
  const router = useRouter();
  const { salonId } = useSalon();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bottom nav setup
  const bottomNavItems = [
    { icon: 'home', label: 'Home', route: '/owner/profile' },
    { icon: 'notifications', label: 'Notifications', route: '/owner/notifications' },
    { icon: 'settings', label: 'Settings', route: '/owner/settings' },
  ];
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const bottomNavScaleValues = React.useRef(bottomNavItems.map(() => new Animated.Value(1))).current;
  const createPressHandlers = (index: number) => ({
    onPressIn: () => Animated.spring(bottomNavScaleValues[index], { toValue: 0.95, useNativeDriver: true }).start(),
    onPressOut: () => Animated.spring(bottomNavScaleValues[index], { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start(),
  });

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    fetchSalonAppointments(salonId)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [salonId]);

  // Sort by most recent
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const renderItem = ({ item }: any) => {
    let message = '';
    if (item.status === 'Scheduled') {
      message = `New booking for ${item.serviceName} on ${item.date} at ${item.time}`;
    } else if (item.status === 'Cancelled') {
      message = `Booking for ${item.serviceName} on ${item.date} at ${item.time} was cancelled.`;
    } else if (item.status === 'Completed') {
      message = `Booking for ${item.serviceName} on ${item.date} at ${item.time} was completed.`;
    }
    return (
      <View style={styles.notificationCard}>
        <Text style={styles.notificationText}>{message}</Text>
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EAD8D8" barStyle="dark-content" />
      <View style={{ height: 32 }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>Booking Notifications</Text>
        </View>
        <View style={{ width: 39 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
      ) : sortedAppointments.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={sortedAppointments}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
      <View style={{ height: 60 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
        {bottomNavItems.map((item, index: number) => {
          const { onPressIn, onPressOut } = createPressHandlers(index);
          return (
            <AnimatedPressable
              key={item.label}
              style={{ alignItems: 'center', flex: 1, transform: [{ scale: bottomNavScaleValues[index] }] }}
              onPress={() => router.push(item.route)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={26} color={item.label === 'Notifications' ? '#A65E5E' : '#777'} />
              <Text style={{ color: item.label === 'Notifications' ? '#A65E5E' : '#777', fontSize: 12 }}>{item.label}</Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7E8E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A65E5E',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationText: {
    fontSize: 16,
    color: '#6B2E2E',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#888',
  },
}); 
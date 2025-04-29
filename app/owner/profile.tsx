import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IconName = keyof typeof MaterialIcons.glyphMap;

type MenuItem = {
  title: string;
  icon: IconName;
  route: string;
};

export default function SalonProfile() {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      title: 'Manage Services',
      icon: 'content-cut',
      route: '/owner/services',
    },
    {
      title: 'Manage Bookings',
      icon: 'event',
      route: '/owner/bookings',
    },
    {
      title: 'Walk-In Queue',
      icon: 'people',
      route: '/owner/queue',
    },
    {
      title: 'Promotions',
      icon: 'local-offer',
      route: '/owner/offers',
    },
  ];

  const bottomNavItems: { icon: IconName; label: string; route: string }[] = [
    { icon: 'home', label: 'Home', route: '/owner/profile' },
    { icon: 'notifications', label: 'Notifications', route: '/owner/notifications' },
    { icon: 'settings', label: 'Settings', route: '/owner/settings' },
  ];

  // Animated pressable for menu and bottom nav items
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  // Create scale animated values for menu items
  const menuScaleValues = React.useRef(menuItems.map(() => new Animated.Value(1))).current;
  const bottomNavScaleValues = React.useRef(bottomNavItems.map(() => new Animated.Value(1))).current;

  const createPressHandlers = (index: number, isMenu: boolean) => {
    const scaleValues = isMenu ? menuScaleValues : bottomNavScaleValues;

    const onPressIn = () => {
      Animated.spring(scaleValues[index], {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleValues[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return { onPressIn, onPressOut };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>My Salon</Text>
              <Text style={styles.salonAddress}>123 Beauty Street, City</Text>
              <Text style={styles.salonHours}>Open: 9:00 AM - 8:00 PM</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
            onPress={() => alert('Edit profile functionality coming soon!')}
          >
            <MaterialIcons name="edit" size={22} color="#A65E5E" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="event" size={26} color="#A65E5E" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Today's Bookings</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="people" size={26} color="#A65E5E" />
            </View>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>In Queue</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="content-cut" size={26} color="#A65E5E" />
            </View>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => {
            const { onPressIn, onPressOut } = createPressHandlers(index, true);
            return (
              <AnimatedPressable
                key={index}
                style={[styles.menuItem, { transform: [{ scale: menuScaleValues[index] }] }]}
                onPress={() => router.push(item.route)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              >
                <View style={styles.menuIconContainer}>
                  <MaterialIcons name={item.icon} size={34} color="#A65E5E" />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item, index) => {
          const { onPressIn, onPressOut } = createPressHandlers(index, false);
          return (
            <AnimatedPressable
              key={index}
              style={[styles.bottomNavItem, { transform: [{ scale: bottomNavScaleValues[index] }] }]}
              onPress={() => router.push(item.route)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <MaterialIcons name={item.icon} size={26} color="#A65E5E" />
              <Text style={styles.bottomNavLabel}>{item.label}</Text>
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
    backgroundColor: '#fff8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0dede',
    elevation: 3,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 18,
    borderWidth: 3,
    borderColor: '#A65E5E',
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#6B2E2E',
  },
  salonAddress: {
    fontSize: 17,
    color: '#8B5E5E',
    marginTop: 6,
  },
  salonHours: {
    fontSize: 15,
    color: '#A67A7A',
    marginTop: 3,
  },
  editButton: {
    padding: 12,
    backgroundColor: '#F9EAEA',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginTop: 14,
    marginHorizontal: 14,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9EAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6B2E2E',
  },
  statLabel: {
    fontSize: 15,
    color: '#8B5E5E',
    marginTop: 6,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginTop: 14,
  },
  menuItem: {
    width: '48%',
    padding: 20,
    backgroundColor: 'white',
    margin: '1%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    elevation: 3,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9EAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  menuText: {
    fontSize: 18,
    color: '#6B2E2E',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0dede',
    elevation: 10,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavLabel: {
    fontSize: 13,
    color: '#8B5E5E',
    marginTop: 6,
    fontWeight: '500',
  },
});

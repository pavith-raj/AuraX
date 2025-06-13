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
        <View style={styles.headerCard}>
          <View style={styles.headerContentCentered}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.profileImageLarge}
            />
            <Text style={styles.salonNameLarge}>My Salon</Text>
            <Text style={styles.salonAddress}>{'123 Beauty Street, City'}</Text>
            <Text style={styles.salonHours}>{'Open: 9:00 AM - 8:00 PM'}</Text>
          </View>
          <TouchableOpacity
            style={styles.fabEditButton}
            onPress={() => router.push('/owner/edit-profile')}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsScrollModern}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18 }}>
            <View style={styles.statCardModern}>
              <MaterialIcons name="event" size={28} color="#A65E5E" style={styles.statCardIconModern} />
              <Text style={styles.statNumberLarge}>12</Text>
              <Text style={styles.statLabelModern}>Today's Bookings</Text>
            </View>
            <View style={styles.statCardModern}>
              <MaterialIcons name="people" size={28} color="#A65E5E" style={styles.statCardIconModern} />
              <Text style={styles.statNumberLarge}>5</Text>
              <Text style={styles.statLabelModern}>In Queue</Text>
            </View>
            <View style={styles.statCardModern}>
              <MaterialIcons name="content-cut" size={28} color="#A65E5E" style={styles.statCardIconModern} />
              <Text style={styles.statNumberLarge}>8</Text>
              <Text style={styles.statLabelModern}>Services</Text>
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.recentActivitySectionModern}>
          <Text style={styles.recentActivityTitleModern}>Recent Activity</Text>
          <View style={styles.recentActivityCardModern}>
            <Text style={styles.recentActivityTextModern}>No recent activity.</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGridModernized}>
          {menuItems.map((item, index) => {
            const { onPressIn, onPressOut } = createPressHandlers(index, true);
            return (
              <AnimatedPressable
                key={index}
                style={[styles.menuItemModernized, { transform: [{ scale: menuScaleValues[index] }] }]}
                onPress={() => router.push(item.route)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              >
                <View style={styles.menuIconContainerModernized}>
                  <MaterialIcons name={item.icon} size={36} color="#A65E5E" />
                </View>
                <Text style={styles.menuTextModernized}>{item.title}</Text>
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
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 10,
    paddingBottom: 32,
    elevation: 5,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    position: 'relative',
  },
  headerContentCentered: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 12,
  },
  profileImageLarge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#A65E5E',
    marginBottom: 14,
  },
  salonNameLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6B2E2E',
    marginBottom: 4,
  },
  fabEditButton: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    backgroundColor: '#A65E5E',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  statsScrollModern: {
    marginTop: 10,
    marginBottom: 10,
  },
  statCardModern: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 26,
    marginRight: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    minWidth: 130,
    minHeight: 120,
  },
  statCardIconModern: {
    marginBottom: 10,
  },
  statNumberLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6B2E2E',
  },
  statLabelModern: {
    fontSize: 16,
    color: '#8B5E5E',
    marginTop: 4,
  },
  menuGridModernized: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    marginTop: 18,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItemModernized: {
    width: '48%',
    padding: 28,
    backgroundColor: 'white',
    marginBottom: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    elevation: 4,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  menuIconContainerModernized: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F9EAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuTextModernized: {
    fontSize: 20,
    color: '#6B2E2E',
    textAlign: 'center',
    fontWeight: '700',
  },
  recentActivitySectionModern: {
    marginTop: 24,
    marginHorizontal: 18,
  },
  recentActivityTitleModern: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6B2E2E',
    marginBottom: 10,
  },
  recentActivityCardModern: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 22,
    elevation: 2,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
  },
  recentActivityTextModern: {
    color: '#8B5E5E',
    fontSize: 16,
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
});

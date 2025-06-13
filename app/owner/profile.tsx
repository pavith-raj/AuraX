import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Animated, Pressable, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getSalonById, updateSalonProfile } from '../../api/salon';
import { useSalon } from '../../context/SalonContext';
import * as ImagePicker from 'expo-image-picker';

type IconName = keyof typeof MaterialIcons.glyphMap;

type MenuItem = {
  title: string;
  icon: IconName;
  route: string;
};

type SalonType = {
  profileImage?: string;
  salonName?: string;
  salonAddress?: string;
  openingTime?: string;
  closingTime?: string;
  // add other fields as needed
};

export default function SalonProfile() {
  const router = useRouter();
  const { salonId } = useSalon();
  const [salon, setSalon] = useState<SalonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUploading(true);
      const imageUrl = result.assets[0].uri;
      await updateSalonProfile(salonId, { profileImage: imageUrl });
      setSalon({ ...salon, profileImage: imageUrl });
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    getSalonById(salonId)
      .then(data => {
        setSalon(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [salonId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#A65E5E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header Section */}
        <View style={styles.headerCard}>
          {/* Edit (pencil) button: top right of card */}
          <TouchableOpacity
            style={styles.fabPencilButtonCard}
            onPress={() => router.push('/owner/edit-profile')}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContentCentered}>
            <View style={{ position: 'relative', width: 120, height: 120, marginBottom: 14 }}>
              <Image
                source={{ uri: salon?.profileImage || 'https://via.placeholder.com/100' }}
                style={styles.profileImageLarge}
              />
              {/* Camera button: bottom right of image */}
              <TouchableOpacity
                style={[styles.fabEditButton, styles.fabCameraButton]}
                onPress={pickAndUploadImage}
                disabled={uploading}
              >
                <MaterialIcons name={uploading ? 'hourglass-empty' : 'camera-alt'} size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.salonNameLarge}>{salon?.salonName || 'My Salon'}</Text>
            <Text style={styles.salonAddress}>{salon?.salonAddress || '123 Beauty Street, City'}</Text>
            <Text style={styles.salonHours}>{salon ? `Open: ${salon.openingTime || '9:00 AM'} - ${salon.closingTime || '8:00 PM'}` : 'Open: 9:00 AM - 8:00 PM'}</Text>
          </View>
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
    bottom: 0,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#A65E5E',
  },
  fabCameraButton: {
    right: 0,
  },
  fabPencilButtonCard: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#A65E5E',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
    zIndex: 10,
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

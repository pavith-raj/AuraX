import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Pressable, ActivityIndicator, Alert, Modal, FlatList, Dimensions } from 'react-native';
import { SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getSalonById, updateSalonProfile } from '../../api/salon';
import { useSalon } from '../../context/SalonContext';
import * as ImagePicker from 'expo-image-picker';
import { fetchTodayBookingCount, fetchDateBookingCounts } from '../../api/appointments';
import { getQueueCount } from '../../api/apiService';

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
  location?: {
    lat?: number;
    lng?: number;
  };
  locationAddress?: string;
  galleryImages?: string[];
};

export default function SalonProfile() {
  const router = useRouter();
  const { salonId } = useSalon();
  const [salon, setSalon] = useState<SalonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [dateCounts, setDateCounts] = useState<{ [date: string]: number }>({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [galleryModalIndex, setGalleryModalIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

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
      mediaTypes: 'images',
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

  useEffect(() => {
    if (!salonId) return;
    fetchTodayBookingCount(salonId).then(setTodayCount);
    getQueueCount(salonId).then(setQueueCount);
  }, [salonId]);

  const openCalendar = async () => {
    setCalendarVisible(true);
    setCalendarLoading(true);
    try {
      const counts = await fetchDateBookingCounts(salonId);
      setDateCounts(counts);
    } finally {
      setCalendarLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#EAD8D8" barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#A65E5E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EAD8D8" barStyle="dark-content" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Add extra space at the top */}
        <View style={{ height: 32 }} />
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
            <Text style={styles.salonAddressLabel}>Salon Address:</Text>
            <Text style={styles.salonAddress}>{salon?.salonAddress || '123 Beauty Street, City'}</Text>
            {salon?.locationAddress && (
              <>
                <Text style={styles.salonAddressLabel}>Location:</Text>
                <Text style={styles.salonAddress}>{salon.locationAddress}</Text>
              </>
            )}
            <Text style={styles.salonHours}>{salon ? `Open: ${salon.openingTime || '9:00 AM'} - ${salon.closingTime || '8:00 PM'}` : 'Open: 9:00 AM - 8:00 PM'}</Text>
          </View>
        </View>

        {/* Salon Gallery Card */}
        {salon?.galleryImages && salon.galleryImages.length > 0 && (
          <View style={styles.galleryCard}>
            <Text style={styles.galleryTitle}>Salon Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
              {salon.galleryImages.map((img, idx) => (
                <TouchableOpacity
                  key={img}
                  onPress={() => {
                    setGalleryModalIndex(idx);
                    setGalleryModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Gallery Modal */}
        <Modal
          visible={galleryModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setGalleryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <FlatList
              data={salon?.galleryImages || []}
              horizontal
              pagingEnabled
              initialScrollIndex={galleryModalIndex}
              getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{ width: screenWidth, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={{ uri: item }} style={styles.fullscreenImage} resizeMode="contain" />
                </View>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setGalleryModalVisible(false)}>
              <MaterialIcons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Quick Stats */}
        <View style={styles.statsScrollModern}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18 }}>
            {/* Today's Bookings Card with calendar modal */}
            <Pressable onPress={openCalendar} style={styles.statCardModern}>
              <MaterialIcons name="event" size={28} color="#A65E5E" style={styles.statCardIconModern} />
              <Text style={styles.statNumberLarge}>{todayCount}</Text>
              <Text style={styles.statLabelModern}>Today's Bookings</Text>
            </Pressable>
            <View style={styles.statCardModern}>
              <MaterialIcons name="people" size={28} color="#A65E5E" style={styles.statCardIconModern} />
              <Text style={styles.statNumberLarge}>{queueCount}</Text>
              <Text style={styles.statLabelModern}>In Queue</Text>
            </View>
            <View style={styles.statCardModern}>
              <MaterialIcons name="content-cut" size={28} color="#A65E5E" style={styles.statCardIconModern} />
              <Text style={styles.statNumberLarge}>8</Text>
              <Text style={styles.statLabelModern}>Services</Text>
            </View>
          </ScrollView>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGridModernized}>
          {menuItems.map((item, index) => {
            const { onPressIn, onPressOut } = createPressHandlers(index, true);
            return (
              <AnimatedPressable
                key={index}
                style={[styles.menuItemModernized, { transform: [{ scale: menuScaleValues[index] }] }]}
                onPress={() => {
                  if (item.route === '/owner/services') {
                    router.push({ pathname: item.route, params: { salonId } });
                  } else {
                    router.push(item.route);
                  }
                }}
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
      <View style={{ height: 60 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
        {bottomNavItems.map((item, index) => {
          const { onPressIn, onPressOut } = createPressHandlers(index, false);
          return (
            <AnimatedPressable
              key={item.label}
              style={{ alignItems: 'center', flex: 1, transform: [{ scale: bottomNavScaleValues[index] }] }}
              onPress={() => router.push(item.route)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <MaterialIcons name={item.icon} size={26} color={item.label === 'Home' ? '#A65E5E' : '#777'} />
              <Text style={{ color: item.label === 'Home' ? '#A65E5E' : '#777', fontSize: 12 }}>{item.label}</Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {/* Calendar Modal */}
      <Modal visible={calendarVisible} animationType="slide" transparent={true} onRequestClose={() => setCalendarVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 340, maxHeight: '80%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#A65E5E', marginBottom: 12, textAlign: 'center' }}>Bookings Calendar</Text>
            <Pressable onPress={() => setCalendarVisible(false)} style={{ position: 'absolute', top: 12, right: 16 }}>
              <MaterialIcons name="close" size={24} color="#A65E5E" />
            </Pressable>
            {calendarLoading ? (
              <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
            ) : (
              <CalendarGrid dateCounts={dateCounts} />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7E8E8',
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
  salonAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5E5E',
    marginTop: 8,
  },
  salonCoords: {
    color: '#8B5E5E',
    fontSize: 14,
    marginTop: 2,
  },
  salonCoordsWarning: {
    color: 'orange',
    fontSize: 13,
    marginTop: 2,
  },
  galleryCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B2E2E',
    marginBottom: 8,
  },
  galleryImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A65E5E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
  },
});

// CalendarGrid component (simple month grid with booking counts)
function CalendarGrid({ dateCounts }: { dateCounts: { [date: string]: number } }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return today.getMonth();
  });
  const [year, setYear] = useState(() => {
    const today = new Date();
    return today.getFullYear();
  });
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();
  const weeks: (number | null)[][] = [[]];
  let week = weeks[0];
  for (let i = 0; i < startDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    if (week.length === 7) {
      week = [];
      weeks.push(week);
    }
    week.push(d);
  }
  while (week.length < 7) week.push(null);
  // Helper to format date as yyyy-mm-dd with leading zeros
  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const goToPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };
  const goToPrevYear = () => setYear(y => y - 1);
  const goToNextYear = () => setYear(y => y + 1);
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <Pressable onPress={goToPrevYear} style={{ padding: 4 }}>
          <MaterialIcons name="keyboard-double-arrow-left" size={22} color="#A65E5E" />
        </Pressable>
        <Pressable onPress={goToPrevMonth} style={{ padding: 4 }}>
          <MaterialIcons name="chevron-left" size={24} color="#A65E5E" />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#A65E5E', marginHorizontal: 8 }}>{monthNames[month]} {year}</Text>
        <Pressable onPress={goToNextMonth} style={{ padding: 4 }}>
          <MaterialIcons name="chevron-right" size={24} color="#A65E5E" />
        </Pressable>
        <Pressable onPress={goToNextYear} style={{ padding: 4 }}>
          <MaterialIcons name="keyboard-double-arrow-right" size={22} color="#A65E5E" />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
          <Text key={day} style={{ width: 36, textAlign: 'center', color: '#A65E5E', fontWeight: 'bold' }}>{day}</Text>
        ))}
      </View>
      {weeks.map((week, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
          {week.map((d, j) => (
            <View key={j} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: d && dateCounts[fmt(d)] ? '#F7E8E8' : 'transparent' }}>
              <Text style={{ color: '#6B2E2E', fontWeight: d === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'bold' : 'normal' }}>{d ? d : ''}</Text>
              {d && dateCounts[fmt(d)] ? (
                <Text style={{ fontSize: 12, color: '#A65E5E' }}>{dateCounts[fmt(d)]}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

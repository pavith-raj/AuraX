import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Animated, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchServices, addService, editService, deleteService } from '../../api/apiService';

export default function ServicesPage() {
  const router = useRouter();
  const { salonId } = useLocalSearchParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [editingService, setEditingService] = useState(null);

  // Animated pressable for list items and buttons
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const scaleValues = useRef([]).current;

  // Fetch services from backend using the shared API helper
  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServices(salonId);
      setServices(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch services');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (salonId) loadServices();
  }, [salonId]);

  // Add or Edit Service using the shared API helpers
  const handleSaveService = async () => {
    if (!serviceName.trim()) return;
    setLoading(true);
    try {
      if (editingService) {
        await editService(salonId, editingService._id, serviceName);
      } else {
        await addService(salonId, serviceName);
      }
      setServiceName('');
      setEditingService(null);
      setModalVisible(false);
      loadServices();
    } catch (e) {
      Alert.alert('Error', 'Failed to save service');
    }
    setLoading(false);
  };

  // Delete service using the shared API helper
  const handleDelete = async (serviceId) => {
    setLoading(true);
    try {
      await deleteService(salonId, serviceId);
      loadServices();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete service');
    }
    setLoading(false);
  };

  // Animated press handlers
  const createPressHandlers = (index) => {
    if (!scaleValues[index]) scaleValues[index] = new Animated.Value(1);
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

  const renderItem = ({ item, index }) => {
    const { onPressIn, onPressOut } = createPressHandlers(index);
    return (
      <AnimatedPressable
        style={[styles.serviceItem, { transform: [{ scale: scaleValues[index] || 1 }] }]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        key={item._id}
      >
        <Text style={styles.serviceName}>{item.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionButton}>
            <MaterialIcons name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
            <MaterialIcons name="delete" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Services</Text>
        <TouchableOpacity onPress={() => { setEditingService(null); setServiceName(''); setModalVisible(true); }} style={styles.addButton}>
          <MaterialIcons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 20 }} />}
      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading && <Text style={styles.emptyText}>No services available.</Text>}
      />

      {/* Modal for Add/Edit */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add Service'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Service name"
              value={serviceName}
              onChangeText={setServiceName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#A65E5E', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveService} style={styles.saveBtn} disabled={loading}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{editingService ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { marginRight: 15 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { padding: 4 },
  listContent: { padding: 20 },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceName: { flex: 1, fontSize: 18, color: '#333' },
  actions: { flexDirection: 'row' },
  actionButton: { marginLeft: 15 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', maxWidth: 400
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#A65E5E', marginBottom: 16 },
  input: {
    backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16
  },
  cancelBtn: { padding: 10, marginRight: 10 },
  saveBtn: { backgroundColor: '#A65E5E', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' },
});
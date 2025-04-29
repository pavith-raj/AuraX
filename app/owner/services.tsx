import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const mockServices = [
  { id: '1', name: 'Haircut' },
  { id: '2', name: 'Manicure' },
  { id: '3', name: 'Massage' },
];

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState(mockServices);

  // Animated pressable for list items and buttons
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  // Create scale animated values for each service item
  const scaleValues = useRef(services.map(() => new Animated.Value(1))).current;

  const createPressHandlers = (index: number) => {
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

  const handleEdit = (id: string) => {
    Alert.alert('Edit Service', `Edit service with id: ${id}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setServices(services.filter(service => service.id !== id)),
        },
      ]
    );
  };

  const handleAdd = () => {
    Alert.alert('Add Service', 'Add new service functionality to be implemented.');
  };

  const renderItem = ({ item, index }: { item: { id: string; name: string }; index: number }) => {
    const { onPressIn, onPressOut } = createPressHandlers(index);
    return (
      <AnimatedPressable
        style={[styles.serviceItem, { transform: [{ scale: scaleValues[index] }] }]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        key={item.id}
      >
        <Text style={styles.serviceName}>{item.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.actionButton}>
            <MaterialIcons name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
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
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <MaterialIcons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No services available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    padding: 20,
  },
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
  serviceName: {
    flex: 1,
    fontSize: 18,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});

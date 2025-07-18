import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, TextInput, RefreshControl, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getQueue, removeQueueEntry, addOfflineWalkIn } from '../../api/apiService';
import { useSalon } from '../../context/SalonContext';

type QueueEntry = {
  _id: string;
  salonId: string;
  userId: string | null;
  name: string;
  joinedAt: string;
};

export default function OwnerQueuePage() {
  const router = useRouter();
  const { salonId } = useSalon();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    if (!salonId) return;
    setLoading(true);
    try {
      const q = await getQueue(salonId);
      setQueue(q);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch queue');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchQueue();
      const interval = setInterval(fetchQueue, 10000);
      return () => clearInterval(interval);
    }, [salonId])
  );

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await addOfflineWalkIn(salonId, newName.trim());
      setNewName('');
      fetchQueue();
    } catch (err) {
      Alert.alert('Error', 'Failed to add walk-in');
    }
    setAdding(false);
  };

  const handleRemove = async (entryId: string) => {
    setRemovingId(entryId);
    try {
      await removeQueueEntry(salonId, entryId);
      fetchQueue();
    } catch (err) {
      Alert.alert('Error', 'Failed to remove entry');
    }
    setRemovingId(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Walk-In Queue</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            await fetchQueue();
            setRefreshing(false);
          }} />
        }
      >
        <View style={styles.addBox}>
          <TextInput
            style={styles.input}
            placeholder="Add walk-in name"
            value={newName}
            onChangeText={setNewName}
            editable={!adding}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={adding || !newName.trim()}>
            <Text style={styles.addBtnText}>{adding ? 'Adding...' : 'Add'}</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
        ) : queue.length === 0 ? (
          <Text style={styles.emptyText}>No one in the queue yet.</Text>
        ) : (
          queue.map((entry, idx) => (
            <View key={entry._id} style={styles.queueEntry}>
              <Text style={styles.entryText}>{idx + 1}. {entry.name || 'Customer'}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
                  onPress={() => handleRemove(entry._id)}
                  disabled={removingId === entry._id}
                >
                  <Text style={styles.actionText}>{removingId === entry._id ? 'Processing...' : 'Done'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#e57373' }]}
                  onPress={() => handleRemove(entry._id)}
                  disabled={removingId === entry._id}
                >
                  <Text style={styles.actionText}>{removingId === entry._id ? 'Processing...' : 'Remove'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  scrollContent: { padding: 20 },
  addBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A65E5E',
    fontSize: 16,
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 40 },
  queueEntry: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#A65E5E',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  entryText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionText: { color: '#fff', fontWeight: 'bold' },
}); 
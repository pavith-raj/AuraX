import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getQueue, joinQueue, leaveQueue } from '../../../api/apiService';
import { AuthContext } from '../../../context/AuthContext';

interface QueueEntry {
  userId: string;
  name?: string;
  joinedAt: string;
}

export default function Queue() {
  const router = useRouter();
  const { salonId, salonName } = useLocalSearchParams();
  const { user } = useContext(AuthContext);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [expectedWait, setExpectedWait] = useState<number | null>(null);
  const userId = user?._id;

  const fetchQueue = async () => {
    if (!salonId) return;
    setLoading(true);
    try {
      const q = await getQueue(salonId);
      setQueue(q);
      const myIdx = q.findIndex((qe: QueueEntry) => qe.userId === userId);
      setInQueue(myIdx !== -1);
      setMyPosition(myIdx !== -1 ? myIdx + 1 : null);
      setExpectedWait(myIdx !== -1 ? myIdx * 10 : null); // 10 min per person
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch queue');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
    // Optionally, poll every X seconds for real-time updates
    // const interval = setInterval(fetchQueue, 10000);
    // return () => clearInterval(interval);
  }, [salonId, userId]);

  const handleJoin = async () => {
    try {
      await joinQueue(salonId);
      fetchQueue();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to join queue');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveQueue(salonId);
      fetchQueue();
    } catch (err) {
      Alert.alert('Error', 'Failed to leave queue');
    }
  };

  if (!salonId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Select a salon to view or join the walk-in queue.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/user/salons/salonslist')}>
          <Text style={styles.buttonText}>Browse Salons</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{salonName || 'Salon'} - Walk-in Queue</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.queueList}>
            <Text style={styles.sectionTitle}>Current Queue:</Text>
            {queue.length === 0 ? (
              <Text style={styles.emptyText}>No one in the queue yet.</Text>
            ) : (
              queue.map((entry, idx) => (
                <Text
                  key={entry.userId + entry.joinedAt}
                  style={entry.userId === userId ? styles.highlight : styles.queueEntry}
                >
                  {idx + 1}. {entry.userId === userId ? 'You' : entry.name || `Customer #${idx + 1}`}
                </Text>
              ))
            )}
          </View>
          {inQueue && myPosition !== null && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Your position: #{myPosition}</Text>
              <Text style={styles.infoText}>Estimated wait: {expectedWait} min</Text>
            </View>
          )}
          <View style={{ marginTop: 24 }}>
            {inQueue ? (
              <TouchableOpacity style={[styles.button, { backgroundColor: '#888' }]} onPress={handleLeave}>
                <Text style={styles.buttonText}>Leave Queue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleJoin}>
                <Text style={styles.buttonText}>Join Walk-in Queue</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EAD8D8',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAD8D8',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 8,
  },
  queueList: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#A65E5E',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  queueEntry: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  highlight: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#A65E5E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#A65E5E',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#A65E5E',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#A65E5E',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
});

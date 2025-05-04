import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiImage } from 'moti';



export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
        <MotiImage
        source={require('../../assets/images/AuraX-icon.png')}
        style={styles.logo}
        from={{
          shadowRadius: 0,
          opacity: 0.8,
          scale: 1,
        }}
        animate={{
          shadowRadius: 20,
          opacity: 1,
          scale: 1.05,
        }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: true,
          repeatReverse: true,
        }}
      />


      <Text style={styles.title}>Who’s logging in?</Text>

      {/* Customer Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/auth/signup?role=user')}
      >
        <MaterialCommunityIcons name="account" size={40} color="#A65E5E" />
        <Text style={styles.cardText}>I'm a Customer</Text>
      </TouchableOpacity>

      {/* Salon Manager Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/auth/signup?role=owner')}
      >
        <MaterialCommunityIcons name="scissors-cutting" size={40} color="#A65E5E" />
        <Text style={styles.cardText}>I'm a Salon Manager</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAD8D8',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      },
      logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
        borderRadius: 20, // 🔁 Rounded edges
        resizeMode: 'cover',
        shadowColor: '#A65E5E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20, 
      },
      
      title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
      },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#A65E5E',
  },
});

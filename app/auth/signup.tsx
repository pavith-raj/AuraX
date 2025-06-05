import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState} from 'react';
import { registerUser } from '../../api/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { role = 'user' } = useLocalSearchParams();

  // States for signup fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(''); // For Salon Owner
  const [salonName, setSalonName] = useState(''); // For Salon Owner
  const [salonAddress, setSalonAddress] = useState(''); // For Salon Owner
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

   // Simple location picker (for demonstration)
  // In production, use a map picker or geolocation API
  const handleSetLocation = () => {
    // Example: set static coordinates or use a real picker
    setLocation({ lat: 12.9716, lng: 77.5946 }); // Example: Bangalore coordinates
  };

  // Handle signup logic
  const handleSignup = async () => {
    if (password === confirmPassword) {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = role === 'owner'
          ? { name, email, password, role, phone, salonName, salonAddress, location, services: [] }
          : { name, email, password, role }; // Customer signup data

        const response = await registerUser(data);
        console.log('Registration successful:', response.data);
        router.push('/auth/login');
      } catch (error) {
        console.log('Registration error:', error.response?.data?.message || error.message);
        setErrorMessage(error.response?.data?.message || 'An error occurred during registration');
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('Passwords do not match');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

<View style={{ position: 'relative' }}>
  <TextInput
    style={styles.input}
    placeholder="Password"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
  />
  <TouchableOpacity
    style={{ position: 'absolute', right: 16, top: 16 }}
    onPress={() => setShowPassword((prev) => !prev)}
  >
    <MaterialIcons
      name={showPassword ? 'visibility' : 'visibility-off'}
      size={24}
      color="#888"
    />
  </TouchableOpacity>
</View>

      {/* Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Additional fields for Salon Manager */}
      {role === 'owner' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Salon Name"
            value={salonName}
            onChangeText={setSalonName}
          />
          <TextInput
            style={styles.input}
            placeholder="Salon Address"
            value={salonAddress}
            onChangeText={setSalonAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {/* Location Picker */}
          <TouchableOpacity style={[styles.input, { backgroundColor: '#f0f0f0', justifyContent: 'center' }]} onPress={handleSetLocation}>
            <Text style={{ color: location.lat && location.lng ? '#333' : '#aaa' }}>
              {location.lat && location.lng
                ? `Location set: (${location.lat}, ${location.lng})`
                : 'Pick Location'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Show error message */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {/* Sign Up Button */}
      <TouchableOpacity onPress={handleSignup} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      {/* Link to Login Screen */}
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#EAD8D8' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#000000', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkText: { marginTop: 16, textAlign: 'center', color: '#828282' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 12 },
});

import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { registerUser } from '../../api/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { role = 'user' } = useLocalSearchParams();

  // States for signup fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(''); // For Salon Owner
  const [salonName, setSalonName] = useState(''); // For Salon Owner
  const [salonAddress, setSalonAddress] = useState(''); // For Salon Owner
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle signup logic
  const handleSignup = async () => {
    if (password === confirmPassword) {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = role === 'owner'
          ? { name, email, password, role, phone, salonName, salonAddress }
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

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

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

import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { registerUser } from '../../api/auth'; // Import register function

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // To handle loading state
  const [errorMessage, setErrorMessage] = useState(''); // To handle error message

  // Handle signup logic
  const handleSignup = async () => {
    if (password === confirmPassword) {
      setLoading(true);
      setErrorMessage(''); // Reset error message on new attempt

      try {
        const response = await registerUser({
          name,
          email,
          password,
        });
        console.log('Registration successful:', response.data);
        // After successful registration, navigate to login page
        router.push('/auth/login');
      } catch (error) {
        console.log('Registration error:', error.response?.data?.message || error.message);
        setErrorMessage(error.response?.data?.message || 'An error occurred during registration');
      } finally {
        setLoading(false); // Stop loading state
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

      {/* Show error message if passwords do not match or any other error */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

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
  errorText: { color: 'red', textAlign: 'center', marginBottom: 12 }, // Error message styling
});

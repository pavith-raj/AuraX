import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { loginUser } from '../../api/auth'; // Import login function
import { storeToken } from '../../api/storage'; // Import storeToken function

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // To handle loading state
  const [errorMessage, setErrorMessage] = useState(''); // To handle error message

  // Handle login logic
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(''); // Reset error message on new attempt

    try {
      const response = await loginUser({ email, password });
      console.log('Login successful:', response.data);

      // Save the JWT token securely using storeToken
      await storeToken(response.data.token); // Save token securely

      // After successful login, navigate to home or dashboard
      router.replace('/user'); // Redirect to home page after successful login
    } catch (error) {
      console.log('Login error:', error.response?.data?.message || error.message);
      setErrorMessage(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to AuraX</Text>

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

      {/* Show error message */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Login Button */}
      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Link to Signup Screen */}
      <TouchableOpacity onPress={() => router.push('/auth/signup')}>
        <Text style={styles.linkText}>Don't have an account? Create one</Text>
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

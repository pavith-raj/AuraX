import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { loginUser } from '../../api/auth'; // Import login function
import { storeToken } from '../../api/storage'; // Import storeToken function
import { MotiImage } from 'moti';
import { MaterialIcons } from '@expo/vector-icons';
import { useSalon } from '../../context/SalonContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const { setSalonId } = useSalon();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      // Handle both user and salon logins
      const { user, salon } = response.data;
      const role = user ? user.role : salon ? salon.role : null;

      // If it's a salon login, store the salon ID in context and AsyncStorage
      if (salon) {
        setSalonId(salon.id);
        await AsyncStorage.setItem('salonId', salon.id);
      }

      // Redirect based on role
      if (user) {
        router.replace('/user');
      } else if (salon) {
        router.replace('/owner/profile');
      } else {
        router.replace('/');
      } // Redirect to home page after successful login
    } catch (error) {
      const err = error as any;
      console.log('Login error:', err.response?.data?.message || err.message);
      setErrorMessage(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <View style={styles.container}>
               <View style={styles.logoContainer}>
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
      </View>
      <Text style={styles.title}>
  Time for Self-Care?{"\n"}
  <Text style={{ fontStyle: 'italic', fontWeight: '400' }}>Log In</Text>
</Text>



      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password Input */}
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

      {/* Show error message */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Login Button */}
      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Link to Signup Screen */}
      <TouchableOpacity onPress={() => router.push('/auth/roleSelection')}>
        <Text style={styles.linkText}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#EAD8D8', // Keep the existing background color
  },
  logoContainer: {
    alignItems: 'center', // Center the logo horizontally
    marginBottom: 30, // Add some space after the logo
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 20, // 🔁 Rounded edges
    resizeMode: 'contain',
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20, 
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#874646', // deeper rose
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'serif', // Or use a custom font if available
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12, // Slightly more rounded
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto', // Clean modern font
    shadowColor: '#000', // Shadow color for depth
    shadowOffset: { width: 0, height: 4 }, // Horizontal and vertical shadow offset
    shadowOpacity: 0.1, // Subtle shadow
    shadowRadius: 8, // Soft shadow
    elevation: 5, // Elevation for Android devices
  },

  button: {
    backgroundColor: '#A65E5E', // Keep the button color consistent
    padding: 14,
    borderRadius: 12, // Rounded edges
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  
  linkText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#828282',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
});
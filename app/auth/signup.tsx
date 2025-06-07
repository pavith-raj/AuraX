import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useCallback } from 'react';
import { registerUser } from '../../api/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlacesAutocompleteInput from '../../components/PlacesAutocomplete'; 


const GOOGLE_API_KEY = 'AIzaSyD9AOX5rjhxoThJDlVYPtkCtLNg7Vivpls'; 

export default function SignupScreen() {
  const router = useRouter();
  const { role = 'user' } = useLocalSearchParams();

  // States for signup form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [phone, setPhone] = useState(''); // For Salon Owner
  const [salonName, setSalonName] = useState(''); // For Salon Owner



  const [salonAddress, setSalonAddress] = useState(''); 
  // location will be derived from PlacesAutocompleteInput
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null }); 
  
  // State for the text input that uses PlacesAutocomplete for location
  const [locationSearchQuery, setLocationSearchQuery] = useState(''); 

  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Autocomplete specific states and ref for the LOCATION search input
  const [locationPredictions, setLocationPredictions] = useState([]); // Predictions for location search
  const locationPlacesInputRef = useRef(null); // Ref to control the PlacesAutocompleteInput component for location

  // Function to fetch full place details from Google Places Details API (for location)
  const fetchPlaceDetailsForLocation = async (place_id: string) => {
    try {
      // Requesting 'geometry' as we only need lat/lng for location
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GOOGLE_API_KEY}&fields=geometry,formatted_address`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.status === 'OK' && json.result) {
        return json.result;
      } else {
        console.error('Google Places Details Error for location:', json.status, json.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching place details for location:', error);
      return null;
    }
  };

  // Callback to receive predictions from PlacesAutocompleteInput for location
  const handleLocationPredictionsReady = useCallback((predictions) => {
    setLocationPredictions(predictions);
  }, []);

  // Callback for when user types in the PlacesAutocompleteInput for location
  const handleLocationQueryChange = useCallback((query) => {
    setLocationSearchQuery(query); // Update the query for the location input
    // If the user starts typing manually after selecting a location, clear the associated lat/lng
    if (location.lat !== null || location.lng !== null) {
        setLocation({ lat: null, lng: null });
    }
  }, [location]);

  // Handler for when a prediction item is pressed from the FlatList overlay (for location)
  const handleLocationPredictionPress = async (item: any) => {
    setLocationPredictions([]); // Clear predictions list immediately after selection

    const details = await fetchPlaceDetailsForLocation(item.place_id);

    if (details && details.geometry && details.geometry.location) {
      setLocation({
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
      });

      // Update the text in the PlacesAutocompleteInput to the selected formatted address (for display purposes)
      locationPlacesInputRef.current?.setQueryText(details.formatted_address || item.description);
      setErrorMessage(''); // Clear previous error messages

      console.log('Selected Location Coordinates:', details.geometry.location);
      console.log('Selected Location Address for display:', details.formatted_address || item.description);

    } else {
      console.warn('Selected place details missing geometry or location for location:', item, details);
      setLocation({ lat: null, lng: null });
      locationPlacesInputRef.current?.clear(); // Clear the input field if details couldn't be fetched
      setErrorMessage('Could not get location coordinates. Please try searching again.');
    }
  };

  // Handle signup logic
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Validate all required fields for owner role
      if (role === 'owner') {
        if (!salonName.trim()) {
          setErrorMessage('Please enter the Salon Name.');
          setLoading(false);
          return;
        }
        if (!phone.trim()) {
          setErrorMessage('Please enter the Phone Number.');
          setLoading(false);
          return;
        }
        // Validation: Ensure salonAddress (manual) and location (lat/lng from API) are present
        if (salonAddress.trim() === '') {
            setErrorMessage('Please enter the Salon Address manually.');
            setLoading(false);
            return;
        }
        if (location.lat === null || location.lng === null) {
            setErrorMessage('Please use the location search to pinpoint the salon\'s coordinates.');
            setLoading(false);
            return;
        }
      }

      // Prepare data for registration, exactly matching your backend schema
      const data = role === 'owner'
        ? {
            name,
            email,
            password,
            role,
            phone,
            salonName,
            salonAddress,       // Manually entered full precise address (string)
            location,           // {lat, lng} object from Places API
            services: []        // Assuming this is still part of your schema
          }
        : { name, email, password, role }; // Customer signup data

      const response = await registerUser(data);
      console.log('Registration successful:', response.data);
      Alert.alert('Success', 'Account created successfully! Please login.', [
        { text: 'OK', onPress: () => router.push('/auth/login') }
      ]);
    } catch (error: any) {
      console.log('Registration error:', error.response?.data?.message || error.message);
      setErrorMessage(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EAD8D8' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled" 
        >
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
              autoCapitalize="none"
            />

            {/* Password Input with Visibility Toggle */}
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
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                {/* Manual Salon Address Input */}
                <TextInput
                  style={styles.input}
                  placeholder="Salon Address (e.g., Street, Locality.)"
                  value={salonAddress}
                  onChangeText={setSalonAddress}
                  multiline={true} // Allow multiple lines for address
                  numberOfLines={3} // Provide some height
                  textAlignVertical="top" // Align text to top for multiline
                />

                {/* Places Autocomplete Input for Location Coordinates */}
                <Text style={styles.sectionHeading}>Pinpoint Location (Coordinates)</Text>
                <View style={styles.autocompleteWrapper}>
                  <PlacesAutocompleteInput
                    ref={locationPlacesInputRef} // Using the ref for location
                    onPredictionsReady={handleLocationPredictionsReady}
                    onQueryChange={handleLocationQueryChange}
                    initialQuery={locationSearchQuery} // Bind to its own state
                  />
                  {/* Autocomplete Predictions FlatList for Location - positioned absolutely */}
                  {locationPredictions.length > 0 && (
                    <View style={styles.autocompletePredictionsOverlay}>
                      <FlatList
                        data={locationPredictions}
                        keyExtractor={item => item.place_id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => handleLocationPredictionPress(item)}
                            style={styles.predictionItem}
                          >
                            <Text style={styles.predictionText}>{item.description}</Text>
                          </TouchableOpacity>
                        )}
                        keyboardShouldPersistTaps="always"
                      />
                    </View>
                  )}
                </View>

                {/* Display selected location details for user confirmation */}
                {location.lat !== null && location.lng !== null && (
                  <Text style={styles.selectedDetailText}>
                    **Selected Coordinates**: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </Text>
                )}
                {locationSearchQuery.trim() !== '' && location.lat === null && (
                    <Text style={styles.warningText}>Please select a precise location from suggestions.</Text>
                )}
              </>
            )}

            {/* Show error message */}
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            {/* Sign Up Button */}
            <TouchableOpacity onPress={handleSignup} style={styles.button} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Link to Login Screen */}
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  container: {
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#EAD8D8',
    position: 'relative',
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: { backgroundColor: '#000000', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkText: { marginTop: 16, textAlign: 'center', color: '#828282' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 12 },
  selectedDetailText: {
    marginTop: 0,
    marginBottom: 5,
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 5,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    color: '#333',
  },
  warningText: {
    fontSize: 12,
    color: 'orange',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 2, // Ensure this wrapper (and its children) are above other form elements
    marginBottom: 0, // No bottom margin for the wrapper itself, as input has its own
  },
  autocompletePredictionsOverlay: {
    position: 'absolute',
    top: 55, // Adjust this value to position the overlay directly below the input field
    left: 0,
    right: 0,
    maxHeight: 200, // Critical: Limits the height of the FlatList
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 1000, // Ensures the overlay appears on top of everything else
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  predictionText: {
    fontSize: 16,
  },
});
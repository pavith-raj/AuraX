import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../../components/BottomNav'; 
import { getUserProfile, updateUserProfile} from '../../../api/user'; // Import API functions
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definition for user profile data
type UserProfile = {
  name: string;
  email: string;
  phone: string;
  role?: string;
};

const ProfilePage = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null); // Initial state is null until data is fetched
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState<string>(''); // Specify type for error
  const navigation = useNavigation();

  // Fetch the logged-in user's data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Retrieve token
        console.log('Token before API call:', token);
        if (!token) throw new Error('No token found');
        const data = await getUserProfile(token);
        console.log('Fetched data:', data);  // Pass token
        setUserData(data);
        setUpdatedData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  
  const handleEditToggle = () => setEditing(!editing);

  const handleSaveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve token
      if (!token) throw new Error('No token found');
      
      const updatedUser = await updateUserProfile(token, updatedData); // Pass token and data
    // ✅ Correctly update userData to the latest user info
    setUserData(updatedUser);
    setEditing(false);
  } catch (error) {
    console.error('Error updating user profile:', error);
    setError('Failed to save changes');
  }
};
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'auth/login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to handle field changes in editing mode
  const handleChange = (field: keyof UserProfile, value: string) => {
    setUpdatedData({ ...updatedData, [field]: value });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>No user data available</Text>
      </View>
    );
  }
  

  return (
<>
  <ScrollView style={styles.container}>
    <View style={styles.profileCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitial}>
          {userData?.name?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.nameText}>{userData?.name}</Text>
      <Text style={styles.emailText}>{userData?.email}</Text>
      {userData?.role && (
  <View style={styles.roleBadge}>
    <Text style={styles.roleText}>{userData.role.toUpperCase()}</Text>
  </View>
)}

      <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
        <Text style={styles.editButtonText}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.fieldLabel}>Phone Number</Text>
      {editing ? (
        <TextInput
          style={styles.input}
          value={updatedData.phone}
          onChangeText={(text) => handleChange('phone', text)}
        />
      ) : (
        <Text style={styles.text}>{userData?.phone}</Text>
      )}

      {editing && (
        <>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={updatedData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={updatedData.email}
            onChangeText={(text) => handleChange('email', text)}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </>
      )}
    </View>

    {error ? <Text style={styles.errorText}>{error}</Text> : null}

    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.changePwdButton}
      onPress={() => navigation.navigate('change-password')}
      >
      <Text style={styles.changePwdText}>Change Password</Text>
    </TouchableOpacity>

  </ScrollView>
  <BottomNavBar activeTab="profile" />
</>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A65E5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarInitial: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B3B3B',
  },
  emailText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: '#FFD4D4',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  roleText: {
    color: '#A65E5E',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  editButton: {
    backgroundColor: '#A65E5E',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#A65E5E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePwdButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#A65E5E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  changePwdText: {
    color: '#A65E5E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});


export default ProfilePage;

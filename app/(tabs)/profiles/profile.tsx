import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../../components/BottomNav';
import { updateUserProfile } from '../../../api/user'; // Corrected import
import { AuthContext } from '../../../context/AuthContext'; // Import AuthContext

// Type definition for user profile data
type UserProfile = {
  name: string;
  email: string;
  phone: string;
  role?: string;
};

const ProfilePage = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext); // Get user and logout from context
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState<string>('');
  const navigation = useNavigation();

  // Set initial form data when user is loaded from context
  useEffect(() => {
    if (user) {
      setUpdatedData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigation.navigate('auth/login' as never);
    }
  }, [authLoading, user, navigation]);

  const handleEditToggle = () => setEditing(!editing);

  const handleSaveChanges = async () => {
    try {
      const updatedUser = await updateUserProfile(updatedData); // No token needed
      // Optionally, you can update the context's user state here if the backend returns the updated user
      setEditing(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to save changes');
    }
  };

  const handleLogout = () => {
    logout(); // Use logout from context
    // The navigation logic to the login screen should be handled globally,
    // possibly in a top-level component that observes the user state.
    // For now, we assume the context change will trigger a redirect.
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setUpdatedData({ ...updatedData, [field]: value });
  };

  if (authLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#A65E5E" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No user data available. Please log in.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('auth/login' as never)}>
            <Text style={styles.logoutButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nameText}>{user?.name}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
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
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.text}>{user?.phone}</Text>
          )}
          
          {editing && (
            <>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={updatedData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={updatedData.name}
                onChangeText={(text) => handleChange('name', text)}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  disabledInput: {
      backgroundColor: '#f0f0f0',
      color: '#888'
  },
  saveBtn: {
    backgroundColor: '#5cb85c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#A65E5E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
export default ProfilePage;


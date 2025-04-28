import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../../components/BottomNav';  // adjust the path if needed

const sampleUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 890',
  profilePicture: 'https://via.placeholder.com/150',
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(sampleUserData);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({ ...userData });
  const navigation = useNavigation();

  const handleEditToggle = () => setEditing(!editing);

  const handleSaveChanges = () => {
    setUserData(updatedData);
    setEditing(false);
  };

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleChange = (field, value) => {
    setUpdatedData({ ...updatedData, [field]: value });
  };

  return (
    <>
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
          <Text style={styles.editButtonText}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <Text style={styles.fieldLabel}>Name</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={updatedData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        ) : (
          <Text style={styles.text}>{userData.name}</Text>
        )}

        <Text style={styles.fieldLabel}>Email</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={updatedData.email}
            onChangeText={(text) => handleChange('email', text)}
          />
        ) : (
          <Text style={styles.text}>{userData.email}</Text>
        )}

        <Text style={styles.fieldLabel}>Phone</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={updatedData.phone}
            onChangeText={(text) => handleChange('phone', text)}
          />
        ) : (
          <Text style={styles.text}>{userData.phone}</Text>
        )}

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    <BottomNavBar activeTab='profile' />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAD8D8',
    padding: 16,
    paddingTop: 60,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#A65E5E',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#A65E5E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileInfo: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    color: '#777',
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutSection: {
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#A65E5E',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePage;

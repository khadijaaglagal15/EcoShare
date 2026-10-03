import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useApp } from '@/context/AppContext';
import { theme } from '@/constants/theme';
import api from '../api';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function AccountInformationScreen() {
  const { profile, setUser, setProfile } = useApp();
  const [fullname, setName] = useState(profile?.fullname || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [profilePic, setProfilePic] = useState(profile?.profile_picture || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  console.log(profile.profile_picture);
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('gender', gender);
      formData.append('phone', phone);
      if (profilePic && !profilePic.startsWith('http')) {
        formData.append('profile_picture', {
          uri: profilePic,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }
      const res = await api.put('/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const profileRes = await api.get('/profile/');
      setUser(profileRes.data);
      setProfile(profileRes.data);
      setProfilePic(profileRes.data.profile_picture || '');
      Alert.alert('Success', 'Your information has been updated.');
      router.back(); // Navigate to home or any other screen after success
    } catch (e) {
      Alert.alert('Error', "Couldn't update your information.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
        {profilePic ? (
          <Image source={{ uri: profilePic ||  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{ color: '#aaa', fontSize: 32 }}>+</Text>
          </View>
        )}
        <Text style={styles.avatarEditText}>Change profile picture</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={fullname || ''}
        onChangeText={setName}
        placeholder="Your name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail || ''}
        placeholder="Your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={setGender || 'Male'}
          style={styles.picker}
        >
          <Picker.Item label="Select gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone || ''}
        placeholder="Phone"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 6,
    color: theme.colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#F9F9F9',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarEditText: {
    color: theme.colors.primary,
    fontSize: 14,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
  },
  picker: {
    height: 44,
    width: '100%',
  },
});
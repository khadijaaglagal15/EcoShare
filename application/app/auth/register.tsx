import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { X, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    console.log('Bouton cliqué');
    console.log('Valeurs:', {name, email, phone, gender, password, confirmPassword});

    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const { data } = await api.post('/register/', {
        fullname: name,
        email,
        phone,
        gender,
        password,
      });

      setSuccessMessage('Inscription réussie ! Redirection...');
      
      await AsyncStorage.setItem('access_token', data.access_token);
      login(data.token);

      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      // Ajoute cette ligne pour voir le détail de l'erreur dans la console
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // @ts-expect-error: error is unknown, but we check for 'response'
        console.log(error.response?.data);
      }

      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: any } };
        const data = responseError.response?.data;
        let message = 'Something went wrong.';
        if (typeof data === 'object' && data !== null) {
          message = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        }
        Alert.alert('Registration failed', message);
      } else {
        Alert.alert('Registration failed', 'Something went wrong.');
      }
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/auth/login')}
        >
          <ChevronLeft size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Create account</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.back()}
        >
          <X size={24} color={theme.colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.form}
        >
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.gray[500]}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.colors.gray[500]}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={theme.colors.gray[500]}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Male' && styles.genderButtonActive
              ]}
              onPress={() => setGender('Male')}
            >
              <Text style={[
                styles.genderText,
                gender === 'Male' && styles.genderTextActive
              ]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Female' && styles.genderButtonActive
              ]}
              onPress={() => setGender('Female')}
            >
              <Text style={[
                styles.genderText,
                gender === 'Female' && styles.genderTextActive
              ]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.colors.gray[500]}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={theme.colors.gray[600]} />
              ) : (
                <Eye size={20} color={theme.colors.gray[600]} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.passwordHint}>
            Password must be at least 8 characters
          </Text>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={theme.colors.gray[500]}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={theme.colors.gray[600]} />
              ) : (
                <Eye size={20} color={theme.colors.gray[600]} />
              )}
            </TouchableOpacity>
          </View>

          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <Button
            title="Create account"
            onPress={handleRegister}
            size="large"
            fullWidth
            style={styles.registerButton}
          />

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      
      <Text style={styles.terms}>
        By continuing, you agree to our <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
      </Text>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: theme.spacing.lg,
    top: theme.spacing.lg,
    padding: 4,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.xl,
    color: theme.colors.black,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: theme.spacing.lg,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.lg,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  genderButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  genderText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[800],
  },
  genderTextActive: {
    color: theme.colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  passwordInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  eyeButton: {
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
  },
  passwordHint: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
  },
  successContainer: {
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  successText: {
    color: theme.colors.black,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  registerButton: {
    marginBottom: theme.spacing.xl,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  loginLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  terms: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  link: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
});
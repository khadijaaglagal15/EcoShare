import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { X, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';


export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const { data } = await api.post('/login/', {
        email,
        password,
      });
  
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      login(data.token);
      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
    
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { detail?: string } } };
        Alert.alert('Login failed', responseError.response?.data?.detail || 'Something went wrong.');
      } else {
        Alert.alert('Login failed', 'Something went wrong.');
      }
    }
    
  };
  


  const navigateToRegister = () => {
    router.push('/auth/register');
  };
  const navigateToForgotPassword = () => {
    router.push('/auth/forgot-password'); 
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Log in</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={theme.colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.form}
      >
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

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Your password"
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

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={navigateToForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>


        <Button
          title="Log in"
          onPress={handleLogin}
          size="large"
          fullWidth
          style={styles.loginButton}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Create an account"
          onPress={navigateToRegister}
          variant="outline"
          size="large"
          fullWidth
          style={styles.registerButton}
        />
      </Animated.View>

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
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  loginButton: {
    marginBottom: theme.spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
  dividerText: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    marginHorizontal: theme.spacing.md,
  },
  registerButton: {
    marginBottom: theme.spacing.lg,
  },
  terms: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: 0,
    right: 0,
  },
  link: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
});
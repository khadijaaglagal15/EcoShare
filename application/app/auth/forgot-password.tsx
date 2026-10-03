import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { X } from 'lucide-react-native';
import axios from 'axios';
import { Alert } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('https://your-api-domain.com/api/forgot-password', { email });

      if (response.data.success) {
        router.push('/auth/otp'); 
      } else {
        Alert.alert('Error', 'Something went wrong or invalid email.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Could not send OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={theme.colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.instruction}>
          Enter the email associated with your account to receive an OTP.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={theme.colors.gray[500]}
        />

        <Button
          title="Send OTP"
          onPress={handleForgotPassword}
          size="large"
          fullWidth
          style={styles.sendButton}
        />
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  instruction: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[700],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.lg,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  sendButton: {
    marginBottom: theme.spacing.lg,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { X } from 'lucide-react-native';
import axios from 'axios';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState('');
  const { email } = useLocalSearchParams();
  const router = useRouter();

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('https://your-api-domain.com/api/verify-otp', {
        email,
        otp,
      });

      if (response.data.success) {
        // OTP verified, navigate to reset password screen
        router.push('/auth/reset-password');
      } else {
        Alert.alert('Verification failed', 'Invalid OTP code.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { detail?: string } } };
        Alert.alert('Verification failed', responseError.response?.data?.detail || 'Something went wrong.');
      } else {
        Alert.alert('Verification failed', 'Something went wrong.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify OTP</Text>
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
          Enter the OTP sent to {email}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
          placeholderTextColor={theme.colors.gray[500]}
        />

        <Button
          title="Verify OTP"
          onPress={handleVerifyOtp}
          size="large"
          fullWidth
          style={styles.verifyButton}
        />

        <TouchableOpacity style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>
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
  verifyButton: {
    marginBottom: theme.spacing.lg,
  },
  resendContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  resendText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  resendLink: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
});

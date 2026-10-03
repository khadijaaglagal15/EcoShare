import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Mail, Smartphone, RefreshCw, CheckCircle } from 'lucide-react-native';

const TwoFactorAuthScreen = () => {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setIsVerified(true);
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      Alert.alert('Verification Failed', 'The code you entered is incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) clearInterval(timer);
        return prev - 1;
      });
    }, 1000);

    // Animation for resend button
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert('Code Sent', `A new verification code has been sent to your ${method}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Two-Factor Authentication</Text>
      </View>

      <View style={styles.content}>
        {/* Method Selector */}
        <View style={styles.methodSelector}>
          <TouchableOpacity
            style={[styles.methodButton, method === 'email' && styles.methodButtonActive]}
            onPress={() => setMethod('email')}
          >
            <Mail size={20} color={method === 'email' ? theme.colors.white : theme.colors.primary} />
            <Text style={[styles.methodText, method === 'email' && styles.methodTextActive]}>
              Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodButton, method === 'sms' && styles.methodButtonActive]}
            onPress={() => setMethod('sms')}
          >
            <Smartphone size={20} color={method === 'sms' ? theme.colors.white : theme.colors.primary} />
            <Text style={[styles.methodText, method === 'sms' && styles.methodTextActive]}>
              SMS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verification Code Input */}
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.codeContainer}>
            <Lock size={24} color={theme.colors.primary} style={styles.lockIcon} />
            <Text style={styles.instruction}>
              Enter the 6-digit code sent to your {method === 'email' ? 'email' : 'phone'}
            </Text>
            
            <TextInput
              style={styles.codeInput}
              placeholder="••••••"
              placeholderTextColor={theme.colors.gray[400]}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <Animated.View style={{ opacity: fadeAnim }}>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? (
                  <Text style={styles.resendText}>
                    Resend in {resendCooldown}s
                  </Text>
                ) : (
                  <View style={styles.resendContainer}>
                    <RefreshCw size={16} color={theme.colors.primary} />
                    <Text style={styles.resendText}>Resend Code</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Verification Button */}
        <TouchableOpacity
          style={[styles.verifyButton, (isLoading || isVerified) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isLoading || isVerified}
        >
          {isVerified ? (
            <View style={styles.successContainer}>
              <CheckCircle size={20} color={theme.colors.white} />
              <Text style={styles.verifyButtonText}>Verified!</Text>
            </View>
          ) : (
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontFamily: 'Poppins-SemiBold',
    color: theme.colors.black,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  methodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  methodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  methodText: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  methodTextActive: {
    color: theme.colors.white,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  codeContainer: {
    alignItems: 'center',
  },
  lockIcon: {
    marginBottom: theme.spacing.md,
  },
  instruction: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  codeInput: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 32,
    letterSpacing: 8,
    color: theme.colors.black,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: '100%',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  resendButton: {
    marginTop: theme.spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  resendText: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: theme.colors.primaryLight,
  },
  verifyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});

export default TwoFactorAuthScreen;
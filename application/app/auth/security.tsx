import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Lock, Shield, Fingerprint, Eye, EyeOff, Bell, Smartphone, Mail, LogOut } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const SecurityScreen = () => {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [hideSensitiveData, setHideSensitiveData] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [activeSessions, setActiveSessions] = useState([
    { id: '1', device: 'iPhone 13 Pro', location: 'New York, NY', lastActive: '2 mins ago', current: true },
    { id: '2', device: 'MacBook Pro', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
  ]);

  const toggleSwitch = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!value);
  };

  const securityFeatures = [
    {
      icon: <Fingerprint size={24} color={theme.colors.primary} />,
      title: 'Biometric Authentication',
      description: 'Use face ID or fingerprint to log in',
      action: () => toggleSwitch(setBiometricEnabled, biometricEnabled),
      value: biometricEnabled,
    },
    {
      icon: <Eye size={24} color={theme.colors.primary} />,
      title: 'Hide Sensitive Data',
      description: 'Mask personal information in app',
      action: () => toggleSwitch(setHideSensitiveData, hideSensitiveData),
      value: hideSensitiveData,
    },
    {
      icon: <Bell size={24} color={theme.colors.primary} />,
      title: 'Security Alerts',
      description: 'Get notified about suspicious activity',
      action: () => toggleSwitch(setSecurityAlerts, securityAlerts),
      value: securityAlerts,
    },
  ];

  const recoveryOptions = [
    {
      icon: <Smartphone size={20} color={theme.colors.primary} />,
      title: 'Phone Number',
      value: '+1 ••• ••• 1234',
      verified: true,
    },
    {
      icon: <Mail size={20} color={theme.colors.primary} />,
      title: 'Email Address',
      value: 'j••••@example.com',
      verified: true,
    },
  ];

  const endSession = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveSessions(activeSessions.filter(session => session.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Security Status Card */}
        <Animated.View 
          style={styles.statusCard}
          entering={FadeIn.duration(300)}
        >
          <LinearGradient
            colors={['#6E45E2', '#88D3CE']}
            style={styles.statusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Shield size={32} color="white" />
            <Text style={styles.statusTitle}>Security Status: Protected</Text>
            <Text style={styles.statusText}>All security features are active</Text>
          </LinearGradient>
        </Animated.View>

        {/* Security Features */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(100)}
        >
          <Text style={styles.sectionTitle}>Security Features</Text>
          {securityFeatures.map((feature, index) => (
            <View key={index}>
              <TouchableOpacity 
                style={styles.featureItem}
                onPress={feature.action}
              >
                <View style={styles.featureIcon}>
                  {feature.icon}
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
                <Switch
                  value={feature.value}
                  onValueChange={feature.action}
                  trackColor={{ false: theme.colors.gray[200], true: theme.colors.primary }}
                  thumbColor="white"
                />
              </TouchableOpacity>
              {index < securityFeatures.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Animated.View>

        {/* Recovery Options */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(200)}
        >
          <Text style={styles.sectionTitle}>Recovery Options</Text>
          {recoveryOptions.map((option, index) => (
            <View key={index}>
              <View style={styles.recoveryItem}>
                <View style={styles.recoveryIcon}>
                  {option.icon}
                </View>
                <View style={styles.recoveryText}>
                  <Text style={styles.recoveryTitle}>{option.title}</Text>
                  <Text style={styles.recoveryValue}>{option.value}</Text>
                </View>
                {option.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              {index < recoveryOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Animated.View>

        {/* Active Sessions */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(300)}
        >
          <Text style={styles.sectionTitle}>Active Sessions (2)</Text>
          {activeSessions.map((session, index) => (
            <View key={session.id}>
              <View style={styles.sessionItem}>
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionDevice}>{session.device}</Text>
                  <Text style={styles.sessionLocation}>{session.location}</Text>
                  <Text style={styles.sessionTime}>{session.lastActive}</Text>
                </View>
                {session.current ? (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>Current</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.endSessionButton}
                    onPress={() => endSession(session.id)}
                  >
                    <Text style={styles.endSessionText}>End Session</Text>
                  </TouchableOpacity>
                )}
              </View>
              {index < activeSessions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Animated.View>

        {/* Advanced Security */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(400)}
        >
          <Text style={styles.sectionTitle}>Advanced</Text>
          <TouchableOpacity 
            style={styles.advancedItem}
            
          >
            <Text style={styles.advancedText}>Security Activity</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.advancedItem}
            onPress={() => router.push('/auth/change_password')}
          >
            <Text style={styles.advancedText}>Change Password</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.advancedItem}
            onPress={() => router.push('/auth/2fa')}
          >
            <Text style={styles.advancedText}>Two-Factor Authentication</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          style={styles.logoutContainer}
          entering={FadeInDown.delay(500)}
        >
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => router.push('/auth/login')}
          >
            <LogOut size={18} color={theme.colors.error} />
            <Text style={styles.logoutText}>Log Out of All Devices</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  statusCard: {
    margin: theme.spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadow.medium,
  },
  statusGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  statusTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: 'white',
    marginTop: theme.spacing.md,
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: theme.spacing.xs,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    ...theme.shadow.small,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  featureIcon: {
    marginRight: theme.spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.black,
  },
  featureDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[100],
    marginVertical: theme.spacing.sm,
  },
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  recoveryIcon: {
    marginRight: theme.spacing.md,
  },
  recoveryText: {
    flex: 1,
  },
  recoveryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
  },
  recoveryValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#4CAF50',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionDevice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.black,
  },
  sessionLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  sessionTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: theme.colors.primary,
  },
  endSessionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  endSessionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: theme.colors.error,
  },
  advancedItem: {
    paddingVertical: theme.spacing.sm,
  },
  advancedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: theme.colors.black,
  },
  logoutContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
});

export default SecurityScreen;
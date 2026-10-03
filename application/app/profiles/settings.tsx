import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Settings, Bell, Lock, Shield, Moon, Palette, Globe, HelpCircle, Mail, LogOut } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [biometricEnabled, setBiometricEnabled] = React.useState(true);

  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const toggleSwitch = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!value);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeIn.duration(300)}
        >
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerLine} />
        </Animated.View>

        {/* Account Section */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.duration(400).delay(50)}
        >
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleNavigate('/settings/account_information')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#6E45E2', '#88D3CE']}
              style={styles.settingIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Settings size={18} color="white" />
            </LinearGradient>
            <Text style={styles.settingText}>Account Information</Text>
            <View style={styles.chevron} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleNavigate('/settings/notifications')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FF9A9E', '#FAD0C4']}
              style={styles.settingIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Bell size={18} color="white" />
            </LinearGradient>
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={() => toggleSwitch(setNotificationsEnabled, notificationsEnabled)}
              trackColor={{ false: theme.colors.gray[200], true: '#FF9A9E' }}
              thumbColor="white"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleNavigate('/settings/security')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.settingIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Lock size={18} color="white" />
            </LinearGradient>
            <Text style={styles.settingText}>Security</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={() => toggleSwitch(setBiometricEnabled, biometricEnabled)}
              trackColor={{ false: theme.colors.gray[200], true: '#4facfe' }}
              thumbColor="white"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* App Preferences */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.duration(400).delay(100)}
        >
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleNavigate('/settings/appearance')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#a18cd1', '#fbc2eb']}
              style={styles.settingIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Palette size={18} color="white" />
            </LinearGradient>
            <Text style={styles.settingText}>Appearance</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={() => toggleSwitch(setDarkModeEnabled, darkModeEnabled)}
              trackColor={{ false: theme.colors.gray[200], true: '#a18cd1' }}
              thumbColor="white"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleNavigate('/settings/language')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              style={styles.settingIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Globe size={18} color="white" />
            </LinearGradient>
            <Text style={styles.settingText}>Language</Text>
            <View style={styles.chevron} />
          </TouchableOpacity>
        </Animated.View>

        {/* Support Section */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.duration(400).delay(150)}
        >
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleNavigate('/settings/help')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#ff758c', '#ff7eb3']}
              style={styles.settingIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <HelpCircle size={18} color="white" />
            </LinearGradient>
            <Text style={styles.settingText}>Help Center</Text>
            <View style={styles.chevron} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleNavigate('/settings/contact')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#a6c1ee', '#fbc2eb']}
              style={styles.settingIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Mail size={18} color="white" />
            </LinearGradient>
            <Text style={styles.settingText}>Contact Us</Text>
            <View style={styles.chevron} />
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          style={styles.logoutContainer}
          entering={FadeInDown.duration(400).delay(200)}
        >
          {/* <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => router.push('/logout-confirm')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              style={styles.logoutButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LogOut size={18} color="white" />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity> */}
        </Animated.View>

        {/* App Version */}
        <Animated.View
          style={styles.versionContainer}
          entering={FadeInDown.duration(400).delay(250)}
        >
          <Text style={styles.versionText}>Version 2.4.8</Text>
        </Animated.View>
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  headerLine: {
    height: 4,
    width: 60,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    ...theme.shadow.small,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.gray[800],
  },
  chevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadow.small,
  },
  logoutButtonGradient: {
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[400],
  },
});
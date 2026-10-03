import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { LogOut, Heart, Settings, Package, Star, ShoppingBag, CircleHelp as HelpCircle, MessageSquare, ChevronRight, Award, Shield, CreditCard } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, ZoomIn, ZoomOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { userProducts, isAuthenticated,profile, logout } = useApp();
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  // const [userProducts, setUserProducts] = useState<any[]>([]);

  // const [profile, setProfile] = useState<any>(null);
  // const fetchUserProfile = async () => {
  //   try {
  //     const response = await api.get('/profile/'); // adapte l'URL si besoin
  //     setProfile(response.data);
  //   } catch (error) {
  //     // Gère l'erreur si besoin
  //     setProfile(null);
  //   }
  // };
  
  useEffect(() => {
  //   const fetchUserProducts = async () => {
  //   try {
  //     const res = await api.get('/user-products/'); 
  //     setUserProducts(res.data);
  //   } catch (e) {
  //     setUserProducts([]);
  //   }
  // };
    if (isAuthenticated) {
      // fetchUserProfile();
      // fetchUserProducts();
      

    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogoutModalVisible(false);
    logout();
  };

  const confirmLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogoutModalVisible(true);
  };

  const navigateToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.authContainer}
        >
          <LinearGradient
            colors={['#6E45E2', '#88D3CE']}
            style={styles.authGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              style={styles.authImage}
              contentFit="contain"
            />
          </LinearGradient>

          <View style={styles.authContent}>
            <Text style={styles.authTitle}>Join Our Community</Text>
            <Text style={styles.authText}>
              Sign up to buy, sell, and discover amazing second-hand items in your area. Get personalized recommendations and exclusive deals.
            </Text>

            <Animated.View entering={FadeIn.delay(200)}>
              <Button
                title="Get Started"
                onPress={navigateToLogin}
                size="large"
                style={styles.authButton}
                textStyle={styles.authButtonText}
                gradient={['#6E45E2', '#88D3CE']}
              />
            </Animated.View>
            
            <TouchableOpacity
              style={styles.loginPrompt}
              onPress={navigateToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginPromptText}>Already have an account? <Text style={styles.loginPromptHighlight}>Log in</Text></Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with animated background */}
        <Animated.View
          style={styles.headerBackground}
          entering={FadeIn.duration(600)}
        />

        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/profiles/settings')}
            activeOpacity={0.7}
          >
            <Settings size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Animated.View
          style={styles.profileCard}
          entering={ZoomIn.duration(500).springify()}
        >
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#6E45E2', '#88D3CE']}
              style={styles.avatarContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={{ uri: profile?.profile_picture ||  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                style={styles.avatar}
                contentFit="cover"
              />
            </LinearGradient>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{profile?.fullname || "Unknown"}</Text>
              <Text style={styles.memberSince}>
                Member since {profile?.date_joined ? new Date(profile.date_joined).getFullYear() : 'None'}
              </Text>
              <View style={styles.ratingContainer}>
                <View style={styles.ratingBadge}>
                  <Star size={14} color={theme.colors.white} fill={theme.colors.white} />
                  <Text style={styles.ratingText}>{profile?.rating ||'0.0'}</Text>
                </View>
               
              </View>
            </View>
          </View>

          {/* Stats with animated appearance */}
          <Animated.View
            style={styles.statsSection}
            entering={FadeIn.delay(200)}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProducts.filter((p) => p.sold === false).length || 0}</Text>
              <Text style={styles.statLabel}>Listed</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProducts.filter((p) => p.sold === true).length}</Text>
              <Text style={styles.statLabel}>Sold</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(profile?.rating)/5 * 100}%</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Premium Card */}
        <Animated.View
          style={styles.premiumCard}
          entering={SlideInDown.duration(500).springify()}
        >
          <LinearGradient
            colors={['#FF9A9E', '#FAD0C4']}
            style={styles.premiumGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.premiumContent}>
              <View style={styles.premiumBadge}>
                <Award size={16} color="#FF9A9E" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
              <Text style={styles.premiumTitle}>Upgrade Your Account</Text>
              <Text style={styles.premiumText}>Get verified badge, featured listings and more visibility</Text>

              <TouchableOpacity
                style={styles.premiumButton}
                activeOpacity={0.8}
              >
                <Text style={styles.premiumButtonText}>Upgrade Now</Text>
                <ChevronRight size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Menu Section */}
        <Animated.View
          style={styles.menuSection}
          entering={FadeIn.delay(400)}
        >
          <Text style={styles.sectionTitle}>My Account</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profiles/listings');
            }}
          >
            <View style={styles.menuIcon}>
              <ShoppingBag size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>My Listings</Text>
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profiles/purchases');
            }}
          >
            <View style={styles.menuIcon}>
              <Package size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Purchases</Text>
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profiles/favorites');
            }}
          >
            <View style={styles.menuIcon}>
              <Heart size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Favorites</Text>
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/messages');
            }}
          >
            <View style={styles.menuIcon}>
              <MessageSquare size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Messages</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Second Menu Section */}
        <Animated.View
          style={[styles.menuSection, { marginTop: 16 }]}
          entering={FadeIn.delay(600)}
        >
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profiles/help');
            }}
          >
            <View style={styles.menuIcon}>
              <HelpCircle size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Help Center</Text>
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profiles/payments');
            }}
          >
            <View style={styles.menuIcon}>
              <CreditCard size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Payments</Text>
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/auth/security');
            }}
          >
            <View style={styles.menuIcon}>
              <Shield size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Security</Text>
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          entering={FadeIn.delay(800)}
          style={styles.logoutContainer}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmLogout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color={theme.colors.error} />
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

       {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={styles.modalContainer}
            entering={ZoomIn.springify().damping(15)}
            exiting={ZoomOut}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <LogOut size={24} color={theme.colors.error} />
              </View>
              <Text style={styles.modalTitle}>Log Out?</Text>
            </View>

            <Text style={styles.modalMessage}>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLogoutModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    zIndex: 1,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
  },
  profileCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    marginHorizontal: theme.spacing.lg,
    marginTop: 10,
    padding: theme.spacing.lg,
    ...theme.shadow.large,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.small,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: theme.colors.black,
    marginBottom: 4,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: theme.colors.white,
    marginLeft: 4,
  },
  memberSince: {
    fontFamily: 'Inter-Regular',
    marginBottom: 15,
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadow.medium,
  },
  premiumGradient: {
    padding: theme.spacing.lg,
  },
  premiumContent: {
    padding: theme.spacing.md,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  premiumBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: theme.colors.white,
    marginLeft: 5,
    letterSpacing: 1,
  },
  premiumTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: theme.colors.white,
    marginBottom: 5,
  },
  premiumText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
    lineHeight: 20,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  premiumButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.white,
    marginRight: 5,
  },
  menuSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    ...theme.shadow.small,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[700],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(104, 66, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: theme.colors.gray[800],
  },
  badge: {
    backgroundColor: theme.colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: theme.colors.white,
  },
  logoutContainer: {
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  logoutButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadow.large,
    transform: [{ scale: 0.95 }], // Slightly scaled down for subtle effect
  },
  modalHeader: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.black,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: theme.colors.gray[100],
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: theme.colors.gray[700],
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: theme.colors.white,
  },
  confirmButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: theme.colors.error,
    textAlign: 'center',
  },
  // Auth styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  authGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.medium,
  },
  authImage: {
    width: 60,
    height: 60,
  },
  authContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 25,
    padding: theme.spacing.xl,
    ...theme.shadow.medium,
  },
  authTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  authText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  authButton: {
    marginBottom: theme.spacing.lg,
  },
  authButtonText: {
    fontFamily: 'Inter-SemiBold',
  },
  loginPrompt: {
    alignSelf: 'center',
  },
  loginPromptText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  loginPromptHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import MessageItem from '@/components/MessageItem';
import Button from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MessageSquareX, Search, Filter, Bell, X, Loader } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';
import { IP } from '../api';
import { Conversation } from '@/types';

// Enhanced blue colors from your theme
const enhancedColors = {
  primary: theme.colors.primary,
  background: {
    light: theme.colors.white,
    dark: theme.colors.gray[900],
  },
  gradient: {
    primary: [theme.colors.primary, theme.colors.secondary],
    accent: [theme.colors.accent, '#4FC3F7'],
  },
  error: theme.colors.error,
};

export default function MessagesScreen() {
  const { isAuthenticated } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ← Ajoute ce state
  const [hasNotifications, setHasNotifications] = useState(true);

  // Animation values
  const headerHeight = useSharedValue(60);
  const searchBarOpacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = conversations.filter(
        conv =>
          conv.receiver_fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  const navigateToNewMessage = () => {
    router.push('/');
  };

  const handleSearch = () => {
    searchBarOpacity.value = searchFocused ? withSpring(1) : withSpring(0);
    headerHeight.value = searchFocused ? withSpring(110) : withSpring(60);
  };

  useEffect(() => {
    handleSearch();
  }, [searchFocused]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: searchBarOpacity.value,
      transform: [{ translateY: (1 - searchBarOpacity.value) * -20 }],
    };
  });

  const filterConversations = (filterType: string) => {
    setActiveFilter(filterType);

    switch (filterType) {
      case 'unread':
        setFilteredConversations(conversations.filter(conv => conv.unread));
        break;
      case 'recent':
        setFilteredConversations([...conversations].sort((a, b) =>
          new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
        ));
        break;
      default:
        setFilteredConversations(conversations);
    }
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <View style={styles.headerTopRow}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSearchFocused(!searchFocused)}
          >
            {searchFocused ? (
              <X size={22} color={theme.colors.gray[700]} />
            ) : (
              <Search size={22} color={theme.colors.gray[700]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={22} color={theme.colors.gray[700]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View>
              <Bell size={22} color={theme.colors.gray[700]} />
              {hasNotifications && <View style={styles.notificationDot} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={theme.colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.gray[400]}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
        {['all', 'unread', 'recent', 'archived'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
            onPress={() => filterConversations(filter)}
          >
            <Text style={[styles.filterChipText, activeFilter === filter && styles.activeFilterChipText]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Déplace la logique de récupération dans une fonction
  const fetchConversations = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const res = await api.get('/conversations/');
      const mapped: Conversation[] = res.data.map((conv: Conversation) => ({
        ...conv,
        receiver_avatar: conv.receiver_avatar.startsWith('http') ? conv.receiver_avatar : `${IP}${conv.receiver_avatar}`,
        product: conv.product && conv.product.image
          ? { 
              ...conv.product,
              image: conv.product.image.startsWith('http')
                ? conv.product.image
                : `${IP}${conv.product.image}`,
            }
          : conv.product,
      }));
      setConversations(mapped);
      setFilteredConversations(mapped);
    } catch (e) {
      setConversations([]);
      setFilteredConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.loadingContent}>
            <Loader size={40} color={enhancedColors.primary} style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <Animated.View entering={FadeIn.duration(400)} style={styles.authContainer}>
          <LinearGradient colors={enhancedColors.gradient.accent as [string, string]} style={styles.iconGradient}>
            <MessageSquareX size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.authTitle}>No messages yet</Text>
          <Text style={styles.authText}>
            Log in to view your messages and communicate with sellers
          </Text>
          <LinearGradient
            colors={enhancedColors.gradient.primary as [string, string]}
            style={styles.gradientButton}
          >
            <Button
              title="Log in"
              onPress={navigateToLogin}
              size="large"
              style={styles.authButton}
              textStyle={styles.authButtonText}
            />
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      {filteredConversations.length > 0 ? (
        <>
          {renderFilters()}
          <FlatList
            data={filteredConversations}
            renderItem={({ item, index }) => (
              <Animated.View entering={SlideInUp.delay(index * 100).duration(400)}>
                <MessageItem conversation={item} />
              </Animated.View>
            )}
            keyExtractor={(item, index) => item.receiver_id ? item.receiver_id.toString() : index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchConversations} />
            }
          />
          <TouchableOpacity style={styles.fabButton} onPress={navigateToNewMessage}>
            <LinearGradient colors={enhancedColors.gradient.primary as [string, string]} style={styles.fabGradient}>
              <Text style={styles.fabIcon}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
          <LinearGradient colors={enhancedColors.gradient.accent as [string, string]} style={styles.iconGradient}>
            <MessageSquareX size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No messages found</Text>
          <Text style={styles.emptyText}>
            When you start conversations with sellers, they'll appear here
          </Text>
          <LinearGradient
            colors={enhancedColors.gradient.primary as [string, string]}
            style={styles.gradientButton}
          >
            <Button
              title="Start a conversation"
              onPress={navigateToNewMessage}
              size="large"
              style={styles.newMessageButton}
              textStyle={styles.newMessageButtonText}
            />
          </LinearGradient>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[100],
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: theme.fontSize.xl,
    color: theme.colors.black,
  },
  searchContainer: {
    marginTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    height: 40,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[800],
    height: '100%',
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.black,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  authTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  authText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  gradientButton: {
    borderRadius: 12,
    width: '80%',
    overflow: 'hidden',
  },
  authButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    width: '100%',
  },
  authButtonText: {
    color: theme.colors.white,
    fontFamily: 'Poppins-SemiBold',
  },
  newMessageButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    width: '100%',
  },
  newMessageButtonText: {
    color: theme.colors.white,
    fontFamily: 'Poppins-SemiBold',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 30,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  filtersContainer: {
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  filtersScrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[700],
  },
  activeFilterChipText: {
    color: theme.colors.white,
  },
});
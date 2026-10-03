import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, ChevronRight, MapPin, Sliders } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import ProductCard from '@/components/ProductCard';
import CategoryItem from '@/components/CategoryItem';
import Button from '@/components/Button';
import { useApp } from '@/context/AppContext';
import api from '../api';
import { Category, Product } from '@/types';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;
const HEADER_EXPANDED_HEIGHT = 100;




export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user , profile} = useApp();

  // State management with proper types
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // const [profile, setProfile] = useState<any>(null);
  // const fetchUserProfile = async () => {
  //     try {
  //       const response = await api.get('/profile/'); // adapte l'URL si besoin
  //       setProfile(response.data);
  //     } catch (error) {
  //       // Gère l'erreur si besoin
  //       setProfile(null);
  //     }
  // };
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     fetchUserProfile();
  //   }
  // }, [isAuthenticated]);

  // Animation ref for scroll effects
  const scrollY = useRef(new Animated.Value(0)).current;

  // Update the fetchData function in your HomeScreen component
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories and products with query parameters
      const [categoriesResponse, featuredResponse, recentResponse] = await Promise.all([
        api.get<Category[]>('/categories/'),
        api.get<Product[]>('/products/?featured=true'),
        api.get<Product[]>('/products/?recent=true')
      ]);

      setCategories(categoriesResponse.data);
      setFeaturedProducts(featuredResponse.data);
      setRecentProducts(recentResponse.data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update the fetchCategoryProducts function
  const fetchCategoryProducts = async (categoryId: number) => {
    try {
      setLoading(true);
      // Changed to use the main products endpoint with category filter
      const response = await api.get<Product[]>(`/products/?categorie=${categoryId}`);
      setRecentProducts(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load category products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);



  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle category selection
  const handleCategoryPress = (category: Category) => {
    if (selectedCategory?.id === category.id) {
      // Deselect category and show all recent products
      setSelectedCategory(null);
      fetchData();
    } else {
      // Select category and filter products
      setSelectedCategory(category);
      fetchCategoryProducts(category.id);
    }
  };

  // Navigation handlers
  const navigateToSearch = () => router.push('/search');
  const navigateToAuth = () => router.push('/auth/login');
  //const navigateToCategory = () => router.push('/(tabs)/categories');

  // Header animation interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Retry"
          onPress={fetchData}
          style={styles.retryButton}
        />
      </View>
    );
  }



  return (
    <View style={styles.container}>
      {/* Animated Header Background */}
      <Animated.View style={[
        styles.headerBackground,
        {
          height: headerHeight,
          opacity: headerOpacity
        }
      ]}>
        <View style={styles.headerGradient} />
      </Animated.View>

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Main Scrollable Content */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Spacer for animated header */}
          <View style={styles.spacer} />

          {/* Header Content with Greeting */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {isAuthenticated ? `Welcome back, ${profile?.fullname.split(' ')[0]}!` : 'Discover amazing finds'}
              </Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color={theme.colors.primary} />
                <Text style={styles.locationText}>Here you will find what you need</Text>
              </View>
            </View>

            {/* Notification or Sign In Button */}
            {isAuthenticated ? (
              <TouchableOpacity style={styles.notificationButton}>
                <View style={styles.notificationBadge} />
                <Bell size={24} color={theme.colors.white} />
              </TouchableOpacity>
            ) : (
              <Button
                title="Sign In"
                variant="primary"
                size="small"
                onPress={navigateToAuth}
                style={styles.authButton}
              />
            )}
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchContainer}
            activeOpacity={0.9}
            onPress={navigateToSearch}
          >
            <View style={styles.searchInput}>
              <Search size={18} color={theme.colors.gray[400]} />
              <Text style={styles.searchPlaceholder}>Search for items, brands...</Text>
            </View>
            <View style={styles.filterButton}>
              <Sliders size={18} color={theme.colors.white} />
            </View>
          </TouchableOpacity>

          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
              // onPress={navigateToCategory}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <ChevronRight size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Horizontal Categories List */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category, index) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory?.id === category.id}
                  onPress={() => handleCategoryPress(category)}
                  isFirst={index === 0}
                  isLast={index === categories.length - 1}
                />
              ))}
            </ScrollView>
          </View>

          {/* Featured Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Items</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <ChevronRight size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {featuredProducts.filter(p => !p.sold).length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {featuredProducts.filter(p => !p.sold).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    featured
                    style={styles.featuredCard}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>No featured products available</Text>
            )}
          </View>

          {/* Recent or Category Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory ? `${selectedCategory.name} Items` : 'Recently Added'}
              </Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <ChevronRight size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {recentProducts.filter(p => !p.sold).length > 0 ? (
              <View style={styles.gridContainer}>
                {recentProducts.filter(p => !p.sold).slice(0, 4).map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    style={[
                      styles.gridItem,
                      index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight
                    ]}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                {selectedCategory ? `No products in ${selectedCategory.name}` : 'No recent products'}
              </Text>
            )}
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  safeArea: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    zIndex: 0,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
    opacity: 0.9,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  spacer: {
    height: HEADER_EXPANDED_HEIGHT - 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    zIndex: 1,
  },
  greeting: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: theme.colors.white,
    lineHeight: 30,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    zIndex: 2,
  },
  authButton: {
    backgroundColor: theme.colors.black,
    borderWidth: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  searchPlaceholder: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[400],
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: width - 100,
    marginRight: 16,
  },
  lastFeaturedCard: {
    marginRight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  gridItemLeft: {
    marginRight: '4%',
  },
  gridItemRight: {
    marginRight: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background.light,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    width: 120,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, X, Tag, MapPin, Gift } from 'lucide-react-native';
import { Product, Category } from '@/types';
import { theme } from '@/constants/theme';
import api from '../api';
import {IP} from '../api';
import { useDebounce } from '../../hooks/useDebounce'; // Optional debounce hook

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Optional: Debounce search queries to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get<Category[]>('/categories/');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on search and category filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (debouncedSearchQuery) params.append('query', debouncedSearchQuery);
        if (selectedCategory) params.append('categorie', selectedCategory.name);
        
        const response = await api.get<Product[]>(`/products/?${params.toString()}`);
        setSearchResults(response.data);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearchQuery, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(prev => (prev?.id === category.id ? null : category));
  };

  if (loading && !searchResults.length && !categories.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory(null);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <SearchIcon size={20} color={theme.colors.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for items..."
          placeholderTextColor={theme.colors.gray[500]}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setIsSearchActive(!!text);
          }}
          onFocus={() => setIsSearchActive(true)}
        />
        {isSearchActive && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={20} color={theme.colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Categories</Text>
        {loading && !categories.length ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryBadge,
                  selectedCategory?.id === item.id && styles.categoryBadgeSelected,
                ]}
                onPress={() => handleCategoryPress(item)}
              >
                <Tag size={16} color={selectedCategory?.id === item.id ? theme.colors.white : theme.colors.primary} />
                <Text
                  style={[
                    styles.categoryBadgeText,
                    selectedCategory?.id === item.id && styles.categoryBadgeTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        )}
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {loading && searchResults.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image 
                  source={{
                          uri:item.images && item.images.length > 0 ? `${IP}${item.images[0].image}`
                                    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                              }}
                  style={styles.cardImage} 
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.cardDetails}>
                    <MapPin size={14} color={theme.colors.gray[600]} />
                    <Text style={styles.cardLocation}>{item.location}</Text>
                  </View>
                  <View style={[
                    styles.cardBadge,
                    { backgroundColor: item.isFree ? theme.colors.success : theme.colors.accent }
                  ]}>
                    <Gift size={14} color={theme.colors.white} />
                    <Text style={styles.cardBadgeText}>
                      {item.isFree ? 'Free' : 'Exchange'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters to find what you're looking for.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    margin: theme.spacing.lg,
    ...theme.shadow.small,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[900],
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  categoryContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoryTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontFamily: 'Inter-SemiBold',
  },
  categoryList: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  categoryBadgeSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryBadgeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[800],
    marginLeft: theme.spacing.sm,
    fontFamily: 'Inter-Medium',
  },
  categoryBadgeTextSelected: {
    color: theme.colors.white,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadow.small,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: 'Inter-SemiBold',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.xs,
    fontFamily: 'Inter-Regular',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  cardBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
});
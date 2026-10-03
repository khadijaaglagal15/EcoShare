import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, HeartOff, ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import api from '../api';
import { IP } from '../api';
import { useApp } from '@/context/AppContext';

const FavoritesScreen = () => {
  const router = useRouter();
  const { favoriteProducts, toggleFavorite } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isEditing, setIsEditing] = useState(false);

  // Si tu veux les détails produits, il faut les récupérer à partir des IDs
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const productDetails = await Promise.all(
        uniqueFavoriteIds.map(async (id) => {
          const res = await api.get(`/product/${id}/`);
          return res.data;
        })
      );
      setProducts(productDetails);
    };
    if (favoriteProducts.length > 0) fetchProducts();
    else setProducts([]);
  }, [favoriteProducts]);

  const filteredFavorites = products.filter(item =>
    (
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.price && item.price.toString().includes(searchQuery))
    )
  );

  const removeFromFavorites = async (productId: string) => {
    await toggleFavorite(productId); // Utilise la fonction du contexte
    // Pas besoin de setProducts ici, le useEffect ci-dessus va s'en charger
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const uniqueFavoriteIds = Array.from(new Set(favoriteProducts));

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Favorites</Text>
          <TouchableOpacity onPress={toggleEditMode}>
            <Text style={styles.editButton}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={18} color={theme.colors.gray[500]} />
          <TextInput
            style={styles.searchText}
            placeholder="Search favorites..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.gray[500]}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <SlidersHorizontal size={18} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {filteredFavorites.length === 0 && (
        <View style={styles.emptyContainer}>
          <HeartOff size={48} color={theme.colors.gray[400]} />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matches found' : 'Tap the heart icon to save items'}
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Favorites List */}
      <Animated.FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.itemContainer}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.9}
          >
            <Image
              source={{
                uri:
                  item.images && item.images.length > 0
                    ? `${IP}${item.images[0].image}`
                    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
              }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
              <Text style={styles.itemLocation}>{item.location}</Text>
            </View>

            <TouchableOpacity 
              style={styles.heartButton}
              onPress={() => removeFromFavorites(item.id.toString())}
            >
              {isEditing ? (
                <HeartOff size={24} color={theme.colors.error} />
              ) : (
                <Heart size={24} color={theme.colors.primary} fill={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontFamily: 'Poppins-SemiBold',
    color: theme.colors.black,
  },
  editButton: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  searchText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.black,
    marginLeft: theme.spacing.sm,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.black,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  browseButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.white,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  itemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  itemPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  itemLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
  heartButton: {
    padding: theme.spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
});

export default FavoritesScreen;
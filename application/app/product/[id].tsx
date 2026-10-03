import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RatingPopup from '@/components/RatingPopup';
import {Product, ProductImage } from '@/types/index'
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { Heart, ChevronLeft, Star, Share2, MessageSquare } from 'lucide-react-native';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Animated, { FadeIn, interpolate, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import api from '../api';
import {IP} from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getProductById, favoriteProducts, toggleFavorite, isAuthenticated } = useApp();
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [seller, setSeller] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  // const [isFavoriteBackend, setIsFavoriteBackend] = useState(false);
  // const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  const [, forceUpdate] = useState(0);
  const productId = Array.isArray(id) ? id[0] : id || '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
// }, [isFavorite]);

  useEffect(() => {
  let isMounted = true;
  setLoading(true);

  const fetchProduct = async () => {
    try {
      const ctxProduct = await getProductById(productId);
      let finalProduct = ctxProduct;

      if (!ctxProduct) {
        const res = await api.get(`/product/${productId}/`);
        finalProduct = res.data;
      }

      if (isMounted) {
        setProduct(finalProduct ?? null);
        // if (finalProduct?.id) {
        //     try {
        //       const response = await api.get(`/favorites/${finalProduct.id}/`);
        //       setIsFavorite(response.data && typeof response.data === 'object' && !Array.isArray(response.data));
        //     } catch (e) {
        //        console.error('Erreur lors du chargement du favori:', e);
        //       setIsFavorite(false);
        //     }
        // }
        const fetchSeller = async () => {
          if (!finalProduct) return;
          try {
            const res = await api.get(`/seller/${finalProduct.seller}/`);
                setSeller(res.data);
          } catch (e) {
          console.error("❌ Failed to fetch seller", e);
          setSeller(null);
          }
        };
        const fetchCategory = async () => {
          if (!finalProduct) return;
          try {
            const res = await api.get(`/categories/?query=${finalProduct.category}`);
                setCategory(res.data);
          } catch (e) {
          console.error("❌ Failed to fetch category", e);
          setCategory(null);
          }
        };   
        // checkFavorite();
        fetchSeller();
        fetchCategory();
        

        setError(null);
      }

      } catch (e) {
        if (isMounted) setError('Produit introuvable');
      } finally {
        if (isMounted) setLoading(false);
      }
  };

  fetchProduct();
  return () => {
    isMounted = false;
  };
}, [productId]);

    const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - 100],
      [0, 1]
    );

    return {
      opacity,
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>{error || 'Produit introuvable'}</Text>
          <Button title="Go back" onPress={() => router.back()} />
        </SafeAreaView>
      );
    }

    

  const handleRatingSubmit = (rating: number, comment: string) => {
    console.log(`Rating submitted: ${rating}, Comment: ${comment}`);
  };
  

  

  const navigateToMessages = () => {
  if (!seller?.id || !product?.id) return;
  if (isAuthenticated) {
    router.push(`/conversation/${seller.id}?product_id=${product.id}`);
  } else {
    router.push('/auth/login');
  }
};

  const isFavorite = favoriteProducts.includes(product?.id?.toString());
  const handleFavorite = async () => {
    // await toggleFavorite(product.id);
    // setIsFavorite((prev) => !prev);
    if (product?.id) {
      await toggleFavorite(product.id.toString());
    }

  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

    const API_URL = IP;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.black} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={22} color={theme.colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFavorite}
        >
          <Heart
            size={22}
           color={isFavorite ? theme.colors.secondary : theme.colors.black}
            fill={isFavorite ? theme.colors.secondary : 'none'}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentImageIndex(newIndex);
            }}
          >
           {Array.isArray(product?.images) && product.images.map((imgObj: ProductImage, index: number) => (
                       <Image
                         key={index}
                         source={{ uri: `${API_URL}${imgObj.image}` }}
                         style={styles.image}
                         contentFit="cover"
                       />
            ))}
          </ScrollView>

          {product.images.length > 1 && (
            <View style={styles.pagination}>
              {product.images.map((_: ProductImage, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                styles.paginationDot,
                currentImageIndex === index && styles.paginationDotActive,
                ]}
                onPress={() => handleImageChange(index)}
              />
              ))}
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.condition}>{product.status.replace('-', ' ')}</Text>
              <Text style={styles.separatorDot}>•</Text>
              <Text style={styles.date}>{formatDate(product.posted_date)}</Text>
            </View>
          </View>

          <View style={styles.sellerSection}>
            <TouchableOpacity style={styles.sellerInfo}
              onPress={() => setRatingModalVisible(true)}
            >
              <Image
                source={{ uri: seller?.profile_picture || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                style={styles.sellerAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.sellerName}>{seller ? seller.fullname : 'Vendeur inconnu'}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={14} color={theme.colors.warning} fill={theme.colors.warning} />
                  <Text style={styles.ratingText}>{seller?.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.location}>{product.location}</Text>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Category</Text>
            <Text style={styles.categoryValue}>
                {Array.isArray(category) && category.length > 0 ? category[0].name : ''}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      <View style={styles.footer}>
        {<Button
          title={isAuthenticated ? "Message Seller" : "Log in to message"}
          onPress={navigateToMessages}
          fullWidth
          icon={<MessageSquare size={18} color="#fff" />}
        />}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.safeAreaBottom} />
      <RatingPopup
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleRatingSubmit}
        sellerName={product.sellerName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  header: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.small,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.small,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  pagination: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  contentContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    marginTop: -20,
    paddingBottom: 100,
  },
  titleSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.xl,
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontFamily: 'Poppins-Bold',
    fontSize: theme.fontSize.xxl,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  condition: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[700],
    textTransform: 'capitalize',
  },
  separatorDot: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[400],
    marginHorizontal: theme.spacing.xs,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  sellerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: theme.spacing.md,
  },
  sellerName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[700],
    marginLeft: 4,
  },
  location: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  descriptionSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[800],
    lineHeight: 24,
  },
  categorySection: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  categoryValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  safeAreaBottom: {
    backgroundColor: theme.colors.white,
  },
  errorText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: theme.spacing.lg,
  },
});
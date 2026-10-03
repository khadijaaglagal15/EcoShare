import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { BlurView } from 'expo-blur';
import api from '../app/api';
import {IP} from '../app/api';


const { width } = Dimensions.get('window');
const cardWidth = width / 2 - theme.spacing.lg;

const categoryColor: Record<string, string> = {
  électronique: '#E3F2FD',
  mobilier: '#F3E5F5',
  vêtements: '#FFF3E0',
  sport: '#E8F5E9',
  autre: '#F5F5F5',
};

export interface ProductCardProps {
  product: Product;
  featured?: boolean;
  style?: any; // or use specific style type like ViewStyle[]
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const {toggleFavorite, favoriteProducts } = useApp();
  // const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const isFavorite = favoriteProducts.includes(product.id.toString());
  // const isFavorite = favoriteProducts.includes(product.id);

  const handlePress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id.toString() }, // Ensure id is string
    });
  };
  
  const handleFavoritePress = async () => {
    // await toggleFavorite(product.id);
    // setIsFavorite((prev) => !prev);
    await toggleFavorite(product.id.toString());
  };

  const isNew =
    Date.now() - new Date(product.posted_date).getTime() < 1000 * 60 * 60 * 24 * 3;

  const getBadgeLabel = () => {
    if (product.views > 50) return '🔥 Populaire';
    if (product.price > 1000) return '💎 Premium';
    if (product.discount) return '🎁 Offre spéciale';
    return null;
  };

  const badgeScale = useRef(new Animated.Value(0)).current;
  const popularity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const backgroundColor = categoryColor[product.category] || categoryColor.autre;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(popularity, {
      toValue: Math.min(product.views ?? 0, 100),
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [product]);

  useEffect(() => {
    if (getBadgeLabel()) {
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [product]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // useEffect(() => {
  //   let mounted = true;
  //   const checkFavorite = async () => {
  //     try {
  //       const res = await api.get(`/favorites/${product.id}/`);
  //       // Si le backend retourne un objet favori, c'est true, sinon (tableau vide) false
  //       if (mounted) {
  //         setIsFavorite(res.data && typeof res.data === 'object' && !Array.isArray(res.data));
  //       }
  //     } catch (e) {
  //       if (mounted) setIsFavorite(false);
  //     }
  //   };
  //   checkFavorite();
  //   return () => { mounted = false; };
  // }, [product.id]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri:
                product.images && product.images.length > 0
                  ? `${IP}${
                      product.images[0].image
                    }`
                  : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />

          <BlurView intensity={50} tint="light" style={styles.overlay}>
            <Text style={styles.title} numberOfLines={1}>
              {product.title}
            </Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <View style={styles.footer}>
              <Text style={styles.location}>{product.location}</Text>
              <Text style={styles.date}>{formatDate(product.posted_date)}</Text>
            </View>
          </BlurView>

          {isNew && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🆕</Text>
            </View>
          )}

          {getBadgeLabel() && (
            <Animated.View
              style={[
                styles.dynamicBadge,
                { transform: [{ scale: badgeScale }] },
              ]}
            >
              <Text style={styles.dynamicBadgeText}>{getBadgeLabel()}</Text>
            </Animated.View>
          )}

          <View style={styles.popularityBarContainer}>
            <Animated.View
              style={[
                styles.popularityBar,
                {
                  width: popularity.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <TouchableOpacity onPress={handleFavoritePress} style={styles.heart}>
            <Heart
              size={20}
              color={isFavorite ? theme.colors.secondary : theme.colors.white}
              fill={isFavorite ? theme.colors.secondary : 'none'}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    position: 'relative',
    ...theme.shadow.medium,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    marginVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[700],
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 6,
    borderRadius: 100,
    ...theme.shadow.small,
  },
  dynamicBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  dynamicBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  popularityBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    width: '100%',
    backgroundColor: theme.colors.gray[300],
  },
  popularityBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});
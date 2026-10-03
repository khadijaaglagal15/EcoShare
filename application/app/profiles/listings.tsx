import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ShoppingBag, Edit, Trash2, Clock, CheckCircle, Plus, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInRight, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import api from '../api';
import {IP} from '../api';
import { useApp } from '@/context/AppContext';


export default function ListingsScreen() {
  const { userProducts, setUserProducts } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filteredListings = userProducts.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'sold') return item.sold === true;
    if (activeTab === 'active') return item.sold === false;
    return true;
  });

  const onRefresh = async () => {
    try {
    const res = await api.get('/user-products/');
    setUserProducts(res.data);
  } catch (e) {
    // Optionnel : gestion d'erreur
  } finally {
    setRefreshing(false);
  }
  
};

  const renderItem = ({ item, index }: { item: any; index: number }) => (
  <Animated.View 
    style={styles.listingCard}
    entering={FadeInRight.delay(index * 100)}
  >
    <Image 
      source={{ uri: item.images && item.images.length > 0 ? `${IP}${item.images[0].image}` : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
      style={styles.listingImage}
      contentFit="cover"
    />
    <View style={styles.listingDetails}>
      <Text style={styles.listingTitle}>{item.title}</Text>
      <Text style={styles.listingPrice}>{item.price} MAD</Text>
      <View style={styles.listingMeta}>
        {item.sold === false && (
          <>
            <Text style={styles.listingViews}>{item.views || 0} views</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.statusText, { color: theme.colors.primary }]}>Active</Text>
            </View>
          </>
        )}
        {item.sold === true && (
          <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
            <CheckCircle size={14} color="#4CAF50" />
            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Sold</Text>
          </View>
        )}
      </View>
    </View>
      
      <View style={styles.listingActions}>
        {item.status !== 'sold' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({
                pathname: '/listings/edit/[id]',
                params: { id: item.id.toString() },
              });
            }}
          >
            <Edit size={18} color={theme.colors.gray[500]} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={async() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Delete functionality
            try {
             await api.delete(`/user-products/?id=${item.id}`);
             setUserProducts(prev => prev.filter(listing => listing.id !== item.id));
            } catch (e) {
              console.log("erreur lors de la suppression: ", e);
            }
          }}
        >
          <Trash2 size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // useEffect(() => {
  //   const fetchListings = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await api.get('/user-products/');
  //       setUserListings(res.data);
  //     } catch (e) {
  //       setUserListings([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchListings();
  // }, []);

  
  return (
    
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View 
        style={styles.header}
        entering={FadeIn.duration(300)}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={{ width: 24 }} /> 
      </Animated.View>

      {/* Tabs */}
      <Animated.View 
        style={styles.tabContainer}
        entering={FadeIn.delay(150)}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {['all', 'active',  'sold'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Listings */}
      <FlatList
        data={filteredListings}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Animated.View style={styles.emptyState} entering={SlideInDown.duration(500)}>
            <ShoppingBag size={48} color={theme.colors.gray[300]} />
            <Text style={styles.emptyTitle}>No {(activeTab || '').toString()} listings</Text>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: theme.colors.black,
  },
  createButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadow.small,
  },
  createButtonGradient: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  tabScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  tabButton: {
    paddingHorizontal: 37,
    paddingVertical: theme.spacing.md,
    marginRight: 8,
    marginLeft: -2,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.small,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  listingDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  listingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.black,
  },
  listingPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.primary,
    marginVertical: 4,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingViews: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginLeft: 4,
  },
  listingActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  actionButton: {
    padding: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.black,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    maxWidth: '80%',
  },
});
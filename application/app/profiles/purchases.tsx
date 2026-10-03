import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Package, CheckCircle, Clock, AlertCircle, ChevronRight, Star, Truck } from 'lucide-react-native';
import Animated, { FadeIn, FadeInRight, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Sample purchase data
const purchasesData = [
  {
    id: '1',
    title: 'Wireless Headphones',
    price: '$65',
    status: 'delivered',
    image: 'https://example.com/headphones.jpg',
    seller: 'TechGadgets',
    date: 'May 15, 2023',
    rating: 5
  },
  {
    id: '2',
    title: 'Leather Wallet',
    price: '$32',
    status: 'shipped',
    image: 'https://example.com/wallet.jpg',
    seller: 'LeatherCrafts',
    date: 'May 10, 2023',
    tracking: 'AB123456789'
  },
  {
    id: '3',
    title: 'Smart Watch',
    price: '$120',
    status: 'cancelled',
    image: 'https://example.com/watch.jpg',
    seller: 'WearableTech',
    date: 'Apr 28, 2023',
    reason: 'Out of stock'
  },
];

export default function PurchasesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredPurchases = purchasesData.filter(item => 
    activeTab === 'all' ? true : item.status === activeTab
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusDetails = (status) => {
    switch(status) {
      case 'delivered':
        return {
          icon: <CheckCircle size={16} color="#4CAF50" />,
          text: 'Delivered',
          color: '#E8F5E9',
          textColor: '#4CAF50'
        };
      case 'shipped':
        return {
          icon: <Truck size={16} color="#2196F3" />,
          text: 'Shipped',
          color: '#E3F2FD',
          textColor: '#2196F3'
        };
      case 'cancelled':
        return {
          icon: <AlertCircle size={16} color="#F44336" />,
          text: 'Cancelled',
          color: '#FFEBEE',
          textColor: '#F44336'
        };
      default:
        return {
          icon: <Clock size={16} color="#FF9800" />,
          text: 'Processing',
          color: '#FFF3E0',
          textColor: "#FF9800"
        };
    }
  };

  const renderItem = ({ item, index }) => {
    const status = getStatusDetails(item.status);
    
    return (
      <Animated.View 
        style={styles.purchaseCard}
        entering={FadeInRight.delay(index * 100)}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.purchaseImage}
          contentFit="cover"
        />
        
        <View style={styles.purchaseDetails}>
          <Text style={styles.purchaseTitle}>{item.title}</Text>
          <Text style={styles.purchasePrice}>{item.price}</Text>
          <Text style={styles.purchaseSeller}>Sold by {item.seller}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            {status.icon}
            <Text style={[styles.statusText, { color: status.textColor }]}>
              {status.text}
            </Text>
          </View>
          
          {item.status === 'delivered' && (
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/purchases/review/${item.id}`);
              }}
            >
              <Star size={14} color="#FFC107" fill="#FFC107" />
              <Text style={styles.rateText}>
                {item.rating ? `Rated ${item.rating}/5` : 'Rate Product'}
              </Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'shipped' && (
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/purchases/track/${item.id}`);
              }}
            >
              <Text style={styles.trackText}>Track Package</Text>
              <ChevronRight size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View 
        style={styles.header}
        entering={FadeIn.duration(300)}
      >
        <Text style={styles.headerTitle}>My Purchases</Text>
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
          {['all', 'delivered', 'shipped', 'cancelled'].map((tab) => (
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

      {/* Purchases List */}
      <FlatList
        data={filteredPurchases}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Animated.View 
            style={styles.emptyState}
            entering={SlideInDown.duration(500)}
          >
            <Package size={48} color={theme.colors.gray[300]} />
            <Text style={styles.emptyTitle}>No {activeTab} purchases</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'delivered' 
                ? 'Your delivered items will appear here' 
                : activeTab === 'shipped'
                ? 'Track your shipped items here'
                : 'Your purchases will appear here'}
            </Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: theme.colors.black,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  tabScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  tabButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.sm,
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
  purchaseCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.small,
  },
  purchaseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  purchaseDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  purchaseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.black,
  },
  purchasePrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.primary,
    marginVertical: 2,
  },
  purchaseSeller: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginLeft: 4,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[600],
    marginLeft: 4,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trackText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: theme.colors.primary,
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
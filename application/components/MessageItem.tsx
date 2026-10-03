import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { formatMessageTime } from '@/utils/formatters';
import { Conversation } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '@/context/AppContext';

type MessageItemProps = {
  conversation: Conversation;
};

export default function MessageItem({ conversation }: MessageItemProps) {
  const router = useRouter();
  const {fetchConversations} = useApp();

  const handlePress = () => {
    router.push(`/conversation/${conversation.receiver_id}`);
  };

  useFocusEffect(
    React.useCallback(() => {
      // Recharge la liste à chaque fois que la page est affichée
      fetchConversations();
    }, [])
  );

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: conversation.receiver_avatar }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        {conversation.unread_count > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{conversation.unread_count}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.name}>{conversation.receiver_fullname}</Text>
          <Text style={styles.time}>{formatMessageTime(conversation.lastMessageTimestamp)}</Text>
        </View>
        
        <Text 
          style={[
            styles.message,
            conversation.unread_count > 0 && styles.unreadMessage
          ]}
          numberOfLines={2}
        >
          {conversation.lastMessage}
        </Text>
        
        {conversation.product && (
          <View style={styles.productContainer}>
            <Image
              source={{ uri: conversation.product.image }}
              style={styles.productImage}
              contentFit="cover"
              transition={200}
            />
            <Text style={styles.productTitle} numberOfLines={1}>
              {conversation.product.title}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.round,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  badgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: theme.colors.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  time: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  unreadMessage: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.black,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
  },
  productImage: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.xs,
    marginRight: theme.spacing.xs,
  },
  productTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[700],
    flex: 1,
  },
});
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ChevronLeft, Send, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import {IP, W} from '../api';
import { useApp } from '@/context/AppContext';
import { Message, Conversation , Product} from '@/types';
import { formatMessageTime } from '@/utils/formatters';

export default function ConversationScreen() {
  const { id, product_id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useApp();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const { getProductById } = useApp();
  const [productDetails, setProductDetails] = useState<{ [id: string]: Product }>({});
  const [headerProduct, setHeaderProduct] = useState<Product | null>(null);
  const [hasSentProductMessage, setHasSentProductMessage] = useState(false);

  useEffect(() => {
    let wsInstance: WebSocket | null = null;
    let isMounted = true;

    const setup = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      try {
        // 1. Charge l'historique
        const res = await api.get(`/get-messages/${id}/`);
        setMessages(res.data);

        // 2. Charge les infos de la conversation (si elle existe)
        const convRes = await api.get(`/conversation/${id}/`);
        setConversation(prev => ({
          ...prev,
          ...convRes.data,
          receiver_avatar: prev?.receiver_avatar,
          receiver_fullname: prev?.receiver_fullname,
          product: convRes.data.product && convRes.data.product.image
            ? {
                ...convRes.data.product,
                image: convRes.data.product.image.startsWith('http')
                  ? convRes.data.product.image
                  : `${IP}${convRes.data.product.image}`,
              }
            : convRes.data.product,
        }));

        // 3. Marque les messages comme lus
        await api.post(`/mark-messages-read/${id}/`);
        setMessages(prev =>
          prev.map(msg =>
            msg.receiver === user?.id ? { ...msg, is_read: true } : msg
          ) 
        );
        setConversation(prev => {
          if (!prev) return prev;
          // Set unread_count to 0 si la conversation correspond à l'utilisateur courant et au destinataire
          if (
            conversation &&
            prev.sender_id === conversation.sender_id &&
            prev.receiver_id === conversation.receiver_id
          ) {
            return { ...prev, unread_count: 0 };
          }
          return prev;
        });
      } catch (e) {
        // Si 404, conversation n'existe pas encore
        setMessages([]);
        // Tu peux aussi initialiser une conversation vide si besoin
      }

      // 3. Connecte WebSocket (toujours, même si la conversation n'existe pas encore)
      wsInstance = new WebSocket(`${W}/ws/chat/?token=${token}`);
      wsInstance.onopen = () => {};
      wsInstance.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (isMounted) {
          setMessages(prev => [...prev, data]);
          // Si le message reçu contient un produit, charge ses infos
          if (data.product && !productDetails[String(data.product)]) {
            getProductById(String(data.product)).then(prod => {
              if (prod) {
                setProductDetails(prev => ({ ...prev, [String(data.product)]: prod }));
              }
            });
          }
        }
      };
      wsInstance.onerror = (e) => {};
      wsInstance.onclose = () => {};
      setWs(wsInstance);

      setLoading(false);
    };

    setup();

    return () => {
      isMounted = false;
      wsInstance?.close();
    };
  }, [id]);

  // Envoi d'un message
  const sendMessage = () => {
    if (!ws || message.trim().length === 0 || !user) return;

    // On épingle le produit UNIQUEMENT si on vient d'une fiche produit ET qu'on n'a pas encore envoyé de message épinglé
    const shouldAttachProduct = !!product_id && !hasSentProductMessage && headerProduct?.id;

    const msgObj: Message = {
      id: `local-${Date.now()}`,
      receiver: typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '',
      content: message,
      sender: user.id,
      timestamp: new Date().toISOString(),
      product: shouldAttachProduct ? String(headerProduct.id) : null,
      is_read: false,
    };

    ws.send(JSON.stringify({
      receiver_id: id,
      content: message,
      sender: user.id,
      timestamp: msgObj.timestamp,
      product: msgObj.product,
    }));

    setMessages(prev => [...prev, msgObj]);
    setMessage('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Après le premier envoi, on ne doit plus épingler le produit
    if (shouldAttachProduct) setHasSentProductMessage(true);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!item.content || item.content.trim() === '') return null;
    const isUser = user && item.sender === user.id;

    // Récupère le produit associé à ce message (si id)
    const product =
      item.product && productDetails[String(item.product)]
        ? productDetails[String(item.product)]
        : null;

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer,
      ]}
      >
        {!isUser && (
          <Image
            source={{ uri: conversation?.receiver_avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          {/* Affiche le produit épinglé si trouvé */}
          {product && product.images && product.images.length > 0 && (
            <TouchableOpacity
              style={styles.productContainer}
              activeOpacity={0.7}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <Image
                source={{
                  uri: product.images[0].image.startsWith('http')
                    ? product.images[0].image
                    : `${IP}${product.images[0].image}`
                }}
                style={styles.productImage}
                contentFit="cover"
              />
              <Text style={styles.productTitle} numberOfLines={1}>
                {product.title}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.otherMessageTime]}>
            {item.timestamp ? formatMessageTime(item.timestamp) : ''}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    // Pour chaque message qui mentionne un produit, charge-le si besoin
    messages.forEach(msg => {
      if (
        msg.product != null &&
        !productDetails[String(msg.product)]
      ) {
        getProductById(String(msg.product)).then(prod => {
          if (prod) {
            setProductDetails(prev => ({ ...prev, [String(msg.product)]: prod }));
          }
        });
      }
    });
  }, [messages]);

  useEffect(() => {
    if (product_id && !headerProduct) {
      const pid = Array.isArray(product_id) ? product_id[0] : product_id;
      if (typeof pid === 'string') {
        getProductById(pid).then(prod => {
          if (prod) setHeaderProduct(prod);
        });
      }
    }
  }, [product_id, getProductById]);

  useEffect(() => {
    if (id) {
      api.get(`/seller/${id}/`).then(res => {
        setConversation(prev => ({
          ...(prev || {
            sender_id: String(user?.id ?? ''),
            receiver_id: String(id ?? ''),
            sender_avatar: String(user?.profile_picture ?? ''),
            lastMessage: '',
            lastMessageTimestamp: '',
            unread_count: 0,
            product: {},
          }),
          receiver_avatar: res.data.profile_picture?.startsWith('http')
            ? res.data.profile_picture
            : `${IP}${res.data.profile_picture}`,
          receiver_fullname: res.data.fullname,
        }));
      });
    }
  }, [id]);

  if (loading || !conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerProfile}>
          <Image source={{ uri: conversation.receiver_avatar }} style={styles.headerAvatar} contentFit="cover" />
          <View>
            <Text style={styles.headerTitle}>{conversation.receiver_fullname}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Plus size={24} color={theme.colors.gray[600]} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor={theme.colors.gray[500]}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim().length === 0 ? styles.sendButtonDisabled : {},
            ]}
            onPress={sendMessage}
            disabled={message.trim().length === 0}
          >
            <Send size={20} color={message.trim().length === 0 ? theme.colors.gray[400] : theme.colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  productContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    padding: theme.spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  productImage: {
    width: 60,
    height: 60,
  },
  productInfo: {
    flex: 1,
    padding: theme.spacing.sm,
    justifyContent: 'center',
  },
  productTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[800],
  },
  messagesContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.xs,
  },
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    maxWidth: '100%',
  },
  userMessageBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  userMessageText: {
    color: theme.colors.white,
  },
  otherMessageText: {
    color: theme.colors.black,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: theme.colors.gray[500],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  attachButton: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : 8,
    maxHeight: 100,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
  },
  errorText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
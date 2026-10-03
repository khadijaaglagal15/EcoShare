import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, CircleEllipsis } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
};

const HelpChatScreen = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'support',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      text: 'I need help with my recent order',
      sender: 'user',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: '3',
      text: 'Sure! Can you share your order number?',
      sender: 'support',
      timestamp: new Date(Date.now() - 1200000)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate support response
    setIsTyping(true);
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! Our team will get back to you shortly.',
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100' }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>Support Team</Text>
            <Text style={styles.subtitle}>
              {isTyping ? 'Typing...' : 'Typically replies in minutes'}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <CircleEllipsis size={24} color={theme.colors.black} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.sender === 'user' ? styles.userBubble : styles.supportBubble
            ]}>
              <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.supportText
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.timeText,
                item.sender === 'user' ? styles.userTime : styles.supportTime
              ]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          )}
          ListFooterComponent={
            isTyping ? (
              <View style={[styles.messageBubble, styles.supportBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.gray[500]}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send 
              size={20} 
              color={newMessage.trim() ? theme.colors.primary : theme.colors.gray[400]} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
  },
  messagesContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.xs,
  },
  supportBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.gray[100],
    borderBottomLeftRadius: theme.borderRadius.xs,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
  },
  userText: {
    color: theme.colors.white,
  },
  supportText: {
    color: theme.colors.black,
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
  },
  userTime: {
    color: theme.colors.white,
    opacity: 0.8,
  },
  supportTime: {
    color: theme.colors.gray[500],
  },
  typingIndicator: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray[500],
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    maxHeight: 120,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    padding: theme.spacing.sm,
  },
});

export default HelpChatScreen;
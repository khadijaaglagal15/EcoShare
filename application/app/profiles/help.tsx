import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ChevronDown, ChevronUp, Mail, MessageSquare, Phone, HelpCircle, ShieldAlert, CreditCard, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const HelpScreen = () => {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a new listing?',
      answer: 'Tap the "New Listing" button on your Listings page, fill in the details, add photos, and set your price. Your item will be live once approved.'
    },
    {
      id: '2',
      question: 'When will I receive my payment?',
      answer: 'Payments are processed within 24 hours after the buyer confirms receipt. Bank transfers take 1-3 business days depending on your bank.'
    },
    {
      id: '3',
      question: 'What items are prohibited?',
      answer: 'We prohibit illegal items, weapons, drugs, counterfeit goods, and anything violating our community guidelines.'
    },
    {
      id: '4',
      question: 'How do I report a problem with an order?',
      answer: 'Go to your Purchases page, select the order, and tap "Report Problem". Our support team will respond within 24 hours.'
    }
  ];

  const toggleFAQ = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === id ? null : id);
  };

  const contactMethods = [
    {
      id: 'email',
      icon: <Mail size={24} color={theme.colors.primary} />,
      title: 'Email Support',
      subtitle: 'Typically responds within 24 hours',
      action: () => Linking.openURL('mailto:support@yourmarketplace.com')
    },
    {
      id: 'chat',
      icon: <MessageSquare size={24} color={theme.colors.primary} />,
      title: 'Live Chat',
      subtitle: 'Available 9AM-5PM (your timezone)',
      action: () => router.push('/profiles/help_chat')
    },
    {
      id: 'phone',
      icon: <Phone size={24} color={theme.colors.primary} />,
      title: 'Call Us',
      subtitle: '24/7 emergency support',
      action: () => Linking.openURL('tel:+18005551234')
    }
  ];

  const quickLinks = [
    {
      id: 'safety',
      icon: <ShieldAlert size={20} color={theme.colors.primary} />,
      title: 'Safety Guidelines'
    },
    {
      id: 'payments',
      icon: <CreditCard size={20} color={theme.colors.primary} />,
      title: 'Payment Help'
    },
    {
      id: 'returns',
      icon: <HelpCircle size={20} color={theme.colors.primary} />,
      title: 'Return Policy'
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeIn.duration(300)}
        >
          <LinearGradient
            colors={['#6E45E2', '#88D3CE']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <HelpCircle size={32} color="white" />
            <Text style={styles.headerTitle}>Help Center</Text>
            <Text style={styles.headerSubtitle}>We're here to help</Text>
          </LinearGradient>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          style={styles.searchContainer}
          entering={FadeInDown.delay(100)}
        >
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => router.push('/help/search')}
          >
            <Text style={styles.searchText}>Search help articles...</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Links */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(150)}
        >
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinksContainer}>
            {quickLinks.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.quickLink}
                onPress={() => router.push(`/help/${link.id}`)}
              >
                <View style={styles.quickLinkIcon}>
                  {link.icon}
                </View>
                <Text style={styles.quickLinkText}>{link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* FAQs */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(200)}
        >
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(faq.id)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                {expandedId === faq.id ? (
                  <ChevronUp size={20} color={theme.colors.gray[500]} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.gray[500]} />
                )}
              </TouchableOpacity>
              {expandedId === faq.id && (
                <Animated.View 
                  style={styles.faqAnswer}
                  entering={FadeIn}
                >
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </Animated.View>
              )}
            </View>
          ))}
        </Animated.View>

        {/* Contact Support */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(250)}
        >
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.contactMethodsContainer}>
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.contactMethod}
                onPress={method.action}
              >
                <View style={styles.contactIcon}>
                  {method.icon}
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.gray[400]} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: 'white',
    marginTop: theme.spacing.sm,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  searchButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    ...theme.shadow.small,
  },
  searchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[500],
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    ...theme.shadow.small,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLink: {
    alignItems: 'center',
    flex: 1,
  },
  quickLinkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(104, 66, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
    textAlign: 'center',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
    paddingVertical: theme.spacing.md,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[800],
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  faqAnswer: {
    paddingTop: theme.spacing.sm,
  },
  faqAnswerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 22,
  },
  contactMethodsContainer: {
    marginTop: theme.spacing.sm,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  contactIcon: {
    marginRight: theme.spacing.md,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[800],
  },
  contactSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
});

export default HelpScreen;
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { ChevronLeft, CreditCard, Banknote, Wallet, History } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';

export default function PaymentsScreen() {
  const router = useRouter();

  const paymentMethods = [
    {
      id: '1',
      title: 'Carte de crédit',
      icon: <CreditCard size={24} color={theme.colors.primary} />,
      description: '**** **** **** 4242',
    //  action: () => router.push('/payment-methods/card')
    },
    {
      id: '2',
      title: 'Mobile Money',
      icon: <Wallet size={24} color={theme.colors.primary} />,
      description: 'Linked to +237 6XX XXX XXX',
     // action: () => router.push('/payment-methods/mobile')
    },
    {
      id: '3',
      title: 'Compte bancaire',
      icon: <Banknote size={24} color={theme.colors.primary} />,
      description: 'BICEA •••• 7890',
    //  action: () => router.push('/payment-methods/bank')
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Paiements</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthodes de paiement</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentMethod}
              onPress={method.action}
            >
              <View style={styles.methodIcon}>
                {method.icon}
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <Button
                      title="Ajouter une méthode de paiement"
                      // onPress={() => router.push('/payment-methods/add')}
                      variant="outline"
                      style={styles.addButton} onPress={function (): void {
                          throw new Error('Function not implemented.');
                      } }          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des transactions</Text>
          
          <TouchableOpacity
            style={styles.historyItem}
           // onPress={() => router.push('/payment-history')}
          >
            <View style={styles.historyIcon}>
              <History size={20} color={theme.colors.gray[600]} />
            </View>
            <Text style={styles.historyText}>Voir l'historique complet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.black,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  methodIcon: {
    marginRight: theme.spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    marginBottom: 2,
  },
  methodDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  historyIcon: {
    marginRight: theme.spacing.sm,
  },
  historyText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[800],
  },
});
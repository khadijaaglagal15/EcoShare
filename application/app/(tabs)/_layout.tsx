import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Home as HomeIcon, Search as SearchIcon, MessageSquare as MessageIcon, User as UserIcon, Plus as PlusIcon } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Supprime les titres des onglets
        tabBarActiveTintColor: theme.colors.black,
        tabBarInactiveTintColor: theme.colors.gray[500],
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (Platform.OS === 'ios' ? <BlurBackground /> : null),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => <SearchIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          tabBarIcon: () => <PostButton />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ color, size }) => <MessageIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

function BlurBackground() {
  return (
    <BlurView
      tint="light"
      intensity={80}
      style={StyleSheet.absoluteFill}
    />
  );
}

function PostButton() {
  return (
    <View style={styles.postButton}>
      <PlusIcon size={24} color="white" />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 64,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});

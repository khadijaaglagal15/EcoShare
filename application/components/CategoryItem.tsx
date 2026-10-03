import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Category } from '@/types';
import * as Icons from 'lucide-react-native';

export interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onPress: (category: Category) => void;
  isFirst?: boolean;
  isLast?: boolean;
}


export default function CategoryItem({ category, isSelected = false, onPress }: CategoryItemProps) {
  // Dynamically get the icon component
  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<Icons.LucideProps> || Icons.Box;

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <IconComponent 
        size={22} 
        color={isSelected ? theme.colors.white : theme.colors.gray[600]} 
      />
      <Text 
        style={[
          styles.text,
          isSelected && styles.selectedText
        ]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
    marginRight: theme.spacing.sm,
    minWidth: 76,
  },
  selectedContainer: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[700],
    marginTop: theme.spacing.xs,
  },
  selectedText: {
    color: theme.colors.white,
  },
});
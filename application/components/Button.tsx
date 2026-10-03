import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  // Generate container styles based on variant, size, and other props
  const getContainerStyle = () => {
    let containerStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
    };

    // Apply variant styles
    if (variant === 'primary') {
      containerStyle = {
        ...containerStyle,
        backgroundColor: theme.colors.primary,
      };
    } else if (variant === 'secondary') {
      containerStyle = {
        ...containerStyle,
        backgroundColor: theme.colors.secondary,
      };
    } else if (variant === 'outline') {
      containerStyle = {
        ...containerStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      };
    } else if (variant === 'ghost') {
      containerStyle = {
        ...containerStyle,
        backgroundColor: 'transparent',
      };
    }

    // Apply fullWidth style if needed
    if (fullWidth) {
      containerStyle.width = '100%';
    }

    // Apply disabled style if needed
    if (disabled || loading) {
      containerStyle.opacity = 0.6;
    }

    return containerStyle;
  };

  // Generate text styles based on variant, size, and other props
  const getTextStyle = () => {
    let textStyleObj: TextStyle = {
      ...styles.buttonText,
      ...styles[`${size}Text`],
    };

    if (variant === 'outline') {
      textStyleObj.color = theme.colors.primary;
    } else if (variant === 'ghost') {
      textStyleObj.color = theme.colors.primary;
    }

    return textStyleObj;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: theme.spacing.sm } : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  mediumButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  largeButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.white,
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.fontSize.xs,
  },
  mediumText: {
    fontSize: theme.fontSize.sm,
  },
  largeText: {
    fontSize: theme.fontSize.md,
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { Star } from 'lucide-react-native';
import Button from '@/components/Button';
import Animated, { 
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated';

interface RatingPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  sellerName: string;
}

const RatingPopup: React.FC<RatingPopupProps> = ({ visible, onClose, onSubmit, sellerName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const overlayOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      // Start enter animation
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic)
      });
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.back(1))
      });
      overlayOpacity.value = withTiming(1, { duration: 150 });
    } else {
      // Start exit animation
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.8, { duration: 200 });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const handleSubmit = () => {
    // First animate out, then submit
    opacity.value = withSequence(
      withTiming(0, { duration: 150 }),
      withTiming(0, { duration: 0 }, (finished) => {
        if (finished) {
          runOnJS(onSubmit)(rating, comment);
          runOnJS(setRating)(0);
          runOnJS(setComment)('');
          runOnJS(onClose)();
        }
      })
    );
    scale.value = withTiming(0.8, { duration: 200 });
    overlayOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleClose = () => {
    // Animate out before closing
    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.8, { duration: 200 });
    overlayOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Text style={styles.title}>Rate {sellerName}</Text>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              onPressIn={() => setHoverRating(star)}
              onPressOut={() => setHoverRating(0)}
            >
              <Star
                size={32}
                color={theme.colors.warning}
                fill={star <= (hoverRating || rating) ? theme.colors.warning : 'none'}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment (optional)"
          placeholderTextColor={theme.colors.gray[400]}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />
        
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.button}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="Submit"
              onPress={handleSubmit}
              style={styles.button}
              disabled={rating === 0}
            />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    zIndex: 1000,
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    minHeight: 100,
    marginBottom: theme.spacing.md,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    width: '100%',
  },
});

export default RatingPopup;
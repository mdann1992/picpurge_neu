import React, { useEffect } from 'react';
import { Image, StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../theme/theme';
import type { Asset } from 'expo-media-library';

const SWIPE_THRESHOLD = 120;
const { width } = Dimensions.get('window');
const OFFSCREEN_X = width * 1.2;

type SwipeCardProps = {
  asset: Asset;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export function SwipeCard({ asset, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const triggerSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(OFFSCREEN_X, { duration: 180 }, (finished) => {
          if (finished) {
            translateX.value = 0;
            translateY.value = 0;
            runOnJS(triggerSwipe)('right');
          }
        });
        return;
      }

      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-OFFSCREEN_X, { duration: 180 }, (finished) => {
          if (finished) {
            translateX.value = 0;
            translateY.value = 0;
            runOnJS(triggerSwipe)('left');
          }
        });
        return;
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 25}deg` },
    ],
  }));

  const keepOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -30, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  const deleteOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 30, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [asset.id, translateX, translateY]);

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: asset.uri }} style={styles.image} />
          <Animated.View style={[styles.overlay, styles.keep, keepOverlayStyle]}>
            <Text style={[styles.overlayText, styles.keepText]}>KEEP</Text>
          </Animated.View>
          <Animated.View style={[styles.overlay, styles.delete, deleteOverlayStyle]}>
            <Text style={[styles.overlayText, styles.deleteText]}>DELETE</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 96,
  },
  card: {
    width: '90%',
    aspectRatio: 3 / 4,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
  },
  keep: {
    right: 16,
    borderColor: theme.colors.keep,
  },
  delete: {
    left: 16,
    borderColor: theme.colors.delete,
  },
  overlayText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  keepText: {
    color: theme.colors.keep,
  },
  deleteText: {
    color: theme.colors.delete,
  },
});

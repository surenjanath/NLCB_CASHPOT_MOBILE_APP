import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonLoaderProps) {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surface,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  style?: any;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }, style]}>
      <View style={styles.header}>
        <SkeletonLoader width={120} height={24} />
        <SkeletonLoader width={80} height={16} />
      </View>
      
      <View style={styles.content}>
        <SkeletonLoader width="100%" height={16} style={styles.contentLine} />
        <SkeletonLoader width="80%" height={16} style={styles.contentLine} />
        <SkeletonLoader width="60%" height={16} style={styles.contentLine} />
      </View>
      
      <View style={styles.footer}>
        <SkeletonLoader width={60} height={16} />
        <SkeletonLoader width={60} height={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    gap: 8,
    marginBottom: 20,
  },
  content: {
    gap: 12,
    marginBottom: 20,
  },
  contentLine: {
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
});

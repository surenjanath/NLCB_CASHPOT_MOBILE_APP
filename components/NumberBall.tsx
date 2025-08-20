import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

interface NumberBallProps {
  number: string;
  isPowerBall?: boolean;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
}

export function NumberBall({ 
  number, 
  isPowerBall = false, 
  size = 'medium',
  onPress,
  disabled = false
}: NumberBallProps) {

  const sizeConfig = {
    small: { width: 40, height: 40, fontSize: 16 },
    medium: { width: 52, height: 52, fontSize: 20 },
    large: { width: 72, height: 72, fontSize: 28 },
  };

  const config = sizeConfig[size];
  
  // Choose colors based on type and size
  const getColors = () => {
    if (isPowerBall) {
      return {
        background: '#EF4444',
        text: '#FFFFFF',
        shadow: '#DC2626',
      };
    }
    
    // Different colors for different sizes
    switch (size) {
      case 'large':
        return {
          background: '#7C3AED',
          text: '#FFFFFF',
          shadow: '#5B21B6',
        };
      case 'medium':
        return {
          background: '#3B82F6',
          text: '#FFFFFF',
          shadow: '#1D4ED8',
        };
      default:
        return {
          background: '#10B981',
          text: '#FFFFFF',
          shadow: '#059669',
        };
    }
  };

  const colors = getColors();

  const handlePress = () => {
    if (onPress && !disabled) {
      // Light haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const ballContent = (
    <View style={[
      styles.ball, 
      { 
        width: config.width, 
        height: config.height,
        backgroundColor: disabled ? '#9CA3AF' : colors.background,
      }
    ]}>
      <Text 
        style={[
          styles.text, 
          { 
            fontSize: config.fontSize,
            color: colors.text
          }
        ]}
        accessible={true}
        accessibilityLabel={`${isPowerBall ? 'Power Ball' : 'Number'} ${number}`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {number}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { width: config.width, height: config.height }]}>
      {onPress ? (
        <Pressable
          style={({ pressed }) => [
            styles.pressable,
            pressed && styles.pressed,
            disabled && styles.disabled
          ]}
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${isPowerBall ? 'Power Ball' : 'Number'} ${number}`}
          accessibilityState={{ disabled }}
        >
          {ballContent}
        </Pressable>
      ) : (
        ballContent
      )}
      
      {/* Subtle shadow */}
      <View style={[
        styles.shadow, 
        { 
          width: config.width, 
          height: config.height,
          backgroundColor: disabled ? '#9CA3AF' : colors.shadow,
          opacity: disabled ? 0.2 : 0.3
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    position: 'relative',
  },
  pressable: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.6,
  },
  shadow: {
    position: 'absolute',
    top: 3,
    left: 2,
    borderRadius: 999,
    zIndex: 1,
  },
  text: {
    fontWeight: '900',
    textAlign: 'center',
    zIndex: 3,
    position: 'relative',
  },
});
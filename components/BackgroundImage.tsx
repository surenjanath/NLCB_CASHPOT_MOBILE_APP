import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BackgroundImageProps {
  children: React.ReactNode;
  overlayOpacity?: number;
}

export function BackgroundImage({ children, overlayOpacity = 0.85 }: BackgroundImageProps) {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('@/assets/images/background_pic.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.1)',
            `rgba(255, 255, 255, ${overlayOpacity})`,
            'rgba(255, 255, 255, 0.95)'
          ]}
          style={styles.gradientOverlay}
        />
        
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

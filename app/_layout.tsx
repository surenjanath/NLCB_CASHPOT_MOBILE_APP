
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import CustomTabBar from '@/components/CustomTabBar';
import { analyticsService } from '@/services/analyticsService';

export default function RootLayout() {
  useFrameworkReady();

  // Track app opens for analytics
  useEffect(() => {
    const trackAppOpen = async () => {
      try {
        await analyticsService.trackAppOpen();
        console.log('✅ App open tracked successfully');
      } catch (error) {
        console.error('❌ Failed to track app open:', error);
      }
    };

    trackAppOpen();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="detail" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        
        {/* Custom Tab Bar - positioned above all content */}
        <CustomTabBar />
        
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
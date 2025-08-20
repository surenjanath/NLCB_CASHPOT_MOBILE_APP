
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import CustomTabBar from '@/components/CustomTabBar';

export default function RootLayout() {
  useFrameworkReady();

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
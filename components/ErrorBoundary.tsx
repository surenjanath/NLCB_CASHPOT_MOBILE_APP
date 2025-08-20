import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.gradient.error || ['#EF4444', '#DC2626']}
        style={styles.header}
      >
        <AlertTriangle size={48} color="#FFFFFF" />
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.subtitle}>
          We encountered an unexpected error
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={[styles.errorCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Error Details
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            {error?.message || 'An unknown error occurred'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.retryButton, { borderColor: theme.colors.primary }]}
          onPress={onRetry}
        >
          <LinearGradient
            colors={theme.colors.gradient.primary}
            style={styles.retryButtonGradient}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 32,
    gap: 24,
  },
  errorCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  retryButton: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SyncStatus } from '@/types/lotto';
import { LoadingSpinner } from './LoadingSpinner';
import { formatRelativeTime } from '@/utils/formatters';
import { Wifi, WifiOff, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react-native';

interface SyncStatusBarProps {
  status: SyncStatus;
  onRetry?: () => void;
}

export function SyncStatusBar({ status, onRetry }: SyncStatusBarProps) {

  // Debug logging to see what status we're receiving
  console.log('🔍 SyncStatusBar received status:', JSON.stringify(status, null, 2));
  console.log('🔍 SyncStatusBar - isSyncing:', status.isSyncing, 'hasCache:', status.hasCache, 'lastSyncTime:', status.lastSyncTime);

  // Don't show the bar if we have no meaningful status to display
  if (!status.isSyncing && !status.error && !status.lastSyncTime && !status.hasCache) {
    console.log('🔍 SyncStatusBar: No meaningful status, returning null');
    return null;
  }

  const getStatusConfig = () => {
    if (status.isSyncing) {
      return {
        icon: <LoadingSpinner size={16} color="#7C3AED" />,
        text: `Syncing... ${status.progress !== undefined ? Math.round(status.progress) + '%' : ''}`,
        color: '#7C3AED',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
      };
    }
    if (status.error) {
      return {
        icon: <AlertCircle size={16} color="#EF4444" />,
        text: `Sync failed: ${status.error}${status.syncAttempts && status.syncAttempts > 0 ? ` (Attempt ${status.syncAttempts})` : ''}`,
        color: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      };
    }
    if (!status.isOnline) {
      return {
        icon: <WifiOff size={16} color="#F59E0B" />,
        text: 'Offline - Using cached data',
        color: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      };
    }
    if (status.lastSyncTime) {
      return {
        icon: <CheckCircle size={16} color="#10B981" />,
        text: `Last updated ${formatRelativeTime(status.lastSyncTime)}`,
        color: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      };
    }
    if (status.hasCache) {
      return {
        icon: <CheckCircle size={16} color="#10B981" />,
        text: 'Data available (pull to sync)',
        color: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      };
    }
    return {
      icon: <Wifi size={16} color="#10B981" />,
      text: 'Ready to sync',
      color: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    };
  };

  const statusConfig = getStatusConfig();
  const showRetryButton = status.error && onRetry && status.isOnline;

  return (
    <View style={[styles.container, { backgroundColor: statusConfig.backgroundColor }]}>
      <View style={styles.statusContent}>
        <View style={[styles.iconContainer, { backgroundColor: statusConfig.backgroundColor }]}>
          {statusConfig.icon}
        </View>
        <Text style={[styles.text, { color: statusConfig.color }]}>
          {statusConfig.text}
        </Text>
      </View>
      
      {showRetryButton && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: statusConfig.color }]}
          onPress={onRetry}
        >
          <RefreshCw size={14} color={statusConfig.color} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
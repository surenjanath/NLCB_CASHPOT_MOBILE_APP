import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { analyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { BarChart3, Users, Smartphone, Activity, TrendingUp, Calendar, RefreshCw } from 'lucide-react-native';

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onClose?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isVisible, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadAnalytics();
    }
  }, [isVisible]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setIsRefreshing(false);
  };

  if (!isVisible) return null;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 App Analytics</Text>
          <Text style={styles.subtitle}>Loading usage statistics...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Activity size={32} color="#7C3AED" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 App Analytics</Text>
          <Text style={styles.subtitle}>No data available</Text>
        </View>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
          <RefreshCw size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 App Analytics</Text>
        <Text style={styles.subtitle}>Real-time usage statistics</Text>
        <Text style={styles.lastUpdated}>
          Last updated: {formatDate(analytics.lastUpdated)}
        </Text>
      </View>

      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <BarChart3 size={24} color="#7C3AED" />
          </View>
          <Text style={styles.statValue}>{formatNumber(analytics.totalOpens)}</Text>
          <Text style={styles.statLabel}>Total App Opens</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Users size={24} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{formatNumber(analytics.uniqueUsers)}</Text>
          <Text style={styles.statLabel}>Unique Users</Text>
        </View>
      </View>

      {/* Platform Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Platform Distribution</Text>
        <View style={styles.platformContainer}>
          {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
            <View key={platform} style={styles.platformItem}>
              <View style={styles.platformIcon}>
                <Smartphone size={20} color="#7C3AED" />
              </View>
              <View style={styles.platformInfo}>
                <Text style={styles.platformName}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Text>
                <Text style={styles.platformCount}>{count} users</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Recent Activity</Text>
        <View style={styles.activityContainer}>
          {analytics.recentActivity.slice(0, 10).map((action, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Activity size={16} color="#F59E0B" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityType}>
                  {action.action_type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.activityTime}>
                  {formatDate(action.timestamp)}
                </Text>
                {action.action_data && (
                  <Text style={styles.activityData}>
                    {JSON.stringify(action.action_data, null, 2)}
                  </Text>
                )}
              </View>
            </View>
          ))}
          
          {analytics.recentActivity.length === 0 && (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyText}>No recent activity</Text>
              <Text style={styles.emptySubtext}>Start using the app to see activity here</Text>
            </View>
          )}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Insights</Text>
        <View style={styles.insightsContainer}>
          <View style={styles.insightItem}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.insightText}>
              {analytics.uniqueUsers > 0 
                ? `Average ${Math.round(analytics.totalOpens / analytics.uniqueUsers)} opens per user`
                : 'No usage data yet'
              }
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Calendar size={20} color="#F59E0B" />
            <Text style={styles.insightText}>
              {analytics.recentActivity.length > 0 
                ? 'Active user engagement detected'
                : 'Waiting for user activity'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <RefreshCw size={20} color="#7C3AED" />
        <Text style={styles.refreshButtonText}>Refresh Analytics</Text>
      </TouchableOpacity>

      {/* Close Button */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close Dashboard</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  platformContainer: {
    gap: 12,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  platformCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityData: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  insightsContainer: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 12,
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  refreshButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    marginBottom: 32,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

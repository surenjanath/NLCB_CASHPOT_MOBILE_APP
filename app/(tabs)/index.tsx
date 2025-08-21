import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LottoCard } from '@/components/LottoCard';
import { SyncStatusBar } from '@/components/SyncStatusBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BackgroundImage } from '@/components/BackgroundImage';
import { lottoService } from '@/services/lottoService';
import { LottoData, LottoResult, SyncStatus } from '@/types/lotto';
import { Sparkles, AlertCircle, RefreshCw, Star, Trophy, Calendar, Clock } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [lottoData, setLottoData] = useState<LottoData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    hasCache: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a small delay to ensure ThemeProvider is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      // This ensures the ThemeProvider has time to initialize
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Initialize sync status properly
    const initializeSyncStatus = async () => {
      try {
        console.log('🔄 Initializing sync status...');
        const currentStatus = await lottoService.getCurrentSyncStatus();
        console.log('📊 Current sync status:', currentStatus);
        
        // Debug: Log the status before setting it
        console.log('🔍 Setting sync status to:', JSON.stringify(currentStatus, null, 2));
        setSyncStatus(currentStatus);
      } catch (error) {
        console.error('Failed to initialize sync status:', error);
        setSyncStatus({
          isSyncing: false,
          hasCache: false,
          isOnline: false,
        });
      }
    };

    initializeSyncStatus();
    
    const unsubscribeSync = lottoService.onSyncStatusChange((newStatus) => {
      console.log('🔄 Index: Sync status changed:', JSON.stringify(newStatus, null, 2));
      console.log('🔄 Index: Previous sync status:', JSON.stringify(syncStatus, null, 2));
      setSyncStatus(newStatus);
      console.log('🔄 Index: Sync status updated in state');
    });
    const unsubscribeData = lottoService.onDataChange((newData) => {
      // Automatically update data when it changes from other screens
      setLottoData(newData);
      setError(null);
    });
    
    loadResults();
    
    return () => {
      unsubscribeSync();
      unsubscribeData();
    };
  }, []);

  const loadResults = async () => {
    try {
      setError(null);
      const data = await lottoService.getResults();
      setLottoData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load results';
      setError(errorMessage);
      console.error('Failed to load results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Index: Starting refresh...');
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await lottoService.syncResults();
      console.log('🔄 Index: Refresh completed, data count:', data.results?.length || 0);
      setLottoData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh results';
      setError(errorMessage);
      console.error('🔄 Index: Refresh failed:', error);
    } finally {
      console.log('🔄 Index: Setting isRefreshing to false');
      setIsRefreshing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadResults();
  };

  const handleCardPress = (result: LottoResult) => {
    // Detail navigation disabled due to theme provider issues
    console.log('Card pressed - detail navigation is currently disabled');
    // TODO: Re-enable when theme provider issues are resolved
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const year = now.getFullYear();
    const suffix = date === 1 ? 'st' : date === 2 ? 'nd' : date === 3 ? 'rd' : 'th';
    return `${day}, ${date}${suffix} ${year}`;
  };

  const renderLoadingState = () => (
    <BackgroundImage overlayOpacity={0.9}>
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.iconContainer}>
            <Star size={48} color="#1F2937" />
            <Sparkles size={24} color="#1F2937" style={styles.sparkleIcon} />
          </View>
          <Text style={styles.loadingTitle}>Loading Lucky Numbers</Text>
          <Text style={styles.loadingSubtitle}>Preparing your lottery experience</Text>
          <LoadingSpinner size={32} color="#1F2937" />
        </View>
      </View>
    </BackgroundImage>
  );

  const renderErrorState = () => (
    <BackgroundImage overlayOpacity={0.9}>
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <View style={styles.retryButtonContent}>
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundImage>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Trophy size={48} color="#1F2937" />
        <Text style={styles.emptyTitle}>Welcome to T&T Cashpot!</Text>
        <Text style={styles.emptySubtitle}>
          Pull down to sync and load your first lottery results
        </Text>
        <View style={styles.syncHint}>
          <Text style={styles.syncHintText}>
            💡 This will download all available lottery data
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatsOverview = () => {
    if (!lottoData?.results.length) return null;
    
    const totalJackpot = lottoData.results.reduce((sum, result) => sum + result.jackpot, 0);
    const avgJackpot = totalJackpot / lottoData.results.length;
    
    return (
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lottoData.results.length}</Text>
          <Text style={styles.statLabel}>Total Draws</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${(avgJackpot / 1000000).toFixed(1)}M</Text>
          <Text style={styles.statLabel}>Avg Jackpot</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${(totalJackpot / 1000000).toFixed(1)}M</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
    );
  };

  const renderLatestResultCard = () => {
    if (!lottoData?.results.length) return null;
    
    const latestResult = lottoData.results[0];
    console.log('Latest result for card:', latestResult);
    
    // Validate the latest result
    if (!latestResult || typeof latestResult !== 'object') {
      console.error('Invalid latest result:', latestResult);
      return null;
    }
    
    const numbers = latestResult.numbers.split('|').filter(Boolean);
    
    return (
      <View
        style={styles.latestCard}
      >
        <View style={styles.latestCardHeader}>
          <View style={styles.latestCardTitleSection}>
            <View style={styles.latestCardIcon}>
              <Text style={styles.latestCardIconText}>🎯</Text>
            </View>
            <View style={styles.latestCardTitleContent}>
              <Text style={styles.latestCardTitle}>Latest Result</Text>
              <Text style={styles.latestCardSubtitle}>Most recent draw</Text>
            </View>
          </View>
          <View style={styles.latestCardArrow}>
            <Text style={styles.latestCardArrowText}>→</Text>
          </View>
        </View>
        
        <View style={styles.latestCardContent}>
          <View style={styles.latestCardDateRow}>
            <Text style={styles.latestCardDate}>
              {(() => {
                // Parse the date string and force it to be treated as local date
                const [year, month, day] = latestResult.date.split('-').map(Number);
                const localDate = new Date(year, month - 1, day); // month is 0-indexed
                return localDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                });
              })()}
            </Text>
            <Text style={styles.latestCardDraw}>#{latestResult.draw_num}</Text>
          </View>
          
          <View style={styles.latestNumbersRow}>
            {numbers.map((num, index) => (
              <View key={index} style={styles.miniNumberBall}>
                <Text style={styles.miniNumberText}>{num}</Text>
              </View>
            ))}
            <View style={styles.miniPowerBall}>
              <Text style={styles.miniPowerBallText}>{latestResult.multiplier}</Text>
            </View>
          </View>
          
          <View style={styles.latestCardFooter}>
            <View style={styles.latestCardFooterLeft}>
              <Text style={styles.latestJackpotLabel}>Jackpot</Text>
              <Text style={styles.latestJackpot}>
                ${(latestResult.jackpot / 1000000).toFixed(1)}M
              </Text>
            </View>
            <View style={styles.latestCardFooterRight}>
              <Text style={styles.latestWinnersLabel}>Winners</Text>
              <Text style={styles.latestWinners}>
                {latestResult.wins.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return renderLoadingState();
  }

  if (error && !lottoData) {
    return renderErrorState();
  }

  if (!lottoData || lottoData.results.length === 0) {
    // Show empty state but make it refreshable for first-time users
    return (
      <BackgroundImage overlayOpacity={0.85}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>WELCOME TO T&T CASHPOT DATA APP.</Text>
              <Text style={styles.dateText}>{getCurrentDate()}</Text>
              <Text style={styles.greetingText}>Cashpot Results</Text>
            </View>
            
            <View style={styles.timeSection}>
              <View style={styles.timeContainer}>
                <Clock size={16} color="#FFFFFF" />
                <Text style={styles.timeText}>{getCurrentTime()}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerInfoText}>
              Welcome! Let's get started with your Cashpot data
            </Text>
            <Text style={styles.headerInfoSubtext}>
              Pull down to sync and load your first results
            </Text>
          </View>
        </View>

        <SyncStatusBar status={syncStatus} onRetry={handleRefresh} />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { flex: 1, justifyContent: 'center' }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#1F2937"
              colors={["#1F2937"]}
              progressBackgroundColor="#FFFFFF"
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
        
        <View style={styles.tabMenuSpacing} />
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage overlayOpacity={0.65}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>WELCOME TO T&T CASHPOT DATA APP.</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
            <Text style={styles.greetingText}>Cashpot Results</Text>
          </View>
          
          <View style={styles.timeSection}>
            <View style={styles.timeContainer}>
              <Clock size={16} color="#FFFFFF" />
              <Text style={styles.timeText}>{getCurrentTime()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>
            Latest T&T Cashpot results updated in real-time
          </Text>
          <Text style={styles.headerInfoSubtext}>
            {lottoData.results.length} recent draws available
          </Text>
        </View>
      </View>

      <SyncStatusBar status={syncStatus} onRetry={handleRefresh} />
      
      {/* Stats Overview */}
      {renderStatsOverview()}
      
      {/* Latest Result Card */}
      {renderLatestResultCard()}
      
      {/* Bottom spacing for tab menu */}
      <View style={styles.tabMenuSpacing} />
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorContent: {
    alignItems: 'center',
    gap: 16,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  retryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeSection: {
    flex: 1,
    gap: 4,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  timeSection: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    gap: 4,
  },
  headerInfoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  headerInfoSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  statsOverview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  resultsSection: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  bottomSpacing: {
    height: 32,
  },
  latestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 24,
    marginBottom: 24,
    marginTop: 80,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.8)',
  },
  latestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  latestCardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  latestCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestCardIconText: {
    fontSize: 20,
  },
  latestCardTitleContent: {
    gap: 2,
  },
  latestCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  latestCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  latestCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestCardArrowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  latestCardContent: {
    gap: 16,
  },
  latestCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  latestCardDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  latestCardDraw: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  latestNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  miniNumberBall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  miniNumberBallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  miniPowerBall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  miniPowerBallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  latestCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(243, 244, 246, 0.8)',
  },
  latestCardFooterLeft: {
    alignItems: 'flex-start',
    gap: 2,
  },
  latestCardFooterRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  latestJackpotLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestJackpot: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  latestWinnersLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestWinners: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  tabMenuSpacing: {
    height: 20, // Increased to account for navigation bar at bottom: 150
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  syncHint: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.2)',
  },
  syncHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
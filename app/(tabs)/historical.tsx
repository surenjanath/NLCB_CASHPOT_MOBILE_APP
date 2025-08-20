import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LottoCard } from '@/components/LottoCard';
import { SearchBar } from '@/components/SearchBar';
import { SyncStatusBar } from '@/components/SyncStatusBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BackgroundImage } from '@/components/BackgroundImage';
import { lottoService } from '@/services/lottoService';
import { LottoData, LottoResult, SyncStatus, SearchFilters } from '@/types/lotto';
import { History, Calendar, Search, Filter } from 'lucide-react-native';

export default function HistoricalScreen() {
  const router = useRouter();
  const [lottoData, setLottoData] = useState<LottoData | null>(null);
  const [filteredResults, setFilteredResults] = useState<LottoResult[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    hasCache: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [pageSize] = useState(100);

  useEffect(() => {
    // Initialize sync status properly
    const initializeSyncStatus = async () => {
      try {
        console.log('🔄 Initializing sync status...');
        const currentStatus = await lottoService.getCurrentSyncStatus();
        console.log('📊 Current sync status:', currentStatus);
        
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
      console.log('🔄 Sync status changed:', newStatus);
      setSyncStatus(newStatus);
    });
    const unsubscribeData = lottoService.onDataChange(async (newData) => {
      // Automatically update data when it changes from other screens
      setError(null);
      
      // Use new Supabase-based pagination for MUCH better performance
      const paginatedData = await lottoService.getResultsPaginated(1, pageSize);
      
      if (paginatedData.results && paginatedData.results.length > 0) {
        setLottoData({
          last_updated: newData.last_updated,
          results: paginatedData.results,
        });
        
        // Update pagination state
        setTotalPages(Math.ceil(paginatedData.total / pageSize));
        setTotalResults(paginatedData.total);
        setHasMore(paginatedData.total > pageSize);
        setCurrentPage(1);
      } else {
        setLottoData(null);
        setTotalPages(1);
        setTotalResults(0);
        setHasMore(false);
        setCurrentPage(1);
      }
    });
    
    loadResults();
    
    return () => {
      unsubscribeSync();
      unsubscribeData();
    };
  }, []);

  useEffect(() => {
    filterResults();
  }, [lottoData, filters]);

  // Separate useEffect for search to handle async operations
  useEffect(() => {
    if (searchQuery.trim()) {
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        filterResults();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      // If search is cleared, reset to current page results
      if (lottoData?.results) {
        setFilteredResults(lottoData.results);
        setTotalResults(lottoData.results.length);
        setTotalPages(Math.ceil(lottoData.results.length / pageSize));
        setCurrentPage(1);
        setHasMore(lottoData.results.length > pageSize);
      }
    }
  }, [searchQuery]);

  const loadResults = async (page: number = 1, append: boolean = false) => {
    try {
      setError(null);
      
      if (page === 1) {
        setIsLoading(true);
        setCurrentPage(1);
      } else {
        setIsLoadingMore(true);
      }

      // Use new Supabase-based pagination for MUCH better performance
      const paginatedData = await lottoService.getResultsPaginated(page, pageSize);
      
      if (!paginatedData.results || paginatedData.results.length === 0) {
        // No cached data - this is not an error, just means we need to sync
        setLottoData(null);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalResults(0);
        setHasMore(false);
        return; // Exit gracefully, don't throw error
      }

      if (append && lottoData) {
        // Append new data to existing data
        const updatedResults = [...lottoData.results, ...paginatedData.results];
        setLottoData({
          ...lottoData,
          results: updatedResults,
        });
      } else {
        // Set new data
        setLottoData({
          last_updated: new Date().toISOString(), // We'll get this from cache later if needed
          results: paginatedData.results,
        });
      }

      // Update pagination state
      setCurrentPage(paginatedData.currentPage);
      setTotalPages(Math.ceil(paginatedData.total / pageSize));
      setTotalResults(paginatedData.total);
      setHasMore(paginatedData.hasMore);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load results';
      setError(errorMessage);
      console.error('Failed to load results:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Sync with Supabase to update the cache
      await lottoService.syncResults();
      
      // Reset to first page and reload from updated cache
      setCurrentPage(1);
      await loadResults(1, false);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh results';
      setError(errorMessage);
      console.error('Failed to refresh results:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadResults();
  };

  const loadMoreResults = () => {
    if (hasMore && !isLoadingMore) {
      loadResults(currentPage + 1, true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const filterResults = async () => {
    if (!lottoData?.results) {
      setFilteredResults([]);
      return;
    }

    // If there's a search query, perform database search
    if (searchQuery.trim()) {
      await performDatabaseSearch(searchQuery);
      return;
    }

    // For filters without search, use current page results
    let results = [...lottoData.results];

    // Apply filters (only on current page for now)
    if (filters.dateRange?.start) {
      results = results.filter(result => 
        new Date(result.date) >= new Date(filters.dateRange!.start)
      );
    }
    if (filters.dateRange?.end) {
      results = results.filter(result => 
        new Date(result.date) <= new Date(filters.dateRange!.end)
      );
    }
    if (filters.minJackpot) {
      results = results.filter(result => result.jackpot >= filters.minJackpot!);
    }
    if (filters.maxJackpot) {
      results = results.filter(result => result.jackpot <= filters.maxJackpot!);
    }

    setFilteredResults(results);
  };

  // Database search using Supabase queries for efficiency
  const performDatabaseSearch = async (query: string) => {
    try {
      setIsSearching(true);
      console.log(`🔍 Performing database search for: "${query}"`);
      
      // Use Supabase query to search across all fields
      const searchResults = await lottoService.searchResults(query);
      
      if (!searchResults || !searchResults.results) {
        console.log('No search results found');
        setFilteredResults([]);
        setTotalResults(0);
        setTotalPages(1);
        setCurrentPage(1);
        setHasMore(false);
        return;
      }

      console.log(`🔍 Database search found ${searchResults.results.length} results`);
      setFilteredResults(searchResults.results);
      
      // Update pagination state for search results
      setTotalResults(searchResults.results.length);
      setTotalPages(Math.ceil(searchResults.results.length / pageSize));
      setCurrentPage(1);
      setHasMore(searchResults.results.length > pageSize);
      
    } catch (error) {
      console.error('Database search failed:', error);
      // Fallback to current page search if database search fails
      const currentPageResults = lottoData?.results || [];
      const searchQuery = query.toLowerCase();
      const fallbackResults = currentPageResults.filter(result => 
        result.draw_num.toString().includes(searchQuery) ||
        result.date.includes(searchQuery) ||
        result.numbers.includes(searchQuery) ||
        result.power_ball.toString().includes(searchQuery) ||
        result.multiplier.toString().includes(searchQuery)
      );
      setFilteredResults(fallbackResults);
      setTotalResults(fallbackResults.length);
      setTotalPages(Math.ceil(fallbackResults.length / pageSize));
      setCurrentPage(1);
      setHasMore(fallbackResults.length > pageSize);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCardPress = (result: LottoResult) => {
    router.push({
      pathname: '/detail',
      params: {
        drawNum: result.draw_num,
        date: result.date,
        numbers: result.numbers,
        powerBall: result.power_ball,
        multiplier: result.multiplier,
        jackpot: result.jackpot,
        wins: result.wins,
      },
    });
  };

  const renderLoadingState = () => (
    <BackgroundImage overlayOpacity={0.9}>
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.iconContainer}>
            <History size={48} color="#1F2937" />
          </View>
          <Text style={styles.loadingTitle}>Loading Historical Data</Text>
          <Text style={styles.loadingSubtitle}>Preparing your lottery history</Text>
          <LoadingSpinner size={32} color="#1F2937" />
        </View>
      </View>
    </BackgroundImage>
  );

  const renderErrorState = () => (
    <BackgroundImage overlayOpacity={0.9}>
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <View style={styles.retryButtonContent}>
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
        <History size={48} color="#1F2937" />
        <Text style={styles.emptyTitle}>
          {searchQuery || Object.keys(filters).length > 0 
            ? 'No Results Found'
            : 'Welcome to Historical Results!'
          }
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery || Object.keys(filters).length > 0 
            ? 'Try adjusting your search or filters'
            : 'Pull down to sync and browse all lottery draws'
          }
        </Text>
                  {!searchQuery && Object.keys(filters).length === 0 && (
            <View style={styles.syncHint}>
              <Text style={styles.syncHintText}>
                💡 This will download all available lottery data for browsing
              </Text>
            </View>
          )}
      </View>
    </View>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  if (error && !lottoData) {
    return renderErrorState();
  }

  if (!lottoData || lottoData.results.length === 0) {
    // Show empty state but make it refreshable
    return (
      <BackgroundImage overlayOpacity={0.85}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <History size={32} color="#1F2937" />
              <Text style={styles.title}>Historical Results</Text>
            </View>
            <Text style={styles.subtitle}>
              Browse all lottery draws and search results
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
    <BackgroundImage overlayOpacity={0.85}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <History size={32} color="#1F2937" />
            <Text style={styles.title}>Historical Results</Text>
          </View>
          <Text style={styles.subtitle}>
            Browse all lottery draws and search results
          </Text>
        </View>
      </View>

      <SyncStatusBar status={syncStatus} onRetry={handleRefresh} />
      
      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearch}
        onFiltersChange={handleFiltersChange}
        placeholder="Search draws, dates, numbers..."
        showFilters={true}
      />

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {filteredResults.length} of {totalResults} results
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </Text>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={() => {
            // Auto-load more when user stops scrolling near the bottom
            if (hasMore && !isLoadingMore) {
              loadMoreResults();
            }
          }}
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
          {filteredResults.map((result) => (
            <LottoCard
              key={`${result.date}-${result.draw_num}`}
              result={result}
              onPress={() => null}
            />
          ))}
          
          {/* Load More Section */}
          {hasMore && (
            <View style={styles.loadMoreSection}>
              {isLoadingMore ? (
                <View style={styles.loadMoreLoading}>
                  <LoadingSpinner size={24} color="#1F2937" />
                  <Text style={styles.loadMoreText}>Loading more results...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreResults}
                  disabled={isLoadingMore}
                >
                  <Text style={styles.loadMoreButtonText}>Load More Results</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
      
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
    alignItems: 'center',
    justifyContent: 'center',
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
  titleSection: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  resultsCount: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  bottomSpacing: {
    height: 32,
  },
  tabMenuSpacing: {
    height: 80, // Increased to account for navigation bar at bottom: 150
  },
  loadMoreSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadMoreLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadMoreButton: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  loadMoreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, LOTTO_TABLE, testSupabaseConnection } from './supabaseClient';
import { LottoData, LottoResult, SyncStatus } from '@/types/lotto';

const CACHE_KEY = 'lotto_cache';
const LAST_SYNC_KEY = 'last_sync';
const SYNC_ATTEMPTS_KEY = 'sync_attempts';

export class LottoService {
  private syncCallbacks: Set<(status: SyncStatus) => void> = new Set();
  private dataChangeCallbacks: Set<(data: LottoData) => void> = new Set();
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  // Subscribe to sync status updates
  onSyncStatusChange(callback: (status: SyncStatus) => void) {
    console.log('🔔 Adding sync status callback, total callbacks:', this.syncCallbacks.size + 1);
    this.syncCallbacks.add(callback);
    return () => {
      console.log('🔔 Removing sync status callback, total callbacks:', this.syncCallbacks.size - 1);
      this.syncCallbacks.delete(callback);
    };
  }

  // Subscribe to data change updates
  onDataChange(callback: (data: LottoData) => void) {
    console.log('🔔 Adding data change callback, total callbacks:', this.dataChangeCallbacks.size + 1);
    this.dataChangeCallbacks.add(callback);
    return () => {
      console.log('🔔 Removing data change callback, total callbacks:', this.dataChangeCallbacks.size - 1);
      this.dataChangeCallbacks.delete(callback);
    };
  }

  private notifySyncStatus(status: SyncStatus) {
    console.log('🔄 Notifying sync status change:', JSON.stringify(status, null, 2));
    console.log('🔄 Total sync callbacks to notify:', this.syncCallbacks.size);
    let callbackIndex = 0;
    this.syncCallbacks.forEach(callback => {
      callbackIndex++;
      console.log(`🔄 Notifying callback ${callbackIndex}`);
      try {
        callback(status);
        console.log(`🔄 Callback ${callbackIndex} executed successfully`);
      } catch (error) {
        console.error(`🔄 Callback ${callbackIndex} failed:`, error);
      }
    });
  }

  private notifyDataChange(data: LottoData) {
    console.log('📊 Notifying data change, results count:', data.results?.length || 0);
    this.dataChangeCallbacks.forEach(callback => callback(data));
  }

  // Test Supabase connection
  async testConnection(): Promise<boolean> {
    try {
      return await testSupabaseConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Check if device is online
  private async isOnline(): Promise<boolean> {
    try {
      // Simple network check - you might want to use a more robust solution
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log('🌐 Network check: Online');
      return true;
    } catch {
      console.log('🌐 Network check: Offline');
      return false;
    }
  }

  // Load cached results (offline-first)
  async loadCachedResults(): Promise<LottoData | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('📦 Loaded cached results, count:', parsed?.results?.length || 0);
        return parsed;
      } else {
        console.log('📦 No cached results found');
        return null;
      }
    } catch (error) {
      console.error('Failed to load cached results:', error);
      return null;
    }
  }

  // Get paginated results directly from Supabase (MUCH faster than cache)
  async getResultsPaginated(page: number = 1, pageSize: number = 100): Promise<{
    results: LottoResult[];
    total: number;
    hasMore: boolean;
    currentPage: number;
  }> {
    try {
      // Calculate the range for Supabase pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get total count first (lightweight query)
      const { count, error: countError } = await supabase
        .from(LOTTO_TABLE)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Count error: ${countError.message}`);
      }

      const total = count || 0;

      // Get paginated results directly from Supabase
      const { data, error } = await supabase
        .from(LOTTO_TABLE)
        .select('*')
        .order('date', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const results = data || [];
      const hasMore = to < total - 1;

      console.log(`📄 Page ${page}: Loaded ${results.length} results (${from}-${to} of ${total})`);

      return {
        results,
        total,
        hasMore,
        currentPage: page,
      };
    } catch (error) {
      console.error('Failed to load paginated results from Supabase:', error);
      
      // Fallback to cache if Supabase fails
      console.log('🔄 Falling back to cache...');
      return await this.getCachedResultsPaginated(page, pageSize);
    }
  }

  // Get paginated results from cache (fallback method)
  async getCachedResultsPaginated(page: number = 1, pageSize: number = 100): Promise<{
    results: LottoResult[];
    total: number;
    hasMore: boolean;
    currentPage: number;
  }> {
    try {
      const cached = await this.loadCachedResults();
      if (!cached || !cached.results || cached.results.length === 0) {
        return {
          results: [],
          total: 0,
          hasMore: false,
          currentPage: page,
        };
      }

      const total = cached.results.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageResults = cached.results.slice(startIndex, endIndex);
      const hasMore = endIndex < total;

      return {
        results: pageResults,
        total,
        hasMore,
        currentPage: page,
      };
    } catch (error) {
      console.error('Failed to load paginated cached results:', error);
      return {
        results: [],
        total: 0,
        hasMore: false,
        currentPage: page,
      };
    }
  }

  // Get total count from Supabase (lightweight and fast)
  async getTotalResultsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(LOTTO_TABLE)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Failed to get total count from Supabase:', error);
        // Fallback to cache
        return await this.getCachedResultsCount();
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get total count:', error);
      // Fallback to cache
      return await this.getCachedResultsCount();
    }
  }

  // Get total count from cache (fallback method)
  async getCachedResultsCount(): Promise<number> {
    try {
      const cached = await this.loadCachedResults();
      return cached?.results?.length || 0;
    } catch (error) {
      console.error('Failed to get cached results count:', error);
      return 0;
    }
  }

  // Save results to cache
  private async saveCachedResults(data: LottoData): Promise<void> {
    try {
      console.log('💾 Saving cached results...');
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      const syncTime = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, syncTime);
      await AsyncStorage.setItem(SYNC_ATTEMPTS_KEY, '0');
      console.log('💾 Cache saved successfully, last sync time:', syncTime);
    } catch (error) {
      console.error('Failed to save cached results:', error);
      throw error;
    }
  }

  // Get sync attempts count
  private async getSyncAttempts(): Promise<number> {
    try {
      const attempts = await AsyncStorage.getItem(SYNC_ATTEMPTS_KEY);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch {
      return 0;
    }
  }

  // Increment sync attempts
  private async incrementSyncAttempts(): Promise<void> {
    try {
      const attempts = await this.getSyncAttempts();
      await AsyncStorage.setItem(SYNC_ATTEMPTS_KEY, (attempts + 1).toString());
    } catch (error) {
      console.error('Failed to increment sync attempts:', error);
    }
  }

  // Fetch results from Supabase with retry logic
  private async fetchFromSupabase(): Promise<LottoResult[]> {
    console.log('🔍 Starting fetchFromSupabase...');
    const attempts = await this.getSyncAttempts();
    
    if (attempts >= this.maxRetries) {
      throw new Error('Max sync attempts reached. Please try again later.');
    }

    try {
      // Check existing JSON cache to see what data we already have
      const existingCache = await this.loadCachedResults();
      
      if (!existingCache || !existingCache.results || existingCache.results.length === 0) {
        // No JSON cache exists - fetch ALL data using pagination
        console.log('🆕 No existing cache - fetching ALL data using pagination');
        return await this.fetchAllDataWithPagination();
      }

      // We have existing data - check the latest date in our cache
      const latestDateInCache = existingCache.results[0]?.date; // First result is most recent due to DESC order
      
      if (!latestDateInCache) {
        console.log('⚠️ Cache exists but no date found - fetching all data');
        return await this.fetchAllDataWithPagination();
      }

      // Incremental sync - fetch only data newer than what we have in cache
      console.log(`🔄 Incremental sync - fetching data newer than ${latestDateInCache} (we have ${existingCache.results.length} records in cache)`);
      
      const { data, error } = await supabase
        .from(LOTTO_TABLE)
        .select('*')
        .gt('date', latestDateInCache) // Use gt (greater than) to get NEWER data only
        .order('date', { ascending: false });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('No new data to sync - cache is up to date');
        return [];
      }

      // Reset sync attempts on success
      await AsyncStorage.setItem(SYNC_ATTEMPTS_KEY, '0');
      
      console.log(`Fetched ${data.length} new records from Supabase (newer than ${latestDateInCache})`);
      return data;
    } catch (error) {
      console.error('🔍 fetchFromSupabase failed:', error);
      await this.incrementSyncAttempts();
      throw error;
    }
  }

  // Fetch all data using pagination to bypass Supabase's 1000 record limit
  private async fetchAllDataWithPagination(): Promise<LottoResult[]> {
    const allResults: LottoResult[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000; // Supabase's default limit

    console.log('📄 Starting paginated fetch of all data...');

    while (hasMore) {
      const { data, error } = await supabase
        .from(LOTTO_TABLE)
        .select('*')
        .order('date', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        throw new Error(`Supabase pagination error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allResults.push(...data);
      console.log(`📄 Fetched page ${page + 1}: ${data.length} records (Total: ${allResults.length})`);
      
      // If we got less than pageSize, we've reached the end
      if (data.length < pageSize) {
        hasMore = false;
      }
      
      page++;
    }

    // Reset sync attempts on success
    await AsyncStorage.setItem(SYNC_ATTEMPTS_KEY, '0');
    
    console.log(`📄 Total records fetched: ${allResults.length}`);
    return allResults;
  }



  // Get last sync time
  async getLastSyncTime(): Promise<string | null> {
    try {
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      console.log('🕐 Retrieved last sync time:', lastSync);
      return lastSync;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  // Sync with Supabase and update cache
  async syncResults(): Promise<LottoData> {
    console.log('🔄 Starting sync process...');
    const hasCache = !!(await this.loadCachedResults());
    const isOnline = await this.isOnline();
    
    console.log('🔄 Sync status - hasCache:', hasCache, 'isOnline:', isOnline);
    
    this.notifySyncStatus({ 
      isSyncing: true, 
      hasCache,
      lastSyncTime: await this.getLastSyncTime() || undefined,
      isOnline
    });

    if (!isOnline) {
      const error = 'No internet connection. Please check your network.';
      this.notifySyncStatus({ 
        isSyncing: false, 
        hasCache,
        error,
        lastSyncTime: await this.getLastSyncTime() || undefined,
        isOnline: false
      });
      
      // Return cached data if available
      const cached = await this.loadCachedResults();
      if (cached) {
        return cached;
      }
      
      throw new Error(error);
    }

    try {
      const newResults = await this.fetchFromSupabase();
      const existingCache = await this.loadCachedResults();
      
      let finalResults: LottoResult[];
      
      if (newResults.length === 0) {
        // No new data to sync - return existing cache
        console.log('No new data - returning existing cache');
        if (existingCache) {
          // Update sync status to completed even when no new data
          console.log('🔄 No new data, updating sync status to completed');
          const finalStatus = { 
            isSyncing: false, 
            hasCache: true,
            lastSyncTime: await this.getLastSyncTime() || undefined,
            isOnline: true
          };
          console.log('🔄 Final sync status for no new data:', JSON.stringify(finalStatus, null, 2));
          this.notifySyncStatus(finalStatus);
          return existingCache;
        } else {
          throw new Error('No data available');
        }
      }
      
      if (!existingCache || !existingCache.results || existingCache.results.length === 0) {
        // No existing cache - use all new results
        console.log('🆕 No existing cache - using all new results');
        finalResults = newResults;
      } else {
        // Merge new results with existing cache
        console.log(`🔄 Merging ${newResults.length} new results with ${existingCache.results.length} existing results`);
        
        // Combine and remove duplicates (new results should be newer, so they come first)
        const combinedResults = [...newResults, ...existingCache.results];
        
        // Remove duplicates based on draw_num and date
        const uniqueMap = new Map();
        combinedResults.forEach(result => {
          const key = `${result.draw_num}-${result.date}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, result);
          }
        });
        
        finalResults = Array.from(uniqueMap.values());
        
        // Sort by date descending (newest first)
        finalResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log(`After merging and deduplication: ${finalResults.length} total results`);
      }
      
      const lottoData: LottoData = {
        last_updated: new Date().toISOString(),
        results: finalResults,
      };

      await this.saveCachedResults(lottoData);
      
      // Notify all subscribers about the new data
      this.notifyDataChange(lottoData);
      
      console.log('🔄 Sync completed successfully, updating status...');
      this.notifySyncStatus({ 
        isSyncing: false, 
        hasCache: true,
        lastSyncTime: lottoData.last_updated,
        isOnline: true
      });

      return lottoData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('🔄 Sync failed with error:', errorMessage);
      
      this.notifySyncStatus({ 
        isSyncing: false, 
        hasCache,
        error: errorMessage,
        lastSyncTime: await this.getLastSyncTime() || undefined,
        isOnline: true
      });

      // If sync fails but we have cached data, return it
      const cached = await this.loadCachedResults();
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  // Get results (offline-first approach)
  async getResults(): Promise<LottoData> {
    // Always try to load from cache first
    const cached = await this.loadCachedResults();
    
    if (cached) {
      // Start background sync if we have cached data
      this.syncResults().catch(console.error);
      return cached;
    }

    // No cache, must sync
    return await this.syncResults();
  }

  // Search results using Supabase queries for efficiency
  async searchResults(query: string): Promise<LottoData> {
    try {
      console.log(`🔍 Searching Supabase for: "${query}"`);
      
      // Create a search query that searches across multiple fields
      const searchQuery = query.toLowerCase();
      
      // Check if the query is a number (for draw_num, power_ball, multiplier)
      const isNumeric = !isNaN(Number(searchQuery));
      
      let queryBuilder = supabase
        .from('lotto_results')
        .select('*', { count: 'exact' });
      
      if (isNumeric) {
        // For numeric queries, search in numeric fields with exact matches and text fields with ilike
        queryBuilder = queryBuilder.or(
          `draw_num.eq.${searchQuery},power_ball.eq.${searchQuery},multiplier.eq.${searchQuery},numbers.ilike.%${searchQuery}%`
        );
      } else {
        // For text queries, check if it's a date format first
        const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
        const yearPattern = /^\d{4}$/; // YYYY format
        const monthYearPattern = /^\d{4}-\d{2}$/; // YYYY-MM format
        
        if (datePattern.test(searchQuery) || yearPattern.test(searchQuery) || monthYearPattern.test(searchQuery)) {
          // Date-based search
          if (datePattern.test(searchQuery)) {
            // Exact date match
            queryBuilder = queryBuilder.eq('date', searchQuery);
          } else if (monthYearPattern.test(searchQuery)) {
            // Month-year search (e.g., "2025-08")
            const [year, month] = searchQuery.split('-');
            const nextMonth = month === '12' ? `${parseInt(year) + 1}-01` : `${year}-${String(parseInt(month) + 1).padStart(2, '0')}`;
            queryBuilder = queryBuilder.gte('date', `${searchQuery}-01`).lt('date', `${nextMonth}-01`);
          } else if (yearPattern.test(searchQuery)) {
            // Year search (e.g., "2025")
            queryBuilder = queryBuilder.gte('date', `${searchQuery}-01-01`).lt('date', `${parseInt(searchQuery) + 1}-01-01`);
          }
        } else {
          // Regular text search in numbers field only
          queryBuilder = queryBuilder.ilike('numbers', `%${searchQuery}%`);
        }
      }
      
      const { data, error, count } = await queryBuilder
        .order('date', { ascending: false })
        .limit(1000); // Limit to prevent overwhelming results
      
      if (error) {
        console.error('Supabase search error:', error);
        throw error;
      }

      console.log(`🔍 Supabase search found ${data?.length || 0} results`);
      
      return {
        last_updated: new Date().toISOString(),
        results: data || [],
      };
      
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // Clear cache (for testing/debugging)
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CACHE_KEY, LAST_SYNC_KEY, SYNC_ATTEMPTS_KEY]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  // Get current sync status for debugging
  async getCurrentSyncStatus(): Promise<SyncStatus> {
    try {
      console.log('🔍 Getting current sync status...');
      const hasCache = !!(await this.loadCachedResults());
      const lastSync = await this.getLastSyncTime();
      const isOnline = await this.isOnline();
      
      console.log('🔍 Status components - hasCache:', hasCache, 'lastSync:', lastSync, 'isOnline:', isOnline);
      
      // If we have cache but no lastSync, try to get it from the cached data
      let lastSyncTime = lastSync;
      if (hasCache && !lastSyncTime) {
        const cachedData = await this.loadCachedResults();
        if (cachedData?.last_updated) {
          lastSyncTime = cachedData.last_updated;
          console.log('🔍 Using last_updated from cached data:', lastSyncTime);
        }
      }
      
      const finalStatus = {
        isSyncing: false, // This should be managed by the sync process
        hasCache,
        lastSyncTime: lastSyncTime || undefined,
        isOnline,
      };
      
      console.log('🔍 Final sync status:', JSON.stringify(finalStatus, null, 2));
      return finalStatus;
    } catch (error) {
      console.error('Failed to get current sync status:', error);
      return {
        isSyncing: false,
        hasCache: false,
        isOnline: false,
      };
    }
  }

  // Get cache info for debugging (lightweight version)
  async getCacheInfo(): Promise<{
    hasCache: boolean;
    lastSync: string | null;
    syncAttempts: number;
    cacheSize: number;
    totalRecords: number;
  }> {
    try {
      const hasCache = !!(await this.loadCachedResults());
      const lastSync = await this.getLastSyncTime();
      const syncAttempts = await this.getSyncAttempts();
      
      let cacheSize = 0;
      let totalRecords = 0;
      
      // Get total records from Supabase (much faster than parsing cache)
      try {
        totalRecords = await this.getTotalResultsCount();
      } catch {
        // Fallback to cache if Supabase fails
        if (hasCache) {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              totalRecords = parsed.results?.length || 0;
            } catch {
              totalRecords = 0;
            }
          }
        }
      }
      
      if (hasCache) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          cacheSize = cached.length;
        }
      }

      return {
        hasCache,
        lastSync,
        syncAttempts,
        cacheSize,
        totalRecords,
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return {
        hasCache: false,
        lastSync: null,
        syncAttempts: 0,
        cacheSize: 0,
        totalRecords: 0,
      };
    }
  }
}

export const lottoService = new LottoService();
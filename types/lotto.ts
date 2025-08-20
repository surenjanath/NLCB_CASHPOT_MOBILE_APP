export interface LottoResult {
  date: string; // YYYY-MM-DD
  draw_num: number;
  numbers: string; // pipe-separated string of numbers
  power_ball: number;
  multiplier: number;
  jackpot: number; // currency
  wins: number;
}

export interface LottoData {
  last_updated: string; // ISO-8601 timestamp
  results: LottoResult[];
  total_draws?: number;
  cache_version?: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime?: string;
  error?: string;
  hasCache: boolean;
  isOnline?: boolean;
  syncAttempts?: number;
  progress?: number; // 0-100 for sync progress
}

export interface CacheInfo {
  hasCache: boolean;
  lastSync: string | null;
  syncAttempts: number;
  cacheSize: number;
  totalRecords: number;
  cacheVersion?: string;
}

export interface LottoStats {
  totalDraws: number;
  totalJackpot: number;
  averageJackpot: number;
  mostFrequentNumbers: Array<{ number: string; frequency: number }>;
  lastDrawDate: string;
  firstDrawDate: string;
}

export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  minJackpot?: number;
  maxJackpot?: number;
  hasWinners?: boolean;
}
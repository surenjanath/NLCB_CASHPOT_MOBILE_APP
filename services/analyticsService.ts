import { supabase } from './supabaseClient';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

export interface AppAnalytics {
  id: number;
  device_id: string;
  app_version: string;
  platform: string;
  first_open: string;
  last_open: string;
  open_count: number;
  created_at: string;
  updated_at: string;
}

export interface LotteryAction {
  id: number;
  device_id: string;
  action_type: 'check_result' | 'search' | 'view_history' | 'sync_data' | 'view_detail';
  action_data?: any;
  timestamp: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalOpens: number;
  uniqueUsers: number;
  platformBreakdown: { [key: string]: number };
  recentActivity: LotteryAction[];
  lastUpdated: string;
}

export class AnalyticsService {
  private deviceId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.deviceId = this.generateDeviceId();
  }

  /**
   * Generate or retrieve a unique device identifier
   */
  private async generateDeviceId(): Promise<string> {
    try {
      // Try to get existing device ID
      let deviceId = await AsyncStorage.getItem('device_id');
      
      if (!deviceId) {
        // Generate new device ID
        if (Platform.OS === 'web') {
          deviceId = `web_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
        } else {
          // Use device-specific identifier for mobile
          deviceId = Device.osInternalBuildId || 
                    Device.deviceName || 
                    `mobile_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
        }
        
        // Store the device ID
        await AsyncStorage.setItem('device_id', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Failed to generate device ID:', error);
      // Fallback to timestamp-based ID
      return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.deviceId = await this.generateDeviceId();
      this.isInitialized = true;
      console.log('✅ Analytics service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize analytics service:', error);
    }
  }

  /**
   * Track app open event
   */
  async trackAppOpen(): Promise<void> {
    try {
      await this.initialize();
      
      const { data, error } = await supabase
        .from('app_analytics')
        .upsert({
          device_id: this.deviceId,
          app_version: Constants.expoConfig?.version || 'unknown',
          platform: Platform.OS,
          last_open: new Date().toISOString(),
          open_count: 1
        }, {
          onConflict: 'device_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      // If device exists, increment count
      if (data) {
        await supabase
          .from('app_analytics')
          .update({
            open_count: data.open_count + 1,
            last_open: new Date().toISOString()
          })
          .eq('device_id', this.deviceId);
      }

      console.log('✅ App open tracked successfully');
    } catch (error) {
      console.error('❌ Failed to track app open:', error);
    }
  }

  /**
   * Track lottery-related actions
   */
  async trackLotteryAction(
    actionType: LotteryAction['action_type'], 
    actionData?: any
  ): Promise<void> {
    try {
      await this.initialize();
      
      const { error } = await supabase
        .from('lottery_actions')
        .insert({
          device_id: this.deviceId,
          action_type: actionType,
          action_data: actionData,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      console.log(`✅ Lottery action tracked: ${actionType}`);
    } catch (error) {
      console.error(`❌ Failed to track lottery action ${actionType}:`, error);
    }
  }

  /**
   * Track result check
   */
  async trackResultCheck(drawNumber: string, drawDate: string): Promise<void> {
    await this.trackLotteryAction('check_result', {
      draw_number: drawNumber,
      draw_date: drawDate,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track search action
   */
  async trackSearch(query: string, resultCount: number): Promise<void> {
    await this.trackLotteryAction('search', {
      query,
      result_count: resultCount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track history view
   */
  async trackHistoryView(page: number, itemsPerPage: number): Promise<void> {
    await this.trackLotteryAction('view_history', {
      page,
      items_per_page: itemsPerPage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track data sync
   */
  async trackDataSync(syncType: 'manual' | 'automatic', recordCount: number): Promise<void> {
    await this.trackLotteryAction('sync_data', {
      sync_type: syncType,
      record_count: recordCount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track detail view
   */
  async trackDetailView(drawNumber: string): Promise<void> {
    await this.trackLotteryAction('view_detail', {
      draw_number: drawNumber,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
      // Get app analytics
      const { data: appData, error: appError } = await supabase
        .from('app_analytics')
        .select('*');

      if (appError) throw appError;

      // Get recent lottery actions
      const { data: actionData, error: actionError } = await supabase
        .from('lottery_actions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (actionError) throw actionError;

      // Calculate summary
      const totalOpens = appData?.reduce((sum, item) => sum + item.open_count, 0) || 0;
      const uniqueUsers = appData?.length || 0;
      
      // Platform breakdown
      const platformBreakdown: { [key: string]: number } = {};
      appData?.forEach(item => {
        platformBreakdown[item.platform] = (platformBreakdown[item.platform] || 0) + 1;
      });

      return {
        totalOpens,
        uniqueUsers,
        platformBreakdown,
        recentActivity: actionData || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get analytics summary:', error);
      return {
        totalOpens: 0,
        uniqueUsers: 0,
        platformBreakdown: {},
        recentActivity: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get analytics for admin dashboard
   */
  async getAdminAnalytics(): Promise<{
    appAnalytics: AppAnalytics[];
    lotteryActions: LotteryAction[];
  }> {
    try {
      const [appResult, actionResult] = await Promise.all([
        supabase.from('app_analytics').select('*').order('created_at', { ascending: false }),
        supabase.from('lottery_actions').select('*').order('timestamp', { ascending: false })
      ]);

      if (appResult.error) throw appResult.error;
      if (actionResult.error) throw actionResult.error;

      return {
        appAnalytics: appResult.data || [],
        lotteryActions: actionResult.data || []
      };
    } catch (error) {
      console.error('❌ Failed to get admin analytics:', error);
      return {
        appAnalytics: [],
        lotteryActions: []
      };
    }
  }

  /**
   * Get device-specific analytics
   */
  async getDeviceAnalytics(): Promise<AppAnalytics | null> {
    try {
      await this.initialize();
      
      const { data, error } = await supabase
        .from('app_analytics')
        .select('*')
        .eq('device_id', this.deviceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to get device analytics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

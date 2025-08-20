import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lottoService } from '@/services/lottoService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BackgroundImage } from '@/components/BackgroundImage';
import { Moon, Sun, Smartphone, Trash2, RefreshCw, Settings as SettingsIcon, Palette, Database, Star, Zap, Shield } from 'lucide-react-native';
import { CacheInfo, SyncStatus } from '@/types/lotto';
import { formatRelativeTime } from '@/utils/formatters';

export default function SettingsScreen() {
  const { themeMode, setThemeMode, theme } = useTheme();
  const [isClearing, setIsClearing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    hasCache: false,
    isOnline: true,
  });
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);

  useEffect(() => {
    const unsubscribeData = lottoService.onDataChange(() => {
      // Refresh cache info when data changes
      loadCacheInfo();
    });
    
    const unsubscribeSync = lottoService.onSyncStatusChange((newStatus) => {
      console.log('🔄 Settings: Sync status changed:', JSON.stringify(newStatus, null, 2));
      console.log('🔄 Settings: Previous sync status:', JSON.stringify(syncStatus, null, 2));
      setSyncStatus(newStatus);
      console.log('🔄 Settings: Sync status updated in state');
    });
    
    // Initialize sync status
    const initializeSyncStatus = async () => {
      try {
        const currentStatus = await lottoService.getCurrentSyncStatus();
        setSyncStatus(currentStatus);
      } catch (error) {
        console.error('Failed to initialize sync status:', error);
      }
    };
    
    initializeSyncStatus();
    loadCacheInfo();
    
    return () => {
      unsubscribeData();
      unsubscribeSync();
    };
  }, []);

  const loadCacheInfo = async () => {
    try {
      const info = await lottoService.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Failed to load cache info:', error);
    }
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? The app will need to sync again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await lottoService.clearCache();
              await loadCacheInfo(); // Refresh cache info
              Alert.alert('Success', 'Cache cleared successfully');
            } catch {
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setIsClearing(false);
            }
          }
        },
      ]
    );
  };

  const handleForceSync = async () => {
    console.log('🔄 Settings: Starting force sync...');
    try {
      const data = await lottoService.syncResults();
      console.log('🔄 Settings: Force sync completed, data count:', data.results?.length || 0);
      await loadCacheInfo(); // Refresh cache info
      Alert.alert('Success', 'Data synced successfully');
    } catch (error) {
      console.error('🔄 Settings: Force sync failed:', error);
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const handleSocialPress = (platform: string) => {
    const socialUrls = {
      linkedin: 'https://www.linkedin.com/in/surenjanath/',
      instagram: 'https://www.instagram.com/surenjanath/',
      youtube: 'https://www.youtube.com/@PythologyProdigy',
      medium: 'https://surenjanath.medium.com/',
      github: 'https://github.com/surenjanath/nlcb-mobile-app',
      github_scraper: 'https://github.com/surenjanath/CashPot_Automated_Scraper'
    };

    const url = socialUrls[platform as keyof typeof socialUrls];
    if (url) {
      // For now, show an alert with the URL
      // In a real app, you'd use Linking.openURL(url)
      Alert.alert(
        `Open ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        `Would you like to open ${url}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => console.log(`Opening ${url}`) }
        ]
      );
    }
  };

  const handleDonationPress = (method: string) => {
    const donationInfo = {
      fiverr: {
        title: 'Fiverr Services',
        message: 'Professional web scraping services at competitive prices!\n\nGet any website scraped for you at a great price.\n\nThank you for your support! 💼',
        url: 'https://www.fiverr.com/surenjanath/webscrape-any-website-for-you-at-a-price'
      },
      coffee: {
        title: 'Buy Me a Coffee',
        message: 'Support development with a coffee! ☕\n\nThank you for your support! 💙',
        url: 'https://www.buymeacoffee.com/surenjanath'
      }
    };

    const info = donationInfo[method as keyof typeof donationInfo];
    if (info) {
      Alert.alert(
        info.title,
        info.message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Link', onPress: () => console.log(`Opening ${info.url}`) }
        ]
      );
    }
  };

  const handleContactPress = (type: string) => {
    if (type === 'email') {
      console.log('Email support pressed');
      // TODO: Implement email opening
    } else if (type === 'whatsapp') {
      console.log('WhatsApp support pressed');
      // TODO: Implement WhatsApp opening
    }
  };

  const handleWebsitePress = () => {
    console.log('Website pressed - opening nlcbplaywhelotto.com');
    // TODO: Implement website opening
  };

  const handlePhotoCreditPress = () => {
    Alert.alert(
      'Photo Credit',
      'This beautiful background photo was taken by Pranay Arora (@pranayyy7) on Unsplash.\n\nIt features a stunning beach scene in Trinidad and Tobago, perfectly capturing the tropical beauty of the region.\n\nPhoto: "people on beach during daytime"\nPhotographer: Pranay Arora\nLocation: Trinidad and Tobago\n\nThank you for sharing this amazing photo! 📸',
      [
        { text: 'Close', style: 'default' },
        { 
          text: 'View on Unsplash', 
          onPress: () => console.log('Opening Unsplash photo page')
        }
      ]
    );
  };

  const formatCacheSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const styles = getStyles(theme);
  
  return (
    <BackgroundImage overlayOpacity={0.85}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <SettingsIcon size={32} color={theme.colors.text} />
            <Text style={styles.title}>Settings</Text>
          </View>
          <Text style={styles.subtitle}>
            Customize your lottery experience
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Theme Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Palette size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Appearance
              </Text>
              <Text style={styles.sectionSubtitle}>
                Choose your preferred theme
              </Text>
            </View>
          </View>
          
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'light' && styles.activeThemeOption,
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.themeOptionContent}>
                <Sun size={24} color={themeMode === 'light' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[
                  styles.themeOptionText, 
                  { color: themeMode === 'light' ? theme.colors.primary : theme.colors.textSecondary }
                ]}>
                  Light
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'dark' && styles.activeThemeOption,
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.themeOptionContent}>
                <Moon size={24} color={themeMode === 'dark' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[
                  styles.themeOptionText, 
                  { color: themeMode === 'dark' ? theme.colors.primary : theme.colors.textSecondary }
                ]}>
                  Dark
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'auto' && styles.activeThemeOption,
              ]}
              onPress={() => handleThemeChange('auto')}
            >
              <View style={styles.themeOptionContent}>
                <Smartphone size={24} color={themeMode === 'auto' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[
                  styles.themeOptionText, 
                  { color: themeMode === 'auto' ? theme.colors.primary : theme.colors.textSecondary }
                ]}>
                  Auto
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cache Information */}
        {cacheInfo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Database size={20} color="#10B981" />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Cache Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Data storage and sync status
                </Text>
              </View>
            </View>
            
            <View style={styles.cacheInfoGrid}>
              <View style={styles.cacheInfoItem}>
                <View style={styles.cacheIconContainer}>
                  <Shield size={16} color="#10B981" />
                </View>
                <Text style={styles.cacheInfoLabel}>
                  Status
                </Text>
                <Text style={styles.cacheInfoValue}>
                  {cacheInfo.hasCache ? 'Available' : 'Empty'}
                </Text>
              </View>
              
              <View style={styles.cacheInfoItem}>
                <View style={styles.cacheIconContainer}>
                  <Database size={16} color="#3B82F6" />
                </View>
                <Text style={styles.cacheInfoLabel}>
                  Size
                </Text>
                <Text style={styles.cacheInfoValue}>
                  {formatCacheSize(cacheInfo.cacheSize)}
                </Text>
              </View>
              
              <View style={styles.cacheInfoItem}>
                <View style={styles.cacheIconContainer}>
                  <RefreshCw size={16} color="#F59E0B" />
                </View>
                <Text style={styles.cacheInfoLabel}>
                  Last Sync
                </Text>
                <Text style={styles.cacheInfoValue}>
                  {cacheInfo.lastSync ? formatRelativeTime(cacheInfo.lastSync) : 'Never'}
                </Text>
              </View>
              
              <View style={styles.cacheInfoItem}>
                <View style={styles.cacheIconContainer}>
                  <Zap size={16} color="#7C3AED" />
                </View>
                <Text style={styles.cacheInfoLabel}>
                  Sync Attempts
                </Text>
                <Text style={styles.cacheInfoValue}>
                  {cacheInfo.syncAttempts}
                </Text>
              </View>
              
              <View style={styles.cacheInfoItem}>
                <View style={styles.cacheIconContainer}>
                  <Star size={16} color="#10B981" />
                </View>
                <Text style={styles.cacheInfoLabel}>
                  Total Records
                </Text>
                <Text style={styles.cacheInfoValue}>
                  {cacheInfo.totalRecords?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Data Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <RefreshCw size={20} color="#F59E0B" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Data Management
              </Text>
              <Text style={styles.sectionSubtitle}>
                Control your data and synchronization
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleForceSync}
            disabled={syncStatus.isSyncing}
          >
            <View style={styles.actionButtonContent}>
              {syncStatus.isSyncing ? (
                <LoadingSpinner size={20} color="#FFFFFF" />
              ) : (
                <RefreshCw size={20} color="#FFFFFF" />
              )}
              <Text style={styles.actionButtonText}>
                {syncStatus.isSyncing ? 'Syncing...' : 'Force Sync'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearCache}
            disabled={isClearing}
          >
            <View style={styles.actionButtonContent}>
              {isClearing ? (
                <LoadingSpinner size={20} color="#FFFFFF" />
              ) : (
                <Trash2 size={20} color="#FFFFFF" />
              )}
              <Text style={styles.actionButtonText}>
                {isClearing ? 'Clearing...' : 'Clear Cache'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Star size={20} color="#7C3AED" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                About
              </Text>
              <Text style={styles.sectionSubtitle}>
                App information and version
              </Text>
            </View>
          </View>
          
          <View style={styles.appInfoContainer}>
            <Text style={styles.appName}>
              T&T Cashpot Data App
            </Text>
            <Text style={styles.appVersion}>
              Version 1.0.0
            </Text>
            <Text style={styles.appDescription}>
              Offline-first lottery results with beautiful design and automatic syncing
            </Text>
          </View>

          {/* Photo Credit */}
          <View style={styles.photoCreditContainer}>
            <Text style={styles.photoCreditTitle}>Background Photo</Text>
            <Text style={styles.photoCreditText}>
              Beautiful beach scene in Trinidad and Tobago
            </Text>
            <TouchableOpacity 
              style={styles.photoCreditButton} 
              onPress={() => handlePhotoCreditPress()}
            >
              <Text style={styles.photoCreditButtonText}>
                📸 Photo by Pranay Arora on Unsplash
              </Text>
            </TouchableOpacity>
          </View>

          {/* Developer Info */}
          <View style={styles.developerInfo}>
            <Text style={styles.developerTitle}>Developed by Surenjanath Singh</Text>
            <Text style={styles.developerSubtitle}>Mobile App Developer & Designer</Text>
            <Text style={styles.vibeCodedText}>✨ Vibe coded with Cursor & GitHub WebScraper ✨</Text>
          </View>

          {/* Social Links */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Connect & Follow</Text>
            <View style={styles.socialGrid}>
              <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('linkedin')}>
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIcon}>💼</Text>
                </View>
                <Text style={styles.socialLabel}>LinkedIn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('instagram')}>
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIcon}>📸</Text>
                </View>
                <Text style={styles.socialLabel}>Instagram</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('youtube')}>
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIcon}>📺</Text>
                </View>
                <Text style={styles.socialLabel}>YouTube</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('medium')}>
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIcon}>✍️</Text>
                </View>
                <Text style={styles.socialLabel}>Medium</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Support & Issues */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Support & Feedback</Text>
            <TouchableOpacity style={styles.githubButton} onPress={() => handleSocialPress('github')}>
              <View style={styles.githubIconContainer}>
                <Text style={styles.githubIcon}>🐙</Text>
              </View>
              <View style={styles.githubContent}>
                <Text style={styles.githubTitle}>GitHub Repository</Text>
                <Text style={styles.githubSubtitle}>Report issues, suggest features, or contribute</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.githubButtonSpacing} />
            
            <TouchableOpacity style={styles.githubButton} onPress={() => handleSocialPress('github_scraper')}>
              <View style={styles.githubIconContainer}>
                <Text style={styles.githubIcon}>🕷️</Text>
              </View>
              <View style={styles.githubContent}>
                <Text style={styles.githubTitle}>CashPot WebScraper</Text>
                <Text style={styles.githubSubtitle}>Automated data collection system</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.githubButtonSpacing} />
            
            <TouchableOpacity style={styles.contactButton} onPress={() => handleContactPress('email')}>
              <View style={styles.contactIconContainer}>
                <Text style={styles.contactIcon}>📧</Text>
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>surenjanath.singh@gmail.com</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.githubButtonSpacing} />
            
            <TouchableOpacity style={styles.contactButton} onPress={() => handleContactPress('whatsapp')}>
              <View style={styles.contactIconContainer}>
                <Text style={styles.contactIcon}>💬</Text>
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>WhatsApp Support</Text>
                <Text style={styles.contactSubtitle}>+1 (868) 263-9980</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Data Source Disclaimer */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>ℹ️</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Data Source & Disclaimer
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Important information about data sources
                </Text>
              </View>
            </View>
            
            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimerText}>
                This app is not affiliated with the National Lotteries Control Board (NLCB) or any official lottery organization. All lottery data is sourced from publicly available information.
              </Text>
              
              <TouchableOpacity style={styles.websiteButton} onPress={() => handleWebsitePress()}>
                <View style={styles.websiteIconContainer}>
                  <Text style={styles.websiteIcon}>🌐</Text>
                </View>
                <View style={styles.websiteContent}>
                  <Text style={styles.websiteTitle}>Data Source Website</Text>
                  <Text style={styles.websiteSubtitle}>nlcbplaywhelotto.com</Text>
                  <Text style={styles.websiteNote}>Click to view the source website</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.disclaimerNote}>
                <Text style={styles.disclaimerNoteText}>
                  ⚠️ Always verify results with official sources. This app is for informational purposes only.
                </Text>
              </View>
            </View>
          </View>

          {/* Donation Section */}
          <View style={styles.donationSection}>
            <Text style={styles.donationTitle}>Support Development</Text>
            <Text style={styles.donationSubtitle}>If you find this app helpful, consider supporting its development</Text>
            <View style={styles.donationGrid}>
              <TouchableOpacity style={styles.donationButton} onPress={() => handleDonationPress('fiverr')}>
                <View style={styles.donationIconContainer}>
                  <Text style={styles.donationIcon}>💼</Text>
                </View>
                <Text style={styles.donationLabel}>Fiverr</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.donationButton} onPress={() => handleDonationPress('coffee')}>
                <View style={styles.donationIconContainer}>
                  <Text style={styles.donationIcon}>☕</Text>
                </View>
                <Text style={styles.donationLabel}>Buy Coffee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Bottom spacing for tab menu */}
      <View style={styles.tabMenuSpacing} />
    </BackgroundImage>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
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
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginLeft: 44,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    marginTop: 12,
    padding: 24,
    borderRadius: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  themeOptions: {
    gap: 12,
  },
  themeOption: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  activeThemeOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.borderLight,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cacheInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cacheInfoItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 8,
  },
  cacheIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cacheInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
  },
  cacheInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  appInfoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  photoCreditContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  photoCreditTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  photoCreditText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  photoCreditButton: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  photoCreditButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  developerInfo: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  developerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  developerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  vibeCodedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  socialSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  socialButton: {
    alignItems: 'center',
    padding: 12,
    minWidth: 80,
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  socialIcon: {
    fontSize: 24,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  supportSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  githubIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  githubIcon: {
    fontSize: 24,
    color: theme.colors.surface,
  },
  githubContent: {
    flex: 1,
  },
  githubTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  githubSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  githubButtonSpacing: {
    height: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerContainer: {
    gap: 20,
  },
  disclaimerText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  websiteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  websiteIcon: {
    fontSize: 20,
  },
  websiteContent: {
    flex: 1,
  },
  websiteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  websiteSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  websiteNote: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  disclaimerNote: {
    backgroundColor: theme.colors.borderLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  disclaimerNoteText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  donationSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  donationSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  donationGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  donationButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 16,
    minWidth: 100,
  },
  donationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  donationIcon: {
    fontSize: 24,
    color: theme.colors.surface,
  },
  donationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 50,
  },
  tabMenuSpacing: {
    height: 30, // Increased to account for navigation bar at bottom: 150
  },
});
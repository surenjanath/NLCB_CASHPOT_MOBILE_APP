import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trophy, Users, Zap, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { NumberBall } from '@/components/NumberBall';
import { formatCurrency, formatNumbers, formatDate } from '@/utils/formatters';

// Wrapper component to ensure theme is available
function DetailScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Use a fallback theme to avoid context issues
  const theme = {
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      card: '#F8F9FA',
      primary: '#007AFF',
      error: '#FF3B30',
      gradient: {
        primary: ['#007AFF', '#0056CC'],
        jackpot: ['#FF9500', '#FF6B00']
      }
    }
  };
  
  // Try to get the actual theme if available, but don't crash if it's not
  let actualTheme;
  try {
    const themeContext = useTheme();
    if (themeContext?.theme) {
      actualTheme = themeContext.theme;
    }
  } catch (error) {
    console.log('Theme context not available, using fallback:', error);
  }
  
  // Use actual theme if available, otherwise use fallback
  const finalTheme = actualTheme || theme;

  // Validate and log parameters
  console.log('Detail screen params:', params);
  
  // Check if all required parameters exist
  if (!params.drawNum || !params.date || !params.numbers || !params.powerBall || !params.multiplier || !params.jackpot || !params.wins) {
    console.error('Missing required parameters:', {
      drawNum: params.drawNum,
      date: params.date,
      numbers: params.numbers,
      powerBall: params.powerBall,
      multiplier: params.multiplier,
      jackpot: params.jackpot,
      wins: params.wins,
    });
    
    // Return error state or redirect back
    return (
      <View style={[styles.container, { backgroundColor: finalTheme.colors.background }]}>
        <Text style={{ color: finalTheme.colors.error, textAlign: 'center', marginTop: 100 }}>
          Error: Missing required data. Please go back and try again.
        </Text>
      </View>
    );
  }

  const result = {
    draw_num: Number(params.drawNum),
    date: params.date as string,
    numbers: params.numbers as string,
    power_ball: Number(params.powerBall),
    multiplier: Number(params.multiplier),
    jackpot: Number(params.jackpot),
    wins: Number(params.wins),
  };

  // Validate that numbers are valid
  if (isNaN(result.draw_num) || isNaN(result.power_ball) || isNaN(result.multiplier) || isNaN(result.jackpot) || isNaN(result.wins)) {
    console.error('Invalid numeric parameters:', result);
    return (
      <View style={[styles.container, { backgroundColor: finalTheme.colors.background }]}>
        <Text style={{ color: finalTheme.colors.error, textAlign: 'center', marginTop: 100 }}>
          Error: Invalid data format. Please go back and try again.
        </Text>
      </View>
    );
  }

  const numbers = formatNumbers(result.numbers);

  return (
    <View style={[styles.container, { backgroundColor: finalTheme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={finalTheme.colors.gradient.primary}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Draw Details</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.dateContainer}>
            <Calendar size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.date}>{formatDate(result.date)}</Text>
          </View>
          <Text style={styles.drawNumber}>Draw #{result.draw_num}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Jackpot Card */}
        <View style={[styles.jackpotCard, { backgroundColor: finalTheme.colors.card }]}>
          <LinearGradient
            colors={finalTheme.colors.gradient.jackpot}
            style={styles.jackpotGradient}
          >
            <Trophy size={32} color="#FFFFFF" />
            <Text style={styles.jackpotLabel}>JACKPOT PRIZE</Text>
            <Text style={styles.jackpotAmount}>
              {formatCurrency(result.jackpot)}
            </Text>
          </LinearGradient>
        </View>

        {/* Winning Numbers */}
        <View style={[styles.section, { backgroundColor: finalTheme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: finalTheme.colors.text }]}>
            Winning Numbers
          </Text>
          <View style={styles.numbersContainer}>
            {numbers.map((num, index) => (
              <NumberBall key={index} number={num} size="large" />
            ))}
          </View>
        </View>

        {/* Power Ball */}
        <View style={[styles.section, { backgroundColor: finalTheme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: finalTheme.colors.text }]}>
            Power Ball
          </Text>
          <View style={styles.powerBallContainer}>
            <NumberBall number={result.power_ball.toString()} isPowerBall size="large" />
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: finalTheme.colors.card }]}>
            <LinearGradient
              colors={['#F59E0B', '#EAB308']}
              style={styles.statIconContainer}
            >
              <Zap size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statLabel, { color: finalTheme.colors.textSecondary }]}>
              Power Play
            </Text>
            <Text style={[styles.statValue, { color: finalTheme.colors.text }]}>
              {result.multiplier}x
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <LinearGradient
              colors={theme.colors.gradient.accent}
              style={styles.statIconContainer}
            >
              <Users size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Winners
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {result.wins.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  drawNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  jackpotCard: {
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  jackpotGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  jackpotLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  jackpotAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  section: {
    margin: 20,
    marginTop: 12,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  powerBallContainer: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  bottomSpacing: {
    height: 32,
  },
});

// Export the wrapper component
export default function DetailScreen() {
  return <DetailScreenContent />;
}
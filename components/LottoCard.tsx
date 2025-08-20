import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LottoResult } from '@/types/lotto';
import { NumberBall } from './NumberBall';
import { formatCurrency, formatNumbers, formatDate } from '@/utils/formatters';
import { Trophy, Users, Zap, Calendar, Star } from 'lucide-react-native';

interface LottoCardProps {
  result: LottoResult;
  onPress?: () => void;
}

export function LottoCard({ result, onPress }: LottoCardProps) {
  const numbers = formatNumbers(result.numbers);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={0.95}
    >
      <View style={styles.card}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.dateSection}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.date}>{formatDate(result.date)}</Text>
            </View>
            <View style={styles.drawNumberSection}>
              <Star size={14} color="#6B7280" />
              <Text style={styles.drawNumber}>#{result.draw_num}</Text>
            </View>
          </View>
        </View>

        {/* Numbers Section */}
        <View style={styles.numbersContainer}>
          <Text style={styles.sectionTitle}>
            Winning Numbers
          </Text>
          
          <View style={styles.mainNumbers}>
            {numbers.map((num, index) => (
              <NumberBall key={index} number={num} size="medium" />
            ))}
          </View>
          
          <View style={styles.powerBallSection}>
            <Text style={styles.powerBallLabel}>
              MULTIPLIER
            </Text>
            <NumberBall number={result.multiplier.toString()} isPowerBall size="medium" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  drawNumberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  drawNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  jackpotSection: {
    alignItems: 'center',
    gap: 6,
  },
  jackpotLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  jackpotAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
  },
  numbersContainer: {
    padding: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6B7280',
  },
  mainNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  powerBallSection: {
    alignItems: 'center',
    gap: 8,
  },
  powerBallLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
    backgroundColor: '#F9FAFB',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
});
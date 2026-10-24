import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

interface TraitBarProps {
  label: string;
  value: number; // 1-5
  compact?: boolean;
  showValue?: boolean;
}

export const TraitBar = memo<TraitBarProps>(
  ({ label, value, compact = false, showValue = false }) => {
    const percentage = Math.min(Math.max(value / 5, 0), 1);
    const barColor =
      percentage >= 0.7 ? Colors.traitHigh :
      percentage >= 0.4 ? Colors.traitMid :
      Colors.traitLow;

    if (compact) {
      return (
        <View style={styles.compactRow}>
          <Text style={styles.compactLabel}>{label}</Text>
          <View style={styles.compactTrack}>
            <View style={[styles.compactFill, { width: `${percentage * 100}%` as `${number}%`, backgroundColor: barColor }]} />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          {showValue && <Text style={[styles.value, { color: barColor }]}>{value}/5</Text>}
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${percentage * 100}%` as `${number}%`, backgroundColor: barColor },
            ]}
          />
        </View>
        <View style={styles.dots}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <View
              key={dot}
              style={[
                styles.dot,
                dot <= Math.round(value)
                  ? { backgroundColor: barColor }
                  : { backgroundColor: Colors.border },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }
);

TraitBar.displayName = 'TraitBar';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  value: {
    ...Typography.label,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  // Compact
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  compactLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    width: 60,
  },
  compactTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  compactFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});

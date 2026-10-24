import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SizeCategory } from '../../types';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const SIZE_CONFIG: Record<SizeCategory, { label: string; color: string; emoji: string }> = {
  small: { label: 'Small', color: Colors.small, emoji: '🐩' },
  medium: { label: 'Medium', color: Colors.medium, emoji: '🐕' },
  large: { label: 'Large', color: Colors.large, emoji: '🦮' },
  giant: { label: 'Giant', color: Colors.giant, emoji: '🐘' },
};

interface SizeBadgeProps {
  size: SizeCategory;
}

export const SizeBadge = memo<SizeBadgeProps>(({ size }) => {
  const config = SIZE_CONFIG[size];
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '33', borderColor: config.color + '66' }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
});

SizeBadge.displayName = 'SizeBadge';

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  label: {
    ...Typography.caption,
    fontWeight: '700',
  },
});

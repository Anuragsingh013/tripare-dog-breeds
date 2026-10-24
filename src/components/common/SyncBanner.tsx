import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';
import { useBreedStore } from '../../store/breedStore';

interface SyncBannerProps {
  onRetry?: () => void;
}

export const SyncBanner = memo<SyncBannerProps>(({ onRetry }) => {
  const { sync } = useBreedStore();
  const { status, error } = sync;

  if (status === 'idle' || status === 'success') return null;

  if (status === 'error') {
    return (
      <View style={styles.errorBanner}>
        <Text style={styles.errorText}>⚠️ {error ?? 'Sync failed - showing cached data'}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.syncBanner}>
      <Text style={styles.syncText}>⚡ Syncing breeds... {Math.round(sync.progress * 100)}%</Text>
    </View>
  );
});

SyncBanner.displayName = 'SyncBanner';

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderBottomWidth: 1,
    borderColor: Colors.error + '55',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    flex: 1,
  },
  retryBtn: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  retryText: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  syncBanner: {
    backgroundColor: Colors.primary + '22',
    borderBottomWidth: 1,
    borderColor: Colors.primary + '44',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  syncText: {
    ...Typography.bodySmall,
    color: Colors.primaryLight,
  },
});
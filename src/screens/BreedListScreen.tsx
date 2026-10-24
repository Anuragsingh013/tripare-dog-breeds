import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SectionList,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useBreedStore } from '../store/breedStore';
import { useBreedSearch } from '../hooks/useBreedSearch';
import { useBreedSync } from '../hooks/useBreedSync';
import { BreedCard } from '../components/breed/BreedCard';
import { SyncBanner } from '../components/common/SyncBanner';
import { FilterPanel } from '../components/breed/FilterPanel';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';
import { Breed } from '../types';
import { formatRelativeTime } from '../utils/helpers';
import { BreedsStackParamList } from '../types';

type NavProp = StackNavigationProp<BreedsStackParamList, 'BreedList'>;

export const BreedListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { getFilteredBreeds, sync, favouriteIds, toggleFavourite, filters } = useBreedStore();
  const { displaySearch, handleSearchChange, clearSearch } = useBreedSearch();
  const { performSync } = useBreedSync();
  const [showFilters, setShowFilters] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const filteredBreeds = getFilteredBreeds();
  const activeFiltersCount =
    filters.groupIds.length +
    filters.sizes.length +
    filters.coatLengths.length +
    (filters.hypoallergenic !== null ? 1 : 0) +
    [filters.minEnergy, filters.minGoodWithChildren, filters.minGoodWithDogs, filters.minGoodWithStrangers]
      .filter(Boolean).length;

  // Group by breed group
  const sections = useMemo(() => {
    const grouped: Record<string, Breed[]> = {};
    for (const b of filteredBreeds) {
      const key = b.groupName ?? 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(b);
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [filteredBreeds]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await performSync(true);
    setIsRefreshing(false);
  }, [performSync]);

  const renderBreed = useCallback(
    ({ item }: { item: Breed }) => (
      <BreedCard
        breed={item}
        isFavourite={favouriteIds.has(item.id)}
        onToggleFavourite={() => toggleFavourite(item.id)}
        onPress={() =>
          navigation.navigate('BreedDetail', {
            breedId: item.id,
            breedName: item.name,
          })
        }
      />
    ),
    [navigation, favouriteIds, toggleFavourite]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title, data } }: { section: { title: string; data: Breed[] } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{data.length}</Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🐾 Dog Breeds</Text>
          <Text style={styles.headerSub}>
            {filteredBreeds.length} of {Object.keys(useBreedStore.getState().breeds).length} breeds
            {sync.lastSyncedAt
              ? ` • Synced ${formatRelativeTime(sync.lastSyncedAt)}`
              : ''}
          </Text>
        </View>
      </View>

      {/* Sync banner */}
      <SyncBanner onRetry={() => performSync(true)} />

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={displaySearch}
            onChangeText={handleSearchChange}
            placeholder="Search by name or other names..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            accessibilityLabel="Search breeds"
            accessibilityHint="Type to filter breeds by name"
          />
          {displaySearch.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
          accessibilityLabel={`Filters, ${activeFiltersCount} active`}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Breed list - SectionList for group headers */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderBreed}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐕</Text>
            <Text style={styles.emptyTitle}>No breeds found</Text>
            <Text style={styles.emptySubtitle}>
              {sync.status === 'syncing'
                ? 'Fetching breeds...'
                : 'Try adjusting your filters or search'}
            </Text>
          </View>
        }
      />

      {/* Filter panel modal */}
      <FilterPanel visible={showFilters} onClose={() => setShowFilters(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  headerSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  clearIcon: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary + '66',
  },
  filterIcon: { fontSize: 18 },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background + 'EE',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.primary,
  },
  sectionCount: {
    ...Typography.caption,
    color: Colors.textMuted,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});
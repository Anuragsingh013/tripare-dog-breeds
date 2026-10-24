import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useBreedStore } from '../store/breedStore';
import { TraitBar } from '../components/breed/TraitBar';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';
import { formatOrigin, formatOtherNames } from '../utils/helpers';
import { BreedsStackParamList } from '../types';

type RouteType = RouteProp<BreedsStackParamList, 'BreedDetail'>;
type NavType = StackNavigationProp<BreedsStackParamList, 'BreedDetail'>;

const TABS = ['Overview', 'Traits', 'Gallery'] as const;
type Tab = typeof TABS[number];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TRAITS = [
  { key: 'energy', label: 'Energy Level' },
  { key: 'barking', label: 'Barking Tendency' },
  { key: 'drooling', label: 'Drooling Level' },
  { key: 'grooming', label: 'Grooming Needs' },
  { key: 'shedding', label: 'Shedding Level' },
  { key: 'trainability', label: 'Trainability' },
  { key: 'goodWithDogs', label: 'Good with Dogs' },
  { key: 'goodWithStrangers', label: 'Good with Strangers' },
  { key: 'goodWithChildren', label: 'Good with Children' },
  { key: 'apartmentFriendly', label: 'Apartment Friendly' },
  { key: 'exerciseMinutes', label: 'Exercise (min/day)' },
] as const;

export const BreedDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavType>();
  const route = useRoute<RouteType>();
  const { breedId } = route.params;
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const breed = useBreedStore((s) => s.breeds[breedId]);
  const { favouriteIds, toggleFavourite } = useBreedStore();
  const isFavourite = favouriteIds.has(breedId);

  if (!breed) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Breed not found</Text>
      </SafeAreaView>
    );
  }

  const heroImage = breed.images[0]?.medium ?? breed.images[0]?.large;
  const originStr = formatOrigin(breed.origin) ?? 'Unknown';
  const otherNamesStr = formatOtherNames(breed.otherNames);
  const temperamentStr = typeof breed.temperament === 'string'
    ? breed.temperament
    : (Array.isArray(breed.temperament) ? (breed.temperament as string[]).join(', ') : null);

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Description */}
      <Section title="About">
        <Text style={styles.description}>{breed.description || 'No description available.'}</Text>
      </Section>

      {/* Key stats */}
      <Section title="Quick Stats">
        <View style={styles.statsGrid}>
          <StatCard icon="🌍" label="Origin" value={originStr} />
          <StatCard icon="⌛" label="Lifespan" value={`${breed.lifeMin}-${breed.lifeMax} years`} />
          <StatCard icon="✨" label="Hypoallergenic" value={breed.hypoallergenic ? 'Yes ✓' : 'No'} />
          <StatCard icon="⚖️" label="Size" value={breed.sizeCategory.charAt(0).toUpperCase() + breed.sizeCategory.slice(1)} />
        </View>
      </Section>

      {/* Weight & Height */}
      <Section title="Weight & Height">
        <View style={styles.table}>
          <Row label="" values={['Male', 'Female']} isHeader />
          <Row
            label="Weight"
            values={[
              `${breed.maleWeightMin}-${breed.maleWeightMax} kg`,
              `${breed.femaleWeightMin}-${breed.femaleWeightMax} kg`,
            ]}
          />
          <Row
            label="Height"
            values={[
              `${breed.maleHeightMin}-${breed.maleHeightMax} cm`,
              `${breed.femaleHeightMin}-${breed.femaleHeightMax} cm`,
            ]}
          />
        </View>
      </Section>

      {/* Temperament */}
      {temperamentStr && (
        <Section title="Temperament">
          <View style={styles.tagRow}>
            {temperamentStr.split(',').map((t, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{t.trim()}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      {/* Other names */}
      {otherNamesStr && (
        <Section title="Also Known As">
          <Text style={styles.otherNames}>{otherNamesStr}</Text>
        </Section>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderTraits = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Section title="All Traits">
        {TRAITS.map(({ key, label }) => {
          const rawValue = breed[key as keyof typeof breed];
          const value = typeof rawValue === 'number' ? rawValue : 0;
          return (
            <TraitBar
              key={key}
              label={label}
              value={key === 'exerciseMinutes' ? value / 20 : value}
              showValue
            />
          );
        })}
      </Section>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderGallery = () => (
    <View style={styles.galleryContainer}>
      {breed.images.length === 0 ? (
        <View style={styles.noImages}>
          <Text style={styles.noImagesEmoji}>📷</Text>
          <Text style={styles.noImagesText}>No images available</Text>
        </View>
      ) : (
        <>
          {/* Full-size image */}
          <View style={styles.galleryMain}>
            <Image
              source={{ uri: breed.images[currentImageIndex]?.large ?? breed.images[currentImageIndex]?.medium }}
              style={styles.galleryMainImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
            />
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {breed.images.length}
              </Text>
            </View>
          </View>

          {/* Attribution */}
          {breed.images[currentImageIndex]?.author && (
            <View style={styles.attribution}>
              <Text style={styles.attributionText}>
                📷 {breed.images[currentImageIndex]?.author}
                {breed.images[currentImageIndex]?.license
                  ? ` • ${breed.images[currentImageIndex]?.license}`
                  : ''}
              </Text>
            </View>
          )}

          {/* Thumbnails */}
          <FlatList
            data={breed.images}
            horizontal
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.thumbList}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setCurrentImageIndex(index)}
                style={[styles.thumb, index === currentImageIndex && styles.thumbActive]}
              >
                <Image
                  source={{ uri: item.thumb }}
                  style={styles.thumbImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />

      {/* Hero image */}
      <View style={styles.hero}>
        {heroImage ? (
          <Image
            source={{ uri: heroImage }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 72 }}>🐕</Text>
          </View>
        )}
        {/* Dark overlay */}
        <View style={styles.heroOverlay} />

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Fav button */}
        <TouchableOpacity style={styles.heroFavBtn} onPress={() => toggleFavourite(breedId)}>
          <Text style={{ fontSize: 20 }}>{isFavourite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Name overlay */}
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>{breed.name}</Text>
          {breed.groupName && <Text style={styles.heroGroup}>{breed.groupName}</Text>}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === 'Overview' && renderOverview()}
      {activeTab === 'Traits' && renderTraits()}
      {activeTab === 'Gallery' && renderGallery()}
    </SafeAreaView>
  );
};

// Helper sub-components

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const StatCard: React.FC<{ icon: string; label: string; value: unknown }> = ({ icon, label, value }) => {
  let display = 'Unknown';
  if (value !== null && value !== undefined) {
    if (typeof value === 'object') {
      const parts = Object.values(value as Record<string, unknown>).filter(Boolean);
      display = parts.length > 0 ? parts.join(', ') : 'Unknown';
    } else {
      display = String(value);
    }
  }
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{display}</Text>
    </View>
  );
};

const Row: React.FC<{ label: string; values: string[]; isHeader?: boolean }> = ({
  label, values, isHeader
}) => (
  <View style={[styles.tableRow, isHeader && styles.tableHeaderRow]}>
    <Text style={[styles.tableCell, styles.tableLabelCell, isHeader && styles.tableHeader]}>
      {label}
    </Text>
    {values.map((v, i) => (
      <Text key={i} style={[styles.tableCell, isHeader && styles.tableHeader]}>{v}</Text>
    ))}
  </View>
);

// Styles

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { ...Typography.body, color: Colors.error, padding: Spacing.md },
  // Hero
  hero: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,15,26,0.4)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  heroFavBtn: {
    position: 'absolute',
    top: 44,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  heroName: { ...Typography.h1, color: Colors.textPrimary },
  heroGroup: { ...Typography.label, color: Colors.primaryLight, textTransform: 'uppercase' },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabLabel: { ...Typography.label, color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary },
  tabContent: { flex: 1, paddingHorizontal: Spacing.md },
  // Sections
  section: { marginTop: Spacing.lg },
  sectionTitle: { ...Typography.h4, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  description: { ...Typography.body, color: Colors.textPrimary, lineHeight: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statLabel: { ...Typography.caption, color: Colors.textMuted, marginBottom: 2 },
  statValue: { ...Typography.h4, color: Colors.textPrimary, textAlign: 'center' },
  // Table
  table: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  tableHeaderRow: { backgroundColor: Colors.surfaceElevated },
  tableCell: { flex: 1, ...Typography.body, color: Colors.textPrimary, padding: Spacing.sm },
  tableLabelCell: { color: Colors.textSecondary, fontWeight: '600' },
  tableHeader: { ...Typography.label, color: Colors.textSecondary },
  // Temperament
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: Colors.primary + '22',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  tagText: { ...Typography.caption, color: Colors.primaryLight },
  otherNames: { ...Typography.body, color: Colors.textSecondary, fontStyle: 'italic' },
  // Gallery
  galleryContainer: { flex: 1 },
  galleryMain: { flex: 1, position: 'relative' },
  galleryMainImage: { flex: 1, width: '100%' },
  imageCounter: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  imageCounterText: { ...Typography.caption, color: Colors.textPrimary },
  attribution: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  attributionText: { ...Typography.caption, color: Colors.textMuted },
  thumbList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: Colors.primary },
  thumbImage: { width: '100%', height: '100%' },
  noImages: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noImagesEmoji: { fontSize: 48, marginBottom: Spacing.md },
  noImagesText: { ...Typography.body, color: Colors.textMuted },
});
import React, { memo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBreedStore } from '../../store/breedStore';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../utils/theme';
import { SizeCategory, CoatLength } from '../../types';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
}

const SIZES: { key: SizeCategory; label: string; emoji: string }[] = [
  { key: 'small', label: 'Small', emoji: '🐕' },
  { key: 'medium', label: 'Medium', emoji: '🦮' },
  { key: 'large', label: 'Large', emoji: '🐕‍🦺' },
  { key: 'giant', label: 'Giant', emoji: '🐺' },
];

const COATS: { key: CoatLength; label: string }[] = [
  { key: 'short', label: 'Short' },
  { key: 'medium', label: 'Medium' },
  { key: 'long', label: 'Long' },
  { key: 'wire', label: 'Wire' },
];

const TRAIT_THRESHOLDS = [1, 2, 3, 4, 5];

export const FilterPanel = memo<FilterPanelProps>(({ visible, onClose }) => {
  const { filters, setFilters, resetFilters, groups } = useBreedStore();

  const toggleGroup = (id: string) => {
    const next = filters.groupIds.includes(id)
      ? filters.groupIds.filter((g) => g !== id)
      : [...filters.groupIds, id];
    setFilters({ groupIds: next });
  };

  const toggleSize = (size: SizeCategory) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    setFilters({ sizes: next });
  };

  const toggleCoat = (coat: CoatLength) => {
    const next = filters.coatLengths.includes(coat)
      ? filters.coatLengths.filter((c) => c !== coat)
      : [...filters.coatLengths, coat];
    setFilters({ coatLengths: next });
  };

  const activeCount =
    filters.groupIds.length +
    filters.sizes.length +
    filters.coatLengths.length +
    (filters.hypoallergenic !== null ? 1 : 0) +
    [filters.minEnergy, filters.minGoodWithChildren, filters.minGoodWithDogs, filters.minGoodWithStrangers]
      .filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.panel} edges={['bottom']}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters {activeCount > 0 ? `(${activeCount})` : ''}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Breed Group */}
            <Section title="Breed Group">
              <View style={styles.chipRow}>
                {groups.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.name}
                    active={filters.groupIds.includes(g.id)}
                    onPress={() => toggleGroup(g.id)}
                  />
                ))}
              </View>
            </Section>

            {/* Size */}
            <Section title="Size">
              <View style={styles.chipRow}>
                {SIZES.map((s) => (
                  <Chip
                    key={s.key}
                    label={`${s.emoji} ${s.label}`}
                    active={filters.sizes.includes(s.key)}
                    onPress={() => toggleSize(s.key)}
                  />
                ))}
              </View>
            </Section>

            {/* Coat */}
            <Section title="Coat Length">
              <View style={styles.chipRow}>
                {COATS.map((c) => (
                  <Chip
                    key={c.key}
                    label={c.label}
                    active={filters.coatLengths.includes(c.key)}
                    onPress={() => toggleCoat(c.key)}
                  />
                ))}
              </View>
            </Section>

            {/* Hypoallergenic */}
            <Section title="Hypoallergenic">
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Only hypoallergenic breeds</Text>
                <Switch
                  value={filters.hypoallergenic === true}
                  onValueChange={(v) =>
                    setFilters({ hypoallergenic: v ? true : null })
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.textPrimary}
                />
              </View>
            </Section>

            {/* Trait thresholds */}
            <Section title="Minimum Energy Level">
              <View style={styles.chipRow}>
                <Chip
                  label="Any"
                  active={filters.minEnergy === null}
                  onPress={() => setFilters({ minEnergy: null })}
                />
                {TRAIT_THRESHOLDS.map((t) => (
                  <Chip
                    key={t}
                    label={`${t}+`}
                    active={filters.minEnergy === t}
                    onPress={() => setFilters({ minEnergy: t })}
                  />
                ))}
              </View>
            </Section>

            <Section title="Good with Children (min)">
              <View style={styles.chipRow}>
                <Chip label="Any" active={filters.minGoodWithChildren === null}
                  onPress={() => setFilters({ minGoodWithChildren: null })} />
                {TRAIT_THRESHOLDS.map((t) => (
                  <Chip key={t} label={`${t}+`}
                    active={filters.minGoodWithChildren === t}
                    onPress={() => setFilters({ minGoodWithChildren: t })} />
                ))}
              </View>
            </Section>

            <Section title="Good with Dogs (min)">
              <View style={styles.chipRow}>
                <Chip label="Any" active={filters.minGoodWithDogs === null}
                  onPress={() => setFilters({ minGoodWithDogs: null })} />
                {TRAIT_THRESHOLDS.map((t) => (
                  <Chip key={t} label={`${t}+`}
                    active={filters.minGoodWithDogs === t}
                    onPress={() => setFilters({ minGoodWithDogs: t })} />
                ))}
              </View>
            </Section>

            <Section title="Good with Strangers (min)">
              <View style={styles.chipRow}>
                <Chip label="Any" active={filters.minGoodWithStrangers === null}
                  onPress={() => setFilters({ minGoodWithStrangers: null })} />
                {TRAIT_THRESHOLDS.map((t) => (
                  <Chip key={t} label={`${t}+`}
                    active={filters.minGoodWithStrangers === t}
                    onPress={() => setFilters({ minGoodWithStrangers: t })} />
                ))}
              </View>
            </Section>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
});

FilterPanel.displayName = 'FilterPanel';

// Sub-components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label, active, onPress,
}) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: Colors.border,
    ...Shadow.large,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetText: { ...Typography.label, color: Colors.textSecondary },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
  },
  closeText: { ...Typography.label, color: Colors.textPrimary },
  scroll: { paddingHorizontal: Spacing.md },
  section: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  sectionTitle: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '33',
    borderColor: Colors.primary,
  },
  chipLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  chipLabelActive: { color: Colors.primaryLight, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
});
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Breed } from '../../types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../utils/theme';
import { TraitBar } from './TraitBar';
import { SizeBadge } from './SizeBadge';

interface BreedCardProps {
  breed: Breed;
  onPress: () => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}

export const BreedCard = memo<BreedCardProps>(
  ({ breed, onPress, isFavourite, onToggleFavourite }) => {
    const thumbUrl = breed.images[0]?.thumb;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`View ${breed.name} breed details`}
      >
        {/* Thumbnail */}
        <View style={styles.imageContainer}>
          {thumbUrl ? (
            <Image
              source={{ uri: thumbUrl }}
              style={styles.image}
              contentFit="cover"
              recyclingKey={breed.id}
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>🐕</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.favButton}
            onPress={onToggleFavourite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Text style={styles.favIcon}>{isFavourite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <SizeBadge size={breed.sizeCategory} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{breed.name}</Text>
          {breed.groupName && (
            <Text style={styles.group} numberOfLines={1}>{breed.groupName}</Text>
          )}
          {breed.temperament && (
            <Text style={styles.temperament} numberOfLines={2}>
              {breed.temperament}
            </Text>
          )}

          {/* Key trait bars */}
          <View style={styles.traits}>
            <TraitBar label="Energy" value={breed.energy} compact />
            <TraitBar label="Trainable" value={breed.trainability} compact />
            <TraitBar label="With Kids" value={breed.goodWithChildren} compact />
          </View>

          {/* Life span + hypo */}
          <View style={styles.footer}>
            <Text style={styles.lifespan}>
              {breed.lifeMin}-{breed.lifeMax} yrs
            </Text>
            {breed.hypoallergenic && (
              <View style={styles.hypoBadge}>
                <Text style={styles.hypoText}>Hypo</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

BreedCard.displayName = 'BreedCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.small,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  favButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    fontSize: 16,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  group: {
    ...Typography.label,
    color: Colors.primary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  temperament: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  traits: {
    marginBottom: Spacing.sm,
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lifespan: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  hypoBadge: {
    backgroundColor: Colors.success + '33',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.success + '66',
  },
  hypoText: {
    ...Typography.caption,
    color: Colors.success,
  },
});
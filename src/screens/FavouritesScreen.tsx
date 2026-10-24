import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Image } from 'expo-image';
import { useBreedStore } from '../store/breedStore';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';
import { Breed } from '../types';
import { BreedsStackParamList } from '../types';

type NavProp = StackNavigationProp<BreedsStackParamList, 'BreedList'>;

export const FavouritesScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { breeds, favouriteIds, toggleFavourite } = useBreedStore();

  const favourites = useMemo(
    () => Object.values(breeds).filter((b) => favouriteIds.has(b.id)),
    [breeds, favouriteIds]
  );

  const renderItem = ({ item }: { item: Breed }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('BreedDetail', { breedId: item.id, breedName: item.name })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.images[0]?.thumb }}
        style={styles.thumb}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.groupName && <Text style={styles.group}>{item.groupName}</Text>}
        <Text style={styles.life}>{item.lifeMin}-{item.lifeMax} years</Text>
      </View>
      <TouchableOpacity onPress={() => toggleFavourite(item.id)} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={{ fontSize: 20 }}>❤️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>❤️ Favourites</Text>
        <Text style={styles.count}>{favourites.length} breeds saved</Text>
      </View>
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💔</Text>
            <Text style={styles.emptyTitle}>No favourites yet</Text>
            <Text style={styles.emptySubtitle}>Tap the heart icon on any breed to save it here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  title: { ...Typography.h1, color: Colors.textPrimary },
  count: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  list: { padding: Spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumb: { width: 72, height: 72 },
  info: { flex: 1, padding: Spacing.md },
  name: { ...Typography.h4, color: Colors.textPrimary },
  group: { ...Typography.caption, color: Colors.primary, marginTop: 2 },
  life: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  favBtn: { padding: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});
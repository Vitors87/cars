import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, ActivityIndicator, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCars } from '@/hooks/useCars'
import { CarCard } from '@/components/CarCard'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'
import type { CarType } from '@autodex/shared'
import { CAR_TYPE_LABEL } from '@autodex/shared'

const TYPES: CarType[] = ['SEDAN', 'HATCHBACK', 'SUV', 'PICKUP', 'COUPE', 'SUPERCAR', 'ELECTRIC', 'CLASSIC']

export default function ExploreScreen() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<CarType | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { cars, loading, loadingMore, hasMore, loadMore, refresh } = useCars({
    q: debouncedSearch || undefined,
    type: activeType ?? undefined,
  })

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text)
    clearTimeout((handleSearchChange as unknown as { timer?: ReturnType<typeof setTimeout> }).timer)
    ;(handleSearchChange as unknown as { timer?: ReturnType<typeof setTimeout> }).timer = setTimeout(() => setDebouncedSearch(text), 400)
  }, [])

  const handleTypeFilter = (type: CarType) => {
    setActiveType((prev) => (prev === type ? null : type))
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>AutoDex</Text>
        <Text style={styles.tagline}>Pokédex de autos</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar marca, modelo..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => { setSearch(''); setDebouncedSearch('') }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filters}
      >
        {TYPES.map((type) => (
          <Pressable
            key={type}
            style={[styles.filterChip, activeType === type && styles.filterChipActive]}
            onPress={() => handleTypeFilter(type)}
          >
            <Text style={[styles.filterLabel, activeType === type && styles.filterLabelActive]}>
              {CAR_TYPE_LABEL[type]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <CarCard car={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          onRefresh={refresh}
          refreshing={false}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No se encontraron autos</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  logo: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  tagline: { color: Colors.textMuted, fontSize: FontSize.sm },
  searchRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  filters: { maxHeight: 44, marginBottom: Spacing.sm },
  filtersContent: { paddingHorizontal: Spacing.md, gap: Spacing.xs },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  filterLabelActive: { color: Colors.text },
  grid: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
})

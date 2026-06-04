import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/mockAuth'
import { Ionicons } from '@expo/vector-icons'
import { interactionsApi } from '@/lib/api'
import { useEffect } from 'react'
import type { Interaction, InteractionType } from '@autodex/shared'
import { INTERACTION_EMOJI, INTERACTION_LABEL } from '@autodex/shared'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const TABS: { type: InteractionType | 'ALL'; label: string }[] = [
  { type: 'ALL', label: 'Todos' },
  { type: 'OWNED', label: '🔑 Tuve' },
  { type: 'DROVE', label: '🏎️ Manejé' },
  { type: 'RODE', label: '🚗 Subí' },
  { type: 'SAW', label: '👁️ Vi' },
  { type: 'WANT', label: '❤️ Quiero' },
]

export default function CollectionScreen() {
  const { isSignedIn, getToken } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<InteractionType | 'ALL'>('ALL')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return }
    ;(async () => {
      setLoading(true)
      try {
        const token = await getToken()
        if (!token) return
        const res = await interactionsApi.list(
          { type: activeTab === 'ALL' ? undefined : activeTab },
          token
        )
        setInteractions(res.data)
      } finally {
        setLoading(false)
      }
    })()
  }, [activeTab, isSignedIn])

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Inicia sesión para ver tu colección</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Colección</Text>
        <Text style={styles.count}>{interactions.length} autos</Text>
      </View>

      {/* Tabs */}
      <FlatList
        horizontal
        data={TABS}
        keyExtractor={(t) => t.type}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabs}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tab, activeTab === item.type && styles.tabActive]}
            onPress={() => setActiveTab(item.type)}
          >
            <Text style={[styles.tabLabel, activeTab === item.type && styles.tabLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={interactions}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <CollectionItem item={item} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyTitle}>Aún no tienes autos aquí</Text>
              <Text style={styles.emptySubtitle}>Explora el catálogo y registra tus experiencias</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

function CollectionItem({ item }: { item: Interaction }) {
  const router = useRouter()
  const version = item.version
  const brand = version?.model?.brand
  const image = version?.images?.[0]

  return (
    <Pressable
      style={styles.item}
      onPress={() => router.push(`/car/${item.versionId}`)}
    >
      <View style={styles.itemImage}>
        {image ? (
          <Image source={{ uri: image.thumbUrl }} style={styles.itemImg} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>🚗</Text>
        )}
      </View>
      <View style={styles.itemInfo}>
        {brand && <Text style={styles.itemBrand}>{brand.name}</Text>}
        <Text style={styles.itemModel}>{version?.model?.name} {version?.year}</Text>
        <Text style={styles.itemVersion} numberOfLines={1}>{version?.name}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemType}>
            {INTERACTION_EMOJI[item.type]} {INTERACTION_LABEL[item.type]}
          </Text>
          {item.verified && (
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={11} color={Colors.success} />
              <Text style={styles.verifiedText}>Verificado</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.itemPoints}>
        <Text style={styles.itemPts}>+{item.points}</Text>
        <Text style={styles.itemPtsLabel}>pts</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  count: { color: Colors.textMuted, fontSize: FontSize.sm },
  tabs: { maxHeight: 44, marginBottom: Spacing.sm },
  tabsContent: { paddingHorizontal: Spacing.md, gap: Spacing.xs },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  tabLabelActive: { color: Colors.text, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  item: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: Spacing.sm },
  itemImage: { width: 72, height: 56, borderRadius: Radius.md, backgroundColor: Colors.surfaceHigh, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  itemImg: { width: 72, height: 56 },
  itemInfo: { flex: 1 },
  itemBrand: { color: Colors.textMuted, fontSize: FontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemModel: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  itemVersion: { color: Colors.textSecondary, fontSize: FontSize.xs },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 4 },
  itemType: { color: Colors.textSecondary, fontSize: FontSize.xs },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.success + '20', borderRadius: Radius.full, paddingHorizontal: Spacing.xs, paddingVertical: 2 },
  verifiedText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  itemPoints: { alignItems: 'center' },
  itemPts: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  itemPtsLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, textAlign: 'center' },
  emptySubtitle: { color: Colors.textMuted, fontSize: FontSize.md, textAlign: 'center' },
  loginBtn: { marginTop: Spacing.md, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  loginBtnText: { color: Colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.md },
})

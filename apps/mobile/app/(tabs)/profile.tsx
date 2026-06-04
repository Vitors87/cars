import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useAuth } from '@/lib/mockAuth'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useProfile } from '@/hooks/useProfile'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

export default function ProfileScreen() {
  const { isSignedIn, signOut } = useAuth()
  const router = useRouter()
  const { profile, loading } = useProfile()

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Tu perfil AutoDex</Text>
          <Text style={styles.emptySubtitle}>Inicia sesión para llevar tu colección y competir en rankings</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  const stats = profile.stats

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>{profile.displayName[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{profile.displayName}</Text>
            {profile.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>⭐ Premium</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        {/* Points */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsNumber}>{profile.totalPoints.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>puntos totales</Text>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatItem label="Interacciones" value={stats.totalInteractions} icon="flash" />
            <StatItem label="Autos únicos" value={stats.uniqueCars} icon="car-sport" />
            <StatItem label="Marcas" value={stats.uniqueBrands} icon="globe" />
            <StatItem label="Verificados" value={stats.verifiedCount} icon="checkmark-circle" />
          </View>
        )}

        {/* Achievements */}
        {(profile as unknown as { achievements?: { key: string; name: string; description: string; unlockedAt: string }[] }).achievements?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logros</Text>
            <View style={styles.achievementList}>
              {(profile as unknown as { achievements: { key: string; name: string; description: string }[] }).achievements.slice(0, 6).map((ach) => (
                <View key={ach.key} style={styles.achievementItem}>
                  <Text style={styles.achievementIcon}>🏆</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.achievementName}>{ach.name}</Text>
                    <Text style={styles.achievementDesc} numberOfLines={1}>{ach.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!profile.isPremium && (
            <Pressable style={styles.premiumBtn}>
              <Ionicons name="star" size={18} color="#0F0F0F" />
              <Text style={styles.premiumBtnText}>Actualizar a Premium</Text>
            </Pressable>
          )}
          <Pressable style={styles.signOutBtn} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.signOutText}>Cerrar sesión</Text>
          </Pressable>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function StatItem({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon as never} size={20} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { color: Colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
  emptySubtitle: { color: Colors.textMuted, fontSize: FontSize.md, textAlign: 'center' },
  loginBtn: { marginTop: Spacing.md, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  loginBtnText: { color: Colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  profileHeader: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.md, gap: Spacing.xs },
  avatar: { width: 88, height: 88, borderRadius: Radius.full, marginBottom: Spacing.sm },
  avatarFallback: { backgroundColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  displayName: { color: Colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  premiumBadge: { backgroundColor: Colors.warning + '30', borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  premiumText: { color: Colors.warning, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  username: { color: Colors.textMuted, fontSize: FontSize.md },
  bio: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
  pointsCard: { alignItems: 'center', marginHorizontal: Spacing.md, marginBottom: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: Spacing.lg },
  pointsNumber: { color: Colors.text, fontSize: FontSize.hero, fontWeight: FontWeight.black },
  pointsLabel: { color: Colors.text + 'CC', fontSize: FontSize.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
  statItem: { flex: 1, minWidth: '45%', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  statValue: { color: Colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center' },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  achievementList: { paddingHorizontal: Spacing.md, gap: Spacing.xs },
  achievementItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  achievementIcon: { fontSize: 24 },
  achievementName: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  achievementDesc: { color: Colors.textMuted, fontSize: FontSize.xs },
  actions: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  premiumBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.warning, borderRadius: Radius.lg, paddingVertical: Spacing.md },
  premiumBtnText: { color: '#0F0F0F', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  signOutText: { color: Colors.error, fontWeight: FontWeight.medium, fontSize: FontSize.md },
})

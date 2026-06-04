import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useRanking } from '@/hooks/useProfile'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'
import type { RankingEntry } from '@autodex/shared'

const MEDALS = ['🥇', '🥈', '🥉']

export default function RankingScreen() {
  const { ranking, myRank, loading } = useRanking('global')

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking</Text>
        {myRank && <Text style={styles.myRank}>Tu posición: #{myRank}</Text>}
      </View>

      {/* Top 3 podium */}
      {ranking.length >= 3 && (
        <View style={styles.podium}>
          {[ranking[1], ranking[0], ranking[2]].map((entry, i) => (
            entry && <PodiumItem key={entry.user.id} entry={entry} podiumPos={i} />
          ))}
        </View>
      )}

      <FlatList
        data={ranking.slice(3)}
        keyExtractor={(item) => item.user.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RankRow entry={item} isMe={item.rank === myRank} />}
      />
    </SafeAreaView>
  )
}

function PodiumItem({ entry, podiumPos }: { entry: RankingEntry; podiumPos: number }) {
  const heights = [90, 110, 75]
  const orders = [1, 0, 2]
  const rank = entry.rank

  return (
    <View style={[styles.podiumItem, { order: orders[podiumPos] as never }]}>
      <Text style={styles.podiumMedal}>{MEDALS[rank - 1]}</Text>
      {entry.user.avatarUrl ? (
        <Image source={{ uri: entry.user.avatarUrl }} style={styles.podiumAvatar} contentFit="cover" />
      ) : (
        <View style={[styles.podiumAvatar, styles.avatarFallback]}>
          <Text style={styles.avatarLetter}>{entry.user.displayName[0]?.toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.podiumName} numberOfLines={1}>{entry.user.displayName}</Text>
      <Text style={styles.podiumPts}>{entry.totalPoints.toLocaleString()}</Text>
      <View style={[styles.podiumBar, { height: heights[podiumPos] }]} />
    </View>
  )
}

function RankRow({ entry, isMe }: { entry: RankingEntry; isMe: boolean }) {
  return (
    <View style={[styles.rankRow, isMe && styles.rankRowMe]}>
      <Text style={styles.rankNum}>#{entry.rank}</Text>
      {entry.user.avatarUrl ? (
        <Image source={{ uri: entry.user.avatarUrl }} style={styles.rowAvatar} contentFit="cover" />
      ) : (
        <View style={[styles.rowAvatar, styles.avatarFallback]}>
          <Text style={styles.avatarLetterSm}>{entry.user.displayName[0]?.toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.rankInfo}>
        <Text style={[styles.rankName, isMe && styles.rankNameMe]}>{entry.user.displayName}</Text>
        <Text style={styles.rankSub}>{entry.totalInteractions} interacciones</Text>
      </View>
      <Text style={styles.rankPts}>{entry.totalPoints.toLocaleString()} pts</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  myRank: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  podiumItem: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  podiumMedal: { fontSize: 24 },
  podiumAvatar: { width: 52, height: 52, borderRadius: Radius.full, backgroundColor: Colors.surfaceHigh },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceHigh },
  avatarLetter: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  avatarLetterSm: { color: Colors.text, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  podiumName: { color: Colors.text, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  podiumPts: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  podiumBar: { width: '100%', backgroundColor: Colors.surface, borderTopLeftRadius: Radius.sm, borderTopRightRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  list: { paddingHorizontal: Spacing.md, gap: Spacing.xs, paddingBottom: Spacing.xxl },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  rankRowMe: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  rankNum: { color: Colors.textMuted, fontSize: FontSize.md, fontWeight: FontWeight.bold, width: 32, textAlign: 'center' },
  rowAvatar: { width: 40, height: 40, borderRadius: Radius.full },
  rankInfo: { flex: 1 },
  rankName: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  rankNameMe: { color: Colors.primary },
  rankSub: { color: Colors.textMuted, fontSize: FontSize.xs },
  rankPts: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.bold },
})

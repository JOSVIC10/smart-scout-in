// ============================================================================
// Smart Scout In — Supabase API layer for Players
// ============================================================================
import { supabase } from './supabaseClient'
import type {
  Player,
  PlayerWithClub,
  Club,
  EnrichedMetric,
  Rating,
  SimilarPlayer,
  PlayerFilters,
} from '@/types/players'
import { RADAR_METRIC_ORDER as ORDER } from '@/types/players'

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function uploadFile(bucket: string, file: File, path: string): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  return getPublicUrl(bucket, path)
}

// ---------------------------------------------------------------------------
// Clubs
// ---------------------------------------------------------------------------
export async function getClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Club[]
}

export async function createClub(name: string, country: string, badgeFile?: File): Promise<Club> {
  let badge_url: string | null = null
  if (badgeFile) {
    const path = `badges/${Date.now()}_${badgeFile.name.replace(/\s/g, '_')}`
    badge_url = await uploadFile('club-badges', badgeFile, path)
  }
  const { data, error } = await supabase
    .from('clubs')
    .insert({ name, country, badge_url })
    .select()
    .single()
  if (error) throw error
  return data as Club
}

// ---------------------------------------------------------------------------
// Players — List
// ---------------------------------------------------------------------------
export async function getPlayers(filters?: Partial<PlayerFilters>): Promise<PlayerWithClub[]> {
  let query = supabase
    .from('players')
    .select(`
      *,
      club:clubs(*)
    `)
    .order('overall_rating', { ascending: false })

  if (filters?.search) {
    const s = filters.search.trim()
    query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%`)
  }
  if (filters?.position) {
    query = query.eq('position', filters.position)
  }
  if (filters?.clubId) {
    query = query.eq('club_id', filters.clubId)
  }
  if (filters?.nationality) {
    query = query.ilike('nationality', `%${filters.nationality}%`)
  }
  if (filters?.foot) {
    query = query.eq('preferred_foot', filters.foot)
  }

  const { data, error } = await query
  if (error) throw error
  return data as PlayerWithClub[]
}

// ---------------------------------------------------------------------------
// Players — Detail
// ---------------------------------------------------------------------------
export async function getPlayerById(id: string): Promise<PlayerWithClub | null> {
  const { data, error } = await supabase
    .from('players')
    .select(`*, club:clubs(*)`)
    .eq('id', id)
    .single()
  if (error) return null
  return data as PlayerWithClub
}

// ---------------------------------------------------------------------------
// Player Metrics
// ---------------------------------------------------------------------------
export async function getPlayerMetrics(playerId: string): Promise<EnrichedMetric[]> {
  const { data, error } = await supabase
    .from('player_metrics')
    .select(`
      value,
      percentile,
      metric:metrics(code, label, "group")
    `)
    .eq('player_id', playerId)

  if (error) throw error

  const raw = data as unknown as Array<{
    value: number
    percentile: number | null
    metric: { code: string; label: string; group: string } | { code: string; label: string; group: string }[] | null
  }>

  const enriched: EnrichedMetric[] = raw
    .filter((r) => r.metric !== null && r.metric !== undefined)
    .map((r) => {
      const m = Array.isArray(r.metric) ? r.metric[0] : r.metric!
      return {
        code: m.code,
        label: m.label,
        group: m.group as EnrichedMetric['group'],
        value: r.value,
        percentile: r.percentile ?? 0,
      }
    })

  // Sort by RADAR_METRIC_ORDER
  return enriched.sort((a, b) => {
    const ai = ORDER.indexOf(a.code)
    const bi = ORDER.indexOf(b.code)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

// ---------------------------------------------------------------------------
// Similar players
// ---------------------------------------------------------------------------
export async function getSimilarPlayers(
  playerId: string,
  metrics: EnrichedMetric[],
  limit = 3
): Promise<SimilarPlayer[]> {
  // Get all other players with their metrics
  const { data: allMetrics, error } = await supabase
    .from('player_metrics')
    .select(`
      player_id,
      value,
      percentile,
      metric:metrics(code)
    `)
    .neq('player_id', playerId)

  if (error || !allMetrics) return []

  // Build map: playerId → { code → percentile }
  const playerMap = new Map<string, Map<string, number>>()
  for (const m of allMetrics as unknown as Array<{
    player_id: string
    percentile: number | null
    metric: { code: string } | { code: string }[] | null
  }>) {
    if (!m.metric) continue
    const metricObj = Array.isArray(m.metric) ? m.metric[0] : m.metric
    if (!metricObj?.code) continue
    if (!playerMap.has(m.player_id)) playerMap.set(m.player_id, new Map())
    playerMap.get(m.player_id)!.set(metricObj.code, m.percentile ?? 0)
  }

  // Base vector
  const baseVector = new Map(metrics.map((m) => [m.code, m.percentile]))

  // Compute Euclidean distance
  const scores: Array<{ playerId: string; similarity: number }> = []
  for (const [pid, vec] of Array.from(playerMap.entries())) {
    let sumSq = 0
    let count = 0
    for (const [code, p] of Array.from(baseVector.entries())) {
      const q = vec.get(code) ?? 0
      sumSq += (p - q) ** 2
      count++
    }
    const dist = count > 0 ? Math.sqrt(sumSq / count) : 99
    const similarity = Math.round(Math.max(0, 100 - dist))
    scores.push({ playerId: pid, similarity })
  }

  scores.sort((a, b) => b.similarity - a.similarity)
  const top = scores.slice(0, limit)

  // Fetch player details
  const ids = top.map((s) => s.playerId)
  const { data: players } = await supabase
    .from('players')
    .select('*, club:clubs(*)')
    .in('id', ids)

  if (!players) return []

  return top.map((s) => ({
    player: (players as PlayerWithClub[]).find((p) => p.id === s.playerId)!,
    similarity: s.similarity,
  })).filter((r) => r.player !== undefined)
}

// ---------------------------------------------------------------------------
// Scout Rating
// ---------------------------------------------------------------------------
export async function getPlayerRating(playerId: string): Promise<Rating | null> {
  const { data } = await supabase
    .from('ratings')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as Rating | null
}

export async function upsertRating(
  playerId: string,
  score: number,
  notes: string
): Promise<Rating> {
  // Check if exists
  const existing = await getPlayerRating(playerId)
  if (existing) {
    const { data, error } = await supabase
      .from('ratings')
      .update({ score, scout_notes: notes })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as Rating
  }
  const { data, error } = await supabase
    .from('ratings')
    .insert({ player_id: playerId, score, scout_notes: notes })
    .select()
    .single()
  if (error) throw error
  return data as Rating
}

// ---------------------------------------------------------------------------
// Create player (with photo upload)
// ---------------------------------------------------------------------------
export async function createPlayer(
  playerData: Omit<Player, 'id' | 'created_at' | 'updated_at' | 'photo_url'>,
  photoFile?: File | null
): Promise<Player> {
  let photo_url: string | null = null
  if (photoFile) {
    const path = `photos/${Date.now()}_${photoFile.name.replace(/\s/g, '_')}`
    photo_url = await uploadFile('player-photos', photoFile, path)
  }
  const { data, error } = await supabase
    .from('players')
    .insert({ ...playerData, photo_url })
    .select()
    .single()
  if (error) throw error
  return data as Player
}

// ============================================================================
// Smart Scout In — TypeScript types (aligned to Supabase schema)
// ============================================================================

export type PreferredFoot = 'left' | 'right' | 'both'

export type Position = 
  | 'GK' 
  | 'CB' 
  | 'FB' 
  | 'RB' 
  | 'LB'
  | 'DM' 
  | 'CM' 
  | 'BBM'
  | 'AM' 
  | 'W' 
  | 'RW'
  | 'LW'
  | 'SS'
  | 'CF'
  | 'ST'

export type MetricGroup = 'offensive' | 'defensive' | 'possession'

// ---------------------------------------------------------------------------
// Club
// ---------------------------------------------------------------------------
export interface Club {
  id: string
  name: string
  country: string
  badge_url: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------
export interface Player {
  id: string
  first_name: string
  last_name: string
  nationality: string
  birth_date: string | null
  preferred_foot: PreferredFoot
  position: Position
  shirt_number: number | null
  club_id: string | null
  photo_url: string | null
  minutes_played: number
  league: string | null
  overall_rating: number | null
  created_at: string
  updated_at: string
}

// Player joined with club data
export interface PlayerWithClub extends Player {
  club: Club | null
}

// ---------------------------------------------------------------------------
// Metric
// ---------------------------------------------------------------------------
export interface Metric {
  id: string
  code: string
  label: string
  group: MetricGroup
}

// ---------------------------------------------------------------------------
// PlayerMetric
// ---------------------------------------------------------------------------
export interface PlayerMetric {
  id: string
  player_id: string
  metric_id: string
  value: number
  percentile: number | null
  metric?: Metric
}

// Enriched metric for display
export interface EnrichedMetric {
  code: string
  label: string
  group: MetricGroup
  value: number
  percentile: number
}

// ---------------------------------------------------------------------------
// Rating (Scout)
// ---------------------------------------------------------------------------
export interface Rating {
  id: string
  player_id: string
  scout_notes: string | null
  score: number
  created_at: string
}

// ---------------------------------------------------------------------------
// Radar data shape for Recharts
// ---------------------------------------------------------------------------
export interface RadarDataPoint {
  metric: string
  label: string
  percentile: number
  fullMark: 99
}

// ---------------------------------------------------------------------------
// Similar player result
// ---------------------------------------------------------------------------
export interface SimilarPlayer {
  player: PlayerWithClub
  similarity: number // 0-100 %
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
export interface PlayerFilters {
  search: string
  position: Position | ''
  clubId: string
  nationality: string
  foot: PreferredFoot | ''
}

// ---------------------------------------------------------------------------
// Form data for adding a player
// ---------------------------------------------------------------------------
export interface AddPlayerFormData {
  first_name: string
  last_name: string
  nationality: string
  birth_date: string
  preferred_foot: PreferredFoot
  position: Position
  shirt_number: string
  club_id: string
  new_club_name: string
  new_club_country: string
  minutes_played: string
  league: string
  overall_rating: string
  photo_file: File | null
  badge_file: File | null
}

// ---------------------------------------------------------------------------
// Utility: compute age from birth date
// ---------------------------------------------------------------------------
export function computeAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const today = new Date()
  const dob = new Date(birthDate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

// ---------------------------------------------------------------------------
// Utility: percentile color
// ---------------------------------------------------------------------------
export function percentileColor(p: number): string {
  if (p >= 80) return '#22c55e'  // green-500
  if (p >= 60) return '#84cc16'  // lime-500
  if (p >= 40) return '#eab308'  // yellow-500
  if (p >= 20) return '#f97316'  // orange-500
  return '#ef4444'               // red-500
}

// ---------------------------------------------------------------------------
// Utility: percentile background class (Tailwind)
// ---------------------------------------------------------------------------
export function percentileBgClass(p: number): string {
  if (p >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (p >= 60) return 'bg-lime-500/20 text-lime-400 border-lime-500/30'
  if (p >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  if (p >= 20) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  return 'bg-red-500/20 text-red-400 border-red-500/30'
}

// ---------------------------------------------------------------------------
// Position display labels
// ---------------------------------------------------------------------------
export const POSITION_LABELS: Record<Position, string> = {
  GK: 'Portero',
  CB: 'Central',
  FB: 'Lateral',
  DM: 'M. Defensivo',
  CM: 'M. Central',
  AM: 'M. Ofensivo',
  W: 'Extremo',
  ST: 'Delantero',
}

export const FOOT_LABELS: Record<PreferredFoot, string> = {
  left: 'Zurdo',
  right: 'Diestro',
  both: 'Ambidiestro',
}

// ---------------------------------------------------------------------------
// Metric groups for radar ordering
// ---------------------------------------------------------------------------
export const RADAR_METRIC_ORDER = [
  'build_play',
  'link_up_play',
  'progression_play',
  'open_play_creation',
  'set_play_creation',
  'threat',
  'open_play_finishing',
  'set_play_finishing',
  'finishing_crosses',
  'defending_oppo_half',
  'open_play_defending',
  'defending_own_half',
  'defending_box',
]

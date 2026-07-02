// Global TypeScript types for Smart Scout In

export interface Player {
  id: string
  name: string
  position: string
  team: string
  age: number
  nationality: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface PlayerStats {
  player_id: string
  season: string
  matches: number
  goals: number
  assists: number
  minutes_played: number
  pass_accuracy: number
  shots_on_target: number
  dribbles_completed: number
  tackles_won: number
  aerial_duels_won: number
}

export interface VideoAnalysis {
  id: string
  player_id: string
  title: string
  video_url: string
  thumbnail_url?: string
  duration: number
  tags: string[]
  notes?: string
  created_at: string
}

export interface GameModel {
  id: string
  name: string
  formation: string
  description?: string
  tactical_data: Record<string, unknown>
  created_at: string
}

export interface ScoutingReport {
  id: string
  player_id: string
  scout_id: string
  rating: number
  strengths: string[]
  weaknesses: string[]
  notes: string
  recommended: boolean
  created_at: string
}

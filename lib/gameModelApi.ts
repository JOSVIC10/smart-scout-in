import { supabase } from './supabaseClient'
import type { Position } from '@/types/players'

export interface GameModel {
  id: string
  name: string
  description: string
  formation: string
  created_at: string
}

export interface TacticalSlot {
  id: string // "CB-1", "ST-1"
  position: Position | string // Required base position e.g., "CB"
  x: number // 0-100 percentage (left to right)
  y: number // 0-100 percentage (top to bottom, where top is opponent's goal)
  playerId?: string | null
}

export interface TemplateData {
  slots: TacticalSlot[]
  // Additional tactical instructions can go here
}

export interface Template {
  id: string
  name: string
  game_model_id: string | null
  formation: string
  data: TemplateData
  created_at: string
  updated_at: string
}

export async function getGameModels(): Promise<GameModel[]> {
  const { data, error } = await supabase
    .from('game_models')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as GameModel[]
}

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data as Template[]
}

export async function createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select()
    .single()
    
  if (error) throw error
  return data as Template
}

export async function updateTemplate(id: string, updates: Partial<Omit<Template, 'id' | 'created_at' | 'updated_at'>>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  return data as Template
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    
  if (error) throw error
}

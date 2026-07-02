'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Upload, User, Shield, Plus, Loader2 } from 'lucide-react'
import type { AddPlayerFormData, Position, PreferredFoot } from '@/types/players'
import { POSITION_LABELS, FOOT_LABELS } from '@/types/players'
import { createPlayer, createClub, getClubs } from '@/lib/playersApi'
import type { Club } from '@/types/players'

const POSITIONS = Object.keys(POSITION_LABELS) as Position[]
const FEET = Object.keys(FOOT_LABELS) as PreferredFoot[]

const EMPTY_FORM: AddPlayerFormData = {
  first_name: '',
  last_name: '',
  nationality: '',
  birth_date: '',
  preferred_foot: 'right',
  position: 'CM',
  shirt_number: '',
  club_id: '',
  new_club_name: '',
  new_club_country: '',
  minutes_played: '',
  league: '',
  overall_rating: '',
  photo_file: null,
  badge_file: null,
}

function ImageUpload({
  id,
  label,
  icon: Icon,
  file,
  onChange,
}: {
  id: string
  label: string
  icon: React.ElementType
  file: File | null
  onChange: (f: File | null) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div
      id={`${id}-drop`}
      onClick={() => ref.current?.click()}
      className="relative h-28 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/40 hover:bg-slate-900/60 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 overflow-hidden"
    >
      {preview ? (
        <>
          <Image src={preview} alt="preview" fill className="object-cover opacity-70" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center z-10"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </>
      ) : (
        <>
          <Icon className="w-7 h-7 text-slate-500" />
          <span className="text-xs text-slate-400 font-medium">{label}</span>
          <span className="text-[10px] text-slate-600">PNG / JPG / WEBP</span>
        </>
      )}
      <input
        ref={ref}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

interface AddPlayerModalProps {
  clubs: Club[]
  onClose: () => void
  onCreated: () => void
}

export function AddPlayerModal({ clubs, onClose, onCreated }: AddPlayerModalProps) {
  const [form, setForm] = useState<AddPlayerFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewClub, setIsNewClub] = useState(false)

  const set = (key: keyof AddPlayerFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let club_id: string | null = form.club_id || null

      // Create new club if needed
      if (isNewClub && form.new_club_name) {
        const club = await createClub(
          form.new_club_name,
          form.new_club_country || 'Unknown',
          form.badge_file ?? undefined
        )
        club_id = club.id
      }

      await createPlayer(
        {
          first_name: form.first_name,
          last_name: form.last_name,
          nationality: form.nationality,
          birth_date: form.birth_date || null,
          preferred_foot: form.preferred_foot,
          position: form.position,
          shirt_number: form.shirt_number ? parseInt(form.shirt_number) : null,
          club_id,
          minutes_played: parseInt(form.minutes_played) || 0,
          league: form.league || null,
          overall_rating: form.overall_rating ? parseFloat(form.overall_rating) : null,
        },
        form.photo_file ?? undefined
      )

      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el jugador')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full bg-slate-900/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500/60 transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-slate-700/60 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur rounded-t-2xl">
          <div>
            <h2 className="text-slate-100 font-bold text-xl">Añadir jugador</h2>
            <p className="text-slate-400 text-sm mt-0.5">Completa la ficha del nuevo jugador</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Fotos
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Foto del jugador</p>
                <ImageUpload
                  id="player-photo-upload"
                  label="Subir foto"
                  icon={User}
                  file={form.photo_file}
                  onChange={(f) => set('photo_file', f)}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Escudo del club</p>
                <ImageUpload
                  id="club-badge-upload"
                  label="Subir escudo"
                  icon={Shield}
                  file={form.badge_file}
                  onChange={(f) => set('badge_file', f)}
                />
              </div>
            </div>
          </div>

          {/* Personal data */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Datos personales
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-first-name" className="block text-xs text-slate-500 mb-1">Nombre *</label>
                <input
                  id="input-first-name"
                  required
                  placeholder="Ej: Pedri"
                  value={form.first_name}
                  onChange={(e) => set('first_name', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="input-last-name" className="block text-xs text-slate-500 mb-1">Apellidos *</label>
                <input
                  id="input-last-name"
                  required
                  placeholder="Ej: González"
                  value={form.last_name}
                  onChange={(e) => set('last_name', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="input-nationality" className="block text-xs text-slate-500 mb-1">Nacionalidad *</label>
                <input
                  id="input-nationality"
                  required
                  placeholder="Ej: Spain"
                  value={form.nationality}
                  onChange={(e) => set('nationality', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="input-birth-date" className="block text-xs text-slate-500 mb-1">Fecha de nacimiento</label>
                <input
                  id="input-birth-date"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => set('birth_date', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Sporting data */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Datos deportivos
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="input-position" className="block text-xs text-slate-500 mb-1">Posición *</label>
                <select
                  id="input-position"
                  required
                  value={form.position}
                  onChange={(e) => set('position', e.target.value as Position)}
                  className={inputCls}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p} — {POSITION_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="input-foot" className="block text-xs text-slate-500 mb-1">Pie hábil</label>
                <select
                  id="input-foot"
                  value={form.preferred_foot}
                  onChange={(e) => set('preferred_foot', e.target.value as PreferredFoot)}
                  className={inputCls}
                >
                  {FEET.map((f) => (
                    <option key={f} value={f}>{FOOT_LABELS[f]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="input-shirt" className="block text-xs text-slate-500 mb-1">Dorsal</label>
                <input
                  id="input-shirt"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="Ej: 10"
                  value={form.shirt_number}
                  onChange={(e) => set('shirt_number', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="input-minutes" className="block text-xs text-slate-500 mb-1">Minutos jugados</label>
                <input
                  id="input-minutes"
                  type="number"
                  min="0"
                  placeholder="Ej: 2340"
                  value={form.minutes_played}
                  onChange={(e) => set('minutes_played', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="input-league" className="block text-xs text-slate-500 mb-1">Liga</label>
                <input
                  id="input-league"
                  placeholder="Ej: La Liga"
                  value={form.league}
                  onChange={(e) => set('league', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="input-overall" className="block text-xs text-slate-500 mb-1">Overall (0-100)</label>
                <input
                  id="input-overall"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Ej: 88.5"
                  value={form.overall_rating}
                  onChange={(e) => set('overall_rating', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Club */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Club
              </label>
              <button
                type="button"
                onClick={() => setIsNewClub(!isNewClub)}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" />
                {isNewClub ? 'Usar club existente' : 'Nuevo club'}
              </button>
            </div>

            {isNewClub ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-new-club" className="block text-xs text-slate-500 mb-1">Nombre del club</label>
                  <input
                    id="input-new-club"
                    placeholder="Ej: Real Madrid"
                    value={form.new_club_name}
                    onChange={(e) => set('new_club_name', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="input-new-club-country" className="block text-xs text-slate-500 mb-1">País del club</label>
                  <input
                    id="input-new-club-country"
                    placeholder="Ej: Spain"
                    value={form.new_club_country}
                    onChange={(e) => set('new_club_country', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="input-club-id" className="block text-xs text-slate-500 mb-1">Seleccionar club</label>
                <select
                  id="input-club-id"
                  value={form.club_id}
                  onChange={(e) => set('club_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Sin club</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800/60 transition-all"
            >
              Cancelar
            </button>
            <button
              id="submit-add-player"
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar jugador'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

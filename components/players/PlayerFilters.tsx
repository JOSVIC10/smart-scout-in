'use client'

import React, { useState, useCallback } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import type { PlayerFilters, Position, PreferredFoot } from '@/types/players'
import { POSITION_LABELS, FOOT_LABELS } from '@/types/players'
import type { Club } from '@/types/players'

const POSITIONS = Object.keys(POSITION_LABELS) as Position[]
const FEET = Object.keys(FOOT_LABELS) as PreferredFoot[]

const NATIONALITIES = [
  'Spain', 'England', 'Germany', 'France', 'Italy', 'Turkey',
  'Portugal', 'Brazil', 'Argentina', 'Netherlands', 'Belgium',
  'Croatia', 'Uruguay', 'Colombia',
]

interface PlayerFiltersProps {
  filters: PlayerFilters
  clubs: Club[]
  onChange: (filters: PlayerFilters) => void
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  id,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  id: string
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-slate-900/60 border border-slate-700/60 text-slate-200 text-sm rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:border-emerald-500/60 focus:bg-slate-900 transition-all cursor-pointer hover:border-slate-600"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

export function PlayerFilters({ filters, clubs, onChange }: PlayerFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debounceRef = React.useRef<NodeJS.Timeout>()

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChange({ ...filters, search: value })
      }, 300)
    },
    [filters, onChange]
  )

  const hasActiveFilters =
    filters.search || filters.position || filters.clubId || filters.nationality || filters.foot

  const clearAll = () => {
    setLocalSearch('')
    onChange({ search: '', position: '', clubId: '', nationality: '', foot: '' })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="player-search"
            type="text"
            placeholder="Buscar jugador..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/60 focus:bg-slate-900 transition-all"
          />
          {localSearch && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Posición */}
        <FilterSelect
          id="filter-position"
          label="Posición"
          value={filters.position}
          onChange={(v) => onChange({ ...filters, position: v as Position | '' })}
          options={POSITIONS.map((p) => ({ value: p, label: `${p} · ${POSITION_LABELS[p]}` }))}
        />

        {/* Club */}
        <FilterSelect
          id="filter-club"
          label="Club"
          value={filters.clubId}
          onChange={(v) => onChange({ ...filters, clubId: v })}
          options={clubs.map((c) => ({ value: c.id, label: c.name }))}
        />

        {/* Nacionalidad */}
        <FilterSelect
          id="filter-nationality"
          label="Nacionalidad"
          value={filters.nationality}
          onChange={(v) => onChange({ ...filters, nationality: v })}
          options={NATIONALITIES.map((n) => ({ value: n, label: n }))}
        />

        {/* Pie */}
        <FilterSelect
          id="filter-foot"
          label="Pie hábil"
          value={filters.foot}
          onChange={(v) => onChange({ ...filters, foot: v as PreferredFoot | '' })}
          options={FEET.map((f) => ({ value: f, label: FOOT_LABELS[f] }))}
        />

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}

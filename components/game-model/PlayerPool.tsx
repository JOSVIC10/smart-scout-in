'use client'

import React, { useState } from 'react'
import type { PlayerWithClub } from '@/types/players'
import { SelectablePlayer } from './DraggablePlayer'
import { ChevronUp, ChevronDown, Search, RefreshCw, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FORMATIONS } from '@/lib/formations'

interface PlayerPoolProps {
  players: PlayerWithClub[]
  assignedPlayerIds: Set<string>
  onClear: () => void
  formation: string
  onFormationChange: (fmt: string) => void
  onPlayerSelect: (player: PlayerWithClub) => void
  selectedSlotPosition: string | null
  
  // Filter Props
  minAge: number | ''
  setMinAge: (val: number | '') => void
  maxAge: number | ''
  setMaxAge: (val: number | '') => void
  selectedLeague: string
  setSelectedLeague: (val: string) => void
  leagues: string[]
}

export function PlayerPool({ 
  players, assignedPlayerIds, onClear, formation, onFormationChange, onPlayerSelect, selectedSlotPosition,
  minAge, setMinAge, maxAge, setMaxAge, selectedLeague, setSelectedLeague, leagues
}: PlayerPoolProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredPlayers = players.filter(p => 
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  )
  // Sort players: matching positions first
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (!selectedSlotPosition) return 0
    const aMatch = a.position === selectedSlotPosition
    const bMatch = b.position === selectedSlotPosition
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })

  const PoolContent = () => (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Plantilla
            </h2>
            <button 
              onClick={onClear}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors flex items-center gap-1"
              title="Limpiar campo"
            >
              <RefreshCw className="w-3 h-3" /> Limpiar
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`p-1.5 rounded transition-colors ${showFilters || minAge || maxAge || selectedLeague ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Filter className="w-4 h-4" />
            </button>
            <select 
              className="h-7 w-20 rounded border border-slate-700 bg-slate-800 px-1 text-xs text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              value={formation}
              onChange={(e) => onFormationChange(e.target.value)}
            >
              {Object.keys(FORMATIONS).map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-slate-900 border border-slate-700 rounded-md p-3 space-y-3 text-xs shadow-inner">
            <div>
              <label className="text-slate-400 mb-1 block">Liga</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                value={selectedLeague}
                onChange={e => setSelectedLeague(e.target.value)}
              >
                <option value="">Todas</option>
                {leagues.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-slate-400 mb-1 block">Edad Min.</label>
                <Input 
                  type="number" 
                  className="h-7 text-xs bg-slate-950 border-slate-800" 
                  value={minAge} 
                  onChange={e => setMinAge(e.target.value ? parseInt(e.target.value) : '')} 
                  placeholder="Ej: 18"
                />
              </div>
              <div className="flex-1">
                <label className="text-slate-400 mb-1 block">Edad Max.</label>
                <Input 
                  type="number" 
                  className="h-7 text-xs bg-slate-950 border-slate-800" 
                  value={maxAge} 
                  onChange={e => setMaxAge(e.target.value ? parseInt(e.target.value) : '')} 
                  placeholder="Ej: 25"
                />
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar jugador..." 
            className="pl-8 h-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500 text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1 space-y-2 pb-24 lg:pb-4">
        {sortedPlayers.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-10">
            No hay jugadores disponibles.
          </div>
        ) : (
          sortedPlayers.map(p => (
            <SelectablePlayer 
              key={p.id} 
              player={p} 
              isAssigned={assignedPlayerIds.has(p.id)} 
              onClick={() => onPlayerSelect(p)}
              highlight={selectedSlotPosition ? p.position === selectedSlotPosition : false}
            />
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block w-80 bg-[#111827] h-full flex-shrink-0 shadow-2xl relative z-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <PoolContent />
      </div>

      {/* Mobile Drawer View */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-2xl transition-transform duration-300 z-40 ${
        isOpenMobile ? 'translate-y-0 h-[70vh]' : 'translate-y-[calc(100%-3.5rem)]'
      }`}>
        <button 
          className="w-full flex items-center justify-center p-4 border-b bg-muted/30"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
        >
          <div className="flex items-center gap-2 font-bold">
            Plantilla ({players.length})
            {isOpenMobile ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </button>
        <div className="h-[calc(70vh-3.5rem)] overflow-hidden">
          <PoolContent />
        </div>
      </div>
      
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}
    </>
  )
}

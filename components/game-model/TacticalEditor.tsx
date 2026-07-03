'use client'

import React, { useState } from 'react'
import type { PlayerWithClub } from '@/types/players'
import type { GameModel, TacticalSlot } from '@/lib/gameModelApi'
import { FORMATIONS, relocatePlayers } from '@/lib/formations'
import { PitchBoard } from './PitchBoard'
import { PlayerPool } from './PlayerPool'
import { Save, Wand2, X, RefreshCw, User } from 'lucide-react'
import { computeAge } from '@/types/players'
import { getPublicUrl } from '@/lib/playersApi'

interface TacticalEditorProps {
  players: PlayerWithClub[]
  gameModels: GameModel[]
  initialFormation?: string
  initialSlots?: TacticalSlot[]
  onSaveTemplate?: (formation: string, slots: TacticalSlot[], gameModelId: string | null) => void
}

export function TacticalEditor({ 
  players, 
  gameModels, 
  initialFormation = '4-3-3',
  initialSlots,
  onSaveTemplate 
}: TacticalEditorProps) {
  const [formation, setFormation] = useState<string>(initialFormation)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(gameModels[0]?.id || null)
  const [playerModal, setPlayerModal] = useState<{player: PlayerWithClub, slotId: string} | null>(null)
  
  // Filters
  const [minAge, setMinAge] = useState<number | ''>('')
  const [maxAge, setMaxAge] = useState<number | ''>('')
  const [selectedLeague, setSelectedLeague] = useState<string>('')

  const leagues = Array.from(new Set(players.map(p => p.league).filter(Boolean))) as string[]

  const computedFilteredPlayers = players.filter(p => {
    if (selectedLeague && p.league !== selectedLeague) return false
    
    if (minAge !== '' || maxAge !== '') {
      if (!p.birth_date) return false
      const dob = new Date(p.birth_date)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
      
      if (minAge !== '' && age < minAge) return false
      if (maxAge !== '' && age > maxAge) return false
    }

    return true
  })

  // Initialize slots
  const [slots, setSlots] = useState<TacticalSlot[]>(() => {
    if (initialSlots && initialSlots.length > 0) return initialSlots
    return JSON.parse(JSON.stringify(FORMATIONS[initialFormation]))
  })

  // Selected slot for click-to-assign
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  // Handle Formation Change
  const handleFormationChange = (newFormation: string) => {
    setFormation(newFormation)
    const newSlots = relocatePlayers(slots, newFormation)
    setSlots(newSlots)
    setSelectedSlotId(null)
  }

  // Handle Game Model Change
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId)
    const model = gameModels.find(m => m.id === modelId)
    if (model && model.formation) {
      handleFormationChange(model.formation)
    }
  }

  const handleClear = () => {
    if (confirm("¿Estás seguro de que deseas limpiar todo el campo?")) {
      setSlots(prev => prev.map(s => ({ ...s, playerId: null })))
      setSelectedSlotId(null)
    }
  }

  const handleSlotClick = (slotId: string) => {
    // Toggle selection
    setSelectedSlotId(prev => prev === slotId ? null : slotId)
  }

  const handlePlayerClick = (player: PlayerWithClub, slotId: string) => {
    setPlayerModal({ player, slotId })
  }

  const isPositionCompatible = (playerPos: string, slotPos: string) => {
    if (slotPos === 'GK' && playerPos !== 'GK') return false
    if (playerPos === 'GK' && slotPos !== 'GK') return false

    const mapping: Record<string, string[]> = {
      'GK': ['GK'],
      'CB': ['CB', 'DM'],
      'FB': ['FB', 'RB', 'LB', 'CB', 'W', 'RW', 'LW'],
      'DM': ['DM', 'CM', 'BBM', 'CB'],
      'CM': ['CM', 'BBM', 'DM', 'AM'],
      'AM': ['AM', 'CM', 'W', 'RW', 'LW', 'SS'],
      'W':  ['W', 'RW', 'LW', 'AM', 'SS', 'ST', 'CF'],
      'ST': ['ST', 'CF', 'SS', 'W', 'RW', 'LW']
    }
    return mapping[slotPos]?.includes(playerPos) || false
  }

  const handlePlayerSelect = (player: PlayerWithClub) => {
    if (!selectedSlotId) return // No slot selected to assign to

    const targetSlot = slots.find(s => s.id === selectedSlotId)
    if (!targetSlot) return

    if (!isPositionCompatible(player.position, targetSlot.position)) {
      alert(`Un jugador de posición ${player.position} no puede jugar como ${targetSlot.position}.`)
      return
    }

    setSlots(prev => prev.map(slot => {
      // Assign to selected slot
      if (slot.id === selectedSlotId) {
        return { ...slot, playerId: player.id }
      }
      // If the player was already in another slot, clear that old slot
      if (slot.playerId === player.id) {
        return { ...slot, playerId: null }
      }
      return slot
    }))
    
    // Auto-deselect after assigning
    setSelectedSlotId(null)
  }

  const handleRemovePlayer = (slotId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, playerId: null } : s))
  }

  const handleAutoBest11 = async () => {
    // Make a copy of current slots and available players
    let currentSlots = [...slots]
    const assignedIds = new Set(currentSlots.map(s => s.playerId).filter(Boolean) as string[])
    
    // To make it simple: iterate over empty slots
    let emptySlots = currentSlots.filter(s => !s.playerId)

    if (emptySlots.length === 0) {
      if (!confirm("El campo ya está lleno. ¿Deseas rehacer toda la alineación con este modelo de juego?")) {
        return
      }
      // Clear all
      currentSlots = currentSlots.map(s => ({ ...s, playerId: null }))
      assignedIds.clear()
      emptySlots = currentSlots
    }

    const modelName = gameModels.find(m => m.id === selectedModelId)?.name || ''
    const { getTacticalAffinity } = await import('@/lib/tacticalLogic')

    // Sort FILTERED players by tactical affinity + overall rating
    const sortedPlayers = [...computedFilteredPlayers].sort((a, b) => {
      const aRating = a.overall_rating || 50
      const bRating = b.overall_rating || 50
      const aAffinity = getTacticalAffinity(a.id, modelName)
      const bAffinity = getTacticalAffinity(b.id, modelName)
      
      const aScore = aRating * 0.4 + aAffinity * 0.6
      const bScore = bRating * 0.4 + bAffinity * 0.6
      return bScore - aScore
    })

    for (const slot of emptySlots) {
      const neededPosition = slot.position // e.g. "CB", "ST"
      
      // Find the best unassigned player that plays this position naturally
      let bestFit = sortedPlayers.find(p => !assignedIds.has(p.id) && p.position === neededPosition)
      
      if (!bestFit) {
        // Fallback: Find the best unassigned player that is AT LEAST compatible
        bestFit = sortedPlayers.find(p => !assignedIds.has(p.id) && isPositionCompatible(p.position, neededPosition))
      }

      if (!bestFit) {
        // Super Fallback: Si no hay nadie compatible (ej. solo tienes porteros en la BD), mete al mejor disponible aunque no pegue ni con cola
        bestFit = sortedPlayers.find(p => !assignedIds.has(p.id))
      }

      if (bestFit) {
        assignedIds.add(bestFit.id)
        currentSlots = currentSlots.map(s => s.id === slot.id ? { ...s, playerId: bestFit!.id } : s)
      }
    }

    setSlots(currentSlots)
  }

  const handleSave = async () => {
    if (onSaveTemplate) {
      onSaveTemplate(formation, slots, selectedModelId)
      return
    }
    
    try {
      const templateName = prompt("Nombre de la plantilla:", "Nueva Plantilla")
      if (!templateName) return
      
      const { createTemplate } = await import('@/lib/gameModelApi')
      await createTemplate({
        name: templateName,
        game_model_id: selectedModelId,
        formation: formation,
        data: { slots }
      })
      alert("Plantilla guardada correctamente.")
    } catch (err) {
      console.error(err)
      alert("Error al guardar la plantilla.")
    }
  }

  const assignedPlayerIds = new Set(slots.map(s => s.playerId).filter(Boolean) as string[])
  const selectedSlot = slots.find(s => s.id === selectedSlotId)

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      
      {/* Simple Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-slate-800 gap-4 bg-[#111827] z-10 shadow-sm relative">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Modelo de Juego</label>
            <select 
              className="flex h-9 w-full sm:w-48 items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={selectedModelId || ''}
              onChange={(e) => handleModelChange(e.target.value)}
            >
              {gameModels.map(gm => (
                <option key={gm.id} value={gm.id}>{gm.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleAutoBest11}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-all bg-indigo-500/10 border border-indigo-500/50 text-indigo-400 shadow-sm hover:bg-indigo-500 hover:text-white h-9 px-4 py-2"
          >
            <Wand2 className="w-4 h-4" /> Autocompletar 11
          </button>
        </div>
        
        <button 
          onClick={handleSave}
          className="w-full sm:w-auto mt-5 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-all bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/40 h-9 px-6 py-2"
        >
          <Save className="w-4 h-4" /> Guardar Plantilla
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Pitch */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
          <PitchBoard 
            slots={slots} 
            players={players} 
            selectedSlotId={selectedSlotId}
            onSlotClick={handleSlotClick}
            onRemovePlayer={handleRemovePlayer} 
            onPlayerClick={handlePlayerClick}
          />
        </div>

        {/* Player Pool (Selección de jugadores por posición) */}
        <PlayerPool 
          players={computedFilteredPlayers} 
          assignedPlayerIds={assignedPlayerIds} 
          onClear={handleClear}
          formation={formation}
          onFormationChange={handleFormationChange}
          onPlayerSelect={handlePlayerSelect}
          selectedSlotPosition={selectedSlot ? selectedSlot.position : null}
          minAge={minAge}
          setMinAge={setMinAge}
          maxAge={maxAge}
          setMaxAge={setMaxAge}
          selectedLeague={selectedLeague}
          setSelectedLeague={setSelectedLeague}
          leagues={leagues}
        />
      </div>

      {/* Mini Player Profile Modal */}
      {playerModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPlayerModal(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors z-10" onClick={() => setPlayerModal(null)}>
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 text-center space-y-4">
               {/* Player Info */}
               <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center shadow-inner relative">
                 {playerModal.player.photo_url ? (
                   /* eslint-disable-next-line @next/next/no-img-element */
                   <img src={playerModal.player.photo_url.startsWith('http') ? playerModal.player.photo_url : getPublicUrl('player-photos', playerModal.player.photo_url)} alt={playerModal.player.last_name} className="object-cover w-full h-full" />
                 ) : (
                   <User className="w-10 h-10 text-slate-500" />
                 )}
                 <div className="absolute bottom-0 bg-slate-900/80 backdrop-blur-sm w-full text-[10px] font-bold py-0.5 border-t border-slate-700">
                   #{playerModal.player.shirt_number || '-'}
                 </div>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-100">{playerModal.player.first_name} {playerModal.player.last_name}</h3>
                 <p className="text-sm text-slate-400 mt-1">{playerModal.player.club?.name || 'Sin Equipo'} • {playerModal.player.position} • {computeAge(playerModal.player.birth_date)} años</p>
               </div>
               
               {/* Stats */}
               <div className="flex justify-center gap-6 py-4 border-y border-slate-800/50 bg-slate-950/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-400">{playerModal.player.overall_rating || '-'}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Valoración</p>
                  </div>
                  <div className="w-px bg-slate-800"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-400">{playerModal.player.minutes_played || 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Minutos</p>
                  </div>
               </div>

               {/* Actions */}
               <button 
                 className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
                 onClick={() => {
                   setSelectedSlotId(playerModal.slotId)
                   setPlayerModal(null)
                 }}
               >
                 <RefreshCw className="w-4 h-4" />
                 Sustituir Jugador
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

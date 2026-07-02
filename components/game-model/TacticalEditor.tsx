'use client'

import React, { useState } from 'react'
import type { PlayerWithClub } from '@/types/players'
import type { GameModel, TacticalSlot } from '@/lib/gameModelApi'
import { FORMATIONS, relocatePlayers } from '@/lib/formations'
import { PitchBoard } from './PitchBoard'
import { PlayerPool } from './PlayerPool'
import { Save, Wand2 } from 'lucide-react'

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

  const handleAutoBest11 = () => {
    // Make a copy of current slots and available players
    let currentSlots = [...slots]
    const assignedIds = new Set(currentSlots.map(s => s.playerId).filter(Boolean) as string[])
    
    // To make it simple: iterate over empty slots
    const emptySlots = currentSlots.filter(s => !s.playerId)

    // Sort players by overall_rating descending
    const sortedPlayers = [...players].sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))

    for (const slot of emptySlots) {
      const neededPosition = slot.position // e.g. "CB", "ST"
      
      // Find the best unassigned player that plays this position naturally
      let bestFit = sortedPlayers.find(p => !assignedIds.has(p.id) && p.position === neededPosition)
      
      if (!bestFit) {
        // Fallback: Find the best unassigned player that is AT LEAST compatible
        bestFit = sortedPlayers.find(p => !assignedIds.has(p.id) && isPositionCompatible(p.position, neededPosition))
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Pitch */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
          <PitchBoard 
            slots={slots} 
            players={players} 
            selectedSlotId={selectedSlotId}
            onSlotClick={handleSlotClick}
            onRemovePlayer={handleRemovePlayer} 
          />
        </div>

        {/* Player Pool (Selección de jugadores por posición) */}
        <PlayerPool 
          players={players} 
          assignedPlayerIds={assignedPlayerIds} 
          onClear={handleClear}
          formation={formation}
          onFormationChange={handleFormationChange}
          onPlayerSelect={handlePlayerSelect}
          selectedSlotPosition={selectedSlot ? selectedSlot.position : null}
        />
      </div>
    </div>
  )
}

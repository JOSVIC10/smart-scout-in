'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { PlayerWithClub } from '@/types/players'
import type { GameModel, TacticalSlot } from '@/lib/gameModelApi'
import { FORMATIONS, relocatePlayers } from '@/lib/formations'
import { PitchBoard } from './PitchBoard'
import { PlayerPool } from './PlayerPool'
import { DraggablePlayer } from './DraggablePlayer'

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

  const [activePlayer, setActivePlayer] = useState<PlayerWithClub | null>(null)

  // Configure Dnd sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 } // 5px movement before dragging starts
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 } // 250ms press before drag on touch
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle Formation Change
  const handleFormationChange = (newFormation: string) => {
    setFormation(newFormation)
    const newSlots = relocatePlayers(slots, newFormation)
    setSlots(newSlots)
  }

  // Handle Game Model Change
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId)
    const model = gameModels.find(m => m.id === modelId)
    if (model && model.formation) {
      handleFormationChange(model.formation)
    }
  }

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const player = active.data.current?.player as PlayerWithClub
    if (player) {
      setActivePlayer(player)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActivePlayer(null)

    if (!over) return // Dropped outside

    const player = active.data.current?.player as PlayerWithClub
    const slotId = over.id as string

    if (!player) return

    setSlots(prev => prev.map(slot => {
      // If we are dropping into a slot
      if (slot.id === slotId) {
        // Find if this player was already in another slot and remove it from there
        const oldSlot = prev.find(s => s.playerId === player.id)
        if (oldSlot && oldSlot.id !== slotId) {
          // Handled below by mapping all slots
        }
        return { ...slot, playerId: player.id }
      }
      
      // If this slot previously had the player we are moving, clear it
      if (slot.playerId === player.id && slot.id !== slotId) {
        return { ...slot, playerId: null }
      }
      
      return slot
    }))
  }

  const handleRemovePlayer = (slotId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, playerId: null } : s))
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

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full bg-background">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border gap-4 bg-card z-10 relative">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Modelo de Juego</label>
              <select 
                className="flex h-9 w-full sm:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedModelId || ''}
                onChange={(e) => handleModelChange(e.target.value)}
              >
                {gameModels.map(gm => (
                  <option key={gm.id} value={gm.id}>{gm.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Formación</label>
              <select 
                className="flex h-9 w-full sm:w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formation}
                onChange={(e) => handleFormationChange(e.target.value)}
              >
                {Object.keys(FORMATIONS).map(fmt => (
                  <option key={fmt} value={fmt}>{fmt}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Guardar Plantilla
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Pitch */}
          <div className="flex-1 p-2 sm:p-4 overflow-auto">
            <PitchBoard 
              slots={slots} 
              players={players} 
              onRemovePlayer={handleRemovePlayer} 
            />
          </div>

          {/* Player Pool */}
          <PlayerPool players={players} assignedPlayerIds={assignedPlayerIds} />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } })
      }}>
        {activePlayer ? <DraggablePlayer player={activePlayer} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

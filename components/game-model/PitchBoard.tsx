import React from 'react'
import { SoccerPitch } from '../players/SoccerPitch'
import { DroppableSlot } from './DroppableSlot'
import type { TacticalSlot } from '@/lib/gameModelApi'
import type { PlayerWithClub } from '@/types/players'

interface PitchBoardProps {
  slots: TacticalSlot[]
  players: PlayerWithClub[]
  selectedSlotId: string | null
  onSlotClick: (slotId: string) => void
  onRemovePlayer: (slotId: string) => void
}

export function PitchBoard({ slots, players, selectedSlotId, onSlotClick, onRemovePlayer }: PitchBoardProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* We constrain the height to 100% of the parent, and let aspect-ratio determine the width */}
      <div className="relative h-full aspect-[68/105] bg-[#166534] rounded-lg border-2 border-slate-700 shadow-2xl overflow-hidden">
        <SoccerPitch orientation="vertical">
          {slots.map(slot => {
            const assignedPlayer = slot.playerId ? players.find(p => p.id === slot.playerId) : null
            return (
              <DroppableSlot 
                key={slot.id} 
                slot={slot} 
                player={assignedPlayer} 
                isSelected={slot.id === selectedSlotId}
                onClick={onSlotClick}
                onRemovePlayer={onRemovePlayer} 
              />
            )
          })}
        </SoccerPitch>
      </div>
    </div>
  )
}

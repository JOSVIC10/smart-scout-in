import React from 'react'
import { SoccerPitch } from '../players/SoccerPitch'
import { DroppableSlot } from './DroppableSlot'
import type { TacticalSlot } from '@/lib/gameModelApi'
import type { PlayerWithClub } from '@/types/players'

interface PitchBoardProps {
  slots: TacticalSlot[]
  players: PlayerWithClub[]
  onRemovePlayer: (slotId: string) => void
}

export function PitchBoard({ slots, players, onRemovePlayer }: PitchBoardProps) {
  // We use orientation vertical for mobile and horizontal for desktop via CSS/Tailwind if possible, 
  // but the SoccerPitch component accepts an orientation prop.
  // Actually, standard tactic boards usually are vertical. Let's use vertical.
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 p-4 rounded-xl border border-border shadow-inner">
      <div className="w-full max-w-2xl relative">
        {/* We fix orientation to vertical as it looks better for formations */}
        <SoccerPitch orientation="vertical">
          {slots.map(slot => {
            const assignedPlayer = slot.playerId ? players.find(p => p.id === slot.playerId) : null
            return (
              <DroppableSlot 
                key={slot.id} 
                slot={slot} 
                player={assignedPlayer} 
                onRemovePlayer={onRemovePlayer} 
              />
            )
          })}
        </SoccerPitch>
      </div>
    </div>
  )
}

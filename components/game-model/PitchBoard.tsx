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
  onPlayerClick?: (player: PlayerWithClub, slotId: string) => void
}

export function PitchBoard({ slots, players, selectedSlotId, onSlotClick, onRemovePlayer, onPlayerClick }: PitchBoardProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      {/* We constrain width/height based on device to keep the pitch fully visible */}
      <div className="relative w-full max-w-[450px] aspect-[68/105] md:w-auto md:max-w-none md:h-full bg-[#166534] rounded-lg border-2 border-slate-700 shadow-2xl overflow-hidden">
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
                onPlayerClick={onPlayerClick}
              />
            )
          })}
        </SoccerPitch>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 rounded-md p-2 flex items-center gap-2 pointer-events-none z-20">
          <div className="bg-amber-500 rounded-full p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          </div>
          <span className="text-[10px] font-medium text-slate-300">Fuera de posición natural</span>
        </div>
      </div>
    </div>
  )
}

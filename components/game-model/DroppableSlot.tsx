'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { PlayerWithClub } from '@/types/players'
import type { TacticalSlot } from '@/lib/gameModelApi'
import { getPublicUrl } from '@/lib/playersApi'
import { AlertTriangle, X } from 'lucide-react'

interface DroppableSlotProps {
  slot: TacticalSlot
  player?: PlayerWithClub | null
  onRemovePlayer?: (slotId: string) => void
}

export function DroppableSlot({ slot, player, onRemovePlayer }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: slot.id,
    data: { slot }
  })

  // Basic check: is the player playing out of position?
  const isOutOfPosition = player && player.position !== slot.position

  const photoUrl = player?.photo_url 
    ? getPublicUrl('player-photos', player.photo_url) 
    : '/placeholder-player.png'

  return (
    <div
      ref={setNodeRef}
      className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
        isOver ? 'scale-110' : ''
      }`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: '4rem', height: '5rem' }}
    >
      {player ? (
        <div className="relative group flex flex-col items-center cursor-pointer">
          <div className="relative w-10 h-10 rounded-full border-2 border-white bg-card shadow-md overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt={player.last_name} className="object-cover w-full h-full" />
          </div>
          
          <div className="mt-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded leading-tight whitespace-nowrap text-center">
            <span className="font-bold">{player.shirt_number}</span> {player.last_name}
          </div>

          {isOutOfPosition && (
            <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5" title="Posición no natural">
              <AlertTriangle className="w-3 h-3" />
            </div>
          )}

          {onRemovePlayer && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemovePlayer(slot.id); }}
              className="absolute -top-1 -left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center shadow-sm backdrop-blur-sm ${
          isOver ? 'border-primary bg-primary/20 text-primary-foreground' : 'border-white/50 bg-black/20 text-white/80'
        }`}>
          <span className="text-xs font-bold">{slot.position}</span>
        </div>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { PlayerWithClub } from '@/types/players'
import { getPublicUrl } from '@/lib/playersApi'

interface DraggablePlayerProps {
  player: PlayerWithClub
  isOverlay?: boolean
}

export function DraggablePlayer({ player, isOverlay = false }: DraggablePlayerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { player }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  }

  const photoUrl = player.photo_url 
    ? getPublicUrl('player-photos', player.photo_url) 
    : '/placeholder-player.png'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative flex items-center gap-3 p-2 bg-card rounded-md border border-border cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors ${
        isOverlay ? 'shadow-xl ring-2 ring-primary' : 'shadow-sm'
      }`}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={player.last_name} className="object-cover w-full h-full" />
      </div>
      <div className="flex flex-col flex-grow min-w-0">
        <span className="text-sm font-bold truncate">
          {player.first_name.charAt(0)}. {player.last_name}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{player.position}</span>
          {player.shirt_number && <span>#{player.shirt_number}</span>}
        </div>
      </div>
    </div>
  )
}

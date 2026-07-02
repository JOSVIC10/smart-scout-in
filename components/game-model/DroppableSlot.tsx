import React from 'react'
import type { PlayerWithClub } from '@/types/players'
import type { TacticalSlot } from '@/lib/gameModelApi'
import { getPublicUrl } from '@/lib/playersApi'
import { AlertTriangle, X, User } from 'lucide-react'

interface DroppableSlotProps {
  slot: TacticalSlot
  player?: PlayerWithClub | null
  isSelected?: boolean
  onClick?: (slotId: string) => void
  onRemovePlayer?: (slotId: string) => void
}

export function PitchPlayer({ player, slotId, onRemovePlayer }: { player: PlayerWithClub, slotId: string, onRemovePlayer?: (id: string) => void }) {
  const isOutOfPosition = player.position !== slotId.split('-')[0] // rough check

  let photoUrl = ''
  if (player?.photo_url) {
    photoUrl = player.photo_url.startsWith('http') 
      ? player.photo_url 
      : getPublicUrl('player-photos', player.photo_url)
  }

  return (
    <div className="relative group flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
      <div className="relative w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center">
        {photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photoUrl} alt={player.last_name} className="object-cover w-full h-full pointer-events-none" />
        ) : (
          <User className="w-5 h-5 text-slate-400 pointer-events-none" />
        )}
      </div>
      
      <div className="mt-1 bg-slate-950/80 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded leading-tight whitespace-nowrap text-center pointer-events-none border border-slate-700/50">
        <span className="font-bold">{player.shirt_number}</span> {player.last_name}
      </div>

      {isOutOfPosition && (
        <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 pointer-events-none shadow-sm" title="Posición no natural">
          <AlertTriangle className="w-3 h-3" />
        </div>
      )}

      {onRemovePlayer && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemovePlayer(slotId); }}
          className="absolute -top-2 -left-2 bg-slate-900/90 text-slate-300 hover:bg-destructive hover:text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-all border border-slate-700 shadow-lg z-50 cursor-pointer"
          title="Eliminar del campo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// We kept the name "DroppableSlot" so imports don't break, but it's now just a selectable slot
export function DroppableSlot({ slot, player, isSelected, onClick, onRemovePlayer }: DroppableSlotProps) {
  return (
    <button
      onClick={() => onClick && onClick(slot.id)}
      className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 hover:scale-110 cursor-pointer outline-none`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: '5rem', height: '6rem' }}
    >
      <div className={`relative flex items-center justify-center w-full h-full rounded-full ${isSelected ? 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-[#166534] bg-emerald-500/20' : ''}`}>
        {player ? (
          <PitchPlayer player={player} slotId={slot.id} onRemovePlayer={onRemovePlayer} />
        ) : (
          <div className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors ${
            isSelected ? 'border-emerald-400 bg-emerald-500/30 text-emerald-300' : 'border-white/50 bg-black/20 text-white/80 hover:border-white hover:bg-black/40'
          }`}>
            <span className="text-xs font-bold pointer-events-none">{slot.position}</span>
          </div>
        )}
      </div>
    </button>
  )
}

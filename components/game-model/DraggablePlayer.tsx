import React from 'react'
import type { PlayerWithClub } from '@/types/players'
import { getPublicUrl } from '@/lib/playersApi'
import { User } from 'lucide-react'

interface SelectablePlayerProps {
  player: PlayerWithClub
  isAssigned?: boolean
  onClick?: () => void
  highlight?: boolean
}

export function SelectablePlayer({ player, isAssigned = false, onClick, highlight = false }: SelectablePlayerProps) {
  let photoUrl = ''
  if (player?.photo_url) {
    photoUrl = player.photo_url.startsWith('http') 
      ? player.photo_url 
      : getPublicUrl('player-photos', player.photo_url)
  }

  return (
    <button 
      onClick={!isAssigned ? onClick : undefined}
      disabled={isAssigned}
      className={`w-full relative flex items-center gap-3 p-2 bg-slate-900/50 rounded-md border text-left transition-all ${
        highlight && !isAssigned ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-emerald-500/10' : 'border-slate-800'
      } ${
        isAssigned ? 'cursor-not-allowed opacity-50 bg-slate-950' : 'cursor-pointer hover:bg-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0 shadow-inner">
        {photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photoUrl} alt={player.last_name} className="object-cover w-full h-full pointer-events-none" />
        ) : (
          <User className="w-5 h-5 text-slate-500 pointer-events-none" />
        )}
      </div>
      <div className="flex flex-col flex-grow min-w-0">
        <span className="text-sm font-bold truncate text-slate-200">
          {player.first_name.charAt(0)}. {player.last_name}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-emerald-500">{player.position}</span>
          {player.shirt_number && <span>#{player.shirt_number}</span>}
          {isAssigned && (
            <span className="ml-auto text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              EN CAMPO
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

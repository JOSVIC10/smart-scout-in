'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SimilarPlayer } from '@/types/players'
import { computeAge } from '@/types/players'
import { Users } from 'lucide-react'

interface SimilarPlayersProps {
  players: SimilarPlayer[]
}

export function SimilarPlayers({ players }: SimilarPlayersProps) {
  if (!players || players.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl h-full flex items-center justify-center">
        <p className="text-slate-500 text-sm">No se encontraron jugadores similares.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-2 text-emerald-400 mb-6">
        <Users className="w-5 h-5" />
        <h2 className="text-xs font-black uppercase tracking-widest">Perfiles Similares</h2>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-3">
        {players.map(({ player, similarity }) => {
          const age = computeAge(player.birth_date)
          return (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="group flex items-center gap-4 p-3 bg-slate-800/30 hover:bg-slate-800/80 border border-slate-700/30 hover:border-emerald-500/30 rounded-2xl transition-all"
            >
              {/* Photo */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                {player.photo_url ? (
                  <Image
                    src={player.photo_url}
                    alt={`${player.first_name} ${player.last_name}`}
                    width={56}
                    height={56}
                    className="object-cover object-top w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">
                  {player.first_name} {player.last_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                  <span className="truncate">{player.club?.name ?? 'Sin club'}</span>
                  <span>•</span>
                  <span>{age} años</span>
                </div>
              </div>

              {/* Similarity Score */}
              <div className="shrink-0 flex flex-col items-end">
                <span className={`text-lg font-black ${similarity > 85 ? 'text-emerald-400' : similarity > 70 ? 'text-sky-400' : 'text-slate-400'}`}>
                  {similarity}%
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Similitud</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

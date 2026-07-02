'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SimilarPlayer } from '@/types/players'
import { computeAge, POSITION_LABELS } from '@/types/players'
import { Users, TrendingUp } from 'lucide-react'

interface SimilarPlayersProps {
  players: SimilarPlayer[]
}

function SimilarityBar({ value }: { value: number }) {
  const color =
    value >= 80 ? '#22c55e' : value >= 60 ? '#84cc16' : value >= 40 ? '#eab308' : '#f97316'
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-black" style={{ color }}>
        {value}%
      </span>
    </div>
  )
}

export function SimilarPlayers({ players }: SimilarPlayersProps) {
  if (!players.length) {
    return (
      <div className="glass-card rounded-2xl border border-slate-800/60 p-5">
        <h2 className="text-slate-100 font-bold text-base mb-4">Más similares a</h2>
        <p className="text-slate-500 text-sm">No se encontraron jugadores similares.</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <h2 className="text-slate-100 font-bold text-base">Más similares a</h2>
      </div>

      <div className="divide-y divide-slate-800/40">
        {players.map(({ player, similarity }, idx) => {
          const age = computeAge(player.birth_date)
          return (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors group"
            >
              {/* Rank */}
              <span className="text-slate-600 font-black text-lg w-5 text-center">{idx + 1}</span>

              {/* Photo */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50 shrink-0">
                {player.photo_url ? (
                  <Image
                    src={player.photo_url}
                    alt={`${player.first_name} ${player.last_name}`}
                    width={48}
                    height={48}
                    className="object-cover object-top w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-bold text-sm group-hover:text-emerald-400 transition-colors truncate">
                  {player.first_name} {player.last_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded font-medium">
                    {player.position}
                  </span>
                  {age !== null && (
                    <span className="text-[11px] text-slate-500">{age} años</span>
                  )}
                </div>
                <div className="mt-1.5">
                  <SimilarityBar value={similarity} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

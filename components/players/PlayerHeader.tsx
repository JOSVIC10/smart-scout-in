'use client'

import React from 'react'
import Image from 'next/image'
import { computeAge, POSITION_LABELS, FOOT_LABELS } from '@/types/players'
import type { PlayerWithClub } from '@/types/players'
import { MapPin, Clock, Hash, Trophy, Star } from 'lucide-react'

const COUNTRY_FLAGS: Record<string, string> = {
  Spain: '🇪🇸', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Germany: '🇩🇪', France: '🇫🇷',
  Italy: '🇮🇹', Turkey: '🇹🇷', Portugal: '🇵🇹', Brazil: '🇧🇷',
  Argentina: '🇦🇷', Netherlands: '🇳🇱', Belgium: '🇧🇪', Default: '🌍',
}

const POSITION_COLORS: Record<string, string> = {
  GK: 'from-yellow-500 to-amber-600',
  CB: 'from-blue-500 to-blue-700',
  FB: 'from-cyan-500 to-cyan-700',
  DM: 'from-purple-500 to-purple-700',
  CM: 'from-indigo-500 to-indigo-700',
  AM: 'from-orange-500 to-orange-700',
  W: 'from-pink-500 to-pink-700',
  ST: 'from-red-500 to-red-700',
}

interface PlayerHeaderProps {
  player: PlayerWithClub
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
  const age = computeAge(player.birth_date)
  const flag = COUNTRY_FLAGS[player.nationality] ?? COUNTRY_FLAGS.Default
  const posGradient = POSITION_COLORS[player.position] ?? 'from-slate-500 to-slate-700'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col md:flex-row gap-6 p-6">
        {/* Photo */}
        <div className="relative shrink-0">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-950/50 bg-slate-800">
            {player.photo_url ? (
              <Image
                src={player.photo_url}
                alt={`${player.first_name} ${player.last_name}`}
                fill
                className="object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                <span className="text-6xl">👤</span>
              </div>
            )}
          </div>

          {/* Position badge */}
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${posGradient} text-white text-xs font-black shadow-lg whitespace-nowrap`}>
            {player.position} · {POSITION_LABELS[player.position as keyof typeof POSITION_LABELS]}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-2">
          {/* Name */}
          <div className="mb-1">
            <span className="text-slate-400 text-sm font-medium">{player.first_name}</span>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mt-0.5">
              {player.last_name}
            </h1>
          </div>

          {/* Stats chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Chip icon={<span className="text-base">{flag}</span>} label={player.nationality} />
            {age !== null && <Chip icon={<span className="text-xs font-bold text-emerald-400">{age}</span>} label="años" />}
            {player.shirt_number && (
              <Chip icon={<Hash className="w-3.5 h-3.5 text-emerald-400" />} label={`${player.shirt_number}`} />
            )}
            <Chip icon={<Clock className="w-3.5 h-3.5 text-blue-400" />} label={`${player.minutes_played.toLocaleString()} min`} />
            {player.league && (
              <Chip icon={<Trophy className="w-3.5 h-3.5 text-amber-400" />} label={player.league} />
            )}
            <Chip
              icon={<Star className="w-3.5 h-3.5 text-slate-400" />}
              label={FOOT_LABELS[player.preferred_foot]}
            />
          </div>

          {/* Club */}
          <div className="mt-5 flex items-center gap-3">
            {player.club?.badge_url && (
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-slate-700/60 flex items-center justify-center overflow-hidden">
                <Image
                  src={player.club.badge_url}
                  alt={player.club.name}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-slate-200 font-bold text-sm">
                {player.club?.name ?? 'Agente libre'}
              </p>
              {player.club?.country && (
                <p className="text-slate-500 text-xs">{player.club.country}</p>
              )}
            </div>

            {/* Overall rating */}
            {player.overall_rating && (
              <div className="ml-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-950/40">
                  <span className="text-slate-900 font-black text-xl">
                    {Math.round(player.overall_rating)}
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-1">Overall</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-medium">
      {icon}
      <span>{label}</span>
    </div>
  )
}

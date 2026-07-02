'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Clock, Star } from 'lucide-react'
import type { PlayerWithClub } from '@/types/players'
import { computeAge, POSITION_LABELS, FOOT_LABELS } from '@/types/players'

// Country code → flag emoji mapping (ISO 3166-1 alpha-2)
const COUNTRY_FLAGS: Record<string, string> = {
  Spain: '🇪🇸',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Germany: '🇩🇪',
  France: '🇫🇷',
  Italy: '🇮🇹',
  Turkey: '🇹🇷',
  Portugal: '🇵🇹',
  Brazil: '🇧🇷',
  Argentina: '🇦🇷',
  Netherlands: '🇳🇱',
  Belgium: '🇧🇪',
  Croatia: '🇭🇷',
  Uruguay: '🇺🇾',
  Colombia: '🇨🇴',
  Default: '🌍',
}

function getFlag(nationality: string): string {
  return COUNTRY_FLAGS[nationality] ?? COUNTRY_FLAGS.Default
}

const POSITION_COLORS: Record<string, string> = {
  GK: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  CB: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  FB: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  DM: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  CM: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  AM: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  W: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  ST: 'bg-red-500/20 text-red-300 border-red-500/30',
}

function ratingGradient(rating: number | null): string {
  if (!rating) return 'from-slate-500 to-slate-600'
  if (rating >= 85) return 'from-yellow-400 to-amber-500'
  if (rating >= 75) return 'from-emerald-400 to-green-500'
  if (rating >= 65) return 'from-blue-400 to-blue-500'
  return 'from-slate-400 to-slate-500'
}

interface PlayerCardProps {
  player: PlayerWithClub
}

export function PlayerCard({ player }: PlayerCardProps) {
  const age = computeAge(player.birth_date)
  const flag = getFlag(player.nationality)
  const posColor = POSITION_COLORS[player.position] ?? POSITION_COLORS.CM

  return (
    <Link
      href={`/players/${player.id}`}
      className="group block glass-card p-0 overflow-hidden card-hover hover:border-emerald-500/40 transition-all duration-300"
    >
      {/* Photo header */}
      <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {player.photo_url ? (
          <Image
            src={player.photo_url}
            alt={`${player.first_name} ${player.last_name}`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-slate-700 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-10 h-10 text-emerald-400/60" />
            </div>
          </div>
        )}

        {/* Overall rating badge */}
        <div
          className={`absolute top-3 right-3 w-11 h-11 rounded-xl bg-gradient-to-br ${ratingGradient(player.overall_rating)} flex items-center justify-center shadow-lg`}
        >
          <span className="text-slate-900 font-black text-sm leading-none">
            {player.overall_rating ? Math.round(player.overall_rating) : '–'}
          </span>
        </div>

        {/* Position badge */}
        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-md border text-xs font-bold ${posColor}`}>
          {player.position}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Club badge */}
        {player.club?.badge_url && (
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden flex items-center justify-center">
            <Image
              src={player.club.badge_url}
              alt={player.club.name}
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-slate-100 font-bold text-base leading-tight group-hover:text-emerald-400 transition-colors">
            {player.first_name} <span className="text-white">{player.last_name}</span>
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{flag}</span>
            <span className="text-slate-400 text-xs">{player.nationality}</span>
            {age !== null && (
              <span className="text-slate-500 text-xs">· {age} años</span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>{player.minutes_played.toLocaleString()} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Star className="w-3.5 h-3.5 text-amber-500/70" />
            <span>{FOOT_LABELS[player.preferred_foot]}</span>
          </div>
        </div>

        {/* Club info */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-800/60">
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-xs font-medium truncate">
              {player.club?.name ?? 'Sin club'}
            </p>
            <p className="text-slate-500 text-[11px] truncate">
              {player.league ?? player.club?.country ?? '—'}
            </p>
          </div>
          {/* Rating bar */}
          {player.overall_rating && (
            <div className="flex flex-col items-end gap-0.5">
              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${ratingGradient(player.overall_rating)}`}
                  style={{ width: `${player.overall_rating}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{POSITION_LABELS[player.position as keyof typeof POSITION_LABELS]}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

'use client'

import React from 'react'
import Image from 'next/image'
import { computeAge, POSITION_LABELS, FOOT_LABELS } from '@/types/players'
import type { PlayerWithClub } from '@/types/players'
import { MapPin, Clock, Hash, Trophy, Star, Ruler, Weight, Calendar, Euro } from 'lucide-react'
import { generatePlayerMetadata } from '@/lib/tacticalLogic'

const COUNTRY_FLAGS: Record<string, string> = {
  España: '🇪🇸', Inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Alemania: '🇩🇪', Francia: '🇫🇷',
  Italia: '🇮🇹', Turquía: '🇹🇷', Portugal: '🇵🇹', Brasil: '🇧🇷',
  Argentina: '🇦🇷', Holanda: '🇳🇱', Bélgica: '🇧🇪', Default: '🌍',
  Escocia: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Canadá: '🇨🇦', Marruecos: '🇲🇦', Uruguay: '🇺🇾',
  Ecuador: '🇪🇨', Ucrania: '🇺🇦', 'Corea del Sur': '🇰🇷', Croacia: '🇭🇷',
  México: '🇲🇽', Japón: '🇯🇵', Ghana: '🇬🇭', Mali: '🇲🇱',
  USA: '🇺🇸', Hungría: '🇭🇺', Austria: '🇦🇹', Egipto: '🇪🇬', Suecia: '🇸🇪',
  Georgia: '🇬🇪', Colombia: '🇨🇴', Dinamarca: '🇩🇰', Senegal: '🇸🇳',
  Nigeria: '🇳🇬', Serbia: '🇷🇸', Polonia: '🇵🇱', Suiza: '🇨🇭', Noruega: '🇳🇴'
}

interface PlayerHeaderProps {
  player: PlayerWithClub
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
  const age = computeAge(player.birth_date)
  const flag = COUNTRY_FLAGS[player.nationality] ?? COUNTRY_FLAGS.Default
  
  // Use tactical logic to generate missing deterministic metadata
  const meta = generatePlayerMetadata(player.id, age, player.position)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 shadow-2xl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-[100px]" />
      </div>

      <div className="relative flex flex-col lg:flex-row gap-8 p-8 items-center lg:items-stretch">
        
        {/* Foto de jugador */}
        <div className="relative shrink-0">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 relative z-10 shadow-xl">
            {player.photo_url ? (
              <Image
                src={player.photo_url}
                alt={`${player.first_name} ${player.last_name}`}
                fill
                className="object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-700 to-slate-800">
                <span className="text-6xl mb-2">👤</span>
              </div>
            )}
            
            {/* Etiqueta de posición flotante */}
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 backdrop-blur-md text-white text-center py-1.5 text-xs font-black uppercase tracking-widest">
              {player.position}
            </div>
          </div>
        </div>

        {/* Info principal */}
        <div className="flex-1 flex flex-col w-full min-w-0 text-center lg:text-left justify-center">
          
          {/* Nombre y liga */}
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {player.first_name} <span className="text-emerald-400">{player.last_name}</span>
            </h1>
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-2 text-slate-400 text-sm font-medium">
              <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-400"/> {player.league ?? 'Competición desconocida'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">{flag} {player.nationality}</span>
            </div>
          </div>

          {/* Tarjetas biográficas densas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BioCard icon={<Calendar className="w-4 h-4 text-sky-400"/>} label="Edad" value={`${age ?? '--'} años`} />
            <BioCard icon={<Ruler className="w-4 h-4 text-emerald-400"/>} label="Altura" value={`${meta.height} cm`} />
            <BioCard icon={<Weight className="w-4 h-4 text-purple-400"/>} label="Peso" value={`${meta.weight} kg`} />
            <BioCard icon={<Star className="w-4 h-4 text-amber-400"/>} label="Pie dominante" value={FOOT_LABELS[player.preferred_foot]} />
          </div>

        </div>

        {/* Derecha: Club, Valor de mercado, Pitch */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-700/50 pt-6 lg:pt-0 lg:pl-8">
          
          {/* Club Info */}
          <div className="flex items-center gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            {player.club?.badge_url ? (
              <div className="w-12 h-12 bg-white/10 rounded-lg p-1.5 shrink-0">
                <Image src={player.club.badge_url} alt={player.club.name} width={40} height={40} className="object-contain" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-slate-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-bold truncate">{player.club?.name ?? 'Sin club'}</p>
              <p className="text-slate-400 text-xs truncate">{player.club?.country ?? 'País desconocido'}</p>
            </div>
          </div>

          {/* Valor de Mercado & Contrato */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Valor Estimado</p>
                <p className="text-lg font-black text-emerald-400">€{meta.marketValue}M</p>
             </div>
             <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Fin Contrato</p>
                <p className="text-lg font-bold text-slate-200">{meta.contractEnd}</p>
             </div>
          </div>

          {/* Partidos */}
          <div className="text-center bg-slate-800/40 p-2 rounded-xl border border-slate-700/50 text-xs text-slate-300">
             Disputados <strong>{meta.matches} partidos</strong> ({player.minutes_played.toLocaleString()} min)
          </div>

        </div>

      </div>
    </div>
  )
}

function BioCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
      <div className="bg-slate-700/50 p-2 rounded-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value}</p>
      </div>
    </div>
  )
}

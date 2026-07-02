'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { PlayerHeader } from '@/components/players/PlayerHeader'
import { RadarChart } from '@/components/players/RadarChart'
import { PercentilePanel } from '@/components/players/PercentilePanel'
import { SimilarPlayers } from '@/components/players/SimilarPlayers'
import { HeatmapOverlay } from '@/components/players/HeatmapOverlay'
import { DefensiveZones } from '@/components/players/DefensiveZones'
import { ScoutRating } from '@/components/players/ScoutRating'
import { ExportButton } from '@/components/players/ExportButton'
import { getPlayerById, getPlayerMetrics, getSimilarPlayers } from '@/lib/playersApi'
import type { PlayerWithClub, EnrichedMetric, SimilarPlayer } from '@/types/players'

interface PlayerProfileClientProps {
  id: string
}

export function PlayerProfileClient({ id }: PlayerProfileClientProps) {
  const [player, setPlayer] = useState<PlayerWithClub | null>(null)
  const [metrics, setMetrics] = useState<EnrichedMetric[]>([])
  const [similar, setSimilar] = useState<SimilarPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [p, m] = await Promise.all([
          getPlayerById(id),
          getPlayerMetrics(id),
        ])
        if (!p) {
          setError('Jugador no encontrado.')
          return
        }
        setPlayer(p)
        setMetrics(m)

        // Load similar players (non-blocking)
        getSimilarPlayers(id, m, 3)
          .then(setSimilar)
          .catch(console.error)
      } catch (err) {
        setError('Error al cargar los datos del jugador.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Cargando ficha del jugador...</p>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-slate-200 font-bold text-lg mb-2">{error ?? 'Jugador no encontrado'}</h2>
          <Link
            href="/players"
            className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  const playerName = `${player.first_name} ${player.last_name}`

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Top bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-6 py-3 flex items-center justify-between backdrop-blur-sm">
        <Link
          href="/players"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Jugadores
        </Link>
        <ExportButton
          containerId="report-container"
          playerName={playerName}
        />
      </div>

      {/* Report container (captured for PDF) */}
      <div id="report-container" className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <PlayerHeader player={player} />

        {/* ── MAIN GRID ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left / Center: radar + heatmap + defensive zones */}
          <div className="xl:col-span-2 space-y-6">
            {/* Radar */}
            <RadarChart metrics={metrics} playerName={playerName} />

            {/* Fields row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HeatmapOverlay metrics={metrics} position={player.position} />
              <DefensiveZones metrics={metrics} />
            </div>
          </div>

          {/* Right: percentile panel + similar + scout rating */}
          <div className="space-y-6">
            <PercentilePanel metrics={metrics} />
            <SimilarPlayers players={similar} />
            <ScoutRating playerId={player.id} />
          </div>
        </div>

        {/* Footer watermark */}
        <div className="text-center py-4 border-t border-slate-800/40">
          <p className="text-slate-600 text-xs">
            Smart Scout In — Informe generado el {new Date().toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

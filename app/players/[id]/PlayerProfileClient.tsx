'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { PlayerHeader } from '@/components/players/PlayerHeader'
import { DecisionBoard } from '@/components/players/DecisionBoard'
import { TopKPIs } from '@/components/players/TopKPIs'
import { RadarChart } from '@/components/players/RadarChart'
import { TacticalProfile } from '@/components/players/TacticalProfile'
import { EvolutionGraph } from '@/components/players/EvolutionGraph'
import { StrengthsWeaknesses } from '@/components/players/StrengthsWeaknesses'
import { PercentilePanel } from '@/components/players/PercentilePanel'
import { SimilarPlayers } from '@/components/players/SimilarPlayers'
import { MetricsAccordion } from '@/components/players/MetricsAccordion'
import { HeatmapOverlay } from '@/components/players/HeatmapOverlay'
import { ExportButton } from '@/components/players/ExportButton'
import { PrintableReport } from '@/components/players/PrintableReport'
import { getPlayerById, getPlayerMetrics, getSimilarPlayers } from '@/lib/playersApi'
import { evaluatePlayer, generateScoutHistory } from '@/lib/tacticalLogic'
import { computeAge } from '@/types/players'
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

        // Load similar players (non-blocking), get 5 instead of 3
        getSimilarPlayers(id, m, 5)
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
      <div className="min-h-screen bg-[#050814] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Cargando base de datos táctica...</p>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center px-6">
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
  const age = computeAge(player.birth_date)
  
  // Tactical AI Evaluation
  const evalData = evaluatePlayer(player.id, metrics, player.position, age)
  const scoutHistory = generateScoutHistory(player.id)

  return (
    <div className="min-h-screen bg-[#050814] relative text-slate-200 selection:bg-emerald-500/30 font-sans pb-20">
      
      {/* Background glow global */}
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

      {/* Printable Report (Hidden from web view, used for PDF export) */}
      <PrintableReport player={player} metrics={metrics} similarPlayers={similar} />

      {/* Top bar */}
      <div className="sticky top-0 bg-[#050814]/80 border-b border-slate-800/60 px-6 py-4 flex items-center justify-between backdrop-blur-md relative z-50">
        <Link
          href="/players"
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 text-sm font-bold tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <ExportButton
          containerId="printable-report-container"
          playerName={playerName}
        />
      </div>

      {/* ── WEB REPORT BENTO BOX ──────────────────────────────────────────── */}
      <div id="report-container" className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 relative z-10">

        {/* 1. Header Gigante */}
        <PlayerHeader player={player} />

        {/* 2. Board de Decisión (AI Score + Summary) */}
        <DecisionBoard evalData={evalData} playerName={playerName} />

        {/* 3. Top 8 KPIs Numéricos */}
        <TopKPIs metrics={metrics} />

        {/* 4. Tactical Row (Radar + Tactical Profile + Evolution) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 min-h-[400px]">
            <RadarChart metrics={metrics} playerName={playerName} />
          </div>
          <div className="lg:col-span-1">
            <TacticalProfile roles={evalData.roles} systems={evalData.systems} model={evalData.model} />
          </div>
          <div className="lg:col-span-1">
            <EvolutionGraph data={evalData.evolution} />
          </div>
        </div>

        {/* 5. Strengths & Weaknesses Row */}
        <StrengthsWeaknesses strengths={evalData.strengths} weaknesses={evalData.weaknesses} />

        {/* 6. Contexto y Comparativa Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PercentilePanel metrics={metrics} />
          </div>
          <div className="lg:col-span-1">
            <SimilarPlayers players={similar} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Heatmap Miniatura (Reutilizamos componente y le damos contenedor fijo) */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl h-64 overflow-hidden relative flex flex-col">
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">Zonas de Influencia</h2>
              <div className="flex-1 relative -mx-4 -mb-4">
                <HeatmapOverlay metrics={metrics} position={player.position} />
              </div>
            </div>

            {/* Scout History Miniatura */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">Notas de Scouts</h2>
              <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
                {scoutHistory.map((note, i) => (
                  <div key={i} className="border-l-2 border-slate-700 pl-3">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                      <span>{note.scout}</span>
                      <span>{note.date}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{note.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Full Metrics Acordeón */}
        <MetricsAccordion metrics={metrics} />

      </div>
    </div>
  )
}

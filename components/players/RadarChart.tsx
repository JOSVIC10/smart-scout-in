'use client'

import React from 'react'
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { EnrichedMetric } from '@/types/players'

interface RadarChartProps {
  metrics: EnrichedMetric[]
  playerName?: string
}

// Short labels for the radar axes (space is limited)
const AXIS_LABELS: Record<string, string> = {
  build_play: 'Build Play',
  link_up_play: 'Link Up',
  progression_play: 'Progression',
  open_play_creation: 'OP Creation',
  set_play_creation: 'SP Creation',
  threat: 'Threat',
  open_play_finishing: 'OP Finishing',
  set_play_finishing: 'SP Finishing',
  finishing_crosses: 'Crosses',
  defending_oppo_half: 'Def Opp Half',
  open_play_defending: 'OP Defending',
  defending_own_half: 'Def Own Half',
  defending_box: 'Def Box',
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { metric: string; percentile: number; label: string } }> }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-200 font-bold mb-0.5">{d.label}</p>
      <p className="text-emerald-400 font-black text-sm">Percentil: {d.percentile}</p>
    </div>
  )
}

export function RadarChart({ metrics, playerName }: RadarChartProps) {
  const data = metrics.map((m) => ({
    metric: AXIS_LABELS[m.code] ?? m.label,
    label: m.label,
    percentile: m.percentile,
    fullMark: 99,
  }))

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800/60">
      <div className="mb-4">
        <h2 className="text-slate-100 font-bold text-base">Perfil de métricas</h2>
        <p className="text-slate-500 text-xs mt-0.5">Percentil vs. jugadores de la misma posición (0-99)</p>
      </div>

      <div className="w-full" style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            data={data}
            margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          >
            <defs>
              <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <PolarGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={({ payload, x, y, cx, cy, ...rest }) => {
                const midAngle = Math.atan2(-(y - cy), x - cx) * (180 / Math.PI)
                const textAnchor =
                  Math.abs(midAngle) < 10
                    ? 'middle'
                    : x > cx
                    ? 'start'
                    : x < cx
                    ? 'end'
                    : 'middle'
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fill="rgba(203,213,225,0.75)"
                    fontSize={10}
                    fontWeight={500}
                  >
                    {payload.value}
                  </text>
                )
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name={playerName ?? 'Jugador'}
              dataKey="percentile"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#radarFill)"
              dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#4ade80', r: 5, stroke: '#166534', strokeWidth: 2 }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 justify-center mt-1">
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <span className="text-slate-400 text-xs">{playerName ?? 'Jugador'} — Percentil</span>
      </div>
    </div>
  )
}

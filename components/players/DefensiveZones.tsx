'use client'

import React from 'react'
import { SoccerPitch } from './SoccerPitch'
import type { EnrichedMetric } from '@/types/players'

interface DefensiveZonesProps {
  metrics: EnrichedMetric[]
}

// Each zone has a label and maps to specific metrics
const ZONES = [
  // Row 0 — own box
  { label: 'Def\nBox', row: 0, col: 0, metricCode: 'defending_box' },
  { label: 'Own\nHalf L', row: 0, col: 1, metricCode: 'defending_own_half' },
  { label: 'Own\nHalf R', row: 0, col: 2, metricCode: 'defending_own_half' },
  // Row 1 — midfield defensive
  { label: 'OP\nDef', row: 1, col: 0, metricCode: 'open_play_defending' },
  { label: 'Mid\nBlock', row: 1, col: 1, metricCode: 'open_play_defending' },
  { label: 'OP\nDef', row: 1, col: 2, metricCode: 'open_play_defending' },
  // Row 2 — opponent's half
  { label: 'Opp\nHalf', row: 2, col: 0, metricCode: 'defending_oppo_half' },
  { label: 'Press', row: 2, col: 1, metricCode: 'defending_oppo_half' },
  { label: 'Opp\nHalf', row: 2, col: 2, metricCode: 'defending_oppo_half' },
]

function getZoneColor(percentile: number): string {
  if (percentile >= 80) return 'rgba(34,197,94,0.5)'   // green
  if (percentile >= 60) return 'rgba(132,204,22,0.4)'  // lime
  if (percentile >= 40) return 'rgba(234,179,8,0.4)'   // yellow
  if (percentile >= 20) return 'rgba(249,115,22,0.4)'  // orange
  return 'rgba(239,68,68,0.35)'                         // red
}

export function DefensiveZones({ metrics }: DefensiveZonesProps) {
  const metricMap = new Map(metrics.map((m) => [m.code, m]))

  const ROWS = 3
  const COLS = 3
  const pitchW = 68  // viewBox after rotation
  const pitchH = 105
  const marginX = 2
  const marginY = 2
  const cellW = (pitchW - marginX * 2) / COLS
  const cellH = (pitchH - marginY * 2) / ROWS

  return (
    <div className="glass-card rounded-2xl border border-slate-800/60 p-5">
      <h2 className="text-slate-100 font-bold text-base mb-1">Zonas defensivas</h2>
      <p className="text-slate-500 text-xs mb-4">Intensidad defensiva por zona del campo</p>

      <div className="max-w-[220px] mx-auto">
        <SoccerPitch orientation="vertical">
          <svg
            viewBox={`0 0 ${pitchW} ${pitchH}`}
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {ZONES.map((zone, idx) => {
              const metric = metricMap.get(zone.metricCode)
              const percentile = metric?.percentile ?? 0
              const x = marginX + zone.col * cellW
              const y = marginY + zone.row * cellH
              const bgColor = getZoneColor(percentile)

              return (
                <g key={idx}>
                  <rect
                    x={x + 0.5}
                    y={y + 0.5}
                    width={cellW - 1}
                    height={cellH - 1}
                    fill={bgColor}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.3"
                    rx="0.5"
                  />
                  {/* Percentile label */}
                  <text
                    x={x + cellW / 2}
                    y={y + cellH / 2 - 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="4.5"
                    fontWeight="800"
                  >
                    {percentile}
                  </text>
                  {/* Zone label */}
                  {zone.label.split('\n').map((line, li) => (
                    <text
                      key={li}
                      x={x + cellW / 2}
                      y={y + cellH / 2 + 3.5 + li * 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.6)"
                      fontSize="3"
                      fontWeight="500"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )
            })}
          </svg>
        </SoccerPitch>
      </div>

      {/* Color legend */}
      <div className="mt-3 grid grid-cols-5 gap-1 text-center">
        {[
          { label: '80+', color: 'bg-green-500/50 text-green-300' },
          { label: '60+', color: 'bg-lime-500/40 text-lime-300' },
          { label: '40+', color: 'bg-yellow-500/40 text-yellow-300' },
          { label: '20+', color: 'bg-orange-500/40 text-orange-300' },
          { label: '<20', color: 'bg-red-500/40 text-red-300' },
        ].map((l) => (
          <div key={l.label} className={`rounded text-[10px] font-bold py-0.5 ${l.color}`}>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}

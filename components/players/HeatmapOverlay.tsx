'use client'

import React from 'react'
import { SoccerPitch } from './SoccerPitch'
import type { EnrichedMetric } from '@/types/players'

interface HeatmapOverlayProps {
  metrics: EnrichedMetric[]
  position: string
}

// Map position to likely zones (row 0=defensive end, row 2=attacking end)
// Grid: 3 cols × 5 rows on pitch
const POSITION_ZONE_WEIGHTS: Record<string, number[][]> = {
  GK: [
    [0.8, 1.0, 0.8],
    [0.4, 0.5, 0.4],
    [0.1, 0.1, 0.1],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
  ],
  CB: [
    [0.6, 0.8, 0.6],
    [0.8, 1.0, 0.8],
    [0.5, 0.6, 0.5],
    [0.1, 0.1, 0.1],
    [0.0, 0.0, 0.0],
  ],
  FB: [
    [0.4, 0.5, 0.7],
    [0.6, 0.7, 0.9],
    [0.7, 0.6, 1.0],
    [0.5, 0.3, 0.8],
    [0.2, 0.1, 0.4],
  ],
  DM: [
    [0.3, 0.5, 0.3],
    [0.6, 0.8, 0.6],
    [0.9, 1.0, 0.9],
    [0.4, 0.5, 0.4],
    [0.1, 0.1, 0.1],
  ],
  CM: [
    [0.2, 0.3, 0.2],
    [0.4, 0.6, 0.4],
    [0.8, 1.0, 0.8],
    [0.7, 0.9, 0.7],
    [0.3, 0.4, 0.3],
  ],
  AM: [
    [0.0, 0.1, 0.0],
    [0.2, 0.3, 0.2],
    [0.5, 0.7, 0.5],
    [0.8, 1.0, 0.8],
    [0.6, 0.8, 0.6],
  ],
  W: [
    [0.0, 0.0, 0.1],
    [0.1, 0.1, 0.4],
    [0.3, 0.2, 0.8],
    [0.5, 0.3, 1.0],
    [0.7, 0.4, 0.9],
  ],
  ST: [
    [0.0, 0.0, 0.0],
    [0.0, 0.1, 0.0],
    [0.2, 0.3, 0.2],
    [0.5, 0.7, 0.5],
    [0.8, 1.0, 0.8],
  ],
}

function intensityToColor(intensity: number): string {
  // 0 → transparent, 1 → deep red/orange
  const r = Math.round(255 * Math.min(1, intensity * 2))
  const g = Math.round(180 * Math.max(0, 1 - intensity))
  const b = 0
  const a = intensity * 0.7
  return `rgba(${r},${g},${b},${a})`
}

export function HeatmapOverlay({ metrics, position }: HeatmapOverlayProps) {
  const baseWeights =
    POSITION_ZONE_WEIGHTS[position] ?? POSITION_ZONE_WEIGHTS.CM

  // Modulate weights slightly by overall offensive/defensive percentile
  const offAvg = metrics
    .filter((m) => m.group === 'offensive')
    .reduce((s, m) => s + m.percentile, 0) / (metrics.filter((m) => m.group === 'offensive').length || 1)
  const defAvg = metrics
    .filter((m) => m.group === 'defensive')
    .reduce((s, m) => s + m.percentile, 0) / (metrics.filter((m) => m.group === 'defensive').length || 1)

  const offFactor = offAvg / 99
  const defFactor = defAvg / 99

  const grid = baseWeights.map((row, rowIdx) =>
    row.map((base) => {
      const isAttacking = rowIdx >= 3
      const isDefensive = rowIdx <= 1
      let w = base
      if (isAttacking) w = base * (0.5 + offFactor * 0.5)
      if (isDefensive) w = base * (0.5 + defFactor * 0.5)
      return Math.min(1, w)
    })
  )

  // Pitch is rendered at 105×68 viewBox, vertical = 90deg rotated
  // Overlay occupies the pitch minus margins (2px on each side)
  const ROWS = 5
  const COLS = 3
  const cellW = (105 - 4) / COLS
  const cellH = (68 - 4) / ROWS

  return (
    <div className="glass-card rounded-2xl border border-slate-800/60 p-5">
      <h2 className="text-slate-100 font-bold text-base mb-1">Mapa de calor</h2>
      <p className="text-slate-500 text-xs mb-4">Zonas de mayor presencia en el campo</p>

      <div className="max-w-[220px] mx-auto">
        <SoccerPitch orientation="vertical">
          {/* SVG overlay matching the viewBox after rotation */}
          <svg
            viewBox="0 0 68 105"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {grid.map((row, rowIdx) =>
              row.map((intensity, colIdx) => {
                if (intensity < 0.05) return null
                const x = 2 + colIdx * (64 / COLS)
                const y = 2 + rowIdx * (101 / ROWS)
                const w = 64 / COLS
                const h = 101 / ROWS
                return (
                  <rect
                    key={`${rowIdx}-${colIdx}`}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={intensityToColor(intensity)}
                    rx="0.5"
                  />
                )
              })
            )}
          </svg>
        </SoccerPitch>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-1">
        <span className="text-[10px] text-slate-500">Baja</span>
        <div className="flex h-2 w-24 rounded overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: intensityToColor(i / 11) }}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-500">Alta</span>
      </div>
    </div>
  )
}

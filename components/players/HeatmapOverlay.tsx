import React from 'react'
import { SoccerPitch } from './SoccerPitch'
import type { EnrichedMetric } from '@/types/players'

interface HeatmapOverlayProps {
  metrics: EnrichedMetric[]
  position: string
}

// Weights per zone (5 rows x 3 cols). 0=Defensive, 4=Attacking.
const POSITION_ZONE_WEIGHTS: Record<string, number[][]> = {
  GK: [
    [0.6, 0.9, 0.6],
    [0.2, 0.3, 0.2],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
  ],
  CB: [
    [0.4, 0.6, 0.4],
    [0.7, 0.9, 0.7],
    [0.3, 0.5, 0.3],
    [0.0, 0.1, 0.0],
    [0.0, 0.0, 0.0],
  ],
  FB: [
    [0.3, 0.2, 0.5],
    [0.6, 0.3, 0.8],
    [0.8, 0.4, 1.0],
    [0.5, 0.2, 0.8],
    [0.2, 0.1, 0.5],
  ],
  DM: [
    [0.2, 0.4, 0.2],
    [0.5, 0.8, 0.5],
    [0.7, 1.0, 0.7],
    [0.3, 0.6, 0.3],
    [0.1, 0.2, 0.1],
  ],
  CM: [
    [0.1, 0.2, 0.1],
    [0.3, 0.6, 0.3],
    [0.7, 1.0, 0.7],
    [0.6, 0.9, 0.6],
    [0.2, 0.4, 0.2],
  ],
  AM: [
    [0.0, 0.1, 0.0],
    [0.2, 0.4, 0.2],
    [0.5, 0.8, 0.5],
    [0.7, 1.0, 0.7],
    [0.5, 0.8, 0.5],
  ],
  W: [
    [0.0, 0.0, 0.1],
    [0.1, 0.1, 0.3],
    [0.3, 0.2, 0.8],
    [0.6, 0.3, 1.0],
    [0.8, 0.5, 0.9],
  ],
  ST: [
    [0.0, 0.0, 0.0],
    [0.0, 0.1, 0.0],
    [0.2, 0.4, 0.2],
    [0.5, 0.8, 0.5],
    [0.8, 1.0, 0.8],
  ],
}

// Simple deterministic pseudo-random for stable scatters
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function HeatmapOverlay({ metrics, position }: HeatmapOverlayProps) {
  const baseWeights = POSITION_ZONE_WEIGHTS[position] ?? POSITION_ZONE_WEIGHTS.CM

  const offAvg = metrics
    .filter((m) => m.group === 'offensive')
    .reduce((s, m) => s + m.percentile, 0) / (metrics.filter((m) => m.group === 'offensive').length || 1)
  const defAvg = metrics
    .filter((m) => m.group === 'defensive')
    .reduce((s, m) => s + m.percentile, 0) / (metrics.filter((m) => m.group === 'defensive').length || 1)

  const offFactor = offAvg / 99
  const defFactor = defAvg / 99

  const ROWS = 5
  const COLS = 3
  const pitchW = 68
  const pitchH = 105

  // Generate a list of circles to simulate a smooth heatmap
  const points: { x: number; y: number; o: number; r: number }[] = []

  baseWeights.forEach((row, rowIdx) => {
    row.forEach((base, colIdx) => {
      const isAttacking = rowIdx >= 3
      const isDefensive = rowIdx <= 1
      let w = base
      if (isAttacking) w = base * (0.5 + offFactor * 0.5)
      if (isDefensive) w = base * (0.5 + defFactor * 0.5)
      
      const intensity = Math.min(1, w)
      if (intensity < 0.1) return

      const cellW = pitchW / COLS
      const cellH = pitchH / ROWS
      const cx = colIdx * cellW + cellW / 2
      const cy = (ROWS - 1 - rowIdx) * cellH + cellH / 2 // Reverse Y so attack is UP

      // Add main circle
      points.push({ x: cx, y: cy, o: intensity, r: 24 * (0.6 + intensity * 0.4) })
      
      // Add scatter noise to make it look organic
      const numNoise = Math.floor(intensity * 3)
      for (let k = 0; k < numNoise; k++) {
        const seed = rowIdx * 100 + colIdx * 10 + k
        const u1 = seededRandom(seed) - 0.5
        const u2 = seededRandom(seed + 1) - 0.5
        
        points.push({
          x: cx + u1 * cellW * 1.5,
          y: cy + u2 * cellH * 1.5,
          o: intensity * 0.7,
          r: 16 * (0.5 + intensity * 0.5),
        })
      }
    })
  })

  return (
    <div className="glass-card rounded-2xl border border-slate-800/60 p-5">
      <h2 className="text-slate-100 font-bold text-base mb-1">Mapa de calor</h2>
      <p className="text-slate-500 text-xs mb-4">Zonas de mayor presencia en el campo</p>

      <div className="max-w-[220px] mx-auto relative">
        <SoccerPitch orientation="vertical">
          <svg
            viewBox={`0 0 ${pitchW} ${pitchH}`}
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="hot-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffea00" stopOpacity="0.8" />
                <stop offset="30%" stopColor="#ff1100" stopOpacity="0.5" />
                <stop offset="70%" stopColor="#660000" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#660000" stopOpacity="0" />
              </radialGradient>
              <filter id="soft-blur">
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>
            <g style={{ mixBlendMode: 'screen' }} filter="url(#soft-blur)">
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill="url(#hot-glow)"
                  opacity={p.o}
                />
              ))}
            </g>
          </svg>
        </SoccerPitch>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1">
        <span className="text-[10px] text-slate-500">Baja</span>
        <div className="flex h-2 w-24 rounded overflow-hidden bg-gradient-to-r from-transparent via-[#ff1100] to-[#ffea00]" />
        <span className="text-[10px] text-slate-500">Alta</span>
      </div>
    </div>
  )
}

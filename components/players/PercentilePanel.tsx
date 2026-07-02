'use client'

import React, { useState } from 'react'
import type { EnrichedMetric } from '@/types/players'
import { percentileBgClass, percentileColor } from '@/types/players'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface PercentilePanelProps {
  metrics: EnrichedMetric[]
}

const GROUP_LABELS: Record<string, string> = {
  offensive: '⚔️ Ataque',
  defensive: '🛡️ Defensa',
  possession: '🔄 Posesión',
}

function PercentileBar({ value }: { value: number }) {
  const color = percentileColor(value)
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function PercentileBadge({ value }: { value: number }) {
  const cls = percentileBgClass(value)
  return (
    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md border text-xs font-black ${cls}`}>
      {value}
    </span>
  )
}

export function PercentilePanel({ metrics }: PercentilePanelProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const grouped = metrics.reduce<Record<string, EnrichedMetric[]>>((acc, m) => {
    if (!acc[m.group]) acc[m.group] = []
    acc[m.group].push(m)
    return acc
  }, {})

  return (
    <div className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden">
      <div className="p-5 border-b border-slate-800/60">
        <h2 className="text-slate-100 font-bold text-base">vs. jugadores de su posición</h2>
        <p className="text-slate-500 text-xs mt-0.5">Percentil de cada métrica (0–99)</p>
      </div>

      <div className="divide-y divide-slate-800/40">
        {Object.entries(grouped).map(([group, mets]) => {
          const isCollapsed = collapsed[group]
          const avgPct = Math.round(mets.reduce((s, m) => s + m.percentile, 0) / mets.length)

          return (
            <div key={group}>
              {/* Group header */}
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [group]: !c[group] }))}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-semibold text-sm">
                    {GROUP_LABELS[group] ?? group}
                  </span>
                  <PercentileBadge value={avgPct} />
                </div>
                {isCollapsed
                  ? <ChevronDown className="w-4 h-4 text-slate-500" />
                  : <ChevronUp className="w-4 h-4 text-slate-500" />
                }
              </button>

              {/* Metrics */}
              {!isCollapsed && (
                <div className="px-5 pb-3 space-y-3">
                  {mets.map((m) => (
                    <div key={m.code} className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs w-36 shrink-0 truncate">{m.label}</span>
                      <PercentileBar value={m.percentile} />
                      <PercentileBadge value={m.percentile} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

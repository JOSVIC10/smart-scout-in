'use client'

import React, { useMemo } from 'react'
import { EnrichedMetric } from '@/types/players'

interface TopKPIsProps {
  metrics: EnrichedMetric[]
}

const TOP_KEYS = [
  'goals', 'assists', 'xg', 'xa', 'prog_passes', 'prog_carries', 'succ_dribbles', 'recoveries'
]

export function TopKPIs({ metrics }: TopKPIsProps) {
  
  const kpis = useMemo(() => {
    return TOP_KEYS.map(key => {
      const m = metrics.find(x => x.code === key)
      return {
        label: m?.label ?? key,
        value: m?.value?.toFixed(2) ?? '--',
        percentile: m?.percentile ?? 0
      }
    })
  }, [metrics])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[70%]">
              {kpi.label}
            </span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-md ${kpi.percentile > 80 ? 'bg-emerald-500/20 text-emerald-400' : kpi.percentile > 50 ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
              P{kpi.percentile}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-white">{kpi.value}</span>
          </div>

          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full ${kpi.percentile > 80 ? 'bg-emerald-500' : kpi.percentile > 50 ? 'bg-sky-500' : 'bg-slate-500'}`} 
              style={{ width: `${kpi.percentile}%` }} 
            />
          </div>

        </div>
      ))}
    </div>
  )
}

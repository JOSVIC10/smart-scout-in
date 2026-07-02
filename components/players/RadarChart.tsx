'use client'

import React, { useMemo } from 'react'
import {
  Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'
import { EnrichedMetric } from '@/types/players'
import { Target } from 'lucide-react'

interface RadarProps {
  metrics: EnrichedMetric[]
  playerName: string
}

const DIMENSIONS = [
  { axis: 'Build Up', keys: ['pass_accuracy', 'passes_final_third', 'xgbuildup'] },
  { axis: 'Progression', keys: ['prog_passes', 'prog_carries', 'through_balls'] },
  { axis: 'Chance Creation', keys: ['key_passes', 'sca', 'xa', 'crosses'] },
  { axis: 'Final Third', keys: ['touches_box', 'carries_final_third', 'carries_box'] },
  { axis: 'Finishing', keys: ['goals', 'xg', 'shots_on_target', 'conversion_rate', 'big_chances'] },
  { axis: 'Defensive Work', keys: ['tackles', 'interceptions', 'clearances', 'blocks'] },
  { axis: 'Pressing', keys: ['recoveries', 'gca'] },
  { axis: 'Physical Impact', keys: ['top_speed', 'sprint_dist', 'aerial_won'] }
]

export function RadarChart({ metrics, playerName }: RadarProps) {
  
  const data = useMemo(() => {
    if (!metrics || metrics.length === 0) return []

    const metricMap = new Map<string, number>()
    metrics.forEach(m => metricMap.set(m.code, m.percentile))

    return DIMENSIONS.map(dim => {
      let sum = 0
      let count = 0
      dim.keys.forEach(k => {
        if (metricMap.has(k)) {
          sum += metricMap.get(k)!
          count++
        }
      })
      return {
        subject: dim.axis,
        A: count > 0 ? Math.round(sum / count) : 0,
        fullMark: 100
      }
    })
  }, [metrics])

  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex items-center justify-center h-full min-h-[400px]">
        <p className="text-slate-500 text-sm">Sin datos para el radar</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-10">
        <Target className="w-5 h-5" />
        <h2 className="text-xs font-black uppercase tracking-widest">Radar de Rendimiento</h2>
      </div>
      <p className="text-slate-400 text-xs mb-6 relative z-10">Percentiles promedio ponderados en 8 dimensiones clave</p>

      <div className="flex-1 w-full relative z-10" style={{ minHeight: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#475569', fontSize: 10 }}
              tickCount={6}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Radar
              name={playerName}
              dataKey="A"
              stroke="#10b981"
              strokeWidth={2}
              fill="#10b981"
              fillOpacity={0.4}
              dot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#34d399', strokeWidth: 0 }}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

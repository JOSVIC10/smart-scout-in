'use client'

import React, { useMemo } from 'react'
import type { EnrichedMetric } from '@/types/players'
import { Trophy, Activity, Target, Shield, Zap } from 'lucide-react'

interface PercentilePanelProps {
  metrics: EnrichedMetric[]
}

export function PercentilePanel({ metrics }: PercentilePanelProps) {
  
  const stats = useMemo(() => {
    if (!metrics || metrics.length === 0) return { general: 0, off: 0, def: 0, poss: 0 }
    
    const general = Math.round(metrics.reduce((acc, m) => acc + m.percentile, 0) / metrics.length)
    
    const getAvg = (group: string) => {
      const gMetrics = metrics.filter(m => m.group === group)
      if (gMetrics.length === 0) return 0
      return Math.round(gMetrics.reduce((acc, m) => acc + m.percentile, 0) / gMetrics.length)
    }

    return {
      general,
      off: getAvg('offensive'),
      def: getAvg('defensive'),
      poss: getAvg('possession')
    }
  }, [metrics])

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full" />
      
      <div className="flex items-center gap-2 text-emerald-400 mb-6 relative z-10">
        <Trophy className="w-5 h-5" />
        <h2 className="text-xs font-black uppercase tracking-widest">Comparativa de Liga</h2>
      </div>

      <div className="flex-1 space-y-5 relative z-10">
        
        {/* Main General Percentile */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-100 font-bold text-sm">Percentil General</p>
              <p className="text-emerald-500/80 text-[10px] font-black uppercase tracking-wider">Top {100 - stats.general}% de su posición</p>
            </div>
          </div>
          <span className="text-3xl font-black text-emerald-400">{stats.general}</span>
        </div>

        {/* Sub percentiles */}
        <div className="grid grid-cols-1 gap-3">
          <MacroBar icon={<Target className="w-4 h-4 text-sky-400"/>} label="Ofensivo / Finalización" value={stats.off} color="bg-sky-500" />
          <MacroBar icon={<Zap className="w-4 h-4 text-purple-400"/>} label="Creación / Posesión" value={stats.poss} color="bg-purple-500" />
          <MacroBar icon={<Shield className="w-4 h-4 text-amber-400"/>} label="Rendimiento Defensivo" value={stats.def} color="bg-amber-500" />
        </div>

      </div>
    </div>
  )
}

function MacroBar({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold text-slate-300">{label}</span>
        </div>
        <span className="text-sm font-black text-white">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import type { EnrichedMetric } from '@/types/players'
import { ChevronDown, ChevronRight, Activity } from 'lucide-react'

interface MetricsAccordionProps {
  metrics: EnrichedMetric[]
}

const GROUPS = [
  { id: 'offensive', label: 'Métricas Ofensivas' },
  { id: 'possession', label: 'Pases y Posesión' },
  { id: 'defensive', label: 'Rendimiento Defensivo' }
]

export function MetricsAccordion({ metrics }: MetricsAccordionProps) {
  const [openGroups, setOpenGroups] = useState<string[]>(['offensive'])

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-2 text-emerald-400 mb-6">
        <Activity className="w-5 h-5" />
        <h2 className="text-xs font-black uppercase tracking-widest">Desglose Detallado</h2>
      </div>

      <div className="space-y-3">
        {GROUPS.map(group => {
          const groupMetrics = metrics.filter(m => m.group === group.id).sort((a,b) => b.percentile - a.percentile)
          if (groupMetrics.length === 0) return null
          
          const isOpen = openGroups.includes(group.id)

          return (
            <div key={group.id} className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-900/50">
              <button 
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
              >
                <span className="text-sm font-bold text-slate-200">{group.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">{groupMetrics.length} métricas</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </span>
              </button>

              {isOpen && (
                <div className="p-4 space-y-4 border-t border-slate-800/60">
                  {groupMetrics.map((m, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-300">{m.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{m.value?.toFixed(2)}</span>
                          <span className={`w-8 text-right ${m.percentile > 80 ? 'text-emerald-400' : m.percentile > 50 ? 'text-sky-400' : 'text-slate-400'}`}>
                            P{m.percentile}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${m.percentile > 80 ? 'bg-emerald-500' : m.percentile > 50 ? 'bg-sky-500' : 'bg-slate-500'}`} 
                          style={{ width: `${m.percentile}%` }} 
                        />
                      </div>
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

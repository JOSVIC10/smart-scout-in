'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface Props {
  strengths: string[]
  weaknesses: string[]
}

export function StrengthsWeaknesses({ strengths, weaknesses }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      
      {/* Fortalezas */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex flex-col">
        <div className="flex items-center gap-2 text-emerald-400 mb-6">
          <ArrowUpCircle className="w-5 h-5" />
          <h2 className="text-xs font-black uppercase tracking-widest">Fortalezas Principales</h2>
        </div>
        
        <div className="flex-1 space-y-3">
          {strengths.map((str, i) => (
            <div key={i} className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-emerald-100 font-bold text-sm">{str}</span>
            </div>
          ))}
          {strengths.length === 0 && (
            <p className="text-slate-500 text-sm">No hay datos suficientes</p>
          )}
        </div>
      </div>

      {/* Debilidades */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex flex-col">
        <div className="flex items-center gap-2 text-amber-500 mb-6">
          <ArrowDownCircle className="w-5 h-5" />
          <h2 className="text-xs font-black uppercase tracking-widest">Áreas de Mejora</h2>
        </div>
        
        <div className="flex-1 space-y-3">
          {weaknesses.map((wk, i) => (
            <div key={i} className="flex items-center gap-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-amber-100 font-bold text-sm">{wk}</span>
            </div>
          ))}
          {weaknesses.length === 0 && (
            <p className="text-slate-500 text-sm">No hay datos suficientes</p>
          )}
        </div>
      </div>

    </div>
  )
}

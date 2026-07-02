'use client'

import React from 'react'
import { Layout, GitPullRequest, Settings, Swords } from 'lucide-react'

interface TacticalProfileProps {
  roles: string[]
  systems: string[]
  model: string
}

export function TacticalProfile({ roles, systems, model }: TacticalProfileProps) {
  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-xl h-full">
      <div className="flex items-center gap-2 text-emerald-400 mb-6">
        <Swords className="w-5 h-5" />
        <h2 className="text-xs font-black uppercase tracking-widest">Perfil Táctico</h2>
      </div>

      <div className="space-y-6">
        
        <div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Layout className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Rol Principal</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((r, i) => (
              <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${i === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700/50'}`}>
                {r}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Settings className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Sistemas Ideales</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {systems.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <GitPullRequest className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Modelo de Juego</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 text-sm font-medium">
            Recomendado para equipos con <strong>{model.toLowerCase()}</strong>.
          </div>
        </div>

      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { BrainCircuit, AlertTriangle, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'

interface DecisionBoardProps {
  evalData: {
    scoutScore: number
    fit: number
    level: number
    potential: number
    risk: number
    status: string
    confidence: number
    urgency: string
    roles: string[]
    model: string
  }
  playerName: string
}

export function DecisionBoard({ evalData, playerName }: DecisionBoardProps) {
  const { scoutScore, fit, level, potential, risk, status, confidence, urgency, roles, model } = evalData

  // Determine status styles
  let statusColor = 'from-slate-500 to-slate-700'
  let StatusIcon = AlertTriangle
  
  if (status === 'PRIORITARIO') {
    statusColor = 'from-emerald-500 to-teal-600'
    StatusIcon = CheckCircle2
  } else if (status === 'RECOMENDADO') {
    statusColor = 'from-sky-500 to-blue-600'
    StatusIcon = TrendingUp
  } else if (status === 'DESCARTAR') {
    statusColor = 'from-red-500 to-rose-600'
    StatusIcon = XCircle
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
      
      {/* 1. AI SCOUT SCORE (Left block, col span 3) */}
      <div className="xl:col-span-3 bg-slate-900 border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full" />
        
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-4">
            <BrainCircuit className="w-5 h-5" />
            <h2 className="text-xs font-black uppercase tracking-widest">AI Scout Score</h2>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white tracking-tighter">{scoutScore}</span>
            <span className="text-slate-500 font-bold">/100</span>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <ScoreBar label="Encaje táctico" value={fit} color="bg-sky-500" />
          <ScoreBar label="Nivel actual" value={level} color="bg-emerald-500" />
          <ScoreBar label="Potencial" value={potential} color="bg-purple-500" />
          <ScoreBar label="Riesgo" value={risk} color="bg-red-500" />
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY (Center block, col span 6) */}
      <div className="xl:col-span-6 bg-slate-900 border border-slate-800/60 rounded-3xl p-6 lg:p-8 flex flex-col shadow-xl">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Executive Summary</h2>
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-slate-300 leading-relaxed text-lg font-medium">
            <strong className="text-white">{playerName}</strong> es un <span className="text-sky-300 font-bold">{roles[0]?.toLowerCase()}</span> altamente calificado que encaja perfectamente en un modelo de <span className="text-emerald-300 font-bold">{model.toLowerCase()}</span>. 
            Actualmente demuestra un rendimiento de élite ({level}/100) en su competición, destacando por su inteligencia táctica y ejecución técnica. 
            Su proyección de desarrollo sugiere que alcanzará un techo competitivo de {potential}/100 a corto-medio plazo.
          </p>
          <p className="text-slate-400 leading-relaxed mt-4">
            Debido a su alto encaje ({fit}%) y al bajo riesgo operativo asociado ({risk}%), el sistema de inteligencia artificial considera que su contratación sería estratégica y de impacto inmediato en la primera plantilla.
          </p>
        </div>
      </div>

      {/* 3. FINAL RECOMMENDATION (Right block, col span 3) */}
      <div className={`xl:col-span-3 rounded-3xl p-6 relative overflow-hidden shadow-xl bg-gradient-to-br ${statusColor} text-white flex flex-col justify-between`}>
        <div className="absolute top-0 left-0 w-full h-full bg-black/20" />
        <div className="absolute -right-8 -bottom-8 opacity-20">
          <StatusIcon className="w-48 h-48" />
        </div>

        <div className="relative z-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/70 mb-4">Recomendación Final</h2>
          <div className="flex items-center gap-3">
            <StatusIcon className="w-8 h-8 text-white" />
            <span className="text-3xl font-black tracking-tight">{status}</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4 mt-8">
          <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-xs font-bold text-white/70 uppercase">Confianza Modelo</span>
            <span className="font-black">{confidence}%</span>
          </div>
          <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-xs font-bold text-white/70 uppercase">Urgencia</span>
            <span className="font-black">{urgency}</span>
          </div>
          <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-xs font-bold text-white/70 uppercase">Rentabilidad (ROI)</span>
            <span className="font-black">{scoutScore > 80 ? 'Alta' : 'Media'}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

function ScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

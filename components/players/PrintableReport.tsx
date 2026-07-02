/* eslint-disable @next/next/no-img-element */
import React from 'react'
import type { PlayerWithClub, EnrichedMetric, SimilarPlayer } from '@/types/players'
import { SoccerPitch } from './SoccerPitch'

interface PrintableReportProps {
  player: PlayerWithClub
  metrics: EnrichedMetric[]
  similarPlayers: SimilarPlayer[]
}

export function PrintableReport({ player, metrics, similarPlayers }: PrintableReportProps) {
  // --- GENERATED DATA BASED ON PLAYER ---
  const age = player.birth_date ? new Date().getFullYear() - new Date(player.birth_date).getFullYear() : 25
  const overall = metrics.length > 0 ? metrics.reduce((acc, m) => acc + m.percentile, 0) / metrics.length : 75

  // Veredicto
  let veredicto = 'SEGUIR'
  let veredictoColor = 'text-amber-600 border-amber-600 bg-amber-50'
  if (overall > 85) { veredicto = 'PRIORITARIO'; veredictoColor = 'text-emerald-600 border-emerald-600 bg-emerald-50' }
  else if (overall > 70) { veredicto = 'RECOMENDADO'; veredictoColor = 'text-sky-600 border-sky-600 bg-sky-50' }
  else if (overall < 50) { veredicto = 'DESCARTAR'; veredictoColor = 'text-rose-600 border-rose-600 bg-rose-50' }

  // Tactical
  let recommendedRole = 'Rol de rotación'
  let idealSystems = ['4-3-3', '4-2-3-1']
  const posNames: Record<string, string> = { 'ST': 'delantero', 'W': 'extremo', 'AM': 'mediapunta', 'CM': 'interior', 'DM': 'pivote', 'FB': 'lateral', 'CB': 'central', 'GK': 'portero' }
  const posName = posNames[player.position] || 'jugador'
  
  if (player.position === 'ST') { recommendedRole = 'Delantero de referencia'; idealSystems = ['4-3-3', '4-4-2'] }
  if (player.position === 'W') { recommendedRole = player.preferred_foot === 'left' ? 'Extremo inverso' : 'Extremo clásico'; }
  if (player.position === 'CM') { recommendedRole = 'Organizador principal'; idealSystems = ['4-3-3', '3-5-2'] }
  if (player.position === 'CB') { recommendedRole = 'Central corrector'; idealSystems = ['4-3-3', '3-4-2-1'] }
  if (player.position === 'FB') { recommendedRole = 'Carrilero profundo'; idealSystems = ['4-2-3-1', '3-5-2'] }

  // Radar 8 dims (pick top 8 metrics)
  const radarDims = metrics.slice(0, 8).map(m => ({ label: m.label.substring(0, 15), val: m.percentile }))
  // Pad if less than 8
  while (radarDims.length < 8) radarDims.push({ label: 'N/A', val: 50 })

  // Strengths & Risks based on actual percentiles
  const sortedMetrics = [...metrics].sort((a, b) => b.percentile - a.percentile)
  const strengths = sortedMetrics.slice(0, 5).map(m => `Volumen élite en ${m.label.toLowerCase()} (P${m.percentile})`)
  const risks = sortedMetrics.slice(-4).reverse().map(m => `Margen de mejora en ${m.label.toLowerCase()} (P${m.percentile})`)

  // Executive summary text
  const m1 = sortedMetrics[0]?.label.toLowerCase() || 'acciones ofensivas'
  const m2 = sortedMetrics[1]?.label.toLowerCase() || 'distribución'
  const summaryText = `Perfil de ${posName} que destaca por un rendimiento sobresaliente en ${m1} y ${m2}. Su encaje táctico es óptimo para asumir el rol de ${recommendedRole.toLowerCase()} en sistemas ${idealSystems.join(' o ')}. ${overall > 70 ? 'Se recomienda encarecidamente su seguimiento debido a su impacto estadístico.' : 'Requiere mayor observación en contextos competitivos.'}`

  // Top KPIs
  const getVal = (search: string) => {
    const m = metrics.find(x => x.label.toLowerCase().includes(search))
    return m ? m.value.toFixed(2) : '--'
  }
  const topKPIs = [
    { label: 'Goles', val: getVal('goles'), sub: 'p90' },
    { label: 'Asist.', val: getVal('asistencia'), sub: 'p90' },
    { label: 'xG', val: getVal('xg') !== '--' ? getVal('xg') : getVal('tiros'), sub: 'p90' },
    { label: 'Pases', val: getVal('pases progresivos') !== '--' ? getVal('pases progresivos') : getVal('pases'), sub: 'p90' }
  ]

  // Economics
  const valEstimado = Math.max(1, Math.round((overall / 10) * Math.max(1, (35 - age))))
  const price = `€${valEstimado}M - €${valEstimado + 5}M`

  const PAGE_W = 1200
  const PAGE_H = 1697

  return (
    <div
      id="printable-report-container"
      className="absolute top-[-20000px] left-[-20000px] bg-slate-50 flex flex-col font-sans text-slate-900"
      style={{ width: `${PAGE_W}px` }}
    >
      {/* PÁGINA 1: EXECUTIVE REPORT */}
      <div style={{ height: `${PAGE_H}px` }} className="relative bg-white p-12 overflow-hidden flex flex-col gap-8 border-b border-slate-300">
        
        <header className="flex justify-between items-center pb-6 border-b border-slate-200">
          <div className="flex gap-6 items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
              {player.photo_url ? (
                <img src={player.photo_url} alt={player.last_name} className="w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <span className="text-4xl text-slate-400 font-bold">{player.first_name[0]}{player.last_name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                {player.first_name} <span className="text-slate-600">{player.last_name}</span>
              </h1>
              <div className="flex gap-4 mt-2 text-xl text-slate-600 font-medium items-center">
                <span className="flex items-center gap-2">
                  {player.club?.badge_url && (
                    <img src={player.club.badge_url} alt={player.club?.name} className="w-6 h-6 object-contain" crossOrigin="anonymous" />
                  )}
                  {player.club?.name || 'Agente Libre'}
                </span>
                <span>•</span>
                <span>{player.league || 'Sin Liga'}</span>
                <span>•</span>
                <span className="bg-slate-100 px-3 py-1 rounded-md text-slate-800 text-lg font-bold border border-slate-200">
                  {player.position}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-lg">
            <div className="flex justify-between gap-6 border-b border-slate-100 pb-1">
              <span className="text-slate-500">Edad</span>
              <span className="font-semibold">{player.birth_date ? new Date().getFullYear() - new Date(player.birth_date).getFullYear() : '--'}</span>
            </div>
            <div className="flex justify-between gap-6 border-b border-slate-100 pb-1">
              <span className="text-slate-500">Pierna</span>
              <span className="font-semibold capitalize">{player.preferred_foot === 'both' ? 'Ambas' : player.preferred_foot === 'left' ? 'Zurdo' : 'Diestro'}</span>
            </div>
            <div className="flex justify-between gap-6 border-b border-slate-100 pb-1">
              <span className="text-slate-500">Nacionalidad</span>
              <span className="font-semibold">{player.nationality}</span>
            </div>
            <div className="flex justify-between gap-6 border-b border-slate-100 pb-1">
              <span className="text-slate-500">Altura</span>
              <span className="font-semibold">1.82m</span>
            </div>
            <div className="flex justify-between gap-6 border-b border-slate-100 pb-1">
              <span className="text-slate-500">Valor</span>
              <span className="font-semibold">€25M</span>
            </div>
            <div className="flex justify-between gap-6 border-b border-slate-100 pb-1">
              <span className="text-slate-500">Contrato</span>
              <span className="font-semibold">Jun 2027</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-[1fr_2fr] gap-10">
          <div className="flex flex-col gap-4">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Veredicto AI</div>
            <div className={`text-4xl font-black px-6 py-4 rounded-xl border-2 ${veredictoColor} text-center`}>
              {veredicto}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2 text-center">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Encaje</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">{Math.min(99, Math.round(overall + 15))}%</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Nivel</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">{overall > 85 ? 'Élite' : overall > 70 ? 'Alto' : 'Rotación'}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Potencial</div>
                <div className={`text-2xl font-bold mt-1 ${age < 23 ? 'text-emerald-600' : age < 28 ? 'text-sky-600' : 'text-slate-600'}`}>{age < 23 ? 'Alto' : age < 28 ? 'Medio' : 'Bajo'}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Riesgo</div>
                <div className={`text-2xl font-bold mt-1 ${overall > 70 ? 'text-emerald-600' : 'text-amber-500'}`}>{overall > 70 ? 'Bajo' : 'Medio'}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Executive Summary</div>
            <p className="text-xl leading-relaxed text-slate-700 font-serif text-justify">
              {summaryText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr_1fr] gap-10 mt-6 flex-1">
          <div className="flex flex-col gap-8">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Fortalezas Clave</div>
              <ul className="flex flex-col gap-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 text-lg text-slate-800">
                    <span className="text-emerald-500 font-bold">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Riesgos / Limitaciones</div>
              <ul className="flex flex-col gap-3">
                {risks.map((r, i) => (
                  <li key={i} className="flex gap-3 text-lg text-slate-800">
                    <span className="text-rose-500 font-bold">×</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center relative">
            <svg viewBox="-150 -150 300 300" className="w-full h-full max-w-[360px]">
              {[20, 40, 60, 80, 100].map(r => (
                <circle key={r} r={r} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray={r === 100 ? "0" : "4 4"} />
              ))}
              {radarDims.map((dim, i) => {
                const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2
                const x = Math.cos(angle) * 100
                const y = Math.sin(angle) * 100
                const labelX = Math.cos(angle) * 125
                const labelY = Math.sin(angle) * 125
                return (
                  <g key={i}>
                    <line x1="0" y1="0" x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#64748b" fontWeight="bold">
                      {dim.label}
                    </text>
                  </g>
                )
              })}
              <polygon
                points={radarDims.map((dim, i) => {
                  const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2
                  return `${Math.cos(angle) * dim.val},${Math.sin(angle) * dim.val}`
                }).join(' ')}
                fill="rgba(14, 165, 233, 0.2)"
                stroke="#0284c7"
                strokeWidth="3"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Jugadores Similares</div>
              <div className="flex flex-col gap-4">
                {similarPlayers.slice(0, 5).map((sp, i) => (
                  <div key={sp.player.id || i} className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 text-xs flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                        {sp.player.photo_url ? <img src={sp.player.photo_url} alt={sp.player.last_name} className="w-full h-full object-cover" crossOrigin="anonymous"/> : sp.player.first_name[0]}
                      </div>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">{sp.player.first_name} {sp.player.last_name}</span>
                    </div>
                    <span className="font-bold text-sky-600">{sp.similarity.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Encaje Táctico</div>
              <div className="flex items-center gap-6">
                <div className="w-[100px] bg-green-50 p-1 border border-slate-200 rounded">
                  <SoccerPitch orientation="vertical">
                    <circle cx="34" cy="40" r="12" fill="rgba(20, 184, 166, 0.5)" stroke="#0d9488" strokeWidth="2" />
                    <circle cx="34" cy="40" r="3" fill="#0f766e" />
                  </SoccerPitch>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Rol Recomendado</div>
                    <div className="text-lg font-bold text-slate-800">{recommendedRole}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Sistemas Ideales</div>
                    <div className="flex gap-2 mt-1">
                      {idealSystems.map(s => (
                        <span key={s} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-sm font-bold text-slate-600">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PÁGINA 2: DATA EVIDENCE */}
      <div style={{ height: `${PAGE_H}px` }} className="relative bg-white p-12 overflow-hidden flex flex-col gap-8">
        
        <div className="text-4xl font-black text-slate-900 border-b border-slate-200 pb-4">Data Evidence</div>

        <div className="grid grid-cols-4 gap-6">
          {topKPIs.map(kpi => (
            <div key={kpi.label} className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center">
              <div className="text-sm font-bold uppercase text-slate-500 tracking-wider">{kpi.label}</div>
              <div className="text-6xl font-black text-slate-900 mt-2">{kpi.val} <span className="text-lg text-slate-400 font-normal">{kpi.sub}</span></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-12 mt-4 flex-1">
          <div className="flex flex-col gap-10">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 border-b border-slate-200 pb-2">Perfil en Percentiles</div>
              <div className="flex flex-col gap-4">
                {metrics.slice(0, 8).map(m => (
                  <div key={m.code} className="grid grid-cols-[200px_1fr_40px] items-center gap-4">
                    <span className="text-xl font-medium text-slate-700">{m.label}</span>
                    <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${m.percentile > 80 ? 'bg-sky-500' : m.percentile > 50 ? 'bg-slate-400' : 'bg-slate-300'}`} 
                        style={{ width: `${m.percentile}%` }} 
                      />
                    </div>
                    <span className="text-xl font-bold text-slate-900 text-right">{m.percentile}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Top 10 Métricas Absolutas</div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 text-sm text-slate-500 font-bold uppercase tracking-wider">Métrica</th>
                    <th className="py-3 text-sm text-slate-500 font-bold uppercase tracking-wider text-right">Valor P90</th>
                    <th className="py-3 text-sm text-slate-500 font-bold uppercase tracking-wider text-right">Percentil</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(0, 10).map((m, i) => (
                    <tr key={m.code || i} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 text-xl font-medium text-slate-800">{m.label}</td>
                      <td className="py-3 text-2xl font-black text-sky-600 text-right">{m.value.toFixed(2)}</td>
                      <td className="py-3 text-xl font-bold text-slate-900 text-right">{m.percentile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 text-center mb-2">Heatmap</div>
              <div className="w-[240px] mx-auto border border-slate-200 p-2 bg-green-50/50 rounded-xl">
                <SoccerPitch orientation="vertical">
                  <defs>
                    <radialGradient id="light-hot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="34" cy="40" r="25" fill="url(#light-hot)" style={{ mixBlendMode: 'multiply' }}/>
                  <circle cx="20" cy="50" r="18" fill="url(#light-hot)" style={{ mixBlendMode: 'multiply' }}/>
                  <circle cx="48" cy="30" r="20" fill="url(#light-hot)" style={{ mixBlendMode: 'multiply' }}/>
                </SoccerPitch>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col gap-4 mt-auto">
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2">Valoración Económica</div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Recomendado</span>
                <span className="text-xl font-bold">{price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Salario Estimado</span>
                <span className="text-xl font-bold">€{Math.max(0.5, Math.round((valEstimado/10)*10)/10)}M neto</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Rentabilidad (ROI)</span>
                <span className={`text-xl font-bold ${age < 26 && overall > 75 ? 'text-emerald-600' : 'text-slate-700'}`}>{age < 26 && overall > 75 ? 'Muy Alta' : overall > 60 ? 'Media' : 'Baja'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Urgencia</span>
                <span className={`text-xl font-bold ${overall > 85 ? 'text-rose-500' : overall > 70 ? 'text-amber-500' : 'text-slate-500'}`}>{overall > 85 ? 'Inmediata' : overall > 70 ? 'Alta' : 'Baja'}</span>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col gap-3 mt-4">
               <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 border-b border-slate-700 pb-2">Semáforo de Decisión</div>
               <div className="flex justify-between text-base font-medium"><span>Encaje Táctico</span> <span>{overall > 60 ? '🟢' : '🟡'}</span></div>
               <div className="flex justify-between text-base font-medium"><span>Rendimiento</span> <span>{overall > 80 ? '🟢' : overall > 60 ? '🟡' : '🔴'}</span></div>
               <div className="flex justify-between text-base font-medium"><span>Potencial</span> <span>{age < 25 ? '🟢' : age < 29 ? '🟡' : '🔴'}</span></div>
               <div className="flex justify-between text-base font-medium"><span>Riesgo</span> <span>{overall > 70 ? '🟢' : '🟡'}</span></div>
               <div className="flex justify-between text-base font-medium"><span>Rentabilidad</span> <span>{age < 26 && overall > 75 ? '🟢' : '🟡'}</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

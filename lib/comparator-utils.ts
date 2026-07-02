import { EnrichedMetric, MetricGroup, PlayerWithClub } from '../types/players'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * TACTICAL WEIGHTS PER GAME MODEL
 * Esto define qué métricas son más importantes según el modelo de juego seleccionado.
 * Los pesos son multiplicadores (1.0 = normal, >1.0 = importante, <1.0 = menos importante).
 */
export const MODEL_WEIGHTS: Record<string, Record<string, number>> = {
  // Juego de posición
  'Juego de posición': {
    'build_play': 1.5, 'link_up_play': 1.5, 'open_play_creation': 1.2, 'threat': 0.8,
    'pass_accuracy': 1.5, 'prog_passes': 1.3, 'xgbuildup': 1.4, 'key_passes': 1.2
  },
  // Presión alta / Gegenpressing
  'Presión alta / Gegenpressing': {
    'defending_oppo_half': 1.5, 'open_play_defending': 1.3, 'threat': 1.2, 'progression_play': 1.2,
    'recoveries': 1.5, 'gca': 1.3, 'tackles': 1.2, 'top_speed': 1.2, 'interceptions': 1.1
  },
  // Contraataque directo
  'Contraataque directo': {
    'progression_play': 1.5, 'threat': 1.4, 'open_play_finishing': 1.3, 'defending_own_half': 1.2, 'build_play': 0.7,
    'prog_carries': 1.5, 'top_speed': 1.4, 'through_balls': 1.3, 'goals': 1.3, 'pass_accuracy': 0.8
  },
  // Bloque bajo
  'Bloque bajo': {
    'defending_own_half': 1.5, 'defending_box': 1.5, 'open_play_defending': 1.2, 'open_play_creation': 0.8,
    'blocks': 1.5, 'clearances': 1.5, 'interceptions': 1.3, 'aerial_won': 1.2
  },
  // Fútbol total
  'Fútbol total': {
    'open_play_creation': 1.3, 'threat': 1.3, 'open_play_defending': 1.3, 'link_up_play': 1.2,
    'sca': 1.3, 'key_passes': 1.3, 'tackles': 1.2, 'prog_passes': 1.2
  },
}

export interface PlayerVerdictScore {
  playerId: string
  score: number
  bestMetrics: string[]
}

/**
 * Calcula el "score" táctico de cada jugador en base al modelo de juego.
 */
export function calculateVerdict(
  players: (PlayerWithClub & { metrics: EnrichedMetric[] })[],
  modelName: string
): PlayerVerdictScore[] {
  const weights = MODEL_WEIGHTS[modelName] || {}

  const scores = players.map(player => {
    let totalScore = 0
    let totalWeight = 0
    const metricContributions: { code: string, label: string, contribution: number }[] = []

    player.metrics.forEach(m => {
      const w = weights[m.code] || 1.0
      const val = m.percentile || 0
      const contribution = val * w
      totalScore += contribution
      totalWeight += w

      metricContributions.push({ code: m.code, label: m.label, contribution })
    })

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0

    // Top 3 métricas que más aportaron (relativo a su peso)
    metricContributions.sort((a, b) => b.contribution - a.contribution)
    const bestMetrics = metricContributions.slice(0, 3).map(mc => mc.label)

    return {
      playerId: player.id,
      score: finalScore,
      bestMetrics
    }
  })

  // Ordenar de mayor a menor score
  scores.sort((a, b) => b.score - a.score)
  return scores
}

export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
]

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${filename}.pdf`)
  } catch (err) {
    console.error('Failed to export PDF', err)
  }
}

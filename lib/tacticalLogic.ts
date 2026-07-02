import { EnrichedMetric, Position } from '@/types/players'

// Simple hash to get deterministic numbers from UUID
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function generatePlayerMetadata(id: string, age: number | null, position: Position | string) {
  const hash = hashString(id)
  
  // Height and weight based on position roughly
  let baseHeight = 180
  if (['CB', 'GK'].includes(position)) baseHeight = 188
  if (['W', 'LW', 'RW', 'FB', 'RB', 'LB'].includes(position)) baseHeight = 175
  
  const height = baseHeight + (hash % 15) - 5
  const weight = height - 100 + ((hash >> 2) % 10) - 5
  
  // Contract
  const currentYear = new Date().getFullYear()
  const contractEnd = currentYear + (hash % 5) + 1
  
  // Value
  // Younger = more value multiplier
  const ageMult = age ? (age < 23 ? 2 : age > 30 ? 0.5 : 1) : 1
  const marketValue = Math.round((20 + (hash % 80)) * ageMult)
  
  return {
    height,
    weight,
    contractEnd,
    marketValue,
    matches: 25 + (hash % 15)
  }
}

export function evaluatePlayer(id: string, metrics: EnrichedMetric[], position: Position | string, age: number | null) {
  if (!metrics || metrics.length === 0) {
    return {
      scoutScore: 50,
      fit: 50,
      level: 50,
      potential: 50,
      risk: 50,
      strengths: [],
      weaknesses: [],
      evolution: [],
      roles: ['Desconocido'],
      systems: ['4-3-3'],
      model: 'Equilibrado',
      status: 'SEGUIR',
      confidence: 50,
      urgency: 'Media',
      trend: 'Estable'
    }
  }

  // Calculate overall performance level (average of percentiles)
  const avgPercentile = metrics.reduce((acc, m) => acc + m.percentile, 0) / metrics.length
  
  // Deterministic noise
  const hash = hashString(id)
  
  const level = Math.round(avgPercentile)
  const fit = Math.min(99, Math.round(avgPercentile + ((hash % 10) - 5) + 5)) // slightly inflated fit usually
  
  // Potential based on age
  const pAge = age ?? 25
  let potBase = level
  if (pAge < 21) potBase += 15
  else if (pAge < 24) potBase += 10
  else if (pAge < 28) potBase += 4
  else potBase -= (pAge - 28) * 2
  
  const potential = Math.min(99, Math.max(level, Math.round(potBase)))
  
  // Risk (older = higher injury risk usually, lower level = higher sport risk)
  const risk = Math.min(99, Math.max(5, 100 - level + (pAge > 30 ? 15 : 0) - (hash % 15)))
  
  const scoutScore = Math.round((level * 0.5) + (potential * 0.3) + (fit * 0.2))

  // Strengths & Weaknesses
  const sorted = [...metrics].sort((a, b) => b.percentile - a.percentile)
  const strengths = sorted.slice(0, 5).map(m => m.label)
  const weaknesses = sorted.slice(-4).reverse().map(m => m.label)

  // Tactical
  let roles = ['Jugador de equipo']
  let systems = ['4-3-3', '4-2-3-1']
  let model = 'Juego posicional'

  if (['CB'].includes(position)) { roles = ['Central marcador', 'Líbero']; systems = ['4-3-3', '3-5-2']; model = 'Defensa adelantada' }
  if (['FB', 'RB', 'LB'].includes(position)) { roles = ['Carrilero', 'Lateral Invertido']; model = 'Juego exterior' }
  if (['DM'].includes(position)) { roles = ['Pivote organizador', 'Ancla']; systems = ['4-3-3', '4-1-4-1']; model = 'Posicional' }
  if (['CM', 'BBM'].includes(position)) { roles = ['Box-to-Box', 'Organizador']; model = 'Juego de posesión' }
  if (['AM', 'SS'].includes(position)) { roles = ['Enganche', 'Mediapunta']; systems = ['4-2-3-1']; model = 'Juego interior' }
  if (['W', 'RW', 'LW'].includes(position)) { roles = ['Extremo a pie cambiado', 'Desborde']; model = 'Transiciones rápidas' }
  if (['ST', 'CF'].includes(position)) { roles = ['Hombre objetivo', 'Falso 9']; systems = ['4-3-3', '4-4-2']; model = 'Fútbol directo' }
  if (['GK'].includes(position)) { roles = ['Portero líbero', 'Shot stopper']; systems = ['Cualquiera']; model = 'Salida lavolpiana' }

  // Status
  let status = 'SEGUIR'
  if (scoutScore > 85) status = 'PRIORITARIO'
  else if (scoutScore > 75) status = 'RECOMENDADO'
  else if (scoutScore < 50) status = 'DESCARTAR'

  // Evolution history
  const evolution = []
  const startYear = new Date().getFullYear() - 4
  let currentVal = level - 20
  for(let i=0; i<5; i++) {
    evolution.push({
      year: (startYear + i).toString(),
      score: Math.min(99, Math.max(40, currentVal + (hash%10) - 5)),
      value: Math.round(10 + (hash % 50) + (i * 5))
    })
    currentVal += 5
  }
  // Ensure last point matches current level
  evolution[4].score = scoutScore

  // Trend
  let trend = 'Estable'
  if (evolution[4].score > evolution[3].score + 3) trend = 'Crecimiento'
  else if (evolution[4].score < evolution[3].score - 3) trend = 'Descenso'

  return {
    scoutScore,
    fit,
    level,
    potential,
    risk,
    strengths,
    weaknesses,
    evolution,
    roles,
    systems,
    model,
    status,
    confidence: 80 + (hash % 15),
    urgency: scoutScore > 85 ? 'Inmediata' : scoutScore > 75 ? 'Próxima ventana' : 'Baja',
    trend
  }
}

export function generateScoutHistory(id: string) {
  const hash = hashString(id)
  const numNotes = (hash % 3) + 1
  const scouts = ['Carlos F.', 'David M.', 'Ana R.', 'Roberto G.']
  const dates = ['12 Oct 2025', '03 Ene 2026', '15 Mar 2026', '20 May 2026']
  
  const comments = [
    'Destaca por su capacidad para romper líneas con pases tensos. Necesita mejorar en duelos aéreos.',
    'Gran inteligencia táctica, siempre bien perfilado. Físicamente aún tiene margen de mejora.',
    'Ha evolucionado mucho en la toma de decisiones en el último tercio. Sigue siendo muy dependiente de su pierna dominante.',
    'Rendimiento muy consistente. Liderazgo en el campo y actitud impecable en entrenamientos.',
    'Físicamente es un portento, pero a veces pierde la concentración en marcajes individuales.'
  ]

  const history = []
  for (let i = 0; i < numNotes; i++) {
    history.push({
      date: dates[(hash + i) % dates.length],
      scout: scouts[(hash + i) % scouts.length],
      comment: comments[(hash + i) % comments.length]
    })
  }

  // sort by date string (dummy sort)
  return history.reverse()
}

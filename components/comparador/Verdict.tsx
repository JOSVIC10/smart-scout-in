import React, { useMemo } from 'react'
import { EnrichedMetric, PlayerWithClub } from '@/types/players'
import { calculateVerdict, CHART_COLORS } from '@/lib/comparator-utils'
import { Trophy, CheckCircle2 } from 'lucide-react'

interface Props {
  players: (PlayerWithClub & { metrics: EnrichedMetric[] })[]
  modelName: string
}

export default function Verdict({ players, modelName }: Props) {
  
  const verdict = useMemo(() => {
    return calculateVerdict(players, modelName)
  }, [players, modelName])

  if (players.length === 0 || verdict.length === 0) return null

  const winnerData = verdict[0]
  const winnerPlayer = players.find(p => p.id === winnerData.playerId)
  const winnerIndex = players.findIndex(p => p.id === winnerData.playerId)
  
  if (!winnerPlayer) return null
  
  const color = CHART_COLORS[winnerIndex % CHART_COLORS.length]

  return (
    <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-full text-primary mt-1">
          <Trophy className="w-8 h-8" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-black mb-1">
            Veredicto Automático: <span style={{ color }}>{winnerPlayer.first_name} {winnerPlayer.last_name}</span>
          </h3>
          <p className="text-muted-foreground mb-4">
            Mejor encaje táctico para el modelo <strong>"{modelName}"</strong>.
          </p>

          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <p className="text-sm leading-relaxed text-foreground">
              Según las ponderaciones algorítmicas de <strong>Smart Scout In</strong> para este modelo de juego, 
              <span className="font-semibold mx-1">{winnerPlayer.last_name}</span> 
              obtiene la mayor puntuación de compatibilidad ({winnerData.score.toFixed(1)} / 100).
            </p>
            <p className="text-sm mt-2 text-muted-foreground">
              Destaca especialmente en las métricas clave demandadas por esta idea de juego:
            </p>
            
            <ul className="mt-3 space-y-2">
              {winnerData.bestMetrics.map((metricLabel, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {metricLabel}
                </li>
              ))}
            </ul>
          </div>
          
          {players.length > 1 && (
            <p className="text-xs text-muted-foreground">
              En segundo lugar queda <strong>{players.find(p => p.id === verdict[1].playerId)?.last_name}</strong> con {verdict[1].score.toFixed(1)} puntos de compatibilidad.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

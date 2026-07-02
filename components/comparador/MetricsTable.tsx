import React, { useMemo } from 'react'
import { EnrichedMetric, PlayerWithClub, RADAR_METRIC_ORDER } from '@/types/players'
import { CHART_COLORS } from '@/lib/comparator-utils'

interface Props {
  players: (PlayerWithClub & { metrics: EnrichedMetric[] })[]
}

export default function MetricsTable({ players }: Props) {
  
  // Determine if using new metrics
  const isNewMetrics = players[0]?.metrics.some(m => m.code === 'goals' || m.code === 'xg')

  const metricCodes = useMemo(() => {
    if (!isNewMetrics) return RADAR_METRIC_ORDER
    const codes = new Set<string>()
    players.forEach(p => p.metrics.forEach(m => codes.add(m.code)))
    return Array.from(codes)
  }, [players, isNewMetrics])

  // Calculate which player has the best percentile for each metric
  const bestPerMetric = useMemo(() => {
    const bests: Record<string, number> = {}
    
    metricCodes.forEach(code => {
      let maxVal = -1
      
      players.forEach((p, idx) => {
        const m = p.metrics.find(metric => metric.code === code)
        const val = m?.percentile || 0
        if (val > maxVal) {
          maxVal = val
        }
      })
      
      bests[code] = maxVal
    })
    
    return bests
  }, [players, metricCodes])

  if (players.length === 0) return null

  // Get labels
  const labelsMap: Record<string, string> = {}
  players.forEach(p => {
    p.metrics.forEach(m => {
      labelsMap[m.code] = m.label
    })
  })

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-bold">Comparativa de Métricas (Percentil)</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-semibold w-1/4 min-w-[200px]">Métrica</th>
              {players.map((p, idx) => (
                <th key={p.id} className="px-6 py-3 font-bold text-center min-w-[120px]" style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                  {p.last_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {metricCodes.map(code => {
              const label = labelsMap[code] || code
              const maxVal = bestPerMetric[code]
              
              return (
                <tr key={code} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">{label}</td>
                  
                  {players.map((p, idx) => {
                    const m = p.metrics.find(metric => metric.code === code)
                    const val = m?.percentile || 0
                    
                    // Highlight if it's the best and it's > 0
                    const isBest = val === maxVal && val > 0
                    
                    return (
                      <td key={`${p.id}-${code}`} className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-bold ${
                          isBest 
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' 
                            : 'text-muted-foreground'
                        }`}>
                          {val}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

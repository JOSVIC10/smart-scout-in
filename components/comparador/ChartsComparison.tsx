import React, { useMemo } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts'
import { EnrichedMetric, PlayerWithClub, RADAR_METRIC_ORDER } from '@/types/players'
import { CHART_COLORS } from '@/lib/comparator-utils'

interface Props {
  players: (PlayerWithClub & { metrics: EnrichedMetric[] })[]
}

export default function ChartsComparison({ players }: Props) {
  // 1. Prepare Radar Data
  const radarData = useMemo(() => {
    return RADAR_METRIC_ORDER.map(metricCode => {
      // Find label for this metric code from the first player's metrics (or any)
      const anyPlayerMetric = players[0]?.metrics.find(m => m.code === metricCode)
      const label = anyPlayerMetric?.label || metricCode

      const dataPoint: any = { metric: label, fullMark: 100 }
      
      players.forEach((p, idx) => {
        const pm = p.metrics.find(m => m.code === metricCode)
        dataPoint[`player_${idx}`] = pm ? pm.percentile : 0
      })

      return dataPoint
    })
  }, [players])

  // 2. Prepare Group Bar Data (Offensive, Defensive, Possession)
  const barData = useMemo(() => {
    const groups = ['offensive', 'defensive', 'possession']
    
    return groups.map(group => {
      const dataPoint: any = { group: group.toUpperCase() }
      
      players.forEach((p, idx) => {
        const groupMetrics = p.metrics.filter(m => m.group === group)
        const avg = groupMetrics.length > 0 
          ? groupMetrics.reduce((sum, m) => sum + (m.percentile || 0), 0) / groupMetrics.length
          : 0
        
        dataPoint[`player_${idx}`] = Math.round(avg)
      })

      return dataPoint
    })
  }, [players])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Radar Chart */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col items-center">
        <h3 className="text-lg font-bold mb-4">Perfil Completo (Radar)</h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              
              {players.map((p, idx) => (
                <Radar
                  key={p.id}
                  name={p.last_name}
                  dataKey={`player_${idx}`}
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Group Bar Chart */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col items-center">
        <h3 className="text-lg font-bold mb-4">Promedio por Fase del Juego</h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="group" tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <RechartsTooltip
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {players.map((p, idx) => (
                <Bar 
                  key={p.id}
                  name={p.last_name} 
                  dataKey={`player_${idx}`} 
                  fill={CHART_COLORS[idx % CHART_COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

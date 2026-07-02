'use client'

import React, { useState, useMemo } from 'react'
import { EnrichedMetric, PlayerWithClub, Position } from '@/types/players'
import PlayerSelector from './PlayerSelector'
import ChartsComparison from './ChartsComparison'
import MetricsTable from './MetricsTable'
import Verdict from './Verdict'
import { exportToPDF } from '@/lib/comparator-utils'
import { Download } from 'lucide-react'

interface GameModel {
  id: string
  name: string
  description: string
}

type PlayerWithMetrics = PlayerWithClub & { metrics: EnrichedMetric[] }

interface Props {
  allPlayers: PlayerWithMetrics[]
  gameModels: GameModel[]
}

const POSITIONS: Position[] = [
  'GK', 'CB', 'FB', 'RB', 'LB', 'DM', 'CM', 'BBM', 'AM', 'W', 'RW', 'LW', 'SS', 'CF', 'ST'
]

export default function ComparatorClient({ allPlayers, gameModels }: Props) {
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerWithMetrics[]>([])
  const [positionFilter, setPositionFilter] = useState<Position | ''>('')
  const [modelFilter, setModelFilter] = useState<string>(gameModels[0]?.name || '')
  
  const [isExporting, setIsExporting] = useState(false)

  // Filteed players for the selector
  const availablePlayers = useMemo(() => {
    return allPlayers.filter(p => {
      // Don't show already selected players
      if (selectedPlayers.some(sp => sp.id === p.id)) return false
      // Filter by position
      if (positionFilter && p.position !== positionFilter) return false
      return true
    })
  }, [allPlayers, selectedPlayers, positionFilter])

  const handleAddPlayer = (player: PlayerWithMetrics) => {
    if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, player])
    }
  }

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))
  }

  const handleExport = async () => {
    setIsExporting(true)
    await exportToPDF('comparador-report', 'Comparativa_Jugadores')
    setIsExporting(false)
  }

  const canCompare = selectedPlayers.length >= 1

  return (
    <div className="space-y-8">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1">Posición</label>
            <select
              className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value as Position)}
            >
              <option value="">Cualquiera</option>
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1">Modelo de Juego</label>
            <select
              className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
            >
              {gameModels.map(model => (
                <option key={model.id} value={model.name}>{model.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={!canCompare || isExporting}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>

      {/* Main Content Area to Export */}
      <div id="comparador-report" className="space-y-8 bg-background p-4 rounded-xl -mx-4 sm:mx-0">
        
        {/* Player Selector & Header */}
        <PlayerSelector
          selectedPlayers={selectedPlayers}
          availablePlayers={availablePlayers}
          onAdd={handleAddPlayer}
          onRemove={handleRemovePlayer}
        />

        {canCompare ? (
          <>
            {/* Charts Section */}
            <ChartsComparison players={selectedPlayers} />

            {/* Verdict Section */}
            <Verdict players={selectedPlayers} modelName={modelFilter} />

            {/* Detailed Table */}
            <MetricsTable players={selectedPlayers} />
          </>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Selecciona entre 1 y 5 jugadores para comenzar la comparación.</p>
          </div>
        )}
      </div>
    </div>
  )
}

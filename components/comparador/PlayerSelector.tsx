import React, { useState } from 'react'
import Image from 'next/image'
import { PlayerWithClub } from '@/types/players'
import { CHART_COLORS } from '@/lib/comparator-utils'
import { Plus, X } from 'lucide-react'

interface Props<T extends PlayerWithClub = PlayerWithClub> {
  selectedPlayers: T[]
  availablePlayers: T[]
  onAdd: (player: T) => void
  onRemove: (playerId: string) => void
}

export default function PlayerSelector<T extends PlayerWithClub>({ selectedPlayers, availablePlayers, onAdd, onRemove }: Props<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredAvailable = availablePlayers.filter(p => {
    const term = search.toLowerCase()
    return (
      p.first_name.toLowerCase().includes(term) ||
      p.last_name.toLowerCase().includes(term) ||
      p.club?.name.toLowerCase().includes(term)
    )
  })

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-bold text-foreground">Jugadores Seleccionados</h2>
      
      <div className="flex flex-wrap gap-4">
        {selectedPlayers.map((player, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length]
          return (
            <div 
              key={player.id} 
              className="relative flex items-center gap-3 p-3 pr-8 bg-card border rounded-lg shadow-sm w-64"
              style={{ borderColor: color }}
            >
              <button 
                onClick={() => onRemove(player.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove player"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Player Photo */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2" style={{ borderColor: color }}>
                {player.photo_url ? (
                  <Image src={player.photo_url} alt={player.last_name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {player.first_name[0]}{player.last_name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: color }}>
                  {player.first_name} {player.last_name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  {player.club?.badge_url && (
                    <Image src={player.club.badge_url} alt={player.club.name} width={12} height={12} className="w-3 h-3 object-contain" unoptimized />
                  )}
                  {player.club?.name || 'Agente Libre'}
                </p>
              </div>
            </div>
          )
        })}

        {selectedPlayers.length < 5 && (
          <div className="relative w-64">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-full h-full min-h-[74px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-sm font-medium">Añadir Jugador</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 p-2">
                <input
                  type="text"
                  placeholder="Buscar jugador..."
                  className="w-full mb-2 bg-background border border-input rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {filteredAvailable.length === 0 ? (
                    <p className="text-sm text-center py-4 text-muted-foreground">No hay jugadores disponibles.</p>
                  ) : (
                    filteredAvailable.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onAdd(p)
                          setIsOpen(false)
                          setSearch('')
                        }}
                        className="flex items-center gap-2 w-full text-left px-2 py-2 rounded hover:bg-muted transition-colors"
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                          {p.photo_url ? (
                            <Image src={p.photo_url} alt={p.last_name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {p.first_name[0]}{p.last_name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.first_name} {p.last_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.position} · {p.club?.name}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

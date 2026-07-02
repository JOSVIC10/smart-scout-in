'use client'

import React, { useState } from 'react'
import type { PlayerWithClub } from '@/types/players'
import { DraggablePlayer } from './DraggablePlayer'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface PlayerPoolProps {
  players: PlayerWithClub[]
  assignedPlayerIds: Set<string>
}

export function PlayerPool({ players, assignedPlayerIds }: PlayerPoolProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const availablePlayers = players.filter(p => !assignedPlayerIds.has(p.id))

  const filteredPlayers = availablePlayers.filter(p => 
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const PoolContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Plantilla ({availablePlayers.length})</h2>
          {/* Close button for mobile inside the drawer body if needed, but handled by the header */}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o pos..." 
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1 space-y-2 pb-24 lg:pb-4">
        {filteredPlayers.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-10">
            No hay jugadores disponibles.
          </div>
        ) : (
          filteredPlayers.map(p => (
            <DraggablePlayer key={p.id} player={p} />
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block w-80 bg-card border-l border-border h-full flex-shrink-0">
        <PoolContent />
      </div>

      {/* Mobile Drawer View */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-2xl transition-transform duration-300 z-40 ${
        isOpenMobile ? 'translate-y-0 h-[70vh]' : 'translate-y-[calc(100%-3.5rem)]'
      }`}>
        <button 
          className="w-full flex items-center justify-center p-4 border-b bg-muted/30"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
        >
          <div className="flex items-center gap-2 font-bold">
            Plantilla ({availablePlayers.length})
            {isOpenMobile ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </button>
        <div className="h-[calc(70vh-3.5rem)] overflow-hidden">
          <PoolContent />
        </div>
      </div>
      
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}
    </>
  )
}

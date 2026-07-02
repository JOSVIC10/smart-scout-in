'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Plus, RefreshCw, Users, TrendingUp, Filter, FileUp } from 'lucide-react'
import { PlayerCard } from '@/components/players/PlayerCard'
import { PlayerFilters } from '@/components/players/PlayerFilters'
import { AddPlayerModal } from '@/components/players/AddPlayerModal'
import { ImportCsvModal } from '@/components/players/ImportCsvModal'
import { getPlayers, getClubs } from '@/lib/playersApi'
import type { PlayerWithClub, PlayerFilters as Filters, Club } from '@/types/players'

const EMPTY_FILTERS: Filters = {
  search: '',
  position: '',
  clubId: '',
  nationality: '',
  foot: '',
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerWithClub[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPlayers(filters)
      setPlayers(data)
    } catch (err) {
      setError('Error al cargar los jugadores. Verifica la conexión con Supabase.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    getClubs().then(setClubs).catch(console.error)
  }, [])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const avgRating =
    players.length > 0
      ? (
          players.reduce((s, p) => s + (p.overall_rating ?? 0), 0) / players.length
        ).toFixed(1)
      : '—'

  const totalMinutes = players
    .reduce((s, p) => s + p.minutes_played, 0)
    .toLocaleString()

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Page header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-[#0a0f1e] border-b border-slate-800/60 px-6 py-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                  Base de datos
                </span>
              </div>
              <h1 className="text-3xl font-black text-white">
                Jugadores
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Gestiona y analiza el rendimiento de tus jugadores scouting
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-sm hover:bg-slate-700 transition-all shadow-lg"
              >
                <FileUp className="w-4 h-4" />
                Importar CSV
              </button>
              <button
                id="open-add-player-modal"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-950/40 transition-all"
              >
                <Plus className="w-4 h-4" />
                Añadir jugador
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Total jugadores', value: players.length.toString(), icon: Users },
              { label: 'Rating promedio', value: avgRating, icon: TrendingUp },
              { label: 'Minutos totales', value: totalMinutes, icon: Filter },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="glass-card rounded-xl p-4 border border-slate-800/60 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{stat.label}</p>
                    <p className="text-slate-100 font-black text-lg leading-tight">{stat.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="mb-6">
          <PlayerFilters
            filters={filters}
            clubs={clubs}
            onChange={setFilters}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
            <span className="text-sm">{error}</span>
            <button
              onClick={fetchPlayers}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold hover:text-red-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-slate-800/60" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Players grid */}
        {!loading && players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-slate-200 font-bold text-lg mb-2">No se encontraron jugadores</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Ajusta los filtros o añade un nuevo jugador a la base de datos.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-all"
              >
                <FileUp className="w-4 h-4" />
                Importar CSV
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Añadir primer jugador
              </button>
            </div>
          </div>
        )}

        {!loading && players.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">
                <span className="text-slate-200 font-bold">{players.length}</span> jugadores encontrados
              </p>
              <button
                onClick={fetchPlayers}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <AddPlayerModal
          clubs={clubs}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            fetchPlayers()
            getClubs().then(setClubs)
          }}
        />
      )}
      
      {showImportModal && (
        <ImportCsvModal 
          isOpen={showImportModal} 
          onClose={() => setShowImportModal(false)} 
          onSuccess={() => {
            fetchPlayers()
            getClubs().then(setClubs)
          }} 
        />
      )}
    </div>
  )
}

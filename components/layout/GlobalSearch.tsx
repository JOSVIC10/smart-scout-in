"use client"

import * as React from "react"
import { Search, X, User as UserIcon, Shield, Sparkles, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"

interface PlayerSearchResult {
  id: string
  first_name: string
  last_name: string
  position: string
  overall_rating: number
  clubs?: { name: string } | null
  photo_url?: string | null
}

const FALLBACK_PLAYERS: PlayerSearchResult[] = [
  { id: "b1000000-0000-0000-0000-000000000004", first_name: "Rodri", last_name: "Hernández", position: "DM", overall_rating: 91.5, clubs: { name: "Manchester City" } },
  { id: "b1000000-0000-0000-0000-000000000008", first_name: "Florian", last_name: "Wirtz", position: "AM", overall_rating: 90.0, clubs: { name: "Bayer Leverkusen" } },
  { id: "b1000000-0000-0000-0000-000000000003", first_name: "Phil", last_name: "Foden", position: "AM", overall_rating: 89.0, clubs: { name: "Manchester City" } },
  { id: "b1000000-0000-0000-0000-000000000001", first_name: "Pedri", last_name: "González", position: "CM", overall_rating: 88.5, clubs: { name: "FC Barcelona" } },
  { id: "b1000000-0000-0000-0000-000000000005", first_name: "Jamal", last_name: "Musiala", position: "AM", overall_rating: 87.0, clubs: { name: "Bayern München" } },
  { id: "b1000000-0000-0000-0000-000000000002", first_name: "Lamine", last_name: "Yamal", position: "W", overall_rating: 85.0, clubs: { name: "FC Barcelona" } },
]

export function GlobalSearch() {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [results, setResults] = React.useState<PlayerSearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("players")
          .select("id, first_name, last_name, position, overall_rating, photo_url, clubs(name)")
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,position.ilike.%${query}%`)
          .limit(6)

        if (error || !data || data.length === 0) {
          // Fallback search in memory
          const q = query.toLowerCase()
          const filtered = FALLBACK_PLAYERS.filter(
            (p) =>
              p.first_name.toLowerCase().includes(q) ||
              p.last_name.toLowerCase().includes(q) ||
              p.position.toLowerCase().includes(q) ||
              (p.clubs?.name && p.clubs.name.toLowerCase().includes(q))
          )
          setResults(filtered)
        } else {
          // Cast typed output
          const mapped: PlayerSearchResult[] = data.map((item: any) => ({
            id: item.id,
            first_name: item.first_name,
            last_name: item.last_name,
            position: item.position,
            overall_rating: Number(item.overall_rating) || 0,
            clubs: item.clubs ? { name: item.clubs.name } : null,
            photo_url: item.photo_url,
          }))
          setResults(mapped)
        }
      } catch {
        const q = query.toLowerCase()
        setResults(
          FALLBACK_PLAYERS.filter(
            (p) =>
              p.first_name.toLowerCase().includes(q) ||
              p.last_name.toLowerCase().includes(q) ||
              p.position.toLowerCase().includes(q)
          )
        )
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (playerId: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/players?search=${encodeURIComponent(playerId)}`)
  }

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar jugador por nombre, posición o equipo..."
          className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && (query.trim() !== "" || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-3">
            <span>Resultados de búsqueda</span>
            {loading && <span className="animate-pulse text-emerald-400">Buscando...</span>}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/40">
            {results.length > 0 ? (
              results.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelect(player.id)}
                  className="w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                      {player.first_name[0]}
                      {player.last_name[0]}
                    </div>
                    <div>
                      <div className="text-xs md:text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {player.first_name} {player.last_name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{player.clubs?.name || "Sin club"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5 font-bold">
                      {player.position}
                    </Badge>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {player.overall_rating}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))
            ) : !loading ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No se encontraron jugadores que coincidan con &quot;{query}&quot;
              </div>
            ) : null}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-950/40 text-center">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push(`/players?search=${encodeURIComponent(query)}`)
              }}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              Ver todos los resultados en Jugadores <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  Building2,
  Video,
  FileText,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  BarChart2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar } from "@/components/ui/avatar"
import { PositionChart, PositionCount } from "./PositionChart"

interface DashboardStats {
  playersCount: number
  clubsCount: number
  videosCount: number
  templatesCount: number
}

interface PlayerItem {
  id: string
  first_name: string
  last_name: string
  position: string
  preferred_foot?: string
  overall_rating: number
  photo_url?: string | null
  league?: string | null
  clubs?: { name: string; country?: string } | null
  created_at?: string
}

const FALLBACK_PLAYERS: PlayerItem[] = [
  {
    id: "b1000000-0000-0000-0000-000000000004",
    first_name: "Rodri",
    last_name: "Hernández",
    position: "DM",
    preferred_foot: "right",
    overall_rating: 91.5,
    league: "Premier League",
    clubs: { name: "Manchester City", country: "England" },
  },
  {
    id: "b1000000-0000-0000-0000-000000000008",
    first_name: "Florian",
    last_name: "Wirtz",
    position: "AM",
    preferred_foot: "right",
    overall_rating: 90.0,
    league: "Bundesliga",
    clubs: { name: "Bayer Leverkusen", country: "Germany" },
  },
  {
    id: "b1000000-0000-0000-0000-000000000003",
    first_name: "Phil",
    last_name: "Foden",
    position: "AM",
    preferred_foot: "left",
    overall_rating: 89.0,
    league: "Premier League",
    clubs: { name: "Manchester City", country: "England" },
  },
  {
    id: "b1000000-0000-0000-0000-000000000001",
    first_name: "Pedri",
    last_name: "González",
    position: "CM",
    preferred_foot: "right",
    overall_rating: 88.5,
    league: "La Liga",
    clubs: { name: "FC Barcelona", country: "Spain" },
  },
  {
    id: "b1000000-0000-0000-0000-000000000005",
    first_name: "Jamal",
    last_name: "Musiala",
    position: "AM",
    preferred_foot: "right",
    overall_rating: 87.0,
    league: "Bundesliga",
    clubs: { name: "Bayern München", country: "Germany" },
  },
  {
    id: "b1000000-0000-0000-0000-000000000002",
    first_name: "Lamine",
    last_name: "Yamal",
    position: "W",
    preferred_foot: "left",
    overall_rating: 85.0,
    league: "La Liga",
    clubs: { name: "FC Barcelona", country: "Spain" },
  },
]

const POSITION_MAP: { [key: string]: { label: string; color: string } } = {
  GK: { label: "Porteros", color: "#6366f1" },       // Indigo
  CB: { label: "Centrales", color: "#3b82f6" },      // Blue
  FB: { label: "Laterales", color: "#0ea5e9" },      // Sky
  DM: { label: "Pivotes", color: "#10b981" },        // Emerald
  CM: { label: "Mediocentros", color: "#22c55e" },   // Green
  AM: { label: "Mediapuntas", color: "#eab308" },    // Yellow
  W:  { label: "Extremos", color: "#f97316" },       // Orange
  ST: { label: "Delanteros", color: "#ef4444" },     // Red
}

interface SupabasePlayerRow {
  id: string
  first_name: string
  last_name: string
  position: string
  preferred_foot?: string
  overall_rating?: number | string
  photo_url?: string | null
  league?: string | null
  clubs?: { name: string; country?: string } | null
}

export function DashboardView() {
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<DashboardStats>({
    playersCount: 8,
    clubsCount: 5,
    videosCount: 4,
    templatesCount: 5,
  })
  const [latestPlayers, setLatestPlayers] = React.useState<PlayerItem[]>(FALLBACK_PLAYERS)
  const [topPlayers, setTopPlayers] = React.useState<PlayerItem[]>(FALLBACK_PLAYERS)
  const [positionData, setPositionData] = React.useState<PositionCount[]>([])

  React.useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        // Fetch counts from Supabase
        const [playersRes, clubsRes, videosRes, templatesRes] = await Promise.all([
          supabase.from("players").select("*", { count: "exact", head: true }),
          supabase.from("clubs").select("*", { count: "exact", head: true }),
          supabase.from("videos").select("*", { count: "exact", head: true }),
          supabase.from("templates").select("*", { count: "exact", head: true }),
        ])

        const pCount = playersRes.count !== null && playersRes.count !== undefined ? playersRes.count : 8
        const cCount = clubsRes.count !== null && clubsRes.count !== undefined ? clubsRes.count : 5
        const vCount = videosRes.count !== null && videosRes.count !== undefined ? videosRes.count : 4
        const tCount = templatesRes.count !== null && templatesRes.count !== undefined ? templatesRes.count : 5

        setStats({
          playersCount: pCount,
          clubsCount: cCount,
          videosCount: vCount,
          templatesCount: tCount,
        })

        // Fetch latest players with club details
        const { data: latestData } = await supabase
          .from("players")
          .select("id, first_name, last_name, position, preferred_foot, overall_rating, photo_url, league, created_at, clubs(name, country)")
          .order("created_at", { ascending: false })
          .limit(6)

        if (latestData && latestData.length > 0) {
          const mappedLatest: PlayerItem[] = (latestData as unknown as SupabasePlayerRow[]).map((p) => ({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            position: p.position,
            preferred_foot: p.preferred_foot,
            overall_rating: Number(p.overall_rating) || 0,
            photo_url: p.photo_url,
            league: p.league,
            clubs: p.clubs ? { name: p.clubs.name, country: p.clubs.country } : null,
          }))
          setLatestPlayers(mappedLatest)
        }

        // Fetch top rated players
        const { data: topData } = await supabase
          .from("players")
          .select("id, first_name, last_name, position, preferred_foot, overall_rating, photo_url, league, clubs(name, country)")
          .order("overall_rating", { ascending: false })
          .limit(5)

        if (topData && topData.length > 0) {
          const mappedTop: PlayerItem[] = (topData as unknown as SupabasePlayerRow[]).map((p) => ({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            position: p.position,
            preferred_foot: p.preferred_foot,
            overall_rating: Number(p.overall_rating) || 0,
            photo_url: p.photo_url,
            league: p.league,
            clubs: p.clubs ? { name: p.clubs.name, country: p.clubs.country } : null,
          }))
          setTopPlayers(mappedTop)
        }

        // Fetch all players for position chart distribution
        const { data: allPlayers } = await supabase
          .from("players")
          .select("position")

        const chartList: Array<{ position?: string }> = (allPlayers && allPlayers.length > 0
          ? allPlayers
          : FALLBACK_PLAYERS) as Array<{ position?: string }>

        // Count distribution
        const counts: { [pos: string]: number } = {
          GK: 0, CB: 0, FB: 0, DM: 0, CM: 0, AM: 0, W: 0, ST: 0,
        }

        chartList.forEach((p) => {
          if (p.position && counts[p.position] !== undefined) {
            counts[p.position] += 1
          }
        })

        const chartArray: PositionCount[] = Object.keys(POSITION_MAP).map((posKey) => ({
          position: posKey,
          label: POSITION_MAP[posKey].label,
          count: counts[posKey] || 0,
          color: POSITION_MAP[posKey].color,
        }))

        setPositionData(chartArray)

      } catch (err) {
        console.error("Error fetching dashboard data from Supabase:", err)
        // Fallback chart calculation
        const counts: { [pos: string]: number } = {
          GK: 0, CB: 0, FB: 0, DM: 1, CM: 2, AM: 3, W: 2, ST: 0,
        }
        const chartArray: PositionCount[] = Object.keys(POSITION_MAP).map((posKey) => ({
          position: posKey,
          label: POSITION_MAP[posKey].label,
          count: counts[posKey] || 0,
          color: POSITION_MAP[posKey].color,
        }))
        setPositionData(chartArray)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getRatingBadgeVariant = (rating: number) => {
    if (rating >= 88) return "pitch"
    if (rating >= 83) return "default"
    if (rating >= 78) return "amber"
    return "blue"
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Panel de Control Principal
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-100">
              Scouting Dashboard <span className="text-gradient-pitch">Smart Scout In</span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              Monitoreo táctico, base de datos de rendimiento y análisis de talento en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/players"
              className={buttonVariants({
                variant: "default",
                size: "default",
                className: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 gap-2",
              })}
            >
              <Plus className="h-4 w-4" /> Nuevo Jugador
            </Link>
            <Link
              href="/video"
              className={buttonVariants({
                variant: "outline",
                size: "default",
                className: "gap-2 border-slate-700 hover:bg-slate-800 text-slate-200",
              })}
            >
              <Video className="h-4 w-4 text-emerald-400" /> Analizar Vídeo
            </Link>
          </div>
        </div>
      </div>

      {/* 1. KPI RESUMEN CARDS (Reading from Supabase) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* KPI 1: Jugadores */}
        <Card className="relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Jugadores Analizados
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {loading ? "..." : stats.playersCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Base de datos activa</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Clubes */}
        <Card className="relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Clubes Registrados
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {loading ? "..." : stats.clubsCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Ligas top europeas</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Vídeos */}
        <Card className="relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Vídeos Analizados
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Video className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {loading ? "..." : stats.videosCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Etiquetado táctico</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Plantillas guardadas */}
        <Card className="relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Plantillas Guardadas
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {loading ? "..." : stats.templatesCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Sistemas tácticos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER COLUMNS (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. ULTIMOS JUGADORES ANALIZADOS */}
          <Card className="border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  Últimos Jugadores Analizados
                </CardTitle>
                <CardDescription>
                  Jugadores recientemente añadidos o evaluados en la plataforma
                </CardDescription>
              </div>
              <Link
                href="/players"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1",
                })}
              >
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="group relative rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-200 hover:border-emerald-500/40 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-950/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={player.photo_url}
                          alt={`${player.first_name} ${player.last_name}`}
                          fallback={`${player.first_name[0]}${player.last_name[0]}`}
                          size="lg"
                          className="border-2 border-slate-700 group-hover:border-emerald-500/60 transition-colors"
                        />
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                            {player.first_name} {player.last_name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {player.clubs?.name || "Agente Libre"}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0">
                              {player.position}
                            </Badge>
                            {player.preferred_foot && (
                              <span className="text-[11px] text-slate-400 capitalize">
                                Pie: {player.preferred_foot === "left" ? "Zurdo" : player.preferred_foot === "right" ? "Diestro" : "Ambidiestro"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium">Overall</span>
                        <Badge
                          variant={getRatingBadgeVariant(player.overall_rating)}
                          className="text-sm font-black px-2.5 py-0.5"
                        >
                          {player.overall_rating}
                        </Badge>
                      </div>
                    </div>

                    {/* Action link */}
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px] text-slate-400">{player.league || "Primera División"}</span>
                      <Link
                        href={`/players?id=${player.id}`}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Ficha completa <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. GRAFICO RESUMEN RECHARTS: Distribución por posición */}
          <Card className="border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-emerald-400" />
                  Distribución de Jugadores por Posición
                </CardTitle>
                <CardDescription>
                  Cantidad de futbolistas scouted desglosada por demarcación táctica
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <PositionChart data={positionData} />
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-8">
          
          {/* 3. TOP VALORACIONES */}
          <Card className="border-slate-800 h-full flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Top Valoraciones
              </CardTitle>
              <CardDescription>
                Ranking global por overall_rating en Smart Scout In
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-5">
              {topPlayers.map((player, index) => (
                <div key={player.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Rank indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          index === 0
                            ? "bg-amber-400 text-slate-950 ring-2 ring-amber-400/30"
                            : index === 1
                            ? "bg-slate-300 text-slate-950"
                            : index === 2
                            ? "bg-amber-700 text-slate-100"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <Link
                          href={`/players?id=${player.id}`}
                          className="font-bold text-sm text-slate-100 hover:text-emerald-400 transition-colors"
                        >
                          {player.first_name} {player.last_name}
                        </Link>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span>{player.clubs?.name || "Agente libre"}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-400">{player.position}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400">
                        {player.overall_rating}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/ 100</span>
                    </div>
                  </div>

                  {/* Mini animated Progress Bar */}
                  <Progress
                    value={player.overall_rating}
                    className="h-1.5"
                    indicatorClassName={
                      player.overall_rating >= 90
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                        : player.overall_rating >= 85
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-400"
                    }
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-slate-800/80">
                <Link
                  href="/players?sort=rating"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full text-xs border-slate-700 hover:bg-slate-800 text-slate-300",
                  })}
                >
                  Ver clasificación completa de valoraciones
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}

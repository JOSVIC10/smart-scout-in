"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Video,
  GitCompare,
  Layers,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Jugadores",
    href: "/players",
    icon: Users,
  },
  {
    name: "Análisis de vídeo",
    href: "/video",
    icon: Video,
  },
  {
    name: "Comparador",
    href: "/comparator",
    icon: GitCompare,
  },
  {
    name: "Modelo de juego",
    href: "/game-model",
    icon: Layers,
  },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Shield className="h-5 w-5 text-slate-950 font-bold fill-slate-950" />
          </div>
          {!collapsed && (
            <div className="flex flex-col transition-opacity duration-300">
              <span className="font-extrabold text-slate-100 text-base tracking-tight leading-none flex items-center gap-1.5">
                Smart <span className="text-emerald-400">Scout In</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pro Analytics
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menú sidebar" : "Colapsar menú sidebar"}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              {!collapsed && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                  {item.name}
                </div>
              )}

              {/* Active Glow Bar */}
              {isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-l-full shadow-[0_0_8px_#22c55e]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Quick Status Card */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 mb-2 text-slate-300 font-semibold">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Supabase Sync</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
            Base de datos de scout en tiempo real conectada.
          </p>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-full animate-pulse" />
          </div>
        </div>
      )}
    </aside>
  )
}

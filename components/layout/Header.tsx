"use client"

import * as React from "react"
import Link from "next/link"
import { Shield, Bell, Menu, X, Sparkles, SlidersHorizontal } from "lucide-react"
import { GlobalSearch } from "./GlobalSearch"
import { cn } from "@/lib/utils"

interface HeaderProps {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function Header({ sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl transition-all duration-300 px-4 md:px-6 flex items-center justify-between gap-4",
        sidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}
    >
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5 text-emerald-400" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Shield className="h-4 w-4 text-slate-950 fill-slate-950" />
          </div>
          <span className="font-extrabold text-slate-100 text-sm tracking-tight">
            Smart <span className="text-emerald-400">Scout</span>
          </span>
        </Link>
      </div>

      {/* Global Search Component */}
      <div className="flex-1 max-w-xl mx-auto md:mx-0">
        <GlobalSearch />
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          title="Notificaciones"
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* User Badge / Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-slate-950 font-black text-xs flex items-center justify-center border border-emerald-400/40 shadow-md shadow-emerald-950/40">
            SC
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 leading-tight">Head Scout</span>
            <span className="text-[10px] text-slate-400">Primera División</span>
          </div>
        </div>
      </div>
    </header>
  )
}

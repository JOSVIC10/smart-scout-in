"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, X } from "lucide-react"
import { NAV_ITEMS } from "./Sidebar"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function MobileNav({ isOpen, setIsOpen }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Drawer Overlay for Mobile Hamburger */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-slate-950 border-r border-slate-800 h-full flex flex-col p-4 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                  <Shield className="h-5 w-5 fill-slate-950" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-100 text-base">
                    Smart <span className="text-emerald-400">Scout In</span>
                  </span>
                  <p className="text-[10px] text-slate-400">Scouting Platform</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
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
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500">Smart Scout In &copy; {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
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
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[56px]",
                isActive
                  ? "text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 mb-0.5", isActive && "scale-110 text-emerald-400")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#22c55e]" />
                )}
              </div>
              <span className="text-[10px] leading-tight truncate max-w-[64px]">
                {item.name === "Análisis de vídeo" ? "Vídeo" : item.name === "Modelo de juego" ? "Modelo" : item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

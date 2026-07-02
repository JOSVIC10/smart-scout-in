import Link from "next/link"
import { Shield, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="relative mb-8">
        {/* Pitch line backdrop visual */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center backdrop-blur-md shadow-2xl shadow-emerald-950/50">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-dashed border-emerald-500/40 flex items-center justify-center">
            <Shield className="w-12 h-12 text-emerald-400 stroke-[1.5]" />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-lg">
          404 ERROR
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight mb-3">
        Fuera de juego <span className="text-emerald-400">(404)</span>
      </h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-md mb-8">
        La página o el recurso de scouting que estás buscando no existe o se ha movido a otra ubicación táctica.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-950/50 transition-all"
        >
          <Home className="w-4 h-4" />
          Volver al Dashboard
        </Link>
        <Link
          href="/players"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition-all"
        >
          <Search className="w-4 h-4 text-slate-400" />
          Buscar Jugadores
        </Link>
      </div>
    </div>
  )
}

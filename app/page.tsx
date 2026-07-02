import Link from "next/link";

const stats = [
  { label: "Jugadores scouted", value: "—", icon: "👤" },
  { label: "Informes pendientes", value: "—", icon: "📋" },
  { label: "Vídeos analizados", value: "—", icon: "🎬" },
  { label: "Comparativas", value: "—", icon: "⚖️" },
];

const navItems = [
  {
    href: "/players",
    title: "Jugadores",
    description: "Catálogo completo con estadísticas detalladas",
    icon: "👤",
    color: "from-pitch-600 to-pitch-800",
  },
  {
    href: "/video",
    title: "Análisis de Vídeo",
    description: "Reproductor con anotaciones tácticas",
    icon: "🎬",
    color: "from-blue-600 to-blue-900",
  },
  {
    href: "/comparator",
    title: "Comparador",
    description: "Compara hasta 4 jugadores con gráficos radar",
    icon: "⚖️",
    color: "from-purple-600 to-purple-900",
  },
  {
    href: "/game-model",
    title: "Modelo de Juego",
    description: "Editor táctico visual con canvas interactivo",
    icon: "🗺️",
    color: "from-amber-600 to-amber-900",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: "var(--pitch-green)" }}
            >
              ⚽
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                Smart Scout In
              </h1>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Plataforma de Scouting
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-green-400"
                style={{ color: "var(--muted-foreground)" }}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              background: "rgba(22, 163, 74, 0.15)",
              border: "1px solid rgba(22, 163, 74, 0.3)",
              color: "#22c55e",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            Plataforma activa
          </div>
          <h2
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
            style={{ color: "var(--foreground)" }}
          >
            Smart{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Scout In
            </span>
          </h2>
          <p
            className="text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            Descubre el talento oculto. Analiza, compara y construye tu modelo
            de juego con datos e inteligencia táctica avanzada.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-6 text-center animate-slide-up"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: "#22c55e" }}
              >
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group glass-card p-8 card-hover block"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg transition-transform group-hover:scale-110`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-xl font-bold mb-2 transition-colors group-hover:text-green-400"
                    style={{ color: "var(--foreground)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {item.description}
                  </p>
                </div>
                <div
                  className="text-xl opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1"
                  style={{ color: "#22c55e" }}
                >
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Smart Scout In &copy; {new Date().getFullYear()} — Todos los derechos reservados
          </p>
        </footer>
      </div>
    </main>
  );
}

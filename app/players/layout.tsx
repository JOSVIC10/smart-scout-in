import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jugadores | Smart Scout In',
  description: 'Listado y análisis completo de jugadores scouting con métricas avanzadas.',
}

export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return children
}

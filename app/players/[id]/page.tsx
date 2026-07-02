import type { Metadata } from 'next'
import { PlayerProfileClient } from './PlayerProfileClient'

interface PageProps {
  params: { id: string }
}

export const metadata: Metadata = {
  title: 'Ficha jugador | Smart Scout In',
}

export default function PlayerDetailPage({ params }: PageProps) {
  return <PlayerProfileClient id={params.id} />
}

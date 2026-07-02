import { getPlayers, getPlayerMetrics } from '@/lib/playersApi'
import { supabase } from '@/lib/supabaseClient'
import ComparatorClient from '@/components/comparador/ComparatorClient'

export const metadata = {
  title: 'Comparador de Jugadores | Smart Scout In',
}

export default async function ComparadorPage() {
  // 1. Fetch Game Models
  const { data: gameModelsData } = await supabase
    .from('game_models')
    .select('*')
    .order('name')

  // 2. Fetch all players
  const playersData = await getPlayers()
  
  // 3. Enrich players with metrics
  const playersWithMetrics = await Promise.all(
    playersData.map(async (p) => {
      const metrics = await getPlayerMetrics(p.id)
      return { ...p, metrics }
    })
  )

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            ⚖️ Comparador de Jugadores
          </h1>
          <p className="mt-2 text-muted-foreground">
            Encuentra al jugador ideal según su posición y tu modelo de juego.
          </p>
        </div>

        <ComparatorClient 
          allPlayers={playersWithMetrics} 
          gameModels={gameModelsData || []} 
        />
      </div>
    </main>
  )
}

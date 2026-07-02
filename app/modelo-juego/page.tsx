import React from 'react'
import { getPlayers } from '@/lib/playersApi'
import { getGameModels } from '@/lib/gameModelApi'
import { TacticalEditor } from '@/components/game-model/TacticalEditor'

// Import Next.js metadata correctly
export const metadata = {
  title: 'Modelo de Juego | Smart Scout In',
  description: 'Editor táctico y gestor de plantillas y modelos de juego.',
}

export default async function ModeloJuegoPage() {
  const [players, gameModels] = await Promise.all([
    getPlayers(),
    getGameModels()
  ])

  // Optionally, we could pass the first template as the initial slots
  // For now we will just let it initialize to the first game model's default formation

  return (
    <main className="h-[calc(100vh-4rem)] md:h-screen w-full flex flex-col">
      <TacticalEditor 
        players={players} 
        gameModels={gameModels} 
        initialFormation={gameModels[0]?.formation || '4-3-3'}
        // onSaveTemplate will be handled client side or we can pass a server action,
        // but for now, we'll keep the client logic for saving separated if needed.
        // The current TacticalEditor will just fire an event. We need a client wrapper or 
        // to convert TacticalEditor to handle the API call. 
        // Let's modify TacticalEditor to handle the save internally or wrap it.
      />
    </main>
  )
}

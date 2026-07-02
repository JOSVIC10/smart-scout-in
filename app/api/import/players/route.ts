import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { players } = await req.json()
    
    if (!players || !Array.isArray(players) || players.length === 0) {
      return NextResponse.json({ error: 'No se enviaron datos válidos.' }, { status: 400 })
    }

    // Process each player sequentially to handle DB insertions
    let successCount = 0
    let errorCount = 0

    // Fetch the metrics dictionary so we can map codes to IDs
    const { data: metricsDict, error: dictError } = await supabase.from('metrics').select('id, code, group')
    if (dictError || !metricsDict) {
      return NextResponse.json({ error: 'Error obteniendo diccionario de métricas.' }, { status: 500 })
    }

    const metricMap = new Map()
    metricsDict.forEach(m => metricMap.set(m.code, { id: m.id, group: m.group }))

    for (const p of players) {
      try {
        // 1. Get or create Club
        const clubName = p.club_name || 'Sin club'
        let clubId = null
        
        const { data: existingClub } = await supabase
          .from('clubs')
          .select('id')
          .eq('name', clubName)
          .single()

        if (existingClub) {
          clubId = existingClub.id
        } else {
          const { data: newClub, error: clubErr } = await supabase
            .from('clubs')
            .insert({ name: clubName, country: 'Importado' })
            .select()
            .single()
            
          if (newClub && !clubErr) clubId = newClub.id
        }

        // 2. Insert Player
        const { data: insertedPlayer, error: playerErr } = await supabase
          .from('players')
          .insert({
            first_name: p.first_name,
            last_name: p.last_name,
            nationality: p.nationality || 'Desconocido',
            club_id: clubId,
            league: p.league || 'Desconocida',
            position: p.position || 'Unknown',
            birth_date: p.birth_date || '2000-01-01',
            preferred_foot: p.preferred_foot || 'right',
            minutes_played: parseInt(p.minutes_played) || 0
          })
          .select()
          .single()

        if (playerErr || !insertedPlayer) {
          console.error('Error insertando jugador:', playerErr)
          errorCount++
          continue
        }

        // 3. Insert Metrics
        const metricsToInsert = []
        for (const [key, value] of Object.entries(p)) {
          if (metricMap.has(key)) {
            const numVal = parseFloat(value as string)
            if (!isNaN(numVal)) {
              metricsToInsert.push({
                player_id: insertedPlayer.id,
                metric_id: metricMap.get(key).id,
                value: numVal,
                // Rough estimation of percentile: standard middle point since we don't have all data to rank immediately
                // Alternatively we just set it to 50 for now
                percentile: 50 
              })
            }
          }
        }

        if (metricsToInsert.length > 0) {
          await supabase.from('player_metrics').insert(metricsToInsert)
        }
        
        successCount++
      } catch (err) {
        console.error('Error in player loop:', err)
        errorCount++
      }
    }

    // En un entorno real, tras la importación masiva habría que disparar un Job para recalcular 
    // todos los percentiles basándose en la nueva distribución de la base de datos completa.

    return NextResponse.json({ 
      success: true, 
      message: `Importación completada. ${successCount} insertados, ${errorCount} errores.` 
    })

  } catch (err) {
    console.error('Error in import route:', err)
    return NextResponse.json({ error: 'Error de servidor procesando la importación.' }, { status: 500 })
  }
}

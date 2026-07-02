'use client'

import React, { useState, useEffect } from 'react'
import { Save, Star, Loader2, CheckCircle } from 'lucide-react'
import { getPlayerRating, upsertRating } from '@/lib/playersApi'
import type { Rating } from '@/types/players'

interface ScoutRatingProps {
  playerId: string
}

export function ScoutRating({ playerId }: ScoutRatingProps) {
  const [notes, setNotes] = useState('')
  const [score, setScore] = useState(70)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    getPlayerRating(playerId)
      .then((r) => {
        if (r) {
          setNotes(r.scout_notes ?? '')
          setScore(r.score)
        }
      })
      .finally(() => setFetchLoading(false))
  }, [playerId])

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      await upsertRating(playerId, score, notes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const scoreColor =
    score >= 80
      ? 'text-green-400'
      : score >= 60
      ? 'text-yellow-400'
      : score >= 40
      ? 'text-orange-400'
      : 'text-red-400'

  const scoreBg =
    score >= 80
      ? 'from-green-500 to-emerald-600'
      : score >= 60
      ? 'from-yellow-500 to-amber-600'
      : score >= 40
      ? 'from-orange-500 to-orange-700'
      : 'from-red-500 to-red-700'

  return (
    <div className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-400" />
        <h2 className="text-slate-100 font-bold text-base">Valoración del scout</h2>
      </div>

      {fetchLoading ? (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Score slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="scout-score-slider" className="text-slate-400 text-sm font-medium">
                Puntuación
              </label>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scoreBg} flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-black text-lg">{score}</span>
              </div>
            </div>
            <input
              id="scout-score-slider"
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>

            {/* Score stars */}
            <div className="flex gap-1 mt-2 justify-center">
              {Array.from({ length: 5 }).map((_, i) => {
                const threshold = (i + 1) * 20
                return (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${score >= threshold ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                    onClick={() => setScore(threshold)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="scout-notes" className="block text-slate-400 text-sm font-medium mb-2">
              Notas del scout
            </label>
            <textarea
              id="scout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Observaciones, puntos fuertes, áreas de mejora..."
              className="w-full bg-slate-900/60 border border-slate-700/60 text-slate-200 placeholder-slate-600 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/60 transition-all resize-none"
            />
          </div>

          {/* Save */}
          <button
            id="save-scout-rating"
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                ¡Guardado!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar valoración
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

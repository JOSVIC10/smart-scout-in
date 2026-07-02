"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { 
  Crosshair, 
  MoveRight, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Swords, 
  Target, 
  AlertTriangle,
  Loader2
} from "lucide-react"

interface LiveTaggingPanelProps {
  videoId: string
  currentTime: number
  isPlaying: boolean
}

const TAG_TYPES = [
  { id: "pase_clave", label: "Pase Clave", icon: MoveRight, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { id: "tiro", label: "Tiro", icon: Crosshair, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { id: "regate", label: "Regate (Take-on)", icon: Zap, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { id: "recuperacion", label: "Recuperación", icon: ShieldCheck, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
  { id: "perdida", label: "Pérdida", icon: ShieldAlert, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  { id: "duelo", label: "Duelo", icon: Swords, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { id: "gol", label: "Gol", icon: Target, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { id: "falta", label: "Falta", icon: AlertTriangle, color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
]

export function LiveTaggingPanel({ videoId, currentTime, isPlaying }: LiveTaggingPanelProps) {
  const [savingTag, setSavingTag] = useState<string | null>(null)

  const handleTag = async (tagId: string, label: string) => {
    if (!videoId) return
    
    setSavingTag(tagId)
    
    // Convert to seconds integer
    const timestamp_seconds = Math.floor(currentTime)
    
    await supabase.from('video_tags').insert({
      video_id: videoId,
      timestamp_seconds,
      event_type: label
    })
    
    // In a real app, we might want to use a global state/context to notify `TagsList` to refresh,
    // or trigger an event. We will handle refreshing via subscription or interval in TagsList.
    
    setSavingTag(null)
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          Eventos Rápidos
        </h3>
        
        {isPlaying ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En vivo
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
            Pausado
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {TAG_TYPES.map((tag) => (
          <Button
            key={tag.id}
            variant="outline"
            disabled={!videoId || savingTag === tag.id}
            onClick={() => handleTag(tag.id, tag.label)}
            className={`h-auto py-3 px-2 flex flex-col gap-2 items-center justify-center border hover:border-emerald-500 hover:bg-emerald-500/10 transition-all ${tag.color}`}
          >
            {savingTag === tag.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <tag.icon className="w-5 h-5" />
            )}
            <span className="text-xs font-medium text-center whitespace-normal">{tag.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

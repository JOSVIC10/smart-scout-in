"use client"

import React, { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { PlayCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TagsListProps {
  videoId: string
  onSeek: (seconds: number) => void
  currentTime: number
  refreshTrigger?: number
}

interface VideoTag {
  id: string
  timestamp_seconds: number
  event_type: string
  created_at: string
}

export function TagsList({ videoId, onSeek, currentTime, refreshTrigger }: TagsListProps) {
  const [tags, setTags] = useState<VideoTag[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTags = useCallback(async () => {
    if (!videoId) return
    const { data } = await supabase
      .from('video_tags')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp_seconds', { ascending: true })
      .order('created_at', { ascending: true })
      
    if (data) {
      setTags(data)
    }
    setLoading(false)
  }, [videoId])

  useEffect(() => {
    fetchTags()
    
    // Simple polling para actualizar la lista mientras tagueamos en vivo
    const interval = setInterval(() => {
      fetchTags()
    }, 2000)
    
    return () => clearInterval(interval)
  }, [fetchTags, refreshTrigger])

  const formatTime = (seconds: number) => {
    return new Date(seconds * 1000).toISOString().substring(14, 19)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await supabase.from('video_tags').delete().eq('id', id)
    fetchTags()
  }

  if (!videoId) return null

  if (loading) {
    return <div className="text-slate-500 text-sm text-center py-4">Cargando tags...</div>
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
        <p className="text-sm">No hay eventos tagueados.</p>
        <p className="text-xs mt-1 opacity-70">Usa el panel superior mientras se reproduce el vídeo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tags.map((tag) => {
        const isNear = Math.abs(currentTime - tag.timestamp_seconds) < 2
        
        return (
          <div 
            key={tag.id}
            onClick={() => onSeek(tag.timestamp_seconds)}
            className={`
              flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
              ${isNear 
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border border-slate-800">
                <PlayCircle className={`w-4 h-4 ${isNear ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className={`font-medium text-sm ${isNear ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {tag.event_type}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {formatTime(tag.timestamp_seconds)}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDelete(e, tag.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

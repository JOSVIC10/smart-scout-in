"use client"

import React, { useState, useRef } from "react"
import { VideoPlayerWithCanvas } from "@/components/video-analysis/VideoPlayerWithCanvas"
import { DrawingToolbar } from "@/components/video-analysis/DrawingToolbar"
import { LiveTaggingPanel } from "@/components/video-analysis/LiveTaggingPanel"
import { TagsList } from "@/components/video-analysis/TagsList"
import { ScoutingReportTab } from "@/components/video-analysis/ScoutingReportTab"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Youtube } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ReactPlayer from "react-player"
import { fabric } from "fabric"

export default function VideoAnalysisPage() {
  const [videoUrlInput, setVideoUrlInput] = useState("")
  const [activeVideoUrl, setActiveVideoUrl] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  
  const playerRef = useRef<ReactPlayer>(null)
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)

  // Load video
  const handleLoadVideo = async () => {
    if (!videoUrlInput) return
    
    // Check if video exists in DB or create
    let { data: existing } = await supabase
      .from('videos')
      .select('*')
      .eq('youtube_url', videoUrlInput)
      .single()
      
    if (!existing) {
      const { data: newVideo } = await supabase
        .from('videos')
        .insert({ title: 'Análisis Táctico', youtube_url: videoUrlInput })
        .select()
        .single()
      existing = newVideo
    }
    
    if (existing) {
      setVideoId(existing.id)
      setActiveVideoUrl(existing.youtube_url)
      setCurrentTime(0)
      setIsPlaying(false)
    }
  }

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, "seconds")
      setCurrentTime(seconds)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 h-[calc(100vh-theme(spacing.16))] overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Análisis <span className="text-emerald-400">Táctico de Vídeo</span>
          </h1>
          <p className="text-slate-400 mt-1">Carga un partido, taguea eventos en vivo y dibuja sobre los fotogramas.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input 
            placeholder="URL de YouTube..." 
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            className="w-full md:w-[300px] bg-slate-900 border-slate-700 focus-visible:ring-emerald-500"
          />
          <Button onClick={handleLoadVideo} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
            <Youtube className="w-4 h-4 mr-2" />
            Cargar
          </Button>
        </div>
      </div>

      {!activeVideoUrl ? (
        <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50 text-slate-500">
          <Youtube className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-slate-400">No hay vídeo cargado</h3>
          <p className="mt-2 text-sm">Pega una URL de YouTube en la parte superior para comenzar el análisis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh] min-h-[600px]">
          {/* Columna Izquierda: Reproductor + Toolbar de dibujo */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-2xl border border-slate-800">
              <VideoPlayerWithCanvas 
                url={activeVideoUrl}
                videoId={videoId!}
                isPlaying={isPlaying}
                onProgress={(time) => setCurrentTime(time)}
                playerRef={playerRef}
                onCanvasReady={setFabricCanvas}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-emerald-400"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <div className="text-slate-300 font-mono text-sm ml-2">
                  {new Date(currentTime * 1000).toISOString().substring(14, 19)}
                </div>
              </div>
              
              {/* Toolbar de dibujo - activa en pausa o play, fabric manejará la interacción si quiere */}
              <div className={`transition-opacity duration-300 ${isPlaying ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                 <DrawingToolbar canvas={fabricCanvas} videoId={videoId!} currentTime={currentTime} />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tabs */}
          <div className="col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
            <Tabs defaultValue="tagging" className="flex-1 flex flex-col">
              <TabsList className="w-full grid grid-cols-2 bg-slate-950 p-1 rounded-none border-b border-slate-800">
                <TabsTrigger value="tagging" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">Tagueo en Vivo</TabsTrigger>
                <TabsTrigger value="report" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">Informe</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="tagging" className="m-0 h-full flex flex-col gap-6">
                  <LiveTaggingPanel videoId={videoId!} currentTime={currentTime} isPlaying={isPlaying} />
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Tags de este vídeo</h3>
                    <div className="flex-1 overflow-y-auto pr-2">
                      <TagsList videoId={videoId!} onSeek={handleSeek} currentTime={currentTime} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="report" className="m-0 h-full">
                  <ScoutingReportTab videoId={videoId!} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}

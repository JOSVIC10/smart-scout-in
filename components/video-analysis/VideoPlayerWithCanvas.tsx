"use client"

import React, { useEffect, useRef, useState } from "react"
import ReactPlayer from "react-player"
import { fabric } from "fabric"
import { supabase } from "@/lib/supabase"

interface VideoPlayerWithCanvasProps {
  url: string
  videoId: string
  isPlaying: boolean
  onProgress: (currentTime: number) => void
  playerRef: React.RefObject<ReactPlayer>
  onCanvasReady: (canvas: fabric.Canvas) => void
  onPlay: () => void
  onPause: () => void
}

export function VideoPlayerWithCanvas({
  url,
  videoId,
  isPlaying,
  onProgress,
  playerRef,
  onCanvasReady,
  onPlay,
  onPause
}: VideoPlayerWithCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)
  
  const [lastLoadedTime, setLastLoadedTime] = useState<number | null>(null)

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      selection: true,
      isDrawingMode: false,
    })

    setFabricCanvas(canvas)
    onCanvasReady(canvas)

    const handleResize = () => {
      if (containerRef.current) {
        canvas.setWidth(containerRef.current.clientWidth)
        canvas.setHeight(containerRef.current.clientHeight)
        canvas.renderAll()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.dispose()
    }
  }, [onCanvasReady])

  // Handle Play/Pause canvas interaction state
  useEffect(() => {
    if (!fabricCanvas) return
    
    // When playing, make canvas un-interactable so clicks pass through to player (or just disable drawing)
    // Actually, react-player catches clicks if canvas pointerEvents="none", but we need canvas to accept clicks when paused.
    // We handle this via CSS pointer-events on the canvas container
    
    if (isPlaying) {
      fabricCanvas.discardActiveObject()
      fabricCanvas.renderAll()
    }
  }, [isPlaying, fabricCanvas])

  // Fetch drawing when paused at a specific time
  const loadDrawingForTime = async (time: number) => {
    if (!fabricCanvas) return
    
    // We only load if the time has changed by at least 1 second to avoid spam
    if (lastLoadedTime === Math.floor(time)) return
    
    setLastLoadedTime(Math.floor(time))
    
    const { data } = await supabase
      .from('video_drawings')
      .select('canvas_json')
      .eq('video_id', videoId)
      .eq('timestamp_seconds', Math.floor(time))
      .single()

    if (data && data.canvas_json) {
      fabricCanvas.loadFromJSON(data.canvas_json, () => {
        fabricCanvas.renderAll()
      })
    } else {
      fabricCanvas.clear()
    }
  }

  const handleProgress = (state: { playedSeconds: number }) => {
    onProgress(state.playedSeconds)
    // Clear canvas when playing so drawings don't stay on screen
    if (isPlaying && fabricCanvas) {
      fabricCanvas.clear()
    }
  }

  const handlePause = () => {
    onPause()
    if (playerRef.current) {
      loadDrawingForTime(playerRef.current.getCurrentTime())
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full relative group">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={isPlaying}
        controls={true}
        onPlay={onPlay}
        onPause={handlePause}
        onProgress={handleProgress}
        progressInterval={500}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      
      {/* Canvas Overlay */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

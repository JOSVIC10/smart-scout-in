"use client"

import React, { useState, useRef, useEffect } from "react"
import * as fabric from "fabric"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { 
  Pencil, 
  Circle, 
  Minus, 
  ArrowRight, 
  Type, 
  Eraser, 
  Save, 
  Trash2
} from "lucide-react"

interface DrawingToolbarProps {
  canvas: fabric.Canvas | null
  videoId: string
  currentTime: number
}

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#ffffff", "#000000"]

export function DrawingToolbar({ canvas, videoId, currentTime }: DrawingToolbarProps) {
  const [activeColor, setActiveColor] = useState(COLORS[0])
  const [activeMode, setActiveMode] = useState<string | null>(null)

  const activeColorRef = useRef(activeColor)
  useEffect(() => {
    activeColorRef.current = activeColor
  }, [activeColor])

  const stopDrawingMode = () => {
    if (!canvas) return
    canvas.isDrawingMode = false
    canvas.selection = true
    canvas.off("mouse:down")
    canvas.off("mouse:move")
    canvas.off("mouse:up")
    canvas.defaultCursor = "default"
    setActiveMode(null)
  }

  const handleFreeDraw = () => {
    if (!canvas) return
    stopDrawingMode()
    canvas.isDrawingMode = true
    canvas.selection = false
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor
      canvas.freeDrawingBrush.width = 3
    }
    setActiveMode("freedraw")
  }

  const handleDrawShape = (shapeType: "circle" | "line" | "arrow") => {
    if (!canvas) return
    stopDrawingMode()
    setActiveMode(shapeType)
    canvas.defaultCursor = "crosshair"
    canvas.selection = false

    let shape: fabric.Object | null = null
    let isDown = false
    let origX = 0
    let origY = 0

    canvas.on("mouse:down", (o: { scenePoint?: { x: number; y: number }; pointer?: { x: number; y: number } }) => {
      isDown = true
      const pointer = o.scenePoint || o.pointer || { x: 0, y: 0 }
      origX = pointer.x
      origY = pointer.y

      if (shapeType === "circle") {
        shape = new fabric.Circle({
          left: origX,
          top: origY,
          originX: "center",
          originY: "center",
          radius: 1,
          fill: "rgba(0,0,0,0)",
          stroke: activeColorRef.current,
          strokeWidth: 3,
        })
      } else if (shapeType === "line" || shapeType === "arrow") {
        const points: [number, number, number, number] = [origX, origY, origX, origY]
        shape = new fabric.Line(points, {
          strokeWidth: 3,
          fill: activeColorRef.current,
          stroke: activeColorRef.current,
          originX: "center",
          originY: "center",
        })
      }

      if (shape) canvas.add(shape)
    })

    canvas.on("mouse:move", (o: { scenePoint?: { x: number; y: number }; pointer?: { x: number; y: number } }) => {
      if (!isDown || !shape) return
      const pointer = o.scenePoint || o.pointer || { x: 0, y: 0 }

      if (shapeType === "circle" && shape instanceof fabric.Circle) {
        const radius = Math.max(Math.abs(origY - pointer.y), Math.abs(origX - pointer.x)) / 2
        shape.set({ radius })
      } else if ((shapeType === "line" || shapeType === "arrow") && shape instanceof fabric.Line) {
        shape.set({ x2: pointer.x, y2: pointer.y })
      }
      canvas.renderAll()
    })

    canvas.on("mouse:up", () => {
      isDown = false
      if (shapeType === "arrow" && shape instanceof fabric.Line) {
        // Add triangle at the end of the line
        const x1 = shape.get("x1") || 0
        const y1 = shape.get("y1") || 0
        const x2 = shape.get("x2") || 0
        const y2 = shape.get("y2") || 0
        
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
        
        const triangle = new fabric.Triangle({
          left: x2,
          top: y2,
          originX: "center",
          originY: "center",
          selectable: false,
          pointType: "arrow_head",
          angle: angle + 90,
          width: 15,
          height: 15,
          fill: activeColorRef.current,
        })
        canvas.add(triangle)
        
        // Group them
        const group = new fabric.Group([shape, triangle], {
          selectable: true
        })
        canvas.remove(shape, triangle)
        canvas.add(group)
      }
      
      stopDrawingMode()
    })
  }

  const handleAddText = () => {
    if (!canvas) return
    stopDrawingMode()
    
    const text = new fabric.IText("Texto", {
      left: 100,
      top: 100,
      fontFamily: "Inter, sans-serif",
      fill: activeColor,
      fontSize: 24,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const handleDeleteActive = () => {
    if (!canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length) {
      canvas.discardActiveObject()
      activeObjects.forEach((obj) => {
        canvas.remove(obj)
      })
    }
  }

  const handleClearAll = () => {
    if (!canvas) return
    canvas.clear()
  }

  const handleSaveDrawing = async () => {
    if (!canvas || !videoId) return
    
    const json = canvas.toJSON()
    
    // Si está vacío, podríamos querer borrar el registro si existía, pero por ahora solo guardamos si hay algo o lo sobreescribimos
    const timestamp = Math.floor(currentTime)
    
    // Delete existing at this exact second
    await supabase
      .from('video_drawings')
      .delete()
      .eq('video_id', videoId)
      .eq('timestamp_seconds', timestamp)
      
    // Insert new
    if (canvas.getObjects().length > 0) {
      await supabase
        .from('video_drawings')
        .insert({
          video_id: videoId,
          timestamp_seconds: timestamp,
          canvas_json: json
        })
    }
    
    alert("Dibujo guardado correctamente")
  }

  const changeColor = (color: string) => {
    setActiveColor(color)
    if (canvas) {
      if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color
      }
      const activeObj = canvas.getActiveObject()
      if (activeObj) {
        if (activeObj.type === 'i-text') {
          activeObj.set('fill', color)
        } else {
          activeObj.set('stroke', color)
          if (activeObj.type === 'group') {
             // simplificación
          }
        }
        canvas.renderAll()
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Herramientas */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleFreeDraw}
          className={`h-8 w-8 ${activeMode === 'freedraw' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          title="Dibujo libre"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDrawShape("arrow")}
          className={`h-8 w-8 ${activeMode === 'arrow' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          title="Flecha"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDrawShape("line")}
          className={`h-8 w-8 ${activeMode === 'line' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          title="Línea"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDrawShape("circle")}
          className={`h-8 w-8 ${activeMode === 'circle' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          title="Círculo"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleAddText}
          className="h-8 w-8 text-slate-400 hover:text-slate-200"
          title="Texto"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Colores */}
      <div className="flex items-center gap-1.5 px-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => changeColor(color)}
            className={`w-5 h-5 rounded-full border-2 transition-transform ${activeColor === color ? 'scale-125 border-emerald-400' : 'border-slate-600 hover:scale-110'}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDeleteActive}
          className="h-8 w-8 text-slate-400 hover:text-red-400"
          title="Borrar selección"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClearAll}
          className="h-8 w-8 text-slate-400 hover:text-red-400"
          title="Limpiar todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleSaveDrawing}
          className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 ml-2"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Dibujo
        </Button>
      </div>
    </div>
  )
}

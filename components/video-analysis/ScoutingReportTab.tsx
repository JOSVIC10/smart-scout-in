"use client"

import React, { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Shield, Loader2, FileText } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface ScoutingReportTabProps {
  videoId: string
}

interface VideoTag {
  id: string
  timestamp_seconds: number
  event_type: string
}

interface TagCounts {
  [key: string]: number
}

export function ScoutingReportTab({ videoId }: ScoutingReportTabProps) {
  const [tags, setTags] = useState<VideoTag[]>([])
  const [counts, setCounts] = useState<TagCounts>({})
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const fetchReportData = async () => {
    if (!videoId) return
    setLoading(true)
    const { data } = await supabase
      .from('video_tags')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp_seconds', { ascending: true })
      
    if (data) {
      setTags(data)
      const newCounts: TagCounts = {}
      data.forEach(t => {
        newCounts[t.event_type] = (newCounts[t.event_type] || 0) + 1
      })
      setCounts(newCounts)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReportData()
  }, [videoId])

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    
    try {
      // Small delay to ensure any UI rendering is complete
      await new Promise(r => setTimeout(r, 300))
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#020617', // slate-950
        logging: false,
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('informe_scouting_video.pdf')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert("Hubo un error al exportar el informe.")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Informe de Partido
        </h2>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchReportData}>
            Actualizar
          </Button>
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleExportPDF}
            disabled={exporting || tags.length === 0}
          >
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* CONTENEDOR EXPORTABLE */}
      <div 
        ref={reportRef} 
        className="bg-slate-950 border border-slate-800 rounded-xl p-8 space-y-8 relative overflow-hidden"
      >
        {/* Cabecera del informe */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50">
              <Shield className="h-7 w-7 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight leading-none">
                Smart <span className="text-emerald-400">Scout In</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                Análisis Táctico
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Fecha de generación</p>
            <p className="font-mono text-slate-200">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Resumen de Estadísticas */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">
            Resumen de Eventos
          </h3>
          
          {Object.keys(counts).length === 0 ? (
            <p className="text-slate-500 text-sm">No hay eventos registrados.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-emerald-400">{count}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">{type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Línea de tiempo cronológica */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">
            Cronología de Acciones
          </h3>
          
          {tags.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay acciones registradas.</p>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-4 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                  <div className="bg-slate-950 font-mono text-xs text-slate-400 px-2 py-1 rounded border border-slate-800 w-16 text-center">
                    {new Date(tag.timestamp_seconds * 1000).toISOString().substring(14, 19)}
                  </div>
                  <div className="font-medium text-sm text-slate-200">
                    {tag.event_type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notas del Scout */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">
            Notas y Conclusiones Tácticas
          </h3>
          
          {/* Ocultamos el textarea en el PDF y mostramos un div estático, o simplemente estilizamos el textarea para que parezca texto en el PDF */}
          <Textarea 
            placeholder="Escribe aquí tus observaciones tácticas sobre el partido o jugador analizado..."
            className="min-h-[150px] bg-slate-900 border-slate-800 focus-visible:ring-emerald-500 text-slate-200 resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

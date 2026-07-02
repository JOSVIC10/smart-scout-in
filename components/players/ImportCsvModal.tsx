'use client'

import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Upload, X, FileDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface ImportCsvModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ImportCsvModal({ isOpen, onClose, onSuccess }: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
      setSuccess(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.errors.length > 0) {
            setError('Error parseando el CSV. Revisa el formato.')
            setLoading(false)
            return
          }

          const response = await fetch('/api/import/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players: results.data })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Error en la importación')
          }

          setSuccess(data.message)
          setTimeout(() => {
            onSuccess()
            onClose()
            setFile(null)
            setSuccess(null)
          }, 2000)

        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err)
          setError(errorMsg)
        } finally {
          setLoading(false)
        }
      },
      error: (err) => {
        setError('Error leyendo el archivo: ' + err.message)
        setLoading(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            Importar Jugadores
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Plantilla Download */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-emerald-400 font-bold text-sm mb-1">Paso 1: Rellenar la Plantilla</h3>
              <p className="text-emerald-100/70 text-xs">Descarga el CSV y rellena las columnas. Contiene datos biográficos y las 32 métricas tácticas necesarias.</p>
            </div>
            <a 
              href="/templates/plantilla_jugadores.csv" 
              download 
              className="shrink-0 flex items-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Plantilla
            </a>
          </div>

          {/* Upload Box */}
          <div>
            <h3 className="text-slate-300 font-bold text-sm mb-3">Paso 2: Subir archivo CSV</h3>
            
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
              }`}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              
              {!file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">
                    Haz clic para seleccionar el archivo CSV
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 rounded-lg bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-colors"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-bold text-sm">{file.name}</p>
                    <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-xs text-slate-400 hover:text-white underline mt-2"
                  >
                    Elegir otro archivo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-200 text-sm">{success}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/60 flex justify-end gap-3 bg-slate-900/50">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Importar Datos
          </button>
        </div>

      </div>
    </div>
  )
}

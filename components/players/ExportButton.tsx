'use client'

import React, { useState } from 'react'
import { Download, Loader2, FileText } from 'lucide-react'

interface ExportButtonProps {
  containerId?: string
  filename?: string
  playerName?: string
}

export function ExportButton({
  containerId = 'report-container',
  filename = 'informe-jugador',
  playerName,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then((m) => m.default),
        import('jspdf'),
      ])

      const element = document.getElementById(containerId)
      if (!element) {
        console.error(`Element #${containerId} not found`)
        return
      }

      // Capture the full container
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0f1e',
        logging: false,
        imageTimeout: 5000,
      })

      const imgData = canvas.toDataURL('image/png', 0.95)
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight

      // Create PDF
      const pdf = new jsPDF({
        orientation: ratio > 1 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const pdfRatio = pdfW / pdfH

      let finalW = pdfW
      let finalH = pdfW / ratio
      if (finalH > pdfH) {
        finalH = pdfH
        finalW = pdfH * ratio
      }

      const offsetX = (pdfW - finalW) / 2
      const offsetY = (pdfH - finalH) / 2

      // Dark background
      pdf.setFillColor(10, 15, 30)
      pdf.rect(0, 0, pdfW, pdfH, 'F')

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalW, finalH)

      // Watermark
      pdf.setFontSize(8)
      pdf.setTextColor(100, 116, 139)
      pdf.text('Smart Scout In — Informe generado automáticamente', pdfW / 2, pdfH - 5, { align: 'center' })

      const safeName = (playerName ?? filename).replace(/\s+/g, '_').toLowerCase()
      pdf.save(`${safeName}_informe.pdf`)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      id="export-report-btn"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-950/40"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Exportar informe
        </>
      )}
    </button>
  )
}

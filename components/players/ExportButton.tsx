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
      const html2canvasModule = await import('html2canvas')
      const html2canvas = html2canvasModule.default || html2canvasModule

      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || (jsPDFModule as any)

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
        backgroundColor: '#ffffff', // White background for the new report
        logging: false,
        imageTimeout: 5000,
        onclone: (clonedDoc) => {
          // We can keep the old toggle logic in case we reuse this button somewhere else
          const hideElements = clonedDoc.querySelectorAll('.html2canvas-hide')
          hideElements.forEach((el) => {
            ;(el as HTMLElement).style.display = 'none'
          })
          const showElements = clonedDoc.querySelectorAll('.html2canvas-show')
          showElements.forEach((el) => {
            ;(el as HTMLElement).style.setProperty('display', 'flex', 'important')
            if (el.classList.contains('whitespace-pre-wrap')) {
              ;(el as HTMLElement).style.setProperty('display', 'block', 'important')
            }
          })
        },
      })

      const imgData = canvas.toDataURL('image/png', 0.95)
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Create PDF in A4 portrait
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfW = pdf.internal.pageSize.getWidth() // 210mm
      const pdfH = pdf.internal.pageSize.getHeight() // 297mm
      
      // Calculate how high the total image is in mm
      const totalPdfHeight = (imgHeight * pdfW) / imgWidth
      const totalPages = Math.ceil(totalPdfHeight / pdfH)

      // Add pages and shift image up
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        
        const yOffset = -(pdfH * i)
        
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfW, totalPdfHeight)
        
        // Watermark on each page
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(`Smart Scout In — Informe generado automáticamente — Página ${i + 1}/${totalPages}`, pdfW / 2, pdfH - 5, { align: 'center' })
      }

      const safeName = (playerName ?? filename).replace(/\s+/g, '_').toLowerCase()
      pdf.save(`${safeName}_informe.pdf`)
    } catch (err: any) {
      console.error('Export error:', err)
      alert('Error al exportar: ' + (err?.message || err))
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

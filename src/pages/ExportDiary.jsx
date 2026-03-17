import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { readingPlan } from '../lib/readingPlan'
import Layout from '../components/Layout'
import { jsPDF } from 'jspdf'

export default function ExportDiary() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('day_number', { ascending: true })
      setEntries(data || [])
      setLoading(false)
    }
    fetchEntries()
  }, [user])

  const handleExport = () => {
    setExporting(true)
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let y = margin

    const addText = (text, fontSize, bold = false, color = [40, 30, 20]) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, contentWidth)
      lines.forEach(line => {
        if (y + 7 > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += fontSize * 0.5
      })
    }

    const addSpace = (mm = 5) => { y += mm }

    const addDivider = () => {
      if (y + 3 > pageHeight - margin) { doc.addPage(); y = margin }
      doc.setDrawColor(210, 180, 120)
      doc.line(margin, y, pageWidth - margin, y)
      y += 4
    }

    // Portada
    doc.setFillColor(120, 64, 23)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 240, 200)
    doc.text('Diario Biblico', pageWidth / 2, 90, { align: 'center' })
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(230, 200, 150)
    doc.text('La Biblia en un Ano', pageWidth / 2, 105, { align: 'center' })
    doc.setFontSize(11)
    doc.text('Fray Sergio Serrano & Dempsey Rosales', pageWidth / 2, 118, { align: 'center' })
    doc.setFontSize(12)
    doc.setTextColor(200, 170, 120)
    doc.text(`${entries.length} entradas completadas`, pageWidth / 2, 140, { align: 'center' })
    doc.text(`Exportado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 152, { align: 'center' })

    // Entradas
    entries.forEach(entry => {
      doc.addPage()
      y = margin

      const plan = readingPlan[entry.day_number - 1]

      // Encabezado del día
      doc.setFillColor(245, 235, 210)
      doc.roundedRect(margin - 3, y - 5, contentWidth + 6, 28, 3, 3, 'F')
      addText(`Dia ${entry.day_number} — ${plan?.title || ''}`, 14, true, [120, 64, 23])
      addSpace(1)
      addText(`${plan?.oldTestament.ref}  |  ${plan?.newTestament.ref}  |  ${plan?.psalm.ref}  |  ${plan?.proverb.ref}`, 8, false, [150, 100, 50])
      addSpace(6)

      const sections = [
        { key: 'what_i_read', label: 'Que lei' },
        { key: 'what_god_said', label: 'Que me hablo Dios' },
        { key: 'what_i_will_do', label: 'Que voy a hacer' },
        { key: 'prayer', label: 'Mi oracion de hoy' },
        { key: 'free_notes', label: 'Notas adicionales' },
      ]

      sections.forEach(({ key, label }) => {
        const content = entry[key]
        if (!content || !content.trim()) return
        addText(label, 10, true, [120, 64, 23])
        addSpace(1)
        addText(content, 10, false, [60, 50, 40])
        addSpace(4)
        addDivider()
        addSpace(2)
      })
    })

    doc.save(`diario-biblico-${new Date().getFullYear()}.pdf`)
    setExporting(false)
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Exportar Diario</h1>
          <p className="text-gray-500 text-sm mt-1">Descarga todas tus entradas completadas en un PDF.</p>
        </div>

        <div className="card">
          {loading ? (
            <p className="text-gray-400 text-center py-6">Cargando entradas...</p>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 text-sm">Aún no tienes entradas completadas.</p>
              <p className="text-gray-400 text-xs mt-1">Completa al menos un día para exportar.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-semibold text-gray-700">Tu diario contiene</p>
                  <p className="text-3xl font-bold text-amber-700">{entries.length} entradas</p>
                  <p className="text-xs text-gray-400 mt-0.5">días completados</p>
                </div>
                <div className="text-5xl">📄</div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 mb-5 text-sm text-amber-800 space-y-1">
                <p>✓ Incluye: lecturas, reflexiones, oraciones y notas</p>
                <p>✓ Formato A4 con portada personalizada</p>
                <p>✓ Solo entradas marcadas como completadas</p>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-primary w-full py-3"
              >
                {exporting ? 'Generando PDF...' : '⬇️ Descargar PDF'}
              </button>
            </>
          )}
        </div>

        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full py-2 text-sm">
          ← Volver al inicio
        </button>
      </div>
    </Layout>
  )
}

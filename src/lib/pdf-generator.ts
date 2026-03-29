import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { ProtocolSummary } from "@/types"

interface PdfMeasurement {
  datetime: string
  period: string
  pas: number
  pad: number
  pulse: number
  isDiscrepant: boolean
}

interface ProtocolPDFData {
  patientName: string
  protocolType: string
  startDate: string
  measurements: PdfMeasurement[]
  summary: ProtocolSummary
}

export function generateProtocolPDF(data: ProtocolPDFData): Buffer {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.setTextColor(27, 55, 94) // navy
  doc.text("Relatório MRPA", 105, 25, { align: "center" })

  doc.setFontSize(12)
  doc.setTextColor(0, 116, 228) // primary
  doc.text("Monitoração Residencial da Pressão Arterial", 105, 33, {
    align: "center",
  })

  // Patient info
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  const startDateFormatted = new Date(data.startDate).toLocaleDateString(
    "pt-BR"
  )
  doc.text(`Paciente: ${data.patientName}`, 20, 50)
  doc.text(`Protocolo: ${data.protocolType === "5d" ? "5 dias" : "7 dias"}`, 20, 58)
  doc.text(`Início: ${startDateFormatted}`, 20, 66)
  doc.text(
    `Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`,
    20,
    74
  )

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(27, 55, 94)
  doc.text("Resultado", 20, 90)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(
    `Média PAS: ${data.summary.avgPas ?? "—"} mmHg`,
    20,
    100
  )
  doc.text(
    `Média PAD: ${data.summary.avgPad ?? "—"} mmHg`,
    20,
    108
  )
  doc.text(
    `Medições válidas: ${data.summary.validCount} de ${data.summary.totalCount}`,
    20,
    116
  )
  if (data.summary.discrepantCount > 0) {
    doc.text(
      `Medições discrepantes: ${data.summary.discrepantCount}`,
      20,
      124
    )
  }

  // Result badge
  const resultY = data.summary.discrepantCount > 0 ? 136 : 128
  if (data.summary.result === "normal") {
    doc.setTextColor(0, 128, 0)
    doc.text("✓ NORMAL (< 135/85 mmHg)", 20, resultY)
  } else if (data.summary.result === "elevated") {
    doc.setTextColor(200, 0, 0)
    doc.text("✗ ELEVADO (≥ 135/85 mmHg)", 20, resultY)
  } else {
    doc.setTextColor(128, 128, 128)
    doc.text("— Dados insuficientes", 20, resultY)
  }

  // Measurements table
  doc.setTextColor(27, 55, 94)
  doc.setFontSize(14)
  doc.text("Medições", 20, resultY + 16)

  const tableData = data.measurements.map((m) => {
    const dt = new Date(m.datetime)
    return [
      dt.toLocaleDateString("pt-BR"),
      dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      m.period === "morning" ? "Manhã" : "Noite",
      String(m.pas),
      String(m.pad),
      String(m.pulse),
      m.isDiscrepant ? "⚠️" : "✓",
    ]
  })

  autoTable(doc, {
    startY: resultY + 20,
    head: [["Data", "Hora", "Período", "PAS", "PAD", "Pulso", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [27, 55, 94] },
    styles: { fontSize: 9 },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.raw) {
        const raw = data.row.raw as string[]
        if (raw[6] === "⚠️") {
          data.cell.styles.fillColor = [255, 238, 238]
          data.cell.styles.textColor = [200, 0, 0]
        }
      }
    },
  })

  // Disclaimer
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 200
  doc.setFontSize(9)
  doc.setTextColor(128, 128, 128)
  doc.text(
    "Este resultado não substitui a avaliação médica. Consulte seu cardiologista.",
    20,
    finalY + 15
  )
  doc.text(
    "Dr. Robson Chamon — Cardiologista e Nutrologista",
    20,
    finalY + 22
  )

  const arrayBuffer = doc.output("arraybuffer")
  return Buffer.from(arrayBuffer)
}

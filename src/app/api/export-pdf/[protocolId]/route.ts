import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/auth"
import { calculateProtocolSummary } from "@/lib/calculations"
import { generateProtocolPDF } from "@/lib/pdf-generator"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ protocolId: string }> }
) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { protocolId: idStr } = await params
  const protocolId = parseInt(idStr)

  if (isNaN(protocolId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const protocol = await prisma.protocol.findUnique({
    where: { id: protocolId },
    include: {
      patient: true,
      measurements: {
        orderBy: { datetime: "asc" },
      },
    },
  })

  if (!protocol) {
    return NextResponse.json(
      { error: "Protocolo não encontrado" },
      { status: 404 }
    )
  }

  const measurements = protocol.measurements.map((m) => ({
    id: m.id,
    protocolId: m.protocolId,
    datetime: m.datetime.toISOString(),
    period: m.period as "morning" | "night",
    pas: m.pas,
    pad: m.pad,
    pulse: m.pulse,
    isDiscrepant: m.isDiscrepant,
    createdAt: m.createdAt.toISOString(),
  }))

  const summary = calculateProtocolSummary(measurements)

  const pdfBytes = generateProtocolPDF({
    patientName: protocol.patient.name,
    protocolType: protocol.type,
    startDate: protocol.startDate.toISOString(),
    measurements,
    summary,
  })

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mrpa-${protocol.patient.name.replace(/\s+/g, "-")}-${protocol.id}.pdf"`,
    },
  })
}

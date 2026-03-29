import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getProgressByDay } from "@/lib/protocol-rules"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const protocolId = parseInt(id)

  if (isNaN(protocolId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const protocol = await prisma.protocol.findUnique({
    where: { id: protocolId },
    include: {
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
    period: m.period,
    pas: m.pas,
    pad: m.pad,
    pulse: m.pulse,
    isDiscrepant: m.isDiscrepant,
    createdAt: m.createdAt.toISOString(),
  }))

  const progress = getProgressByDay(
    protocol.type,
    protocol.startDate.toISOString(),
    measurements
  )

  return NextResponse.json({
    id: protocol.id,
    patientId: protocol.patientId,
    type: protocol.type,
    startDate: protocol.startDate.toISOString(),
    status: protocol.status,
    createdAt: protocol.createdAt.toISOString(),
    measurements,
    progress,
  })
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/auth"
import { calculateProtocolSummary } from "@/lib/calculations"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const patientId = parseInt(id)

  if (isNaN(patientId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      protocols: {
        orderBy: { createdAt: "desc" },
        include: {
          measurements: {
            orderBy: { datetime: "asc" },
          },
        },
      },
    },
  })

  if (!patient) {
    return NextResponse.json(
      { error: "Paciente não encontrado" },
      { status: 404 }
    )
  }

  const protocols = patient.protocols.map((proto) => {
    const measurements = proto.measurements.map((m) => ({
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

    return {
      id: proto.id,
      patientId: proto.patientId,
      type: proto.type,
      startDate: proto.startDate.toISOString(),
      status: proto.status,
      createdAt: proto.createdAt.toISOString(),
      measurements,
      summary: calculateProtocolSummary(measurements),
    }
  })

  return NextResponse.json({
    id: patient.id,
    name: patient.name,
    token: patient.token,
    createdAt: patient.createdAt.toISOString(),
    protocols,
  })
}

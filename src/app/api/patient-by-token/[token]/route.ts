import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateProtocolSummary } from "@/lib/calculations"
import { getProgressByDay } from "@/lib/protocol-rules"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const patient = await prisma.patient.findUnique({
    where: { token },
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

  const activeProto = patient.protocols.find((p) => p.status === "active")
  const completedProtos = patient.protocols.filter(
    (p) => p.status === "completed"
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatMeasurements = (measurements: any[]) =>
    measurements.map((m) => ({
      id: m.id as number,
      protocolId: m.protocolId as number,
      datetime: m.datetime.toISOString() as string,
      period: m.period as "morning" | "night",
      pas: m.pas as number,
      pad: m.pad as number,
      pulse: m.pulse as number,
      isDiscrepant: m.isDiscrepant as boolean,
      createdAt: m.createdAt.toISOString() as string,
    }))

  return NextResponse.json({
    id: patient.id,
    name: patient.name,
    token: patient.token,
    createdAt: patient.createdAt.toISOString(),
    activeProtocol: activeProto
      ? (() => {
          const measurements = formatMeasurements(activeProto.measurements)
          return {
            id: activeProto.id,
            patientId: activeProto.patientId,
            type: activeProto.type,
            startDate: activeProto.startDate.toISOString(),
            status: activeProto.status,
            createdAt: activeProto.createdAt.toISOString(),
            measurements,
            summary: calculateProtocolSummary(measurements),
            progress: getProgressByDay(
              activeProto.type,
              activeProto.startDate.toISOString(),
              measurements
            ),
          }
        })()
      : null,
    completedProtocols: completedProtos.map((proto) => {
      const measurements = formatMeasurements(proto.measurements)
      return {
        id: proto.id,
        patientId: proto.patientId,
        type: proto.type,
        startDate: proto.startDate.toISOString(),
        status: proto.status,
        createdAt: proto.createdAt.toISOString(),
        measurements,
        summary: calculateProtocolSummary(measurements),
        progress: getProgressByDay(
          proto.type,
          proto.startDate.toISOString(),
          measurements
        ),
      }
    }),
  })
}

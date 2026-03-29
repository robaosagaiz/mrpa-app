import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateMeasurement } from "@/lib/validations"
import { isProtocolComplete, PROTOCOL_RULES } from "@/lib/protocol-rules"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const protocolId = parseInt(id)

  if (isNaN(protocolId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const measurements = await prisma.measurement.findMany({
    where: { protocolId },
    orderBy: { datetime: "asc" },
  })

  return NextResponse.json(
    measurements.map((m) => ({
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
  )
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const protocolId = parseInt(id)

    if (isNaN(protocolId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const protocol = await prisma.protocol.findUnique({
      where: { id: protocolId },
      include: { _count: { select: { measurements: true } } },
    })

    if (!protocol) {
      return NextResponse.json(
        { error: "Protocolo não encontrado" },
        { status: 404 }
      )
    }

    if (protocol.status === "completed") {
      return NextResponse.json(
        { error: "Protocolo já está completo" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { period, pas, pad, pulse, datetime } = body

    // Validate input
    if (!["morning", "night"].includes(period)) {
      return NextResponse.json(
        { error: "Período deve ser 'morning' ou 'night'" },
        { status: 400 }
      )
    }

    const pasNum = parseInt(pas)
    const padNum = parseInt(pad)
    const pulseNum = parseInt(pulse)

    if (isNaN(pasNum) || pasNum < 40 || pasNum > 350) {
      return NextResponse.json(
        { error: "PAS deve ser um número entre 40 e 350" },
        { status: 400 }
      )
    }
    if (isNaN(padNum) || padNum < 20 || padNum > 250) {
      return NextResponse.json(
        { error: "PAD deve ser um número entre 20 e 250" },
        { status: 400 }
      )
    }
    if (isNaN(pulseNum) || pulseNum < 20 || pulseNum > 250) {
      return NextResponse.json(
        { error: "Pulso deve ser um número entre 20 e 250" },
        { status: 400 }
      )
    }

    const parsedDatetime = new Date(datetime || new Date().toISOString())
    if (isNaN(parsedDatetime.getTime())) {
      return NextResponse.json(
        { error: "Data/hora inválida" },
        { status: 400 }
      )
    }

    // Validate for discrepancy
    const validation = validateMeasurement({
      pas: pasNum,
      pad: padNum,
      pulse: pulseNum,
    })

    const measurement = await prisma.measurement.create({
      data: {
        protocolId,
        datetime: parsedDatetime,
        period,
        pas: pasNum,
        pad: padNum,
        pulse: pulseNum,
        isDiscrepant: validation.isDiscrepant,
      },
    })

    // Check if protocol is now complete
    const newCount = protocol._count.measurements + 1
    const rules = PROTOCOL_RULES[protocol.type]
    if (rules && isProtocolComplete(protocol.type, newCount)) {
      await prisma.protocol.update({
        where: { id: protocolId },
        data: { status: "completed" },
      })
    }

    return NextResponse.json(
      {
        id: measurement.id,
        protocolId: measurement.protocolId,
        datetime: measurement.datetime.toISOString(),
        period: measurement.period,
        pas: measurement.pas,
        pad: measurement.pad,
        pulse: measurement.pulse,
        isDiscrepant: measurement.isDiscrepant,
        warnings: validation.warnings,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Erro ao salvar medição" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { patientToken, type } = await request.json()

    if (!patientToken || !type || !["5d", "7d"].includes(type)) {
      return NextResponse.json(
        { error: "Dados inválidos. Forneça patientToken e type (5d ou 7d)." },
        { status: 400 }
      )
    }

    const patient = await prisma.patient.findUnique({
      where: { token: patientToken },
      include: {
        protocols: {
          where: { status: "active" },
        },
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      )
    }

    if (patient.protocols.length > 0) {
      return NextResponse.json(
        { error: "Já existe um protocolo ativo para este paciente" },
        { status: 400 }
      )
    }

    const protocol = await prisma.protocol.create({
      data: {
        patientId: patient.id,
        type,
        startDate: new Date(),
        status: "active",
      },
    })

    return NextResponse.json(
      {
        id: protocol.id,
        patientId: protocol.patientId,
        type: protocol.type,
        startDate: protocol.startDate.toISOString(),
        status: protocol.status,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar protocolo" },
      { status: 500 }
    )
  }
}

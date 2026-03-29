import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/auth"
import { generateToken } from "@/lib/tokens"
import { PROTOCOL_RULES } from "@/lib/protocol-rules"

export async function GET(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const patients = await prisma.patient.findMany({
    include: {
      protocols: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          _count: { select: { measurements: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const result = patients.map((p) => {
    const latest = p.protocols[0] || null
    return {
      id: p.id,
      name: p.name,
      token: p.token,
      createdAt: p.createdAt.toISOString(),
      latestProtocol: latest
        ? {
            id: latest.id,
            type: latest.type,
            status: latest.status,
            startDate: latest.startDate.toISOString(),
            measurementCount: latest._count.measurements,
            expectedTotal:
              PROTOCOL_RULES[latest.type]?.totalExpected || 0,
          }
        : null,
    }
  })

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { name } = await request.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    const token = generateToken()

    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        token,
      },
    })

    return NextResponse.json(
      {
        id: patient.id,
        name: patient.name,
        token: patient.token,
        createdAt: patient.createdAt.toISOString(),
        patientUrl: `/p/${patient.token}`,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar paciente" },
      { status: 500 }
    )
  }
}

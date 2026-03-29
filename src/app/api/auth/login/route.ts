import { NextResponse } from "next/server"
import { validateAdminCredentials } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!validateAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set("mrpa_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24h
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "Erro no servidor" },
      { status: 500 }
    )
  }
}

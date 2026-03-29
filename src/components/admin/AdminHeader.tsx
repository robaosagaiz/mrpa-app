"use client"

import { useRouter } from "next/navigation"
import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <header className="bg-chamon-navy text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo maxWidth="120px" />
          <span className="text-lg font-semibold hidden sm:block">
            Painel do Médico
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-white border-white hover:bg-white/20"
        >
          Sair
        </Button>
      </div>
    </header>
  )
}

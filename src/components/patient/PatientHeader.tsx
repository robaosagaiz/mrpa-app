"use client"

import { Logo } from "@/components/shared/Logo"

interface PatientHeaderProps {
  patientName: string
}

export function PatientHeader({ patientName }: PatientHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 pb-4 border-b">
      <Logo maxWidth="180px" />
      <h1 className="text-xl font-bold text-chamon-navy">
        Olá, {patientName.split(" ")[0]}!
      </h1>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PatientListItem } from "@/types"

interface PatientListProps {
  patients: PatientListItem[]
}

export function PatientList({ patients }: PatientListProps) {
  const copyLink = (token: string) => {
    const url = `${window.location.origin}/p/${token}`
    navigator.clipboard.writeText(url)
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-xl">Nenhum paciente cadastrado</p>
        <p>Clique em &quot;Novo Paciente&quot; para começar.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {patients.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <StatusBadge patient={p} />
            </div>
            {p.latestProtocol && (
              <p className="text-sm text-gray-500">
                {p.latestProtocol.type === "5d" ? "5 dias" : "7 dias"} —{" "}
                {p.latestProtocol.measurementCount}/
                {p.latestProtocol.expectedTotal} medições
              </p>
            )}
            <div className="flex gap-2">
              <Link href={`/admin/patients/${p.id}`}>
                <Button size="sm" variant="outline">
                  Ver Detalhes
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyLink(p.token)}
              >
                📋 Copiar Link
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <table className="hidden sm:table w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 px-4 font-semibold">Nome</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Protocolo</th>
            <th className="py-3 px-4 font-semibold">Progresso</th>
            <th className="py-3 px-4 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{p.name}</td>
              <td className="py-3 px-4">
                <StatusBadge patient={p} />
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {p.latestProtocol
                  ? `${p.latestProtocol.type === "5d" ? "5 dias" : "7 dias"} — ${new Date(
                      p.latestProtocol.startDate
                    ).toLocaleDateString("pt-BR")}`
                  : "—"}
              </td>
              <td className="py-3 px-4 text-sm">
                {p.latestProtocol
                  ? `${p.latestProtocol.measurementCount}/${p.latestProtocol.expectedTotal}`
                  : "—"}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Link href={`/admin/patients/${p.id}`}>
                    <Button size="sm" variant="outline">
                      Detalhes
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyLink(p.token)}
                  >
                    📋
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ patient }: { patient: PatientListItem }) {
  if (!patient.latestProtocol) {
    return <Badge variant="secondary">Pendente</Badge>
  }
  if (patient.latestProtocol.status === "active") {
    return <Badge variant="default">Em Andamento</Badge>
  }
  return <Badge variant="success">Concluído</Badge>
}

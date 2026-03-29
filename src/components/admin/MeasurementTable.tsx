"use client"

import type { Measurement } from "@/types"

interface MeasurementTableProps {
  measurements: Measurement[]
}

export function MeasurementTable({ measurements }: MeasurementTableProps) {
  if (measurements.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">Nenhuma medição registrada.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 px-3 font-semibold">Data</th>
            <th className="py-2 px-3 font-semibold">Hora</th>
            <th className="py-2 px-3 font-semibold">Período</th>
            <th className="py-2 px-3 font-semibold">PAS</th>
            <th className="py-2 px-3 font-semibold">PAD</th>
            <th className="py-2 px-3 font-semibold">Pulso</th>
            <th className="py-2 px-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m) => {
            const dt = new Date(m.datetime)
            return (
              <tr
                key={m.id}
                className={`border-b ${
                  m.isDiscrepant ? "bg-red-50 text-red-700" : "hover:bg-gray-50"
                }`}
              >
                <td className="py-2 px-3">
                  {dt.toLocaleDateString("pt-BR")}
                </td>
                <td className="py-2 px-3">
                  {dt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2 px-3">
                  {m.period === "morning" ? "☀️ Manhã" : "🌙 Noite"}
                </td>
                <td className="py-2 px-3 font-medium">{m.pas}</td>
                <td className="py-2 px-3 font-medium">{m.pad}</td>
                <td className="py-2 px-3">{m.pulse}</td>
                <td className="py-2 px-3">
                  {m.isDiscrepant ? "⚠️ Discrepante" : "✓"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

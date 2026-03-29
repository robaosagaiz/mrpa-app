"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import type { ProtocolWithDetails } from "@/types"

interface InterProtocolChartProps {
  protocols: ProtocolWithDetails[]
}

export function InterProtocolChart({ protocols }: InterProtocolChartProps) {
  if (protocols.length < 2) return null

  const data = protocols
    .filter((p) => p.summary.avgPas !== null)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    .map((p) => ({
      label: new Date(p.startDate).toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
      pas: p.summary.avgPas,
      pad: p.summary.avgPad,
      result: p.summary.result,
    }))

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-chamon-navy mb-2">
        📉 Evolução Histórica
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={[50, 200]} />
          <Tooltip />
          <Legend />
          <ReferenceLine y={135} stroke="#f97316" strokeDasharray="5 5" />
          <ReferenceLine y={85} stroke="#f97316" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="pas"
            stroke="#ef4444"
            name="Média PAS"
            strokeWidth={2}
            dot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="pad"
            stroke="#3b82f6"
            name="Média PAD"
            strokeWidth={2}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

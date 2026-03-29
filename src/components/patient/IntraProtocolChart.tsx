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
import type { Measurement } from "@/types"

interface IntraProtocolChartProps {
  measurements: Measurement[]
}

export function IntraProtocolChart({ measurements }: IntraProtocolChartProps) {
  if (measurements.length === 0) return null

  const data = measurements.map((m, i) => {
    const dt = new Date(m.datetime)
    return {
      index: i + 1,
      label: `${dt.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })} ${m.period === "morning" ? "☀️" : "🌙"}`,
      pas: m.isDiscrepant ? null : m.pas,
      pad: m.isDiscrepant ? null : m.pad,
      pasDisc: m.isDiscrepant ? m.pas : null,
      padDisc: m.isDiscrepant ? m.pad : null,
    }
  })

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-chamon-navy mb-2">
        📈 Gráfico de Medições
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis domain={[50, 220]} />
          <Tooltip />
          <Legend />
          <ReferenceLine
            y={135}
            stroke="#f97316"
            strokeDasharray="5 5"
            label={{ value: "PAS 135", position: "right", fontSize: 10 }}
          />
          <ReferenceLine
            y={85}
            stroke="#f97316"
            strokeDasharray="5 5"
            label={{ value: "PAD 85", position: "right", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="pas"
            stroke="#ef4444"
            name="PAS"
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="pad"
            stroke="#3b82f6"
            name="PAD"
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="pasDisc"
            stroke="#d1d5db"
            name="PAS (disc.)"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "#d1d5db" }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="padDisc"
            stroke="#d1d5db"
            name="PAD (disc.)"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "#d1d5db" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

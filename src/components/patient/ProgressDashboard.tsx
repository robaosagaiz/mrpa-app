"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { DayProgress } from "@/types"
import { PROTOCOL_RULES } from "@/lib/protocol-rules"

interface ProgressDashboardProps {
  protocolType: string
  totalMeasurements: number
  progress: DayProgress[]
  onMeasure: () => void
}

export function ProgressDashboard({
  protocolType,
  totalMeasurements,
  progress,
  onMeasure,
}: ProgressDashboardProps) {
  const rules = PROTOCOL_RULES[protocolType]
  const expected = rules?.totalExpected || 0
  const pct = expected > 0 ? (totalMeasurements / expected) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">📊 Progresso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            {totalMeasurements} de {expected} medições realizadas
          </p>
          <Progress value={pct} className="h-4" />
        </div>

        <div className="space-y-2">
          {progress.map((day) => (
            <div
              key={day.day}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border"
            >
              <span className="font-medium text-lg">
                Dia {day.day}{" "}
                <span className="text-sm text-gray-500">
                  ({new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })})
                </span>
              </span>
              <div className="flex gap-3 text-lg">
                <span title={`Manhã: ${day.morningCount}/${day.expectedPerPeriod}`}>
                  ☀️ {day.morning ? "✅" : `${day.morningCount}/${day.expectedPerPeriod}`}
                </span>
                <span title={`Noite: ${day.nightCount}/${day.expectedPerPeriod}`}>
                  🌙 {day.night ? "✅" : `${day.nightCount}/${day.expectedPerPeriod}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onMeasure} size="lg" className="w-full">
          Registrar Medição Agora
        </Button>
      </CardContent>
    </Card>
  )
}

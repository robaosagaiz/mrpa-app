import type { DayProgress } from "@/types"

interface MeasurementLike {
  datetime: string
  period: string
}

export const PROTOCOL_RULES: Record<
  string,
  {
    days: number
    measurementsPerPeriod: number
    totalExpected: number
    label: string
  }
> = {
  "5d": {
    days: 5,
    measurementsPerPeriod: 3,
    totalExpected: 30,
    label: "5 dias (3+3 por dia)",
  },
  "7d": {
    days: 7,
    measurementsPerPeriod: 2,
    totalExpected: 28,
    label: "7 dias (2+2 por dia)",
  },
}

export function getProgressByDay(
  protocolType: string,
  startDate: string,
  measurements: MeasurementLike[]
): DayProgress[] {
  const rules = PROTOCOL_RULES[protocolType]
  if (!rules) return []
  const start = new Date(startDate)

  return Array.from({ length: rules.days }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]

    const dayMeasurements = measurements.filter((m) => {
      const mDate = new Date(m.datetime).toISOString().split("T")[0]
      return mDate === dateStr
    })

    const morningCount = dayMeasurements.filter(
      (m) => m.period === "morning"
    ).length
    const nightCount = dayMeasurements.filter(
      (m) => m.period === "night"
    ).length

    return {
      day: i + 1,
      date: dateStr,
      morning: morningCount >= rules.measurementsPerPeriod,
      morningCount,
      night: nightCount >= rules.measurementsPerPeriod,
      nightCount,
      expectedPerPeriod: rules.measurementsPerPeriod,
    }
  })
}

export function getCurrentPeriod(): "morning" | "night" {
  const hour = new Date().getHours()
  return hour >= 5 && hour < 12 ? "morning" : "night"
}

export function isProtocolComplete(
  protocolType: string,
  measurementCount: number
): boolean {
  const rules = PROTOCOL_RULES[protocolType]
  if (!rules) return false
  return measurementCount >= rules.totalExpected
}

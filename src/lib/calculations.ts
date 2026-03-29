import type { ProtocolSummary } from "@/types"

interface MeasurementLike {
  pas: number
  pad: number
  isDiscrepant: boolean
}

export function calculateProtocolSummary(
  measurements: MeasurementLike[]
): ProtocolSummary {
  const valid = measurements.filter((m) => !m.isDiscrepant)
  const discrepant = measurements.filter((m) => m.isDiscrepant)

  if (valid.length === 0) {
    return {
      avgPas: null,
      avgPad: null,
      validCount: 0,
      discrepantCount: discrepant.length,
      totalCount: measurements.length,
      result: "incomplete",
    }
  }

  const avgPas = Math.round(
    valid.reduce((sum, m) => sum + m.pas, 0) / valid.length
  )
  const avgPad = Math.round(
    valid.reduce((sum, m) => sum + m.pad, 0) / valid.length
  )

  const isElevated = avgPas >= 135 || avgPad >= 85

  return {
    avgPas,
    avgPad,
    validCount: valid.length,
    discrepantCount: discrepant.length,
    totalCount: measurements.length,
    result: isElevated ? "elevated" : "normal",
  }
}

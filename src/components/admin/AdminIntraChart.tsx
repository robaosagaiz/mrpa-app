"use client"

import { IntraProtocolChart } from "@/components/patient/IntraProtocolChart"
import type { Measurement } from "@/types"

interface AdminIntraChartProps {
  measurements: Measurement[]
}

export function AdminIntraChart({ measurements }: AdminIntraChartProps) {
  return <IntraProtocolChart measurements={measurements} />
}

"use client"

import { InterProtocolChart } from "@/components/patient/InterProtocolChart"
import type { ProtocolWithDetails } from "@/types"

interface AdminInterChartProps {
  protocols: ProtocolWithDetails[]
}

export function AdminInterChart({ protocols }: AdminInterChartProps) {
  return <InterProtocolChart protocols={protocols} />
}

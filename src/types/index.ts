export interface Patient {
  id: number
  name: string
  token: string
  createdAt: string
}

export interface Protocol {
  id: number
  patientId: number
  type: "5d" | "7d"
  startDate: string
  status: "active" | "completed"
  createdAt: string
}

export interface Measurement {
  id: number
  protocolId: number
  datetime: string
  period: "morning" | "night"
  pas: number
  pad: number
  pulse: number
  isDiscrepant: boolean
  createdAt: string
}

export interface DayProgress {
  day: number
  date: string
  morning: boolean
  morningCount: number
  night: boolean
  nightCount: number
  expectedPerPeriod: number
}

export interface ProtocolSummary {
  avgPas: number | null
  avgPad: number | null
  validCount: number
  discrepantCount: number
  totalCount: number
  result: "normal" | "elevated" | "incomplete"
}

export interface ProtocolWithDetails extends Protocol {
  measurements: Measurement[]
  summary: ProtocolSummary
  progress: DayProgress[]
}

export interface PatientWithProtocols extends Patient {
  activeProtocol: ProtocolWithDetails | null
  completedProtocols: ProtocolWithDetails[]
}

export interface PatientListItem extends Patient {
  latestProtocol: {
    id: number
    type: string
    status: string
    startDate: string
    measurementCount: number
    expectedTotal: number
  } | null
}

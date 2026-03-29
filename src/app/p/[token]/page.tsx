"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { PatientHeader } from "@/components/patient/PatientHeader"
import { Checklist } from "@/components/patient/Checklist"
import { ProtocolSelector } from "@/components/patient/ProtocolSelector"
import { MeasurementForm } from "@/components/patient/MeasurementForm"
import { MeasurementTimer } from "@/components/patient/MeasurementTimer"
import { ProgressDashboard } from "@/components/patient/ProgressDashboard"
import { IntraProtocolChart } from "@/components/patient/IntraProtocolChart"
import { InterProtocolChart } from "@/components/patient/InterProtocolChart"
import { FinalResult } from "@/components/patient/FinalResult"
import { ProtocolHistory } from "@/components/patient/ProtocolHistory"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PROTOCOL_RULES } from "@/lib/protocol-rules"
import type { PatientWithProtocols, Measurement } from "@/types"

type PatientView =
  | "loading"
  | "not-found"
  | "checklist"
  | "protocol-select"
  | "measuring"
  | "timer"
  | "progress"
  | "result"
  | "history"

export default function PatientPage() {
  const params = useParams()
  const token = params.token as string

  const [view, setView] = useState<PatientView>("loading")
  const [patient, setPatient] = useState<PatientWithProtocols | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState<"morning" | "night">(
    new Date().getHours() >= 5 && new Date().getHours() < 12
      ? "morning"
      : "night"
  )
  const [periodMeasurementCount, setPeriodMeasurementCount] = useState(0)

  const loadPatient = useCallback(async () => {
    try {
      const res = await fetch(`/api/patient-by-token/${token}`)
      if (!res.ok) {
        setView("not-found")
        return
      }
      const data = await res.json()
      setPatient(data)

      // Determine view
      if (!data.activeProtocol) {
        setView("checklist")
      } else if (data.activeProtocol.status === "completed") {
        setView("result")
      } else {
        const hasMeasurements = data.activeProtocol.measurements.length > 0
        setView(hasMeasurements ? "progress" : "measuring")
      }
    } catch {
      setView("not-found")
    }
  }, [token])

  useEffect(() => {
    loadPatient()
  }, [loadPatient])

  // Calculate current measurement number for the period
  const getCurrentMeasurementInfo = () => {
    if (!patient?.activeProtocol) return { number: 1, total: 2 }
    const rules = PROTOCOL_RULES[patient.activeProtocol.type]
    if (!rules) return { number: 1, total: 2 }

    const todayStr = new Date().toISOString().split("T")[0]
    const todayMeasurements = patient.activeProtocol.measurements.filter(
      (m: Measurement) => {
        const mDate = new Date(m.datetime).toISOString().split("T")[0]
        return mDate === todayStr && m.period === currentPeriod
      }
    )

    return {
      number: todayMeasurements.length + 1 + periodMeasurementCount,
      total: rules.measurementsPerPeriod,
    }
  }

  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chamon-gray">
        <LoadingSpinner />
      </div>
    )
  }

  if (view === "not-found" || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chamon-gray p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-chamon-navy">
            Link não encontrado
          </h1>
          <p className="text-gray-500 text-lg">
            Verifique o link enviado pelo seu médico.
          </p>
        </div>
      </div>
    )
  }

  const measureInfo = getCurrentMeasurementInfo()

  return (
    <div className="min-h-screen bg-chamon-gray">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <PatientHeader patientName={patient.name} />

        {view === "checklist" && (
          <Checklist
            onComplete={() =>
              patient.activeProtocol
                ? setView("measuring")
                : setView("protocol-select")
            }
          />
        )}

        {view === "protocol-select" && (
          <ProtocolSelector
            patientToken={patient.token}
            onSelect={() => {
              loadPatient()
              setView("measuring")
            }}
          />
        )}

        {view === "measuring" && patient.activeProtocol && (
          <>
            <div className="flex justify-center gap-3 mb-2">
              <button
                onClick={() => setCurrentPeriod("morning")}
                className={`px-4 py-2 rounded-xl text-lg font-medium ${
                  currentPeriod === "morning"
                    ? "bg-chamon-primary text-white"
                    : "bg-white text-gray-600 border"
                }`}
              >
                ☀️ Manhã
              </button>
              <button
                onClick={() => setCurrentPeriod("night")}
                className={`px-4 py-2 rounded-xl text-lg font-medium ${
                  currentPeriod === "night"
                    ? "bg-chamon-primary text-white"
                    : "bg-white text-gray-600 border"
                }`}
              >
                🌙 Noite
              </button>
            </div>

            <MeasurementForm
              protocolId={patient.activeProtocol.id}
              currentPeriod={currentPeriod}
              measurementNumber={measureInfo.number}
              totalForPeriod={measureInfo.total}
              onMeasurementSaved={() => {
                setPeriodMeasurementCount((c) => c + 1)
                if (measureInfo.number < measureInfo.total) {
                  setView("timer")
                } else {
                  setPeriodMeasurementCount(0)
                  loadPatient()
                  setView("progress")
                }
              }}
            />
          </>
        )}

        {view === "timer" && (
          <MeasurementTimer
            onComplete={() => {
              loadPatient()
              setView("measuring")
            }}
          />
        )}

        {view === "progress" && patient.activeProtocol && (
          <>
            <ProgressDashboard
              protocolType={patient.activeProtocol.type}
              totalMeasurements={patient.activeProtocol.measurements.length}
              progress={patient.activeProtocol.progress}
              onMeasure={() => setView("checklist")}
            />
            <IntraProtocolChart
              measurements={patient.activeProtocol.measurements}
            />
          </>
        )}

        {view === "result" && patient.activeProtocol && (
          <>
            <FinalResult
              summary={patient.activeProtocol.summary}
              onViewHistory={() => setView("history")}
              onNewProtocol={() => {
                setView("checklist")
              }}
            />
            <IntraProtocolChart
              measurements={patient.activeProtocol.measurements}
            />
          </>
        )}

        {view === "history" && (
          <>
            <ProtocolHistory
              completedProtocols={patient.completedProtocols}
            />
            <InterProtocolChart protocols={patient.completedProtocols} />
            <button
              onClick={() => setView(patient.activeProtocol ? "result" : "checklist")}
              className="text-chamon-primary text-lg underline w-full text-center py-2"
            >
              ← Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

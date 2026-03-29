"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { MeasurementTable } from "@/components/admin/MeasurementTable"
import { AdminIntraChart } from "@/components/admin/AdminIntraChart"
import { AdminInterChart } from "@/components/admin/AdminInterChart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import type { ProtocolWithDetails } from "@/types"

interface PatientData {
  id: number
  name: string
  token: string
  createdAt: string
  protocols: ProtocolWithDetails[]
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [patient, setPatient] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProtocolId, setSelectedProtocolId] = useState<number | null>(
    null
  )

  const loadPatient = useCallback(async () => {
    try {
      const res = await fetch(`/api/patients/${id}`)
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      if (!res.ok) {
        setLoading(false)
        return
      }
      const data = await res.json()
      setPatient(data)
      if (data.protocols.length > 0) {
        setSelectedProtocolId(data.protocols[0].id)
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    loadPatient()
  }, [loadPatient])

  if (loading) {
    return (
      <div className="min-h-screen bg-chamon-gray">
        <AdminHeader />
        <LoadingSpinner />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-chamon-gray">
        <AdminHeader />
        <div className="max-w-6xl mx-auto p-4">
          <p className="text-center text-gray-500">Paciente não encontrado.</p>
        </div>
      </div>
    )
  }

  const selectedProtocol = patient.protocols.find(
    (p) => p.id === selectedProtocolId
  )

  const handleExportPDF = () => {
    if (!selectedProtocolId) return
    window.open(`/api/export-pdf/${selectedProtocolId}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-chamon-gray">
      <AdminHeader />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-chamon-primary">
            Pacientes
          </Link>
          <span>→</span>
          <span className="text-chamon-navy font-medium">{patient.name}</span>
        </div>

        {/* Patient Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-chamon-navy">
                  {patient.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Cadastrado em{" "}
                  {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Token: <code className="font-mono">{patient.token}</code>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/p/${patient.token}`
                    )
                  }}
                >
                  📋 Copiar Link
                </Button>
                {selectedProtocol && (
                  <Button size="sm" onClick={handleExportPDF}>
                    📄 Exportar PDF
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protocol Selector */}
        {patient.protocols.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {patient.protocols.map((proto) => (
              <button
                key={proto.id}
                onClick={() => setSelectedProtocolId(proto.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  selectedProtocolId === proto.id
                    ? "bg-chamon-primary text-white"
                    : "bg-white text-gray-600 border hover:border-chamon-primary"
                }`}
              >
                {proto.type === "5d" ? "5 dias" : "7 dias"} —{" "}
                {new Date(proto.startDate).toLocaleDateString("pt-BR")}
              </button>
            ))}
          </div>
        )}

        {/* Selected Protocol Details */}
        {selectedProtocol && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Protocolo {selectedProtocol.type === "5d" ? "5 dias" : "7 dias"}
                  </span>
                  {selectedProtocol.summary.result === "normal" ? (
                    <Badge variant="success">✅ Normal</Badge>
                  ) : selectedProtocol.summary.result === "elevated" ? (
                    <Badge variant="destructive">⚠️ Elevado</Badge>
                  ) : (
                    <Badge variant="secondary">Em andamento</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Média PAS</p>
                    <p className="text-2xl font-bold text-chamon-navy">
                      {selectedProtocol.summary.avgPas ?? "—"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Média PAD</p>
                    <p className="text-2xl font-bold text-chamon-navy">
                      {selectedProtocol.summary.avgPad ?? "—"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Válidas</p>
                    <p className="text-2xl font-bold">
                      {selectedProtocol.summary.validCount}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Discrepantes</p>
                    <p className="text-2xl font-bold text-red-500">
                      {selectedProtocol.summary.discrepantCount}
                    </p>
                  </div>
                </div>

                <AdminIntraChart
                  measurements={selectedProtocol.measurements}
                />
                <MeasurementTable
                  measurements={selectedProtocol.measurements}
                />
              </CardContent>
            </Card>

            {/* Historical Evolution */}
            {patient.protocols.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>📉 Evolução Histórica</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminInterChart protocols={patient.protocols} />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {patient.protocols.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Nenhum protocolo iniciado.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

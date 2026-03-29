"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MeasurementFormProps {
  protocolId: number
  currentPeriod: "morning" | "night"
  measurementNumber: number
  totalForPeriod: number
  onMeasurementSaved: (measurement: {
    id: number
    isDiscrepant: boolean
    warnings: string[]
  }) => void
}

export function MeasurementForm({
  protocolId,
  currentPeriod,
  measurementNumber,
  totalForPeriod,
  onMeasurementSaved,
}: MeasurementFormProps) {
  const [pas, setPas] = useState("")
  const [pad, setPad] = useState("")
  const [pulse, setPulse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")

  const validate = (): string | null => {
    const p = parseInt(pas)
    const d = parseInt(pad)
    const pu = parseInt(pulse)
    if (!pas || isNaN(p)) return "Preencha a PAS (Sistólica)"
    if (p < 40 || p > 350) return "PAS deve estar entre 40 e 350"
    if (!pad || isNaN(d)) return "Preencha a PAD (Diastólica)"
    if (d < 20 || d > 250) return "PAD deve estar entre 20 e 250"
    if (!pulse || isNaN(pu)) return "Preencha o Pulso"
    if (pu < 20 || pu > 250) return "Pulso deve estar entre 20 e 250"
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")
    setWarning("")

    try {
      const res = await fetch(`/api/protocols/${protocolId}/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: currentPeriod,
          pas: parseInt(pas),
          pad: parseInt(pad),
          pulse: parseInt(pulse),
          datetime: new Date().toISOString(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao salvar")
        setLoading(false)
        return
      }

      if (data.isDiscrepant) {
        setWarning(
          "⚠️ Atenção: esta medida parece fora do esperado. Foi registrada, mas pode ser desconsiderada na análise."
        )
      }

      setPas("")
      setPad("")
      setPulse("")

      // small delay to show warning if any
      setTimeout(() => {
        onMeasurementSaved(data)
      }, data.isDiscrepant ? 2000 : 300)
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          <span className="text-3xl">
            {currentPeriod === "morning" ? "☀️ Manhã" : "🌙 Noite"}
          </span>
          <p className="text-lg text-gray-500 mt-1">
            Medição {measurementNumber} de {totalForPeriod}
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pas" className="text-xl">
            PAS (Sistólica) mmHg
          </Label>
          <Input
            id="pas"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 120"
            value={pas}
            onChange={(e) => setPas(e.target.value)}
            className="h-16 text-2xl text-center"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pad" className="text-xl">
            PAD (Diastólica) mmHg
          </Label>
          <Input
            id="pad"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 80"
            value={pad}
            onChange={(e) => setPad(e.target.value)}
            className="h-16 text-2xl text-center"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pulse" className="text-xl">
            Pulso (bpm)
          </Label>
          <Input
            id="pulse"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 72"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            className="h-16 text-2xl text-center"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-300 p-3 text-red-700 text-center">
            {error}
          </div>
        )}

        {warning && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-3 text-yellow-800 text-center">
            {warning}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? "Salvando..." : "Salvar Medição"}
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProtocolSelectorProps {
  patientToken: string
  onSelect: (protocol: { id: number; type: string }) => void
}

export function ProtocolSelector({
  patientToken,
  onSelect,
}: ProtocolSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleSelect = async (type: "5d" | "7d") => {
    setLoading(type)
    setError("")
    try {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientToken, type }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao criar protocolo")
        setLoading(null)
        return
      }
      onSelect(data)
    } catch {
      setError("Erro de conexão")
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Escolha o Tipo de Protocolo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-2 hover:border-chamon-primary transition-colors">
            <CardContent className="p-6 text-center space-y-3">
              <h3 className="text-2xl font-bold text-chamon-navy">5 Dias</h3>
              <p className="text-lg text-gray-600">
                3 medições manhã + 3 noite
              </p>
              <p className="text-sm text-gray-500">Total: 30 medições</p>
              <Button
                onClick={() => handleSelect("5d")}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === "5d" ? "Criando..." : "Escolher"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-chamon-primary transition-colors">
            <CardContent className="p-6 text-center space-y-3">
              <h3 className="text-2xl font-bold text-chamon-navy">7 Dias</h3>
              <p className="text-lg text-gray-600">
                2 medições manhã + 2 noite
              </p>
              <p className="text-sm text-gray-500">Total: 28 medições</p>
              <Button
                onClick={() => handleSelect("7d")}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === "7d" ? "Criando..." : "Escolher"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}

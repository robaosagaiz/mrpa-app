"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProtocolSummary } from "@/types"

interface FinalResultProps {
  summary: ProtocolSummary
  onViewHistory: () => void
  onNewProtocol: () => void
}

export function FinalResult({
  summary,
  onViewHistory,
  onNewProtocol,
}: FinalResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          🏁 Resultado do seu MRPA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center p-4">
            <p className="text-sm text-gray-500">Média PAS</p>
            <p className="text-4xl font-bold text-chamon-navy">
              {summary.avgPas ?? "—"}
            </p>
            <p className="text-sm text-gray-500">mmHg</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-sm text-gray-500">Média PAD</p>
            <p className="text-4xl font-bold text-chamon-navy">
              {summary.avgPad ?? "—"}
            </p>
            <p className="text-sm text-gray-500">mmHg</p>
          </Card>
        </div>

        <div className="text-center">
          {summary.result === "normal" ? (
            <Badge variant="success" className="text-lg px-6 py-2">
              ✅ NORMAL
            </Badge>
          ) : summary.result === "elevated" ? (
            <Badge variant="destructive" className="text-lg px-6 py-2">
              ⚠️ ELEVADO
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-lg px-6 py-2">
              Dados insuficientes
            </Badge>
          )}
        </div>

        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>
            {summary.validCount} medições válidas de {summary.totalCount} totais
          </p>
          {summary.discrepantCount > 0 && (
            <p>{summary.discrepantCount} medições desconsideradas</p>
          )}
        </div>

        <div className="rounded-xl bg-gray-100 p-4 text-sm text-gray-600">
          <p>
            <strong>Nota:</strong> Este resultado não substitui a avaliação
            médica. Consulte seu cardiologista.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={onViewHistory} variant="outline" className="w-full">
            Ver Histórico de Protocolos
          </Button>
          <Button onClick={onNewProtocol} className="w-full">
            Iniciar Novo Protocolo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

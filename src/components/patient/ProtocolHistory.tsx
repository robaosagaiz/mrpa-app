"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProtocolWithDetails } from "@/types"

interface ProtocolHistoryProps {
  completedProtocols: ProtocolWithDetails[]
}

export function ProtocolHistory({
  completedProtocols,
}: ProtocolHistoryProps) {
  if (completedProtocols.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Nenhum protocolo anterior encontrado.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">📋 Protocolos Anteriores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {completedProtocols.map((proto) => (
          <div
            key={proto.id}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border"
          >
            <div>
              <p className="font-medium text-lg">
                {new Date(proto.startDate).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm text-gray-500">
                {proto.type === "5d" ? "5 dias" : "7 dias"} —{" "}
                {proto.summary.avgPas ?? "—"}/{proto.summary.avgPad ?? "—"}{" "}
                mmHg
              </p>
            </div>
            <div>
              {proto.summary.result === "normal" ? (
                <Badge variant="success">Normal</Badge>
              ) : proto.summary.result === "elevated" ? (
                <Badge variant="destructive">Elevado</Badge>
              ) : (
                <Badge variant="secondary">—</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

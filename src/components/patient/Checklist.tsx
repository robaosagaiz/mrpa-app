"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CHECKLIST_ITEMS = [
  "Ambiente silencioso",
  "Repouso de 5 minutos (não se levante antes de medir)",
  "Evitei café, cigarro e exercício nas últimas 30 minutos",
  "Bexiga esvaziada",
  "Sentado com as costas apoiadas e pés no chão",
  "Braço apoiado na mesa, na altura do coração",
  "Manguito no braço nu (sem roupa)",
]

interface ChecklistProps {
  onComplete: () => void
}

export function Checklist({ onComplete }: ChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(CHECKLIST_ITEMS.length).fill(false)
  )

  const allChecked = checked.every(Boolean)

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          📋 Antes de Medir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {CHECKLIST_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-center gap-3 w-full min-h-[52px] p-3 rounded-xl border-2 text-left transition-colors ${
              checked[i]
                ? "border-green-500 bg-green-50 text-green-800"
                : "border-gray-200 bg-white text-gray-700 hover:border-chamon-primary"
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold ${
                checked[i]
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {checked[i] ? "✓" : i + 1}
            </div>
            <span className="text-lg">{item}</span>
          </button>
        ))}

        <div className="pt-4">
          <Button
            onClick={onComplete}
            disabled={!allChecked}
            size="lg"
            className="w-full"
          >
            Estou Pronto para Medir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

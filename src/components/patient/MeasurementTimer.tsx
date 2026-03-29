"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MeasurementTimerProps {
  onComplete: () => void
  seconds?: number
}

export function MeasurementTimer({
  onComplete,
  seconds = 60,
}: MeasurementTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (remaining === 0) {
      onComplete()
    }
  }, [remaining, onComplete])

  const percent = ((seconds - remaining) / seconds) * 100
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center gap-6">
        <h2 className="text-xl font-bold text-chamon-navy">
          Aguarde antes da próxima medição
        </h2>

        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#eff0f4"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#0074e4"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-chamon-navy">
              {remaining}s
            </span>
          </div>
        </div>

        <p className="text-lg text-gray-500 text-center">
          Permaneça sentado e relaxado
        </p>

        {remaining <= 30 && remaining > 0 && (
          <Button variant="outline" onClick={onComplete} size="sm">
            Já aguardei o suficiente
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

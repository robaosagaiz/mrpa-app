"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { PatientList } from "@/components/admin/PatientList"
import { NewPatientDialog } from "@/components/admin/NewPatientDialog"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import type { PatientListItem } from "@/types"

export default function AdminPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/patients")
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      setPatients(data)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  return (
    <div className="min-h-screen bg-chamon-gray">
      <AdminHeader />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-chamon-navy">Pacientes</h2>
          <NewPatientDialog onCreated={loadPatients} />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-xl border shadow-sm">
            <PatientList patients={patients} />
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NewPatientDialogProps {
  onCreated: () => void
}

export function NewPatientDialog({ onCreated }: NewPatientDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [createdUrl, setCreatedUrl] = useState("")

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Nome é obrigatório")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao criar paciente")
        setLoading(false)
        return
      }

      const fullUrl = `${window.location.origin}${data.patientUrl}`
      setCreatedUrl(fullUrl)
      onCreated()
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(createdUrl)
  }

  const handleClose = () => {
    setOpen(false)
    setName("")
    setCreatedUrl("")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="default">+ Novo Paciente</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Paciente</DialogTitle>
          <DialogDescription>
            Cadastre um novo paciente para gerar o link de acesso.
          </DialogDescription>
        </DialogHeader>

        {!createdUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do paciente</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              onClick={handleCreate}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Criando..." : "Criar e Gerar Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-green-50 border border-green-300 p-4">
              <p className="text-green-800 font-medium mb-2">
                ✅ Paciente criado com sucesso!
              </p>
              <p className="text-sm break-all font-mono bg-white p-2 rounded border">
                {createdUrl}
              </p>
            </div>

            <p className="text-sm text-gray-500">
              Envie este link para o paciente via WhatsApp.
            </p>

            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1">
                📋 Copiar Link
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

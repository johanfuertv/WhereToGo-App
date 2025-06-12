"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "./auth-context"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TravelerRegistrationFormProps {
  onBack: () => void
  onSuccess: () => void
}

export default function TravelerRegistrationForm({ onBack, onSuccess }: TravelerRegistrationFormProps) {
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    try {
      await register(formData.name, formData.email, formData.password, "traveler")
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Registro de Cuenta Viajera</h3>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Crear cuenta
          </Button>
        </div>
      </form>
    </div>
  )
}

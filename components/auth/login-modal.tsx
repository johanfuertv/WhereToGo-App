"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "./auth-context"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onRegisterClick: () => void
}

export default function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const { login, isLoading, isAuthServiceAvailable } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await login(email, password)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión. Inténtalo de nuevo.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] z-[1000]">
        <DialogHeader>
          <DialogTitle>Iniciar Sesión</DialogTitle>
          <DialogDescription>Ingresa tus credenciales para acceder a tu cuenta en WhereToGo.</DialogDescription>
        </DialogHeader>

        {!isAuthServiceAvailable && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El servicio de autenticación está temporalmente no disponible. Algunas funciones pueden estar limitadas.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || !isAuthServiceAvailable}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Button variant="link" className="p-0 h-auto text-xs" type="button">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || !isAuthServiceAvailable}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !isAuthServiceAvailable}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => {
              onClose()
              onRegisterClick()
            }}
          >
            Regístrate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

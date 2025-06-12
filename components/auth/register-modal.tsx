"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { UserRole } from "./auth-context"
import { AlertCircle, Briefcase, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "./auth-context"
import TravelerRegistrationForm from "./traveler-registration-form"
import BusinessRegistrationForm from "./business-registration-form"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

export default function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const { isAuthServiceAvailable } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
  }

  const handleBack = () => {
    setSelectedRole(null)
  }

  const handleSuccess = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] z-[1000]">
        <DialogHeader>
          <DialogTitle>Crear una cuenta</DialogTitle>
          <DialogDescription>Únete a WhereToGo para descubrir los mejores destinos en Colombia.</DialogDescription>
        </DialogHeader>

        {!isAuthServiceAvailable && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El servicio de autenticación está temporalmente no disponible. Algunas funciones pueden estar limitadas.
            </AlertDescription>
          </Alert>
        )}

        {selectedRole === null ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">Selecciona el tipo de cuenta que deseas crear:</p>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center"
                onClick={() => handleRoleSelect("traveler")}
                disabled={!isAuthServiceAvailable}
              >
                <User className="h-10 w-10 mb-2 text-primary" />
                <span className="font-medium">Cuenta Viajera</span>
                <span className="text-xs text-muted-foreground mt-1">Para explorar y planificar viajes</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center"
                onClick={() => handleRoleSelect("business")}
                disabled={!isAuthServiceAvailable}
              >
                <Briefcase className="h-10 w-10 mb-2 text-primary" />
                <span className="font-medium">Cuenta Anunciante</span>
                <span className="text-xs text-muted-foreground mt-1">Para promocionar tu negocio</span>
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => {
                  onClose()
                  onLoginClick()
                }}
              >
                Inicia sesión
              </Button>
            </div>
          </div>
        ) : selectedRole === "traveler" ? (
          <TravelerRegistrationForm onBack={handleBack} onSuccess={handleSuccess} />
        ) : (
          <BusinessRegistrationForm onBack={handleBack} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}

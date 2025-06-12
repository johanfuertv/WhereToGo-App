"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Briefcase, Heart, LogOut, Settings, User } from "lucide-react"
import LoginModal from "./login-modal"
import RegisterModal from "./register-modal"
import Link from "next/link"

export default function UserMenu() {
  // Implementación de fallback para cuando el contexto de autenticación no está disponible
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  // Usar try/catch para manejar el caso en que useAuth no esté disponible
  // Initialize user and logout using useAuth hook.  This avoids calling the hook conditionally.
  let auth
  try {
    auth = useAuth()
  } catch (error) {
    console.warn("Auth context not available, using fallback")
    auth = { user: null, logout: () => {} } // Provide a fallback object
  }

  const { user, logout } = auth

  const openLoginModal = () => {
    setIsLoginModalOpen(true)
  }

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true)
  }

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 z-[60]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mi perfil</span>
            </DropdownMenuItem>
            <Link href="/perfil/favoritos">
              <DropdownMenuItem>
                <Heart className="mr-2 h-4 w-4" />
                <span>Favoritos</span>
              </DropdownMenuItem>
            </Link>
            {user.role === "business" && (
              <DropdownMenuItem>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Mi negocio</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openLoginModal}>
            Iniciar Sesión
          </Button>
          <Button size="sm" onClick={openRegisterModal}>
            Registrarse
          </Button>
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={openRegisterModal}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={openLoginModal}
      />
    </>
  )
}

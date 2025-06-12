"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as AuthAPI from "@/services/auth-api"
import * as NotificationsAPI from "@/services/notifications-api"

export type UserRole = "traveler" | "business" | null
export type BusinessType = "hotel" | "restaurant" | "transport" | "tour" | "other" | null

export interface BusinessDetails {
  name: string
  type: BusinessType
  address: string
  city: string
  description: string
}

export interface PaymentMethod {
  type: "credit_card" | "bank_account"
  lastFour?: string
  bank?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  businessDetails?: BusinessDetails
  paymentMethods?: PaymentMethod[]
  createdAt?: string
  lastLogin?: string | null
  isActive?: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthServiceAvailable: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    businessDetails?: BusinessDetails,
    paymentMethod?: PaymentMethod,
  ) => Promise<void>
  logout: () => void
  updateProfile: (data: { name?: string; businessDetails?: BusinessDetails }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthServiceAvailable, setIsAuthServiceAvailable] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedToken = localStorage.getItem("auth_token")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
          // Verificar si el token sigue siendo válido
          try {
            const tokenVerification = await AuthAPI.verifyToken(storedToken)
            if (tokenVerification.valid) {
              setToken(storedToken)
              setUser(JSON.parse(storedUser))
              setIsAuthServiceAvailable(true)
            } else {
              // Token inválido, limpiar storage
              localStorage.removeItem("auth_token")
              localStorage.removeItem("user")
            }
          } catch (error) {
            console.error("Token verification failed:", error)
            // Si falla la verificación, asumir que el servicio no está disponible
            // pero mantener la sesión local
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
            setIsAuthServiceAvailable(false)
          }
        }
      } catch (error) {
        console.error("Failed to restore user session:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    // Ejecutar solo en el cliente
    if (typeof window !== "undefined") {
      checkUserSession()
      // Check if auth service is available
      checkAuthService()
    }
  }, [])

  // Periodically check if auth service is available
  const checkAuthService = async () => {
    try {
      const isAvailable = await AuthAPI.checkServiceHealth()
      setIsAuthServiceAvailable(isAvailable)
    } catch (error) {
      setIsAuthServiceAvailable(false)
    }
  }

  // Set up periodic health check
  useEffect(() => {
    if (typeof window === "undefined") return

    const interval = setInterval(checkAuthService, 180000) // Check every 3 minutes
    return () => clearInterval(interval)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (!isAuthServiceAvailable) {
        throw new Error(
          "El servicio de autenticación no está disponible en este momento. Por favor, inténtelo más tarde.",
        )
      }

      const response = await AuthAPI.login({ email, password })

      setUser(response.user)
      setToken(response.token)

      // Guardar en localStorage
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      console.log("✅ Login exitoso:", response.user.name)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    businessDetails?: BusinessDetails,
    paymentMethod?: PaymentMethod,
  ) => {
    setIsLoading(true)
    try {
      if (!isAuthServiceAvailable) {
        throw new Error(
          "El servicio de autenticación no está disponible en este momento. Por favor, inténtelo más tarde.",
        )
      }

      const response = await AuthAPI.register({
        name,
        email,
        password,
        role: role!,
        businessDetails,
        paymentMethod,
      })

      setUser(response.user)
      setToken(response.token)

      // Guardar en localStorage
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      // Enviar notificación de bienvenida
      try {
        await NotificationsAPI.sendWelcomeNotification(response.user.id, response.user.name)
      } catch (notifError) {
        console.warn("No se pudo enviar notificación de bienvenida:", notifError)
      }

      console.log("✅ Registro exitoso:", response.user.name)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: { name?: string; businessDetails?: BusinessDetails }) => {
    if (!token) throw new Error("No hay token de autenticación")

    try {
      const response = await AuthAPI.updateProfile(token, data)
      setUser(response.user)
      localStorage.setItem("user", JSON.stringify(response.user))
      console.log("✅ Perfil actualizado:", response.user.name)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (token && isAuthServiceAvailable) {
        await AuthAPI.logout(token)
      }
    } catch (error) {
      console.warn("Error during logout API call:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
      console.log("✅ Logout exitoso")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthServiceAvailable,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

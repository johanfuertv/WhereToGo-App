"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as RatingsAPI from "@/services/ratings-api"

interface RatingsContextType {
  isServiceAvailable: boolean
  checkServiceAvailability: () => Promise<void>
}

const RatingsContext = createContext<RatingsContextType | undefined>(undefined)

export const RatingsProvider = ({ children }: { children: ReactNode }) => {
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)

  const checkServiceAvailability = async () => {
    try {
      const isAvailable = await RatingsAPI.checkServiceHealth()
      setIsServiceAvailable(isAvailable)
      console.log("Estado del servicio de calificaciones:", isAvailable ? "Disponible" : "No disponible")
    } catch (error) {
      console.error("Error al verificar disponibilidad del servicio de calificaciones:", error)
      setIsServiceAvailable(false)
    }
  }

  useEffect(() => {
    // Verificar disponibilidad inicial
    checkServiceAvailability()

    // Verificar periódicamente
    const interval = setInterval(checkServiceAvailability, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <RatingsContext.Provider value={{ isServiceAvailable, checkServiceAvailability }}>
      {children}
    </RatingsContext.Provider>
  )
}

export const useRatings = () => {
  const context = useContext(RatingsContext)
  if (context === undefined) {
    throw new Error("useRatings debe ser usado dentro de un RatingsProvider")
  }
  return context
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as ReviewsAPI from "@/services/reviews-api"

interface ReviewsContextType {
  isServiceAvailable: boolean
  checkServiceAvailability: () => Promise<void>
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)

  const checkServiceAvailability = async () => {
    try {
      const isAvailable = await ReviewsAPI.checkServiceHealth()
      setIsServiceAvailable(isAvailable)
      console.log("Estado del servicio de reseñas:", isAvailable ? "Disponible" : "No disponible")
    } catch (error) {
      console.error("Error al verificar disponibilidad del servicio de reseñas:", error)
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
    <ReviewsContext.Provider value={{ isServiceAvailable, checkServiceAvailability }}>
      {children}
    </ReviewsContext.Provider>
  )
}

export const useReviews = () => {
  const context = useContext(ReviewsContext)
  if (context === undefined) {
    throw new Error("useReviews debe ser usado dentro de un ReviewsProvider")
  }
  return context
}

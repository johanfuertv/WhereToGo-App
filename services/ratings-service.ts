"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/components/auth/auth-context"

// Tipos para las calificaciones
export interface Rating {
  id?: string
  placeId: string
  placeType: "restaurant" | "hotel" | "activity" | "city"
  userId: string
  userName: string
  rating: number
  comment?: string
  date?: string
}

export interface RatingAverage {
  placeId: string
  placeType: string
  averageRating: number
  totalRatings: number
}

// API simulada para calificaciones
const ratingsApi = {
  baseUrl: "http://localhost:3003",

  async checkServiceHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      return false
    }
  },

  async getRatings(placeId: string, placeType: string): Promise<Rating[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ratings/${placeType}/${placeId}`)
      if (!response.ok) throw new Error("Error fetching ratings")
      return await response.json()
    } catch (error) {
      // Devolver datos de ejemplo si el servicio no está disponible
      return this.getLocalRatings(placeId, placeType)
    }
  },

  async getRatingAverage(placeId: string, placeType: string): Promise<RatingAverage> {
    try {
      const response = await fetch(`${this.baseUrl}/ratings/${placeType}/${placeId}/average`)
      if (!response.ok) throw new Error("Error fetching rating average")
      return await response.json()
    } catch (error) {
      // Devolver datos de ejemplo si el servicio no está disponible
      const ratings = this.getLocalRatings(placeId, placeType)
      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
      const avg = ratings.length > 0 ? sum / ratings.length : 4.5

      return {
        placeId,
        placeType,
        averageRating: Number.parseFloat(avg.toFixed(1)),
        totalRatings: ratings.length || 10,
      }
    }
  },

  async getUserRating(userId: string, placeId: string, placeType: string): Promise<Rating | null> {
    try {
      const response = await fetch(`${this.baseUrl}/ratings/${placeType}/${placeId}/user/${userId}`)
      if (!response.ok) throw new Error("Error fetching user rating")
      return await response.json()
    } catch (error) {
      // Buscar en calificaciones locales
      const ratings = this.getLocalRatings(placeId, placeType)
      return ratings.find((r) => r.userId === userId) || null
    }
  },

  async addOrUpdateRating(rating: Rating): Promise<Rating> {
    try {
      const response = await fetch(`${this.baseUrl}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rating),
      })

      if (!response.ok) throw new Error("Error adding/updating rating")

      // Guardar también localmente
      this.saveRatingLocally(rating)
      return await response.json()
    } catch (error) {
      // Guardar localmente si falla
      this.saveRatingLocally(rating)
      return {
        ...rating,
        id: `local_${Date.now()}`,
        date: new Date().toISOString(),
      }
    }
  },

  getLocalRatings(placeId: string, placeType: string): Rating[] {
    try {
      const stored = localStorage.getItem(`ratings_${placeType}_${placeId}`)
      if (stored) return JSON.parse(stored)

      // Datos de ejemplo si no hay nada guardado
      return [
        {
          id: "sample1",
          placeId,
          placeType,
          userId: "user1",
          userName: "María López",
          rating: 5,
          comment: "¡Excelente lugar! La comida es deliciosa y el servicio muy amable.",
          date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "sample2",
          placeId,
          placeType,
          userId: "user2",
          userName: "Carlos Rodríguez",
          rating: 4,
          comment: "Muy buena experiencia. Recomendado para ocasiones especiales.",
          date: new Date(Date.now() - 172800000).toISOString(),
        },
      ]
    } catch (error) {
      console.error("Error al obtener calificaciones locales:", error)
      return []
    }
  },

  saveRatingLocally(rating: Rating): void {
    try {
      const { placeId, placeType } = rating
      const key = `ratings_${placeType}_${placeId}`

      // Obtener calificaciones existentes
      const existingRatings = this.getLocalRatings(placeId, placeType)

      // Buscar si ya existe una calificación del mismo usuario
      const index = existingRatings.findIndex((r) => r.userId === rating.userId)

      if (index >= 0) {
        // Actualizar calificación existente
        existingRatings[index] = {
          ...rating,
          date: new Date().toISOString(),
        }
      } else {
        // Añadir nueva calificación
        existingRatings.push({
          ...rating,
          id: `local_${Date.now()}`,
          date: new Date().toISOString(),
        })
      }

      // Guardar en localStorage
      localStorage.setItem(key, JSON.stringify(existingRatings))
    } catch (error) {
      console.error("Error al guardar calificación localmente:", error)
    }
  },
}

// Hook para usar el servicio de calificaciones
export const useRatingsService = (placeId?: string, placeType?: "restaurant" | "hotel" | "activity" | "city") => {
  const { user } = useAuth()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [ratingAverage, setRatingAverage] = useState<RatingAverage | null>(null)
  const [userRating, setUserRating] = useState<Rating | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)

  // Usar refs para evitar re-renders innecesarios
  const lastCheckTimeRef = useRef(0)
  const CHECK_INTERVAL = 180000 // 3 minutos entre verificaciones
  const isMountedRef = useRef(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar disponibilidad del servicio sin causar re-renders frecuentes
  const checkServiceAvailability = useCallback(async () => {
    // Evitar verificaciones demasiado frecuentes
    if (Date.now() - lastCheckTimeRef.current < CHECK_INTERVAL) {
      return
    }

    try {
      const isAvailable = await ratingsApi.checkServiceHealth()
      // Solo actualizar el estado si ha cambiado para evitar re-renderizados innecesarios
      if (isAvailable !== isServiceAvailable && isMountedRef.current) {
        setIsServiceAvailable(isAvailable)
      }
      lastCheckTimeRef.current = Date.now()
    } catch (error) {
      if (isServiceAvailable && isMountedRef.current) {
        setIsServiceAvailable(false)
      }
      lastCheckTimeRef.current = Date.now()
    }
  }, [isServiceAvailable])

  const loadRatingsData = useCallback(async () => {
    if (!placeId || !placeType) return

    setIsLoading(true)
    try {
      // Cargar calificaciones y promedio en paralelo
      const [ratingsData, averageData] = await Promise.all([
        ratingsApi.getRatings(placeId, placeType),
        ratingsApi.getRatingAverage(placeId, placeType),
      ])

      // Verificar que el componente sigue montado antes de actualizar el estado
      if (!isMountedRef.current) return

      setRatings(ratingsData)
      setRatingAverage(averageData)

      // Actualizar el estado de disponibilidad del servicio
      setIsServiceAvailable(true)
      lastCheckTimeRef.current = Date.now()

      // Si hay un usuario logueado, intentar cargar su calificación específica
      if (user) {
        try {
          const userRatingData = await ratingsApi.getUserRating(user.id, placeId, placeType)
          if (isMountedRef.current) {
            setUserRating(userRatingData)
          }
        } catch (error) {
          // Intentamos encontrar la calificación del usuario en las calificaciones cargadas
          const foundUserRating = ratingsData.find((rating) => rating.userId === user.id)
          if (isMountedRef.current) {
            setUserRating(foundUserRating || null)
          }
        }
      } else {
        if (isMountedRef.current) {
          setUserRating(null)
        }
      }
    } catch (error) {
      // Si hay un error al cargar, asumimos que el servicio no está disponible
      if (isMountedRef.current) {
        setIsServiceAvailable(false)
        lastCheckTimeRef.current = Date.now()
      }
    } finally {
      // Pequeño retraso para evitar parpadeos en la UI
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }, 300)
    }
  }, [placeId, placeType, user])

  // Cargar datos al iniciar o cuando cambian los parámetros
  useEffect(() => {
    isMountedRef.current = true

    if (placeId && placeType) {
      loadRatingsData()
    } else {
      setRatings([])
      setRatingAverage(null)
      setUserRating(null)
      setIsLoading(false)
    }

    // Verificar periódicamente con un intervalo más largo
    checkIntervalRef.current = setInterval(checkServiceAvailability, CHECK_INTERVAL)

    return () => {
      isMountedRef.current = false
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
    }
  }, [placeId, placeType, user, loadRatingsData, checkServiceAvailability])

  const addOrUpdateRating = async (rating: number) => {
    if (!user) {
      throw new Error("Debes iniciar sesión para calificar")
    }

    if (!placeId || !placeType) {
      throw new Error("Información del lugar incompleta")
    }

    try {
      const newRating = await ratingsApi.addOrUpdateRating({
        placeId,
        placeType,
        userId: user.id,
        userName: user.name,
        rating,
      })

      // Actualizar el estado local
      if (isMountedRef.current) {
        setUserRating(newRating)
      }

      // Recargar los datos para obtener el nuevo promedio
      await loadRatingsData()

      // Actualizar el estado de disponibilidad del servicio
      if (isMountedRef.current) {
        setIsServiceAvailable(true)
        lastCheckTimeRef.current = Date.now()
      }

      return newRating
    } catch (error) {
      // Si hay un error al añadir, verificamos si el servicio sigue disponible
      if (isMountedRef.current) {
        setIsServiceAvailable(false)
        lastCheckTimeRef.current = Date.now()
      }
      throw error
    }
  }

  const getUserRatingValue = () => {
    return userRating?.rating || 0
  }

  const hasUserRated = () => {
    return userRating !== null
  }

  return {
    ratings,
    ratingAverage,
    userRating,
    isLoading,
    isServiceAvailable,
    addOrUpdateRating,
    getUserRatingValue,
    hasUserRated,
    refreshData: loadRatingsData,
  }
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import * as ReviewsAPI from "./reviews-api"
import type { Review } from "./reviews-api"

export type { Review } from "./reviews-api"

export const useReviewsService = (placeId?: string, placeType?: "restaurant" | "hotel" | "activity" | "city") => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const CHECK_INTERVAL = 60000 // 60 segundos entre verificaciones (aumentado de 30000)

  // Verificar disponibilidad del servicio
  const checkServiceAvailability = async () => {
    // Evitar verificaciones demasiado frecuentes
    if (Date.now() - lastCheckTime < CHECK_INTERVAL) {
      return
    }

    try {
      const isAvailable = await ReviewsAPI.checkServiceHealth()
      // Solo actualizar el estado si ha cambiado para evitar re-renderizados innecesarios
      if (isAvailable !== isServiceAvailable) {
        setIsServiceAvailable(isAvailable)
        console.log("Estado del servicio de reseñas:", isAvailable ? "Disponible" : "No disponible")
      }
      setLastCheckTime(Date.now())
    } catch (error) {
      console.error("Error al verificar disponibilidad del servicio de reseñas:", error)
      if (isServiceAvailable) {
        setIsServiceAvailable(false)
      }
      setLastCheckTime(Date.now())
    }
  }

  // Cargar reseñas al iniciar o cuando cambian los parámetros
  useEffect(() => {
    if (placeId && placeType) {
      loadReviews()
    } else {
      setReviews([])
      setIsLoading(false)
    }

    // Verificar periódicamente
    const interval = setInterval(() => {
      // Solo verificar si ha pasado suficiente tiempo desde la última verificación
      if (Date.now() - lastCheckTime >= CHECK_INTERVAL) {
        checkServiceAvailability()
      }
    }, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [placeId, placeType, user, lastCheckTime])

  const loadReviews = async () => {
    if (!placeId || !placeType) return

    setIsLoading(true)
    try {
      // Cargar todas las reseñas para este lugar (ahora getReviews siempre devuelve algo, incluso en caso de error)
      const data = await ReviewsAPI.getReviews(placeId, placeType)
      setReviews(data)

      // Actualizar el estado de disponibilidad del servicio
      setIsServiceAvailable(true)
      setLastCheckTime(Date.now())

      // Si hay un usuario logueado, intentar cargar su reseña específica
      if (user) {
        try {
          const userReviewData = await ReviewsAPI.getUserReview(placeId, placeType, user.id)
          setUserReview(userReviewData)
        } catch (error) {
          console.error("Error al cargar la reseña del usuario:", error)
          // Intentamos encontrar la reseña del usuario en las reseñas cargadas
          const foundUserReview = data.find((review) => review.userId === user.id)
          setUserReview(foundUserReview || null)
        }
      } else {
        setUserReview(null)
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
      // Si hay un error al cargar, asumimos que el servicio no está disponible
      setIsServiceAvailable(false)
      setLastCheckTime(Date.now())
    } finally {
      setIsLoading(false)
    }
  }

  const addReview = async (rating: number, comment: string) => {
    if (!isServiceAvailable) {
      throw new Error("El servicio de reseñas no está disponible. No puedes dejar tu opinión ahora mismo.")
    }

    if (!user) {
      throw new Error("Debes iniciar sesión para dejar una reseña")
    }

    if (!placeId || !placeType) {
      throw new Error("Información del lugar incompleta")
    }

    try {
      const newReview = await ReviewsAPI.addReview({
        placeId,
        placeType,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
      })

      // Actualizar el estado local sin necesidad de recargar todas las reseñas
      setReviews((prev) => [...prev, newReview])
      setUserReview(newReview)

      // Actualizar el estado de disponibilidad del servicio
      setIsServiceAvailable(true)
      setLastCheckTime(Date.now())

      return newReview
    } catch (error) {
      console.error("Error adding review:", error)
      // Si hay un error al añadir, verificamos si el servicio sigue disponible
      setIsServiceAvailable(false)
      setLastCheckTime(Date.now())
      throw error
    }
  }

  const getUserReview = () => {
    return userReview
  }

  const updateReview = async (reviewId: string, rating: number, comment: string) => {
    if (!isServiceAvailable) {
      throw new Error("El servicio de reseñas no está disponible. No puedes actualizar tu opinión ahora mismo.")
    }

    if (!user) {
      throw new Error("Debes iniciar sesión para actualizar una reseña")
    }

    try {
      const updatedReview = await ReviewsAPI.updateReview(reviewId, user.id, rating, comment)

      // Actualizar el estado local sin necesidad de recargar todas las reseñas
      setReviews((prev) => prev.map((review) => (review.id === reviewId ? updatedReview : review)))
      setUserReview(updatedReview)

      // Actualizar el estado de disponibilidad del servicio
      setIsServiceAvailable(true)
      setLastCheckTime(Date.now())

      return true
    } catch (error) {
      console.error("Error updating review:", error)
      // Si hay un error al actualizar, verificamos si el servicio sigue disponible
      setIsServiceAvailable(false)
      setLastCheckTime(Date.now())
      throw error
    }
  }

  return {
    reviews,
    isLoading,
    isServiceAvailable,
    addReview,
    getUserReview,
    updateReview,
  }
}

"use client"

import { useState, useEffect } from "react"
import * as FavoritesAPI from "./favorites-api"
import type { FavoritePlace } from "./favorites-api"

export type { FavoritePlace } from "./favorites-api"

// Añadir esta función al inicio del archivo, fuera del hook
const saveToLocalStorage = (favorites: FavoritePlace[]) => {
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  } catch (error) {
    console.error("Error al guardar en localStorage:", error)
  }
}

export const useFavoritesService = () => {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const CHECK_INTERVAL = 60000 // 60 segundos entre verificaciones (aumentado de 30000)

  // Verificar disponibilidad del servicio
  const checkServiceAvailability = async () => {
    // Evitar verificaciones demasiado frecuentes
    if (Date.now() - lastCheckTime < CHECK_INTERVAL) {
      return
    }

    try {
      const isAvailable = await FavoritesAPI.checkServiceHealth()
      // Solo actualizar el estado si ha cambiado para evitar re-renderizados innecesarios
      if (isAvailable !== isServiceAvailable) {
        setIsServiceAvailable(isAvailable)
        console.log("Estado del servicio de favoritos:", isAvailable ? "Disponible" : "No disponible")
      }
      setLastCheckTime(Date.now())
    } catch (error) {
      console.error("Error al verificar disponibilidad del servicio de favoritos:", error)
      if (isServiceAvailable) {
        setIsServiceAvailable(false)
      }
      setLastCheckTime(Date.now())
    }
  }

  // Cargar favoritos al iniciar
  useEffect(() => {
    loadFavorites()

    // Verificar periódicamente
    const interval = setInterval(() => {
      // Solo verificar si ha pasado suficiente tiempo desde la última verificación
      if (Date.now() - lastCheckTime >= CHECK_INTERVAL) {
        checkServiceAvailability()
      }
    }, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [lastCheckTime])

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      // Intentar cargar desde el API (ahora getFavorites siempre devuelve algo, incluso en caso de error)
      const data = await FavoritesAPI.getFavorites()
      setFavorites(data)

      // Actualizar el estado de disponibilidad del servicio basado en si la operación tuvo éxito
      setIsServiceAvailable(true)
      setLastCheckTime(Date.now())
    } catch (error) {
      console.error("Error loading favorites:", error)

      // Si hay un error al cargar, asumimos que el servicio no está disponible
      setIsServiceAvailable(false)
      setLastCheckTime(Date.now())

      // Intentar cargar desde localStorage
      try {
        const storedFavorites = localStorage.getItem("favorites")
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites))
          console.log("Usando favoritos almacenados localmente")
        } else {
          // Si no hay datos en localStorage, usar datos de ejemplo
          setFavorites(FavoritesAPI.getMockFavorites())
        }
      } catch (localError) {
        console.error("Error al cargar favoritos locales:", localError)
        // Si todo falla, usar datos de ejemplo
        setFavorites(FavoritesAPI.getMockFavorites())
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addFavorite = async (place: FavoritePlace) => {
    try {
      // Verificar si el servicio está disponible antes de intentar añadir
      if (!isServiceAvailable) {
        throw new Error("El servicio de favoritos no está disponible en este momento")
      }

      // Intentar añadir el favorito
      await FavoritesAPI.addFavorite(place)

      // Actualizar el estado local sin necesidad de recargar todos los favoritos
      setFavorites((prev) => [...prev, place])

      return true
    } catch (error) {
      console.error("Error adding favorite:", error)

      // Si el servicio no está disponible, lanzar el error para que se maneje en la UI
      if (!isServiceAvailable) {
        throw new Error("El servicio de favoritos no está disponible. No se puede añadir a favoritos en este momento.")
      }

      // Para otros errores, intentar guardar localmente
      setFavorites((prev) => [...prev, place])
      saveToLocalStorage([...favorites, place])

      // Actualizar el estado de disponibilidad
      setIsServiceAvailable(false)
      setLastCheckTime(Date.now())

      throw error
    }
  }

  const removeFavorite = async (id: string) => {
    try {
      // Verificar si el servicio está disponible antes de intentar eliminar
      if (!isServiceAvailable) {
        throw new Error("El servicio de favoritos no está disponible en este momento")
      }

      // Intentar eliminar el favorito
      await FavoritesAPI.removeFavorite(id)

      // Actualizar el estado local sin necesidad de recargar todos los favoritos
      setFavorites((prev) => prev.filter((fav) => fav.id !== id))

      return true
    } catch (error) {
      console.error("Error removing favorite:", error)

      // Si el servicio no está disponible, lanzar el error para que se maneje en la UI
      if (!isServiceAvailable) {
        throw new Error(
          "El servicio de favoritos no está disponible. No se puede eliminar de favoritos en este momento.",
        )
      }

      // Para otros errores, intentar eliminar localmente
      setFavorites((prev) => prev.filter((fav) => fav.id !== id))
      saveToLocalStorage(favorites.filter((fav) => fav.id !== id))

      // Actualizar el estado de disponibilidad
      setIsServiceAvailable(false)
      setLastCheckTime(Date.now())

      throw error
    }
  }

  const isFavorite = (placeId: string) => {
    return favorites.some((fav) => fav.id === placeId)
  }

  return {
    favorites,
    isLoading,
    isServiceAvailable,
    addFavorite,
    removeFavorite,
    isFavorite,
  }
}

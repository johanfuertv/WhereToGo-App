"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/auth/auth-context"
import * as FavoritesAPI from "@/services/favorites-api"
import type { FavoritePlace } from "@/services/favorites-api"

interface FavoritesContextType {
  favorites: FavoritePlace[]
  isLoading: boolean
  isServiceAvailable: boolean
  addFavorite: (place: FavoritePlace) => Promise<boolean>
  removeFavorite: (id: string) => Promise<boolean>
  isFavorite: (placeId: string) => boolean
  toggleFavorite: (place: FavoritePlace) => Promise<boolean>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoritePlace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isServiceAvailable, setIsServiceAvailable] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState(0)

  // Reducir frecuencia de verificaciones para mejorar rendimiento
  const CHECK_INTERVAL = 3 * 60 * 1000 // 3 minutos

  // Verificar disponibilidad del servicio (optimizado)
  const checkServiceAvailability = useCallback(async () => {
    const now = Date.now()
    if (now - lastCheckTime < CHECK_INTERVAL) {
      return isServiceAvailable
    }

    try {
      const available = await FavoritesAPI.checkServiceHealth()
      setIsServiceAvailable(available)
      setLastCheckTime(now)
      return available
    } catch (error) {
      setIsServiceAvailable(false)
      setLastCheckTime(now)
      return false
    }
  }, [lastCheckTime, isServiceAvailable, CHECK_INTERVAL])

  // Cargar favoritos desde localStorage primero (para hidratación)
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const stored = localStorage.getItem(`favorites_${user.id}`)
        if (stored) {
          setFavorites(JSON.parse(stored))
        }
      } catch (error) {
        console.error("Error cargando favoritos locales:", error)
      }
    }
  }, [user])

  // Cargar favoritos del servidor (optimizado)
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      return
    }

    try {
      const available = await checkServiceAvailability()
      if (available) {
        setIsLoading(true)
        const data = await FavoritesAPI.getFavorites()
        setFavorites(data)
        // Guardar en localStorage
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(data))
      }
    } catch (error) {
      console.error("Error cargando favoritos del servidor:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user, checkServiceAvailability])

  // Cargar favoritos cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user, loadFavorites])

  // Función optimizada para verificar si es favorito
  const isFavorite = useCallback(
    (placeId: string) => {
      return favorites.some((fav) => fav.id === placeId)
    },
    [favorites],
  )

  // Añadir favorito (siempre funciona, con o sin servicio)
  const addFavorite = useCallback(
    async (place: FavoritePlace): Promise<boolean> => {
      if (!user) {
        return false
      }

      try {
        // Actualizar UI inmediatamente (optimistic update)
        const newFavorites = [...favorites, place]
        setFavorites(newFavorites)

        // Guardar en localStorage inmediatamente
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))

        // Intentar guardar en el servidor si está disponible
        const available = await checkServiceAvailability()
        if (available) {
          await FavoritesAPI.addFavorite(place)
          console.log(`💖 Favorito añadido al servidor: ${place.name}`)
        } else {
          console.log(`💖 Favorito añadido localmente: ${place.name}`)
        }

        return true
      } catch (error) {
        // Si falla, revertir el cambio optimista
        setFavorites((prev) => prev.filter((fav) => fav.id !== place.id))
        console.error("Error añadiendo favorito:", error)
        return false
      }
    },
    [user, favorites, checkServiceAvailability],
  )

  // Remover favorito (siempre funciona, con o sin servicio)
  const removeFavorite = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        return false
      }

      try {
        // Actualizar UI inmediatamente (optimistic update)
        const newFavorites = favorites.filter((fav) => fav.id !== id)
        setFavorites(newFavorites)

        // Actualizar localStorage inmediatamente
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))

        // Intentar remover del servidor si está disponible
        const available = await checkServiceAvailability()
        if (available) {
          await FavoritesAPI.removeFavorite(id)
          console.log(`💔 Favorito removido del servidor: ${id}`)
        } else {
          console.log(`💔 Favorito removido localmente: ${id}`)
        }

        return true
      } catch (error) {
        // Si falla, revertir el cambio optimista
        const removedFavorite = favorites.find((fav) => fav.id === id)
        if (removedFavorite) {
          setFavorites((prev) => [...prev, removedFavorite])
        }
        console.error("Error removiendo favorito:", error)
        return false
      }
    },
    [user, favorites, checkServiceAvailability],
  )

  // Toggle favorito (función de conveniencia)
  const toggleFavorite = useCallback(
    async (place: FavoritePlace): Promise<boolean> => {
      if (isFavorite(place.id)) {
        return await removeFavorite(place.id)
      } else {
        return await addFavorite(place)
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  )

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(
    () => ({
      favorites,
      isLoading,
      isServiceAvailable,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite,
    }),
    [favorites, isLoading, isServiceAvailable, addFavorite, removeFavorite, isFavorite, toggleFavorite],
  )

  return <FavoritesContext.Provider value={contextValue}>{children}</FavoritesContext.Provider>
}

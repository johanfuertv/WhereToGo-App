export interface FavoritePlace {
  id: string
  name: string
  type: "restaurant" | "hotel" | "activity"
  image: string
  location: string
}

const API_URL = "http://localhost:3001/api"

// Variable para almacenar el estado de disponibilidad del servicio
let cachedServiceAvailability = false
let lastCheckTime = 0
const CHECK_INTERVAL = 60000 // 60 segundos entre verificaciones (aumentado de 30000)

export const getFavorites = async (): Promise<FavoritePlace[]> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de favoritos no disponible, usando datos de fallback sin intentar petición")
      return getMockFavorites()
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Actualizar el estado de disponibilidad del servicio
    cachedServiceAvailability = true
    lastCheckTime = Date.now()

    if (!response.ok) {
      throw new Error("Error al obtener favoritos")
    }

    const data = await response.json()

    // Guardar en localStorage como respaldo
    try {
      localStorage.setItem("favorites", JSON.stringify(data))
    } catch (localError) {
      console.error("Error al guardar favoritos en localStorage:", localError)
    }

    return data
  } catch (error) {
    console.error("Error en getFavorites:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Intentar recuperar datos del localStorage como fallback
    try {
      const storedFavorites = localStorage.getItem("favorites")
      if (storedFavorites) {
        return JSON.parse(storedFavorites)
      }
    } catch (localError) {
      console.error("Error al recuperar favoritos del localStorage:", localError)
    }

    // Si no hay datos en localStorage o hay un error, devolver datos de ejemplo
    return getMockFavorites()
  }
}

// Función para generar datos de ejemplo de favoritos
export function getMockFavorites(): FavoritePlace[] {
  return [
    {
      id: "peru-cook",
      name: "Peru Cook",
      type: "restaurant",
      image: "/placeholder.svg?height=200&width=300&text=Peru%20Cook",
      location: "Guadalajara de Buga",
    },
    {
      id: "hotel-guadalajara",
      name: "Hotel Guadalajara",
      type: "hotel",
      image: "/placeholder.svg?height=200&width=300&text=Hotel%20Guadalajara",
      location: "Guadalajara de Buga",
    },
    {
      id: "visita-a-la-basilica",
      name: "Visita a la Basílica",
      type: "activity",
      image: "/placeholder.svg?height=200&width=300&text=Basílica",
      location: "Guadalajara de Buga",
    },
  ]
}

export const addFavorite = async (favorite: FavoritePlace): Promise<FavoritePlace> => {
  try {
    // Si el servicio ya se sabe que no está disponible, guardar solo localmente
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de favoritos no disponible, guardando favorito solo localmente")

      // Actualizar localStorage con el nuevo favorito
      try {
        const currentFavorites = localStorage.getItem("favorites")
        let favoritesArray = []
        if (currentFavorites) {
          favoritesArray = JSON.parse(currentFavorites)
        }
        favoritesArray.push(favorite)
        localStorage.setItem("favorites", JSON.stringify(favoritesArray))
      } catch (localError) {
        console.error("Error al actualizar favoritos en localStorage:", localError)
      }

      return favorite
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

    const response = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(favorite),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Actualizar el estado de disponibilidad del servicio
    cachedServiceAvailability = true
    lastCheckTime = Date.now()

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al añadir favorito")
    }

    // Actualizar localStorage con el nuevo favorito
    try {
      const currentFavorites = localStorage.getItem("favorites")
      let favoritesArray = []
      if (currentFavorites) {
        favoritesArray = JSON.parse(currentFavorites)
      }
      favoritesArray.push(favorite)
      localStorage.setItem("favorites", JSON.stringify(favoritesArray))
    } catch (localError) {
      console.error("Error al actualizar favoritos en localStorage:", localError)
    }

    return response.json()
  } catch (error) {
    console.error("Error en addFavorite:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Guardar localmente en caso de error
    try {
      const currentFavorites = localStorage.getItem("favorites")
      let favoritesArray = []
      if (currentFavorites) {
        favoritesArray = JSON.parse(currentFavorites)
      }
      favoritesArray.push(favorite)
      localStorage.setItem("favorites", JSON.stringify(favoritesArray))
    } catch (localError) {
      console.error("Error al actualizar favoritos en localStorage:", localError)
    }

    return favorite
  }
}

export const removeFavorite = async (id: string): Promise<void> => {
  try {
    // Si el servicio ya se sabe que no está disponible, eliminar solo localmente
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de favoritos no disponible, eliminando favorito solo localmente")

      // Actualizar localStorage eliminando el favorito
      try {
        const currentFavorites = localStorage.getItem("favorites")
        if (currentFavorites) {
          const favoritesArray = JSON.parse(currentFavorites)
          const updatedFavorites = favoritesArray.filter((fav: FavoritePlace) => fav.id !== id)
          localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
        }
      } catch (localError) {
        console.error("Error al actualizar favoritos en localStorage:", localError)
      }

      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

    const response = await fetch(`${API_URL}/favorites/${id}`, {
      method: "DELETE",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Actualizar el estado de disponibilidad del servicio
    cachedServiceAvailability = true
    lastCheckTime = Date.now()

    if (!response.ok && response.status !== 204) {
      const error = await response.json()
      throw new Error(error.error || "Error al eliminar favorito")
    }

    // Actualizar localStorage eliminando el favorito
    try {
      const currentFavorites = localStorage.getItem("favorites")
      if (currentFavorites) {
        const favoritesArray = JSON.parse(currentFavorites)
        const updatedFavorites = favoritesArray.filter((fav: FavoritePlace) => fav.id !== id)
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      }
    } catch (localError) {
      console.error("Error al actualizar favoritos en localStorage:", localError)
    }
  } catch (error) {
    console.error("Error en removeFavorite:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Eliminar localmente en caso de error
    try {
      const currentFavorites = localStorage.getItem("favorites")
      if (currentFavorites) {
        const favoritesArray = JSON.parse(currentFavorites)
        const updatedFavorites = favoritesArray.filter((fav: FavoritePlace) => fav.id !== id)
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      }
    } catch (localError) {
      console.error("Error al actualizar favoritos en localStorage:", localError)
    }
  }
}

export const isFavorite = async (id: string): Promise<boolean> => {
  try {
    // Si el servicio ya se sabe que no está disponible, verificar solo localmente
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de favoritos no disponible, verificando favorito solo localmente")

      // Verificar en localStorage si el elemento es favorito
      try {
        const storedFavorites = localStorage.getItem("favorites")
        if (storedFavorites) {
          const favoritesArray = JSON.parse(storedFavorites)
          return favoritesArray.some((fav: FavoritePlace) => fav.id === id)
        }
      } catch (localError) {
        console.error("Error al verificar favorito en localStorage:", localError)
      }

      return false
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/favorites/${id}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Actualizar el estado de disponibilidad del servicio
    cachedServiceAvailability = true
    lastCheckTime = Date.now()

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.isFavorite
  } catch (error) {
    console.error("Error en isFavorite:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Verificar en localStorage si el elemento es favorito
    try {
      const storedFavorites = localStorage.getItem("favorites")
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites)
        return favoritesArray.some((fav: FavoritePlace) => fav.id === id)
      }
    } catch (localError) {
      console.error("Error al verificar favorito en localStorage:", localError)
    }

    return false
  }
}

export const checkServiceHealth = async (): Promise<boolean> => {
  // Si se verificó recientemente, devolver el valor en caché
  if (Date.now() - lastCheckTime < CHECK_INTERVAL) {
    return cachedServiceAvailability
  }

  try {
    // Aumentar el timeout a 5 segundos para dar más tiempo a la respuesta
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      try {
        controller.abort()
      } catch (e) {
        console.warn("Error al abortar la solicitud:", e)
      }
    }, 5000) // 5 segundos de timeout

    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Actualizar el estado en caché
    cachedServiceAvailability = response.ok
    lastCheckTime = Date.now()

    return response.ok
  } catch (error) {
    console.error("Error en checkServiceHealth:", error)

    // Actualizar el estado en caché
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    return false
  }
}

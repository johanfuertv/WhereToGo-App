export interface Rating {
  id: string
  placeId: string
  placeType: "restaurant" | "hotel" | "activity" | "city"
  userId: string
  userName: string
  rating: number
  date: string
}

export interface RatingAverage {
  averageRating: number
  totalRatings: number
  placeId: string
  placeType: string
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface RatingStats {
  totalRatings: number
  averageOverall: number
  statsByType: {
    [key: string]: {
      count: number
      totalRating: number
      averageRating: number
      uniquePlaces: number
    }
  }
}

const API_URL = "http://localhost:3003/api"

// Variable para almacenar el estado de disponibilidad del servicio
let cachedServiceAvailability = false
let lastCheckTime = 0
const CHECK_INTERVAL = 60000 // 60 segundos entre verificaciones

export const getRatings = async (placeId: string, placeType: string): Promise<Rating[]> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de calificaciones no disponible, usando datos de fallback sin intentar petición")
      return getMockRatings(placeId, placeType)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/ratings/${placeId}/${placeType}`, {
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
      throw new Error("Error al obtener calificaciones")
    }

    return response.json()
  } catch (error) {
    console.error("Error en getRatings:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Devolver datos de ejemplo como fallback
    return getMockRatings(placeId, placeType)
  }
}

export const getRatingAverage = async (placeId: string, placeType: string): Promise<RatingAverage> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de calificaciones no disponible, usando datos de fallback sin intentar petición")
      return getMockRatingAverage(placeId, placeType)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/ratings/${placeId}/${placeType}/average`, {
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
      throw new Error("Error al obtener promedio de calificaciones")
    }

    return response.json()
  } catch (error) {
    console.error("Error en getRatingAverage:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Devolver datos de ejemplo como fallback
    return getMockRatingAverage(placeId, placeType)
  }
}

export const getUserRating = async (userId: string, placeId: string, placeType: string): Promise<Rating | null> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de calificaciones no disponible, usando datos de fallback sin intentar petición")
      return null
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/ratings/user/${userId}/${placeId}/${placeType}`, {
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
      if (response.status === 404) {
        return null // Usuario no ha calificado este lugar
      }
      throw new Error("Error al obtener calificación de usuario")
    }

    return response.json()
  } catch (error) {
    console.error("Error en getUserRating:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    return null
  }
}

export const addOrUpdateRating = async (rating: {
  placeId: string
  placeType: string
  userId: string
  userName: string
  rating: number
}): Promise<Rating> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      throw new Error("El servicio de calificaciones no está disponible en este momento")
    }

    const response = await fetch(`${API_URL}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rating),
    })

    // Actualizar el estado de disponibilidad del servicio
    cachedServiceAvailability = true
    lastCheckTime = Date.now()

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al añadir/actualizar calificación")
    }

    return response.json()
  } catch (error) {
    console.error("Error en addOrUpdateRating:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    throw error
  }
}

export const getRatingStats = async (): Promise<RatingStats> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de calificaciones no disponible, usando datos de fallback sin intentar petición")
      return getMockRatingStats()
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/ratings/stats`, {
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
      throw new Error("Error al obtener estadísticas de calificaciones")
    }

    return response.json()
  } catch (error) {
    console.error("Error en getRatingStats:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Devolver datos de ejemplo como fallback
    return getMockRatingStats()
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

// Funciones para generar datos de ejemplo
function getMockRatings(placeId: string, placeType: string): Rating[] {
  const baseRatings = [
    {
      id: "mock-rating-1",
      placeId,
      placeType,
      userId: "user1",
      userName: "María González",
      rating: 5,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-rating-2",
      placeId,
      placeType,
      userId: "user2",
      userName: "Juan Pérez",
      rating: 4,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return baseRatings
}

function getMockRatingAverage(placeId: string, placeType: string): RatingAverage {
  // Datos de ejemplo basados en el lugar
  const mockData: { [key: string]: RatingAverage } = {
    "peru-cook": {
      averageRating: 4.7,
      totalRatings: 23,
      placeId,
      placeType,
      ratingDistribution: { 1: 0, 2: 4, 3: 9, 4: 35, 5: 52 },
    },
    "chuleta-don-carlos": {
      averageRating: 4.8,
      totalRatings: 18,
      placeId,
      placeType,
      ratingDistribution: { 1: 0, 2: 0, 3: 11, 4: 28, 5: 61 },
    },
    "hotel-guadalajara": {
      averageRating: 4.6,
      totalRatings: 31,
      placeId,
      placeType,
      ratingDistribution: { 1: 3, 2: 6, 3: 13, 4: 32, 5: 46 },
    },
  }

  return (
    mockData[placeId] || {
      averageRating: 4.5,
      totalRatings: 15,
      placeId,
      placeType,
      ratingDistribution: { 1: 0, 2: 7, 3: 13, 4: 40, 5: 40 },
    }
  )
}

function getMockRatingStats(): RatingStats {
  return {
    totalRatings: 127,
    averageOverall: 4.6,
    statsByType: {
      restaurant: {
        count: 45,
        totalRating: 208,
        averageRating: 4.6,
        uniquePlaces: 8,
      },
      hotel: {
        count: 38,
        totalRating: 175,
        averageRating: 4.6,
        uniquePlaces: 6,
      },
      activity: {
        count: 44,
        totalRating: 205,
        averageRating: 4.7,
        uniquePlaces: 7,
      },
    },
  }
}

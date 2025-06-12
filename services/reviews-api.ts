export interface Review {
  id: string
  placeId: string
  placeType: "restaurant" | "hotel" | "activity" | "city"
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

const API_URL = "http://localhost:3002/api"

// Variable para almacenar el estado de disponibilidad del servicio
let cachedServiceAvailability = false
let lastCheckTime = 0
const CHECK_INTERVAL = 60000 // 60 segundos entre verificaciones (aumentado de 30000)

export const getReviews = async (placeId: string, placeType: string): Promise<Review[]> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de reseñas no disponible, usando datos de fallback sin intentar petición")

      // Devolver datos de ejemplo según el tipo
      if (placeType === "city" && placeId === "buga") {
        return getMockCityReviews()
      } else if (placeType === "restaurant") {
        return getMockRestaurantReviews(placeId)
      } else if (placeType === "hotel") {
        return getMockHotelReviews(placeId)
      } else if (placeType === "activity") {
        return getMockActivityReviews(placeId)
      }

      return []
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/reviews?placeId=${placeId}&placeType=${placeType}`, {
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
      throw new Error("Error al obtener reseñas")
    }

    return response.json()
  } catch (error) {
    console.error("Error en getReviews:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Devolver datos de ejemplo como fallback
    if (placeType === "city" && placeId === "buga") {
      return getMockCityReviews()
    } else if (placeType === "restaurant") {
      return getMockRestaurantReviews(placeId)
    } else if (placeType === "hotel") {
      return getMockHotelReviews(placeId)
    } else if (placeType === "activity") {
      return getMockActivityReviews(placeId)
    }

    return [] // Devolver array vacío si no hay datos de fallback
  }
}

// Funciones para generar datos de ejemplo
function getMockCityReviews(): Review[] {
  return [
    {
      id: "review1",
      placeId: "buga",
      placeType: "city",
      userId: "user1",
      userName: "Carolina Martínez",
      rating: 5,
      comment: "Una ciudad hermosa con mucha historia y cultura. La Basílica es impresionante y la gente muy amable.",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días atrás
    },
    {
      id: "review2",
      placeId: "buga",
      placeType: "city",
      userId: "user2",
      userName: "Andrés Gómez",
      rating: 4.5,
      comment: "Excelente destino para un fin de semana. Tiene buenos restaurantes y lugares para visitar.",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
    },
  ]
}

function getMockRestaurantReviews(restaurantId: string): Review[] {
  const baseReviews = [
    {
      id: `${restaurantId}-review1`,
      placeId: restaurantId,
      placeType: "restaurant",
      userId: "user3",
      userName: "María González",
      rating: 5,
      comment: "Excelente comida y servicio. Los platos son deliciosos y el ambiente muy acogedor.",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
    },
    {
      id: `${restaurantId}-review2`,
      placeId: restaurantId,
      placeType: "restaurant",
      userId: "user4",
      userName: "Juan Pérez",
      rating: 4.5,
      comment: "Muy buena experiencia. La comida es auténtica y los precios razonables.",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 días atrás
    },
  ]

  // Personalizar comentarios según el restaurante
  if (restaurantId === "peru-cook") {
    baseReviews[0].comment = "Los ceviches son increíbles y el ambiente muy acogedor. Definitivamente volveré."
    baseReviews[1].comment = "El lomo saltado es espectacular. Muy buena experiencia peruana."
  } else if (restaurantId === "chuleta-don-carlos") {
    baseReviews[0].comment = "La mejor chuleta valluna que he probado. El servicio es excelente."
    baseReviews[1].comment = "Carnes de primera calidad y los acompañamientos son deliciosos."
  } else if (restaurantId === "panaderia-casita-del-pandebono") {
    baseReviews[0].comment = "Los pandebonos más deliciosos de la región. El café es excelente también."
    baseReviews[1].comment = "Panadería tradicional con productos frescos y sabrosos. Recomendado."
  }

  return baseReviews
}

function getMockHotelReviews(hotelId: string): Review[] {
  return [
    {
      id: `${hotelId}-review1`,
      placeId: hotelId,
      placeType: "hotel",
      userId: "user5",
      userName: "Laura Ramírez",
      rating: 4.8,
      comment: "Excelente ubicación y habitaciones muy cómodas. El personal es muy amable y servicial.",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 días atrás
    },
    {
      id: `${hotelId}-review2`,
      placeId: hotelId,
      placeType: "hotel",
      userId: "user6",
      userName: "Carlos Mendoza",
      rating: 4.5,
      comment: "Muy buena relación calidad-precio. Las instalaciones están bien mantenidas y limpias.",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 días atrás
    },
  ]
}

function getMockActivityReviews(activityId: string): Review[] {
  return [
    {
      id: `${activityId}-review1`,
      placeId: activityId,
      placeType: "activity",
      userId: "user7",
      userName: "Patricia Londoño",
      rating: 5,
      comment: "Una experiencia increíble. El guía fue muy informativo y la actividad muy bien organizada.",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
    },
    {
      id: `${activityId}-review2`,
      placeId: activityId,
      placeType: "activity",
      userId: "user8",
      userName: "Miguel Ángel Torres",
      rating: 4.7,
      comment: "Muy recomendable. Vale la pena el precio y es adecuado para toda la familia.",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días atrás
    },
  ]
}

export const getUserReview = async (placeId: string, placeType: string, userId: string): Promise<Review | null> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      console.log("Servicio de reseñas no disponible, usando datos de fallback sin intentar petición")

      // Si el usuario es "user1" y estamos buscando su reseña de Buga, devolver un mock
      if (userId === "user1" && placeId === "buga" && placeType === "city") {
        return {
          id: "review1",
          placeId: "buga",
          placeType: "city",
          userId: "user1",
          userName: "Carolina Martínez",
          rating: 5,
          comment:
            "Una ciudad hermosa con mucha historia y cultura. La Basílica es impresionante y la gente muy amable.",
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        }
      }

      return null
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos de timeout

    const response = await fetch(`${API_URL}/reviews/user?placeId=${placeId}&placeType=${placeType}&userId=${userId}`, {
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
      throw new Error("Error al obtener reseña de usuario")
    }

    return response.json()
  } catch (error) {
    console.error("Error en getUserReview:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    // Si el usuario es "user1" y estamos buscando su reseña de Buga, devolver un mock
    if (userId === "user1" && placeId === "buga" && placeType === "city") {
      return {
        id: "review1",
        placeId: "buga",
        placeType: "city",
        userId: "user1",
        userName: "Carolina Martínez",
        rating: 5,
        comment: "Una ciudad hermosa con mucha historia y cultura. La Basílica es impresionante y la gente muy amable.",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      }
    }

    return null
  }
}

export const addReview = async (review: {
  placeId: string
  placeType: string
  userId: string
  userName: string
  rating: number
  comment: string
}): Promise<Review> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      throw new Error("El servicio de reseñas no está disponible en este momento")
    }

    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    })

    // Actualizar el estado de disponibilidad del servicio
    cachedServiceAvailability = true
    lastCheckTime = Date.now()

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al añadir reseña")
    }

    return response.json()
  } catch (error) {
    console.error("Error en addReview:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    throw error
  }
}

export const updateReview = async (id: string, userId: string, rating: number, comment: string): Promise<Review> => {
  try {
    // Si el servicio ya se sabe que no está disponible, no intentar la petición
    if (!cachedServiceAvailability && Date.now() - lastCheckTime < CHECK_INTERVAL) {
      throw new Error("El servicio de reseñas no está disponible en este momento")
    }

    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, rating, comment }),
    })

    // Actualizar el estado de disponibilidad del servicio
    cachedServiceAvailability = true
    lastCheckTime = Date.now()

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar reseña")
    }

    return response.json()
  } catch (error) {
    console.error("Error en updateReview:", error)

    // Marcar el servicio como no disponible
    cachedServiceAvailability = false
    lastCheckTime = Date.now()

    throw error
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

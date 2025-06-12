const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const app = express()
const PORT = 3003

// Base de datos en memoria para calificaciones
const ratings = []

// Middleware
app.use(cors())
app.use(express.json())

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "ratings-service" })
})

// Obtener todas las calificaciones de un lugar específico
app.get("/api/ratings/:placeId/:placeType", (req, res) => {
  const { placeId, placeType } = req.params

  if (!placeId || !placeType) {
    return res.status(400).json({ error: "Se requieren placeId y placeType" })
  }

  const placeRatings = ratings.filter((rating) => rating.placeId === placeId && rating.placeType === placeType)

  console.log(
    `📊 Obteniendo calificaciones para ${placeType} ${placeId}:`,
    placeRatings.length,
    "calificaciones encontradas",
  )

  res.json(placeRatings)
})

// Obtener calificación promedio de un lugar
app.get("/api/ratings/:placeId/:placeType/average", (req, res) => {
  const { placeId, placeType } = req.params

  if (!placeId || !placeType) {
    return res.status(400).json({ error: "Se requieren placeId y placeType" })
  }

  const placeRatings = ratings.filter((rating) => rating.placeId === placeId && rating.placeType === placeType)

  if (placeRatings.length === 0) {
    console.log(`📊 No hay calificaciones para ${placeType} ${placeId}`)
    return res.json({
      averageRating: 0,
      totalRatings: 0,
      placeId,
      placeType,
    })
  }

  const totalRating = placeRatings.reduce((sum, rating) => sum + rating.rating, 0)
  const averageRating = Math.round((totalRating / placeRatings.length) * 10) / 10 // Redondear a 1 decimal

  console.log(`📊 Promedio para ${placeType} ${placeId}: ${averageRating} (${placeRatings.length} calificaciones)`)

  res.json({
    averageRating,
    totalRatings: placeRatings.length,
    placeId,
    placeType,
    ratingDistribution: calculateRatingDistribution(placeRatings),
  })
})

// Obtener calificación específica de un usuario para un lugar
app.get("/api/ratings/user/:userId/:placeId/:placeType", (req, res) => {
  const { userId, placeId, placeType } = req.params

  if (!userId || !placeId || !placeType) {
    return res.status(400).json({ error: "Se requieren userId, placeId y placeType" })
  }

  const userRating = ratings.find(
    (rating) => rating.userId === userId && rating.placeId === placeId && rating.placeType === placeType,
  )

  if (!userRating) {
    console.log(`👤 No se encontró calificación del usuario ${userId} para ${placeType} ${placeId}`)
    return res.status(404).json({ error: "Calificación no encontrada" })
  }

  console.log(`👤 Calificación del usuario ${userId} para ${placeType} ${placeId}: ${userRating.rating}`)
  res.json(userRating)
})

// Añadir o actualizar una calificación
app.post("/api/ratings", (req, res) => {
  const { placeId, placeType, userId, userName, rating } = req.body

  // Validar datos requeridos
  if (!placeId || !placeType || !userId || !userName || !rating) {
    return res.status(400).json({ error: "Faltan datos requeridos: placeId, placeType, userId, userName, rating" })
  }

  // Validar que la calificación esté entre 1 y 5
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return res.status(400).json({ error: "La calificación debe ser un número entero entre 1 y 5" })
  }

  // Verificar si el usuario ya calificó este lugar
  const existingRatingIndex = ratings.findIndex(
    (r) => r.userId === userId && r.placeId === placeId && r.placeType === placeType,
  )

  if (existingRatingIndex !== -1) {
    // Actualizar calificación existente
    const oldRating = ratings[existingRatingIndex].rating
    ratings[existingRatingIndex] = {
      ...ratings[existingRatingIndex],
      rating,
      date: new Date().toISOString(),
    }
    console.log(`🔄 Calificación actualizada para ${placeType} ${placeId} por ${userName}: ${oldRating} → ${rating}`)
    res.json(ratings[existingRatingIndex])
  } else {
    // Crear nueva calificación
    const newRating = {
      id: uuidv4(),
      placeId,
      placeType,
      userId,
      userName,
      rating,
      date: new Date().toISOString(),
    }

    ratings.push(newRating)
    console.log(`⭐ Nueva calificación para ${placeType} ${placeId} por ${userName}: ${rating}/5`)
    res.status(201).json(newRating)
  }

  // Mostrar estadísticas actualizadas
  const placeRatings = ratings.filter((r) => r.placeId === placeId && r.placeType === placeType)
  const average = placeRatings.reduce((sum, r) => sum + r.rating, 0) / placeRatings.length
  console.log(
    `📈 Nuevo promedio para ${placeType} ${placeId}: ${average.toFixed(1)} (${placeRatings.length} calificaciones)`,
  )
})

// Eliminar una calificación
app.delete("/api/ratings/:id", (req, res) => {
  const { id } = req.params
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: "Se requiere userId" })
  }

  const ratingIndex = ratings.findIndex((rating) => rating.id === id)

  if (ratingIndex === -1) {
    return res.status(404).json({ error: "Calificación no encontrada" })
  }

  // Verificar que el usuario sea el propietario de la calificación
  if (ratings[ratingIndex].userId !== userId) {
    return res.status(403).json({ error: "No tienes permiso para eliminar esta calificación" })
  }

  // Eliminar la calificación
  const deletedRating = ratings.splice(ratingIndex, 1)[0]
  console.log(`🗑️ Calificación ${id} eliminada por ${deletedRating.userName}`)
  res.status(204).send()
})

// Obtener estadísticas generales del sistema
app.get("/api/ratings/stats", (req, res) => {
  const totalRatings = ratings.length
  const averageOverall = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0

  // Agrupar por tipo de lugar
  const statsByType = {}
  ratings.forEach((rating) => {
    if (!statsByType[rating.placeType]) {
      statsByType[rating.placeType] = {
        count: 0,
        totalRating: 0,
        places: new Set(),
      }
    }
    statsByType[rating.placeType].count++
    statsByType[rating.placeType].totalRating += rating.rating
    statsByType[rating.placeType].places.add(rating.placeId)
  })

  // Calcular promedios por tipo
  Object.keys(statsByType).forEach((type) => {
    const stats = statsByType[type]
    stats.averageRating = Math.round((stats.totalRating / stats.count) * 10) / 10
    stats.uniquePlaces = stats.places.size
    delete stats.places // No enviar el Set en la respuesta
  })

  console.log(`📊 Estadísticas generales: ${totalRatings} calificaciones, promedio ${averageOverall.toFixed(1)}`)

  res.json({
    totalRatings,
    averageOverall: Math.round(averageOverall * 10) / 10,
    statsByType,
  })
})

// Función auxiliar para calcular distribución de calificaciones
function calculateRatingDistribution(placeRatings) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  placeRatings.forEach((rating) => {
    distribution[rating.rating]++
  })

  // Convertir a porcentajes
  const total = placeRatings.length
  Object.keys(distribution).forEach((key) => {
    distribution[key] = Math.round((distribution[key] / total) * 100)
  })

  return distribution
}

// Inicializar con algunos datos de ejemplo
function initializeWithSampleData() {
  const sampleRatings = [
    // Restaurantes
    {
      id: uuidv4(),
      placeId: "peru-cook",
      placeType: "restaurant",
      userId: "user1",
      userName: "María González",
      rating: 5,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      placeId: "peru-cook",
      placeType: "restaurant",
      userId: "user2",
      userName: "Juan Pérez",
      rating: 4,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      placeId: "peru-cook",
      placeType: "restaurant",
      userId: "user3",
      userName: "Ana Rodríguez",
      rating: 5,
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      placeId: "chuleta-don-carlos",
      placeType: "restaurant",
      userId: "user1",
      userName: "María González",
      rating: 5,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      placeId: "chuleta-don-carlos",
      placeType: "restaurant",
      userId: "user4",
      userName: "Carlos Mendoza",
      rating: 4,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Hoteles
    {
      id: uuidv4(),
      placeId: "hotel-guadalajara",
      placeType: "hotel",
      userId: "user2",
      userName: "Juan Pérez",
      rating: 5,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      placeId: "hotel-guadalajara",
      placeType: "hotel",
      userId: "user5",
      userName: "Laura Ramírez",
      rating: 4,
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Actividades
    {
      id: uuidv4(),
      placeId: "visita-a-la-basilica",
      placeType: "activity",
      userId: "user3",
      userName: "Ana Rodríguez",
      rating: 5,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      placeId: "visita-a-la-basilica",
      placeType: "activity",
      userId: "user6",
      userName: "Patricia Londoño",
      rating: 5,
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  ratings.push(...sampleRatings)
  console.log("🎯 Datos de ejemplo inicializados para el servicio de calificaciones")
  console.log(`📊 Total de calificaciones de ejemplo: ${sampleRatings.length}`)
}

// Inicializar datos de ejemplo al arrancar el servidor
initializeWithSampleData()

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servicio de Calificaciones ejecutándose en http://localhost:${PORT}`)
  console.log(`📋 Endpoints disponibles:`)
  console.log(`  GET  /api/health - Estado del servicio`)
  console.log(`  GET  /api/ratings/:placeId/:placeType - Calificaciones de un lugar`)
  console.log(`  GET  /api/ratings/:placeId/:placeType/average - Promedio de calificaciones`)
  console.log(`  POST /api/ratings - Añadir/actualizar calificación`)
  console.log(`  GET  /api/ratings/user/:userId/:placeId/:placeType - Calificación de usuario`)
  console.log(`  GET  /api/ratings/stats - Estadísticas generales`)
  console.log(`⭐ Sistema de calificaciones con números del 1 al 5 listo!`)
})

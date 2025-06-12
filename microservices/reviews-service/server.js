const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const app = express()
const PORT = 3002

// Base de datos en memoria
const reviews = []

// Middleware
app.use(cors())
app.use(express.json())

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "reviews-service" })
})

// Obtener reseñas por lugar
app.get("/api/reviews", (req, res) => {
  const { placeId, placeType } = req.query

  if (!placeId || !placeType) {
    return res.status(400).json({ error: "Se requieren placeId y placeType" })
  }

  const filteredReviews = reviews.filter((review) => review.placeId === placeId && review.placeType === placeType)

  res.json(filteredReviews)
})

// Obtener reseña específica de un usuario para un lugar
app.get("/api/reviews/user", (req, res) => {
  const { placeId, placeType, userId } = req.query

  if (!placeId || !placeType || !userId) {
    return res.status(400).json({ error: "Se requieren placeId, placeType y userId" })
  }

  const userReview = reviews.find(
    (review) => review.placeId === placeId && review.placeType === placeType && review.userId === userId,
  )

  if (!userReview) {
    return res.status(404).json({ error: "Reseña no encontrada" })
  }

  res.json(userReview)
})

// Añadir una reseña
app.post("/api/reviews", (req, res) => {
  const { placeId, placeType, userId, userName, rating, comment } = req.body

  // Validar datos requeridos
  if (!placeId || !placeType || !userId || !userName || !rating) {
    return res.status(400).json({ error: "Faltan datos requeridos" })
  }

  // Verificar si el usuario ya dejó una reseña para este lugar
  const existingReview = reviews.find(
    (review) => review.placeId === placeId && review.placeType === placeType && review.userId === userId,
  )

  if (existingReview) {
    return res.status(409).json({ error: "Ya has dejado una reseña para este lugar" })
  }

  // Crear nueva reseña
  const newReview = {
    id: uuidv4(),
    placeId,
    placeType,
    userId,
    userName,
    rating,
    comment: comment || "",
    date: new Date().toISOString(),
  }

  // Añadir a la base de datos
  reviews.push(newReview)
  console.log(`Nueva reseña añadida para ${placeType} ${placeId} por ${userName}`)
  res.status(201).json(newReview)
})

// Actualizar una reseña
app.put("/api/reviews/:id", (req, res) => {
  const { id } = req.params
  const { userId, rating, comment } = req.body

  // Validar datos requeridos
  if (!userId || !rating) {
    return res.status(400).json({ error: "Faltan datos requeridos" })
  }

  // Encontrar la reseña
  const reviewIndex = reviews.findIndex((review) => review.id === id)

  if (reviewIndex === -1) {
    return res.status(404).json({ error: "Reseña no encontrada" })
  }

  // Verificar que el usuario sea el propietario de la reseña
  if (reviews[reviewIndex].userId !== userId) {
    return res.status(403).json({ error: "No tienes permiso para editar esta reseña" })
  }

  // Actualizar la reseña
  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    rating,
    comment: comment || reviews[reviewIndex].comment,
    date: new Date().toISOString(), // Actualizar la fecha
  }

  console.log(`Reseña ${id} actualizada`)
  res.json(reviews[reviewIndex])
})

// Eliminar una reseña
app.delete("/api/reviews/:id", (req, res) => {
  const { id } = req.params
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: "Se requiere userId" })
  }

  const reviewIndex = reviews.findIndex((review) => review.id === id)

  if (reviewIndex === -1) {
    return res.status(404).json({ error: "Reseña no encontrada" })
  }

  // Verificar que el usuario sea el propietario de la reseña
  if (reviews[reviewIndex].userId !== userId) {
    return res.status(403).json({ error: "No tienes permiso para eliminar esta reseña" })
  }

  // Eliminar la reseña
  reviews.splice(reviewIndex, 1)
  console.log(`Reseña ${id} eliminada`)
  res.status(204).send()
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servicio de Reseñas ejecutándose en http://localhost:${PORT}`)
})

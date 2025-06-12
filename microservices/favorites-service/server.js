const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const app = express()
const PORT = 3001

// Base de datos en memoria
let favorites = []

// Middleware
app.use(cors())
app.use(express.json())

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "favorites-service" })
})

// Obtener todos los favoritos
app.get("/api/favorites", (req, res) => {
  res.json(favorites)
})

// Verificar si un lugar es favorito
app.get("/api/favorites/:id", (req, res) => {
  const { id } = req.params
  const isFavorite = favorites.some((fav) => fav.id === id)
  res.json({ isFavorite })
})

// Añadir un favorito
app.post("/api/favorites", (req, res) => {
  const favorite = req.body

  // Validar datos requeridos
  if (!favorite.id || !favorite.name || !favorite.type || !favorite.location) {
    return res.status(400).json({ error: "Faltan datos requeridos" })
  }

  // Verificar si ya existe
  const exists = favorites.some((fav) => fav.id === favorite.id)
  if (exists) {
    return res.status(409).json({ error: "Este lugar ya está en favoritos" })
  }

  // Añadir a favoritos
  favorites.push(favorite)
  console.log(`Favorito añadido: ${favorite.name}`)
  res.status(201).json(favorite)
})

// Eliminar un favorito
app.delete("/api/favorites/:id", (req, res) => {
  const { id } = req.params
  const initialLength = favorites.length

  favorites = favorites.filter((fav) => fav.id !== id)

  if (favorites.length === initialLength) {
    return res.status(404).json({ error: "Favorito no encontrado" })
  }

  console.log(`Favorito eliminado: ${id}`)
  res.status(204).send()
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servicio de Favoritos ejecutándose en http://localhost:${PORT}`)
})

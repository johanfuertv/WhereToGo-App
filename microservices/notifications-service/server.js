const express = require("express")
const cors = require("cors")
const fs = require("fs").promises
const path = require("path")

const app = express()
const PORT = 3005

// Middleware
app.use(cors())
app.use(express.json())

// Archivo para almacenar notificaciones
const NOTIFICATIONS_FILE = path.join(__dirname, "notifications.json")

// Función para leer notificaciones
async function readNotifications() {
  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    // Si el archivo no existe, crear uno vacío
    const initialData = { notifications: [], users: [] }
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }
}

// Función para escribir notificaciones
async function writeNotifications(data) {
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2))
}

// Generar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notifications", port: PORT })
})

// Registrar usuario para notificaciones automáticas
app.post("/register-user", async (req, res) => {
  try {
    const { userId, userName } = req.body

    if (!userId || !userName) {
      return res.status(400).json({ success: false, error: "userId y userName son requeridos" })
    }

    const data = await readNotifications()

    // Verificar si el usuario ya está registrado
    const existingUser = data.users.find((u) => u.userId === userId)
    if (!existingUser) {
      data.users.push({ userId, userName, registeredAt: new Date().toISOString() })
      await writeNotifications(data)
      console.log(`👤 Usuario registrado para notificaciones: ${userName} (${userId})`)
    }

    res.json({ success: true, message: "Usuario registrado para notificaciones" })
  } catch (error) {
    console.error("Error registrando usuario:", error)
    res.status(500).json({ success: false, error: "Error interno del servidor" })
  }
})

// Obtener notificaciones de un usuario
app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 20, offset = 0 } = req.query
    const data = await readNotifications()

    // Filtrar notificaciones del usuario y ordenar por fecha (más recientes primero)
    const userNotifications = data.notifications
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Paginación
    const startIndex = Number.parseInt(offset)
    const endIndex = startIndex + Number.parseInt(limit)
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex)

    res.json({
      success: true,
      notifications: paginatedNotifications,
      total: userNotifications.length,
      unread: userNotifications.filter((n) => !n.read).length,
      hasMore: endIndex < userNotifications.length,
    })

    console.log(
      `📬 Notificaciones obtenidas para usuario ${userId}: ${paginatedNotifications.length}/${userNotifications.length} total, ${userNotifications.filter((n) => !n.read).length} no leídas`,
    )
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error)
    res.status(500).json({ success: false, error: "Error interno del servidor" })
  }
})

// Crear nueva notificación
app.post("/notifications", async (req, res) => {
  try {
    const { userId, type, title, message, data: notificationData, priority } = req.body

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos requeridos: userId, type, title, message",
      })
    }

    const newNotification = {
      id: generateId(),
      userId,
      type,
      title,
      message,
      data: notificationData || {},
      priority: priority || "normal",
      read: false,
      createdAt: new Date().toISOString(),
      readAt: null,
    }

    const notifications = await readNotifications()
    notifications.notifications.push(newNotification)
    await writeNotifications(notifications)

    res.status(201).json({
      success: true,
      notification: newNotification,
    })

    console.log(`🔔 Nueva notificación creada: ${title} para usuario ${userId}`)
  } catch (error) {
    console.error("Error creando notificación:", error)
    res.status(500).json({ success: false, error: "Error interno del servidor" })
  }
})

// Endpoint específico para notificaciones de favoritos
app.post("/notifications/favorite-added", async (req, res) => {
  try {
    const { userId, placeName, placeType } = req.body

    if (!userId || !placeName || !placeType) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos requeridos: userId, placeName, placeType",
      })
    }

    const newNotification = {
      id: generateId(),
      userId,
      type: "favorite",
      title: "💖 ¡Favorito añadido!",
      message: `Has añadido ${placeName} a tus favoritos. Podrás encontrarlo fácilmente en tu perfil.`,
      data: {
        placeName,
        placeType,
        action: "added",
      },
      priority: "normal",
      read: false,
      createdAt: new Date().toISOString(),
      readAt: null,
    }

    const notifications = await readNotifications()
    notifications.notifications.push(newNotification)
    await writeNotifications(notifications)

    res.status(201).json({
      success: true,
      notification: newNotification,
    })

    console.log(`💖 Notificación de favorito añadido: ${placeName} para usuario ${userId}`)
  } catch (error) {
    console.error("Error creando notificación de favorito:", error)
    res.status(500).json({ success: false, error: "Error interno del servidor" })
  }
})

// Marcar notificación como leída
app.patch("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId es requerido" })
    }

    const data = await readNotifications()
    const notificationIndex = data.notifications.findIndex((n) => n.id === id && n.userId === userId)

    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, error: "Notificación no encontrada" })
    }

    data.notifications[notificationIndex].read = true
    data.notifications[notificationIndex].readAt = new Date().toISOString()

    await writeNotifications(data)

    res.json({
      success: true,
      notification: data.notifications[notificationIndex],
    })

    console.log(`✅ Notificación marcada como leída: ${id}`)
  } catch (error) {
    console.error("Error marcando notificación como leída:", error)
    res.status(500).json({ success: false, error: "Error interno del servidor" })
  }
})

// Marcar todas las notificaciones como leídas
app.patch("/notifications/user/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params
    const data = await readNotifications()

    let updatedCount = 0
    const now = new Date().toISOString()

    data.notifications = data.notifications.map((notification) => {
      if (notification.userId === userId && !notification.read) {
        updatedCount++
        return {
          ...notification,
          read: true,
          readAt: now,
        }
      }
      return notification
    })

    await writeNotifications(data)

    res.json({
      success: true,
      updatedCount,
    })

    console.log(`✅ ${updatedCount} notificaciones marcadas como leídas para usuario ${userId}`)
  } catch (error) {
    console.error("Error marcando todas las notificaciones como leídas:", error)
    res.status(500).json({ success: false, error: "Error interno del servidor" })
  }
})

// Eliminar notificación
app.delete("/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId es requerido" })
    }

    const data = await readNotifications()
    const initialLength = data.notifications.length

    data.notifications = data.notifications.filter((n) => !(n.id === id && n.userId === userId))

    if (data.notifications.length === initialLength) {
      return res.status(404).json({ success: false, error: "Notificación no encontrada" })
    }

    await writeNotifications(data)

    res.json({ success: true })
    console.log(`🗑️ Notificación eliminada: ${id}`)
  } catch (error) {
    console.error("Error eliminando notificación:", error)
    res.status(500).json({ success: false, error: "Error interno del servidor" })
  }
})

// Función para enviar notificaciones automáticas a todos los usuarios
async function sendAutomaticNotifications() {
  try {
    const data = await readNotifications()
    const users = data.users || []

    if (users.length === 0) {
      console.log("📭 No hay usuarios registrados para notificaciones automáticas")
      return
    }

    const promotions = [
      {
        title: "🍽️ ¡Hoy Peru Cook ofrece promociones especiales!",
        message: "Descuento del 20% en todos los platos peruanos. ¡Ven y disfruta de nuestros sabores auténticos!",
        data: { restaurant: "Peru Cook", discount: 20, validUntil: "hoy" },
      },
      {
        title: "🏨 ¡Hotel Casa Colonial con ofertas increíbles!",
        message: "Habitaciones disponibles con 30% de descuento. ¡Reserva ahora y vive una experiencia única!",
        data: { hotel: "Casa Colonial", discount: 30, location: "Buga" },
      },
      {
        title: "🎯 ¡Nuevas actividades disponibles en Buga!",
        message:
          "Tours guiados por la Basílica del Señor de los Milagros. ¡Descubre la historia de este lugar sagrado!",
        data: { activity: "Tour Basílica", location: "Buga", type: "cultural" },
      },
      {
        title: "🌟 ¡Chuleta Don Carlos te espera!",
        message: "La mejor chuleta valluna de la región. ¡Ven y prueba nuestros sabores tradicionales!",
        data: { restaurant: "Chuleta Don Carlos", specialty: "chuleta valluna" },
      },
      {
        title: "☕ ¡Panadería Casita del Pandebono!",
        message: "Pandebonos frescos recién horneados. ¡El sabor auténtico del Valle del Cauca te espera!",
        data: { bakery: "Casita del Pandebono", product: "pandebonos" },
      },
    ]

    // Enviar notificación a cada usuario registrado
    for (const user of users) {
      const randomPromotion = promotions[Math.floor(Math.random() * promotions.length)]

      const newNotification = {
        id: generateId(),
        userId: user.userId,
        type: "promotion",
        title: randomPromotion.title,
        message: randomPromotion.message,
        data: randomPromotion.data,
        priority: "high",
        read: false,
        createdAt: new Date().toISOString(),
        readAt: null,
      }

      data.notifications.push(newNotification)
    }

    await writeNotifications(data)
    console.log(`🎉 Notificaciones automáticas enviadas a ${users.length} usuarios`)
  } catch (error) {
    console.error("Error enviando notificaciones automáticas:", error)
  }
}

// Programar notificaciones automáticas cada 2 minutos
setInterval(sendAutomaticNotifications, 2 * 60 * 1000)

// Enviar primera notificación después de 10 segundos
setTimeout(sendAutomaticNotifications, 10000)

app.listen(PORT, () => {
  console.log(`🔔 Servicio de Notificaciones ejecutándose en http://localhost:${PORT}`)
  console.log(`🎉 Notificaciones automáticas cada 2 minutos`)
  console.log(`💖 Listo para recibir notificaciones de favoritos`)
  console.log(`📋 Endpoints disponibles:`)
  console.log(`  GET  /health - Estado del servicio`)
  console.log(`  POST /register-user - Registrar usuario para notificaciones`)
  console.log(`  GET  /notifications/:userId - Obtener notificaciones (paginadas)`)
  console.log(`  POST /notifications - Crear notificación`)
  console.log(`  POST /notifications/favorite-added - Notificación de favorito añadido`)
  console.log(`  PATCH /notifications/:id/read - Marcar como leída`)
  console.log(`  PATCH /notifications/user/:userId/read-all - Marcar todas como leídas`)
  console.log(`  DELETE /notifications/:id - Eliminar notificación`)
})

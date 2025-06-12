"use client"

const NOTIFICATIONS_API_URL = "http://localhost:3005"

export interface NotificationData {
  userId: string
  type: "rating" | "review" | "favorite" | "booking" | "promotion" | "system" | "welcome"
  title: string
  message: string
  data?: Record<string, any>
  priority?: "low" | "normal" | "high" | "urgent"
}

export interface Notification extends NotificationData {
  id: string
  read: boolean
  createdAt: string
  readAt: string | null
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unread: number
  hasMore: boolean
}

// Verificar salud del servicio
export const checkServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${NOTIFICATIONS_API_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// Registrar usuario para notificaciones automáticas
export const registerUser = async (userId: string, userName: string): Promise<void> => {
  try {
    await fetch(`${NOTIFICATIONS_API_URL}/register-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userName }),
    })
  } catch (error) {
    console.error("Error registrando usuario para notificaciones:", error)
  }
}

// Obtener notificaciones de un usuario (con paginación)
export const getNotifications = async (userId: string, limit = 10, offset = 0): Promise<NotificationsResponse> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    const response = await fetch(`${NOTIFICATIONS_API_URL}/notifications/${userId}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      notifications: data.notifications || [],
      total: data.total || 0,
      unread: data.unread || 0,
      hasMore: data.hasMore || false,
    }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }
}

// Crear nueva notificación
export const createNotification = async (notificationData: NotificationData): Promise<Notification> => {
  try {
    const response = await fetch(`${NOTIFICATIONS_API_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Notificación específica cuando se añade un favorito
export const sendFavoriteAddedNotification = async (
  userId: string,
  placeName: string,
  placeType: string,
): Promise<Notification> => {
  try {
    const response = await fetch(`${NOTIFICATIONS_API_URL}/notifications/favorite-added`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, placeName, placeType }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.notification
  } catch (error) {
    console.error("Error sending favorite notification:", error)
    throw error
  }
}

// Notificación de bienvenida
export const sendWelcomeNotification = async (userId: string, userName: string): Promise<void> => {
  try {
    const notificationData: NotificationData = {
      userId,
      type: "welcome",
      title: "¡Bienvenido a WhereToGo! 🎉",
      message: `¡Hola ${userName}! Gracias por unirte a nuestra comunidad. Descubre los mejores lugares de Colombia.`,
      priority: "normal",
    }

    await createNotification(notificationData)
  } catch (error) {
    console.error("Error sending welcome notification:", error)
  }
}

// Marcar notificación como leída
export const markAsRead = async (notificationId: string, userId: string): Promise<Notification> => {
  try {
    const response = await fetch(`${NOTIFICATIONS_API_URL}/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.notification
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (userId: string): Promise<{ updatedCount: number }> => {
  try {
    const response = await fetch(`${NOTIFICATIONS_API_URL}/notifications/user/${userId}/read-all`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { updatedCount: data.updatedCount }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Eliminar notificación
export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${NOTIFICATIONS_API_URL}/notifications/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { toast } from "@/hooks/use-toast"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "promotion" | "favorite"
  timestamp: Date
  read: boolean
  priority: "low" | "normal" | "high" | "urgent"
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  getNotificationsByType: (type: string) => Notification[]
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

const PROMOTIONAL_MESSAGES = [
  {
    title: "🍽️ Peru Cook - ¡Promoción Especial!",
    message: "25% de descuento en todos nuestros platos tradicionales peruanos. ¡Solo hoy!",
    type: "promotion" as const,
    priority: "high" as const,
    icon: "🍽️",
  },
  {
    title: "🏨 Hotel Casa Colonial - ¡Oferta Única!",
    message: "35% de descuento + desayuno gratis. Reserva ahora y vive la experiencia colonial.",
    type: "promotion" as const,
    priority: "high" as const,
    icon: "🏨",
  },
  {
    title: "🎯 Tours Buga - ¡Nueva Experiencia!",
    message: "Tours guiados + almuerzo típico. Descubre la historia de Buga con nosotros.",
    type: "promotion" as const,
    priority: "normal" as const,
    icon: "🎯",
  },
  {
    title: "🌟 Chuleta Don Carlos - ¡Tradición!",
    message: "Chuleta valluna + arepa gratis. El sabor auténtico del Valle del Cauca.",
    type: "promotion" as const,
    priority: "normal" as const,
    icon: "🌟",
  },
  {
    title: "☕ Pandebono Casita - ¡Recién Horneado!",
    message: "Pandebonos frescos + café colombiano. El desayuno perfecto te espera.",
    type: "promotion" as const,
    priority: "normal" as const,
    icon: "☕",
  },
  {
    title: "🎉 Festival Gastronómico Valluno",
    message: "3 días de ofertas especiales en restaurantes locales. ¡No te lo pierdas!",
    type: "promotion" as const,
    priority: "urgent" as const,
    icon: "🎉",
  },
  {
    title: "🏞️ Aventura en Farallones",
    message: "Senderismo ecológico + almuerzo campestre. Conecta con la naturaleza.",
    type: "promotion" as const,
    priority: "normal" as const,
    icon: "🏞️",
  },
  {
    title: "🎭 Noche Cultural en Cali",
    message: "Espectáculo de salsa + cena + transporte incluido. Vive la cultura caleña.",
    type: "promotion" as const,
    priority: "high" as const,
    icon: "🎭",
  },
]

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Cargar notificaciones desde localStorage al montar
  useEffect(() => {
    mountedRef.current = true
    setMounted(true)

    const savedNotifications = localStorage.getItem("wheretogo-notifications")
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
        setNotifications(parsed)
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }

    return () => {
      mountedRef.current = false
    }
  }, [])

  // Guardar notificaciones en localStorage
  useEffect(() => {
    if (mounted && notifications.length > 0) {
      localStorage.setItem("wheretogo-notifications", JSON.stringify(notifications))
    }
  }, [notifications, mounted])

  // Sistema de notificaciones automáticas cada minuto
  useEffect(() => {
    if (!mounted) return

    const startPromotionalNotifications = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        if (!mountedRef.current) return

        const randomPromo = PROMOTIONAL_MESSAGES[Math.floor(Math.random() * PROMOTIONAL_MESSAGES.length)]

        const newNotification: Notification = {
          id: `promo-${Date.now()}-${Math.random()}`,
          title: randomPromo.title,
          message: randomPromo.message,
          type: randomPromo.type,
          priority: randomPromo.priority,
          icon: randomPromo.icon,
          timestamp: new Date(),
          read: false,
        }

        setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]) // Mantener máximo 50 notificaciones

        // Mostrar toast solo si está montado
        if (mountedRef.current) {
          toast({
            title: randomPromo.icon + " " + randomPromo.title.replace(/🍽️|🏨|🎯|🌟|☕|🎉|🏞️|🎭/g, "").trim(),
            description: randomPromo.message,
            duration: 4000,
          })
        }
      }, 60000) // Cada minuto
    }

    // Iniciar después de 5 segundos para evitar conflictos de hidratación
    const timeoutId = setTimeout(startPromotionalNotifications, 5000)

    return () => {
      clearTimeout(timeoutId)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [mounted])

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      if (!mountedRef.current) return

      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev.slice(0, 49)])

      // Mostrar toast
      if (mounted) {
        toast({
          title: notification.title,
          description: notification.message,
          duration: 4000,
        })
      }
    },
    [mounted],
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem("wheretogo-notifications")
  }, [])

  const getNotificationsByType = useCallback(
    (type: string) => {
      return notifications.filter((notification) => notification.type === type)
    },
    [notifications],
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}

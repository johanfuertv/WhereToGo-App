"use client"
import { useState, useCallback, memo, useEffect } from "react"
import { Bell, BellRing, X, Trash2, CheckCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Tipo para las notificaciones globales
type GlobalNotification = {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
  priority: "low" | "normal" | "high" | "urgent"
}

// Notificaciones promocionales predefinidas con más variedad
const PROMO_NOTIFICATIONS = [
  {
    title: "🍽️ ¡Peru Cook - Promoción Especial!",
    message: "Descuento del 25% en todos los platos peruanos. ¡Sabores auténticos que te transportarán a Lima!",
    type: "promotion",
    priority: "high" as const,
  },
  {
    title: "🏨 ¡Hotel Casa Colonial - Oferta Única!",
    message: "Habitaciones con 35% de descuento + desayuno gratis. ¡Vive la historia en cada rincón!",
    type: "promotion",
    priority: "high" as const,
  },
  {
    title: "🎯 ¡Tours Buga - Nueva Experiencia!",
    message: "Tours guiados por la Basílica + almuerzo típico. ¡Descubre los milagros de esta tierra sagrada!",
    type: "promotion",
    priority: "normal" as const,
  },
  {
    title: "🌟 ¡Chuleta Don Carlos - Tradición!",
    message: "La auténtica chuleta valluna + arepa de chócolo gratis. ¡El sabor que conquistó el Valle!",
    type: "promotion",
    priority: "normal" as const,
  },
  {
    title: "☕ ¡Pandebono Casita - Recién Horneado!",
    message: "Pandebonos frescos + café colombiano premium. ¡El desayuno perfecto te espera!",
    type: "promotion",
    priority: "normal" as const,
  },
  {
    title: "🎉 ¡Festival Gastronómico Valluno!",
    message: "3 días de sabores únicos con descuentos especiales. ¡No te pierdas esta celebración culinaria!",
    type: "promotion",
    priority: "urgent" as const,
  },
  {
    title: "🏞️ ¡Aventura en Farallones!",
    message: "Senderismo + avistamiento de aves + almuerzo campestre. ¡Conecta con la naturaleza!",
    type: "promotion",
    priority: "high" as const,
  },
  {
    title: "🎭 ¡Noche Cultural en Cali!",
    message: "Espectáculo de salsa + cena típica + transporte incluido. ¡Vive la capital mundial de la salsa!",
    type: "promotion",
    priority: "high" as const,
  },
]

const NotificationBell = memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<GlobalNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Función para generar un ID único
  const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Función para añadir una notificación promocional aleatoria
  const addRandomPromotion = useCallback(() => {
    const randomPromo = PROMO_NOTIFICATIONS[Math.floor(Math.random() * PROMO_NOTIFICATIONS.length)]
    const newNotification: GlobalNotification = {
      id: generateId(),
      title: randomPromo.title,
      message: randomPromo.message,
      type: randomPromo.type,
      priority: randomPromo.priority,
      createdAt: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev.slice(0, 29)]) // Mantener solo las 30 más recientes
    setUnreadCount((prev) => prev + 1)
    setIsAnimating(true)

    // Resetear animación después de un tiempo
    setTimeout(() => setIsAnimating(false), 1000)
  }, [])

  // Añadir notificación promocional cada minuto
  useEffect(() => {
    // Añadir primera notificación después de 3 segundos
    const initialTimeout = setTimeout(addRandomPromotion, 3000)

    // Configurar intervalo para añadir notificaciones cada minuto
    const interval = setInterval(addRandomPromotion, 60000) // 60000 ms = 1 minuto

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [addRandomPromotion])

  // Marcar notificación como leída
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => {
        if (notif.id === id && !notif.read) {
          setUnreadCount((count) => Math.max(0, count - 1))
          return { ...notif, read: true }
        }
        return notif
      }),
    )
  }, [])

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    setUnreadCount(0)
  }, [])

  // Eliminar notificación
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const notifToDelete = prev.find((n) => n.id === id)
      if (notifToDelete && !notifToDelete.read) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
      return prev.filter((n) => n.id !== id)
    })
  }, [])

  // Obtener icono según tipo de notificación
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return "🎉"
      case "favorite":
        return "💖"
      case "system":
        return "📍"
      case "welcome":
        return "👋"
      default:
        return "🔔"
    }
  }

  // Obtener color según prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "normal":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative transition-all duration-300 hover:bg-primary/10 hover:scale-110",
          isAnimating && "animate-bounce-gentle",
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        {unreadCount > 0 ? (
          <BellRing className={cn("h-5 w-5 text-primary", isAnimating && "animate-pulse-glow")} />
        ) : (
          <Bell className="h-5 w-5" />
        )}

        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold",
              "animate-pulse-glow gradient-accent border-0 text-white shadow-lg",
              isAnimating && "animate-bounce-gentle",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-3 w-96 max-h-[32rem] shadow-2xl z-50 border-2 glass-card animate-slide-in-right">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg text-gradient">Notificaciones</h3>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs hover:bg-primary/10 btn-glow"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-bounce-gentle">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                </div>
                <p className="text-sm text-muted-foreground">¡Las promociones más increíbles aparecerán aquí pronto!</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-300 cursor-pointer hover-lift will-change-transform",
                      !notification.read
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md"
                        : "bg-background hover:bg-muted/50",
                      index === 0 && !notification.read && "animate-fade-in-up",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                        {!notification.read && (
                          <div
                            className={cn(
                              "absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse",
                              getPriorityColor(notification.priority),
                            )}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4
                            className={cn(
                              "font-semibold text-sm leading-tight",
                              !notification.read ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {notification.title}
                          </h4>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <p
                          className={cn(
                            "text-xs leading-relaxed mb-3",
                            !notification.read ? "text-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>

                          {notification.priority === "urgent" && (
                            <Badge variant="destructive" className="text-xs px-2 py-0.5">
                              Urgente
                            </Badge>
                          )}
                          {notification.priority === "high" && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800">
                              Importante
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-muted/20">
              <p className="text-xs text-center text-muted-foreground">¡Nuevas promociones cada minuto! 🎉</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
})

NotificationBell.displayName = "NotificationBell"

export default NotificationBell

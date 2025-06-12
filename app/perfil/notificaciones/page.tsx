"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Bell, CheckCheck, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Header from "@/components/header"
import Footer from "@/components/footer"

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

// Notificaciones promocionales predefinidas
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
]

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<GlobalNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Función para generar un ID único
  const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Cargar notificaciones al iniciar
  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Simular carga de notificaciones
    setTimeout(() => {
      // Generar notificaciones de ejemplo
      const sampleNotifications: GlobalNotification[] = []

      // Añadir notificaciones promocionales
      for (let i = 0; i < 15; i++) {
        const randomPromo = PROMO_NOTIFICATIONS[Math.floor(Math.random() * PROMO_NOTIFICATIONS.length)]
        const date = new Date()
        date.setMinutes(date.getMinutes() - i * 30) // Espaciar cada 30 minutos

        sampleNotifications.push({
          id: generateId(),
          title: randomPromo.title,
          message: randomPromo.message,
          type: randomPromo.type,
          priority: randomPromo.priority,
          createdAt: date.toISOString(),
          read: Math.random() > 0.6, // 40% no leídas
        })
      }

      // Añadir algunas notificaciones de favoritos
      const favoriteNotifications = [
        {
          id: generateId(),
          title: "💖 ¡Nuevo favorito añadido!",
          message: "Peru Cook ha sido añadido a tu lista de favoritos",
          type: "favorite",
          priority: "normal" as const,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
          read: false,
        },
        {
          id: generateId(),
          title: "💖 ¡Nuevo favorito añadido!",
          message: "Hotel Casa Colonial ha sido añadido a tu lista de favoritos",
          type: "favorite",
          priority: "normal" as const,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
          read: true,
        },
      ]

      setNotifications(
        [...sampleNotifications, ...favoriteNotifications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      )
      setIsLoading(false)
    }, 1000)
  }, [user, router])

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter((notification) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.read) ||
      (activeTab === "promotions" && notification.type === "promotion") ||
      (activeTab === "favorites" && notification.type === "favorite")

    const matchesSearch =
      searchQuery === "" ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  // Marcar como leída
  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  // Eliminar notificación
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  // Obtener icono según tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return "🎉"
      case "favorite":
        return "💖"
      case "system":
        return "📍"
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

  // Contar notificaciones por tipo
  const counts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    promotions: notifications.filter((n) => n.type === "promotion").length,
    favorites: notifications.filter((n) => n.type === "favorite").length,
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                <p className="text-gray-600">Gestiona todas tus notificaciones y promociones</p>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>

              {counts.unread > 0 && (
                <Button variant="outline" onClick={markAllAsRead} className="hover:bg-primary/10">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all" className="relative">
                Todas
                {counts.all > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {counts.all}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                No leídas
                {counts.unread > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {counts.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="promotions">
                Promociones
                {counts.promotions > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {counts.promotions}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="favorites">
                Favoritos
                {counts.favorites > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {counts.favorites}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600">Cargando notificaciones...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="animate-bounce-gentle mb-4">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No se encontraron notificaciones" : "No hay notificaciones"}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? "Intenta con otros términos de búsqueda"
                      : "Las nuevas notificaciones aparecerán aquí"}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification, index) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        "transition-all duration-300 hover:shadow-lg cursor-pointer",
                        !notification.read
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                          : "hover:bg-gray-50",
                        index === 0 && "animate-fade-in-up",
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <span className="text-3xl">{getTypeIcon(notification.type)}</span>
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
                            <div className="flex items-start justify-between mb-3">
                              <h3
                                className={cn(
                                  "font-semibold text-lg leading-tight",
                                  !notification.read ? "text-gray-900" : "text-gray-600",
                                )}
                              >
                                {notification.title}
                              </h3>

                              <div className="flex items-center gap-2">
                                {notification.priority === "urgent" && (
                                  <Badge variant="destructive" className="text-xs">
                                    Urgente
                                  </Badge>
                                )}
                                {notification.priority === "high" && (
                                  <Badge className="text-xs bg-orange-100 text-orange-800">Importante</Badge>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <p
                              className={cn(
                                "text-base leading-relaxed mb-4",
                                !notification.read ? "text-gray-800" : "text-gray-600",
                              )}
                            >
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 font-medium">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </span>

                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  notification.type === "promotion" && "border-orange-200 text-orange-700",
                                  notification.type === "favorite" && "border-pink-200 text-pink-700",
                                )}
                              >
                                {notification.type === "promotion"
                                  ? "Promoción"
                                  : notification.type === "favorite"
                                    ? "Favorito"
                                    : "Sistema"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}

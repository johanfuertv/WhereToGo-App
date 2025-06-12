"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Server, Database, Bell, Heart, Star } from "lucide-react"

interface ServiceStatus {
  name: string
  port: number
  status: "online" | "offline" | "checking"
  icon: React.ReactNode
  color: string
}

const SERVICES: ServiceStatus[] = [
  {
    name: "Favoritos",
    port: 3003,
    status: "checking",
    icon: <Heart className="w-3 h-3" />,
    color: "bg-pink-500",
  },
  {
    name: "Calificaciones",
    port: 3002,
    status: "checking",
    icon: <Star className="w-3 h-3" />,
    color: "bg-yellow-500",
  },
  {
    name: "Notificaciones",
    port: 3005,
    status: "checking",
    icon: <Bell className="w-3 h-3" />,
    color: "bg-blue-500",
  },
  {
    name: "Autenticación",
    port: 3004,
    status: "checking",
    icon: <Database className="w-3 h-3" />,
    color: "bg-green-500",
  },
]

export function ServiceStatusIndicator() {
  const [services, setServices] = useState<ServiceStatus[]>(SERVICES)
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    setMounted(true)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const checkServiceStatus = async (port: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  const checkAllServices = async () => {
    if (!mountedRef.current) return

    const updatedServices = await Promise.all(
      services.map(async (service) => {
        const isOnline = await checkServiceStatus(service.port)
        return {
          ...service,
          status: isOnline ? ("online" as const) : ("offline" as const),
        }
      }),
    )

    if (mountedRef.current) {
      setServices(updatedServices)
    }
  }

  useEffect(() => {
    if (!mounted) return

    // Verificación inicial después de 2 segundos
    const initialTimeout = setTimeout(checkAllServices, 2000)

    // Verificaciones periódicas cada 3 minutos (optimizado)
    intervalRef.current = setInterval(checkAllServices, 180000)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  const onlineServices = services.filter((s) => s.status === "online").length
  const totalServices = services.length

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        {onlineServices === totalServices ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : onlineServices > 0 ? (
          <Server className="w-4 h-4 text-yellow-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm font-medium">
          Servicios: {onlineServices}/{totalServices}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {services.map((service) => (
          <Badge
            key={service.name}
            variant={service.status === "online" ? "default" : "secondary"}
            className={`text-xs flex items-center gap-1 ${
              service.status === "online"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : service.status === "offline"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {service.icon}
            <span className="truncate">{service.name}</span>
            <div
              className={`w-2 h-2 rounded-full ${
                service.status === "online"
                  ? "bg-green-500"
                  : service.status === "offline"
                    ? "bg-red-500"
                    : "bg-gray-400"
              }`}
            />
          </Badge>
        ))}
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Star, Users, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Imágenes de fondo rotativas
  const backgroundImages = [
    "/placeholder.svg?height=600&width=1200&text=Cali+Salsa+Capital",
    "/placeholder.svg?height=600&width=1200&text=Cartagena+Colonial",
    "/placeholder.svg?height=600&width=1200&text=Medellín+Innovation",
    "/placeholder.svg?height=600&width=1200&text=Bogotá+Culture",
  ]

  // Estadísticas dinámicas
  const stats = [
    { icon: MapPin, label: "Destinos", value: "500+", color: "text-blue-500" },
    { icon: Star, label: "Reseñas", value: "10K+", color: "text-yellow-500" },
    { icon: Users, label: "Viajeros", value: "50K+", color: "text-green-500" },
  ]

  // Efectos de animación
  useEffect(() => {
    setIsVisible(true)

    // Cambiar imagen de fondo cada 5 segundos
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirigir a la página de búsqueda con el query
      window.location.href = `/buscar-plan?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Efectos de partículas */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div
          className={cn(
            "transition-all duration-1000 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
        >
          {/* Título principal */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse mr-2" />
              <span className="text-yellow-400 font-semibold text-lg">Descubre Colombia</span>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse ml-2" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Tu próxima
              <span className="block text-gradient bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                aventura
              </span>
              te espera
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Explora los destinos más increíbles de Colombia. Desde la vibrante Cali hasta la histórica Cartagena,
              encuentra restaurantes únicos, hoteles de ensueño y experiencias inolvidables.
            </p>
          </div>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="max-w-2xl mx-auto relative">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="¿A dónde quieres ir? Busca restaurantes, hoteles, actividades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 pl-6 pr-32 text-lg rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-gray-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 h-12 px-8 rounded-full gradient-primary text-white font-semibold hover:scale-105 transition-all btn-glow"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </form>

          {/* Botones de acción rápida */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { href: "/buscar-plan/restaurantes", label: "🍽️ Restaurantes", color: "from-orange-500 to-red-500" },
              { href: "/buscar-plan/hoteles", label: "🏨 Hoteles", color: "from-blue-500 to-purple-500" },
              { href: "/buscar-plan/actividades", label: "🎯 Actividades", color: "from-green-500 to-teal-500" },
            ].map((item, index) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-14 px-8 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:scale-110 transition-all duration-300 btn-glow will-change-transform",
                    `hover:bg-gradient-to-r hover:${item.color} hover:border-transparent`,
                  )}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {item.label}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            ))}
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn("glass-card p-6 rounded-2xl hover-lift will-change-transform", "animate-fade-in-up")}
                style={{ animationDelay: `${0.5 + index * 0.2}s` }}
              >
                <stat.icon className={cn("h-8 w-8 mx-auto mb-3", stat.color)} />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}

export default Hero

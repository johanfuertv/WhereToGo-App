"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Users, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const destinations = [
  {
    id: 1,
    name: "Cali",
    description: "La capital mundial de la salsa te espera con su energía contagiosa",
    image: "/placeholder.svg?height=300&width=400&text=Cali+Salsa",
    rating: 4.8,
    visitors: "25K+",
    highlights: ["Salsa", "Gastronomía", "Cultura"],
    color: "from-red-500 to-orange-500",
  },
  {
    id: 2,
    name: "Cartagena",
    description: "Historia colonial y playas paradisíacas en perfecta armonía",
    image: "/placeholder.svg?height=300&width=400&text=Cartagena+Colonial",
    rating: 4.9,
    visitors: "40K+",
    highlights: ["Historia", "Playas", "Romance"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    name: "Medellín",
    description: "La ciudad de la eterna primavera y la innovación constante",
    image: "/placeholder.svg?height=300&width=400&text=Medellín+Innovation",
    rating: 4.7,
    visitors: "30K+",
    highlights: ["Innovación", "Clima", "Arte"],
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    name: "Bogotá",
    description: "El corazón cultural y gastronómico de Colombia",
    image: "/placeholder.svg?height=300&width=400&text=Bogotá+Culture",
    rating: 4.6,
    visitors: "35K+",
    highlights: ["Cultura", "Gastronomía", "Museos"],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 5,
    name: "Buga",
    description: "Tradición religiosa y sabores auténticos del Valle del Cauca",
    image: "/placeholder.svg?height=300&width=400&text=Buga+Tradición",
    rating: 4.5,
    visitors: "15K+",
    highlights: ["Tradición", "Religión", "Gastronomía"],
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: 6,
    name: "Santa Marta",
    description: "Donde la montaña más alta del mundo se encuentra con el mar",
    image: "/placeholder.svg?height=300&width=400&text=Santa+Marta+Beach",
    rating: 4.8,
    visitors: "20K+",
    highlights: ["Playa", "Naturaleza", "Historia"],
    color: "from-teal-500 to-blue-500",
  },
]

const Destinations = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    // Animar las tarjetas una por una
    destinations.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCards((prev) => [...prev, index])
      }, index * 200)
    })
  }, [])

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary animate-pulse mr-2" />
            <span className="text-primary font-semibold text-lg">Destinos Populares</span>
            <Sparkles className="h-6 w-6 text-primary animate-pulse ml-2" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Descubre la magia de
            <span className="block text-gradient bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Colombia
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada destino cuenta una historia única. Desde ciudades vibrantes hasta pueblos con encanto colonial,
            encuentra tu próximo lugar favorito en el corazón de Sudamérica.
          </p>
        </div>

        {/* Grid de destinos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <Card
              key={destination.id}
              className={cn(
                "group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 will-change-transform",
                visibleCards.includes(index) ? "animate-fade-in-up opacity-100" : "opacity-0",
                hoveredCard === destination.id ? "scale-105" : "scale-100",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredCard(destination.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative overflow-hidden">
                {/* Imagen */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay con gradiente */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    )}
                  />

                  {/* Rating badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-gray-900 font-semibold">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {destination.rating}
                    </Badge>
                  </div>

                  {/* Visitors badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/70 text-white font-semibold">
                      <Users className="h-3 w-3 mr-1" />
                      {destination.visitors}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Título y descripción */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{destination.description}</p>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {destination.highlights.map((highlight, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>

                  {/* Botón de acción */}
                  <Link href={`/destinos/${destination.name.toLowerCase()}`}>
                    <Button
                      className={cn(
                        "w-full group/btn relative overflow-hidden",
                        `bg-gradient-to-r ${destination.color} hover:shadow-lg hover:scale-105 transition-all duration-300 btn-glow`,
                      )}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Explorar {destination.name}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <Link href="/buscar-plan">
            <Button
              size="lg"
              className="h-14 px-12 text-lg gradient-primary text-white hover:scale-105 transition-all btn-glow"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Ver todos los destinos
              <Sparkles className="h-5 w-5 ml-2 animate-pulse" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Destinations

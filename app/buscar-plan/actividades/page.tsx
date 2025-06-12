"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { useFavorites } from "@/components/favorites-context"
import Image from "next/image"
import Link from "next/link"

const activities = [
  {
    id: "visita-a-la-basilica",
    name: "Visita a la Basílica",
    image: "/placeholder.svg?height=200&width=300&text=Basílica",
    description:
      "Visita guiada a la famosa Basílica del Señor de los Milagros, el principal atractivo religioso de Buga.",
    rating: 4.9,
    priceRange: "$",
    duration: "2 horas",
    category: "Cultural",
  },
  {
    id: "tour-por-el-centro-historico",
    name: "Tour por el Centro Histórico",
    image: "/placeholder.svg?height=200&width=300&text=Centro%20Histórico",
    description: "Recorrido por las calles coloniales y los edificios históricos del centro de Guadalajara de Buga.",
    rating: 4.7,
    priceRange: "$",
    duration: "3 horas",
    category: "Cultural",
  },
  {
    id: "reserva-natural-laguna-de-sonso",
    name: "Reserva Natural Laguna de Sonso",
    image: "/placeholder.svg?height=200&width=300&text=Laguna%20de%20Sonso",
    description:
      "Excursión a la reserva natural más importante del Valle del Cauca, hogar de numerosas especies de aves.",
    rating: 4.8,
    priceRange: "$$",
    duration: "Medio día",
    category: "Naturaleza",
  },
]

export default function ActividadesPage() {
  const { user } = useAuth() || { user: null }
  const { addFavorite, removeFavorite, isFavorite } = useFavorites() || {
    addFavorite: async () => false,
    removeFavorite: async () => false,
    isFavorite: () => false,
  }

  const handleToggleFavorite = async (activity: any) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      const isFav = isFavorite(activity.id)
      if (isFav) {
        await removeFavorite(activity.id)
      } else {
        await addFavorite({
          id: activity.id,
          name: activity.name,
          type: "activity",
          image: activity.image,
          location: "Guadalajara de Buga",
        })
      }
    } catch (error) {
      console.error("Error al gestionar favorito:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Actividades en Guadalajara de Buga</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filtros */}
            <div className="md:w-1/4">
              <div className="border rounded-lg p-4 sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Filtros</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Categoría</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-cultural" />
                        <Label htmlFor="category-cultural">Cultural</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-nature" />
                        <Label htmlFor="category-nature">Naturaleza</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-adventure" />
                        <Label htmlFor="category-adventure">Aventura</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="category-gastronomy" />
                        <Label htmlFor="category-gastronomy">Gastronomía</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Duración</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="duration-short" />
                        <Label htmlFor="duration-short">Menos de 3 horas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="duration-medium" />
                        <Label htmlFor="duration-medium">Medio día</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="duration-long" />
                        <Label htmlFor="duration-long">Día completo</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Precio</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="price-1" />
                        <Label htmlFor="price-1">$ (Económico)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="price-2" />
                        <Label htmlFor="price-2">$$ (Moderado)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="price-3" />
                        <Label htmlFor="price-3">$$$ (Exclusivo)</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de actividades */}
            <div className="md:w-3/4">
              <div className="space-y-6">
                {activities.map((activity) => {
                  const isFav = isFavorite(activity.id)

                  return (
                    <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative h-48 md:h-auto">
                          <Image
                            src={activity.image || "/placeholder.svg"}
                            alt={activity.name}
                            fill
                            className="object-cover"
                          />
                          {user && (
                            <Button
                              variant={isFav ? "default" : "outline"}
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
                              onClick={() => handleToggleFavorite(activity)}
                            >
                              <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : "text-gray-600"}`} />
                              <span className="sr-only">{isFav ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
                            </Button>
                          )}
                        </div>
                        <CardContent className="p-6 md:w-2/3">
                          <Link href={`/buscar-plan/actividades/${activity.id}`}>
                            <div className="flex justify-between items-start">
                              <h2 className="text-xl font-semibold hover:text-primary transition-colors cursor-pointer">
                                {activity.name}
                              </h2>
                              <div className="flex items-center">
                                <span className="bg-primary/10 text-primary font-medium px-2 py-1 rounded text-sm">
                                  {activity.rating}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                                {activity.category}
                              </span>
                              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                                {activity.duration}
                              </span>
                            </div>
                            <div className="mt-4">
                              <span className="font-medium">{activity.priceRange}</span>
                            </div>
                          </Link>
                        </CardContent>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

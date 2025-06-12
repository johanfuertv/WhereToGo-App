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

const hotels = [
  {
    id: "hotel-guadalajara",
    name: "Hotel Guadalajara",
    image: "/placeholder.svg?height=200&width=300&text=Hotel%20Guadalajara",
    description: "Hotel de 4 estrellas con todas las comodidades en el centro de Buga.",
    rating: 4.6,
    priceRange: "$$$",
    amenities: ["Piscina", "WiFi", "Restaurante", "Estacionamiento"],
  },
  {
    id: "hotel-el-faro",
    name: "Hotel El Faro",
    image: "/placeholder.svg?height=200&width=300&text=Hotel%20El%20Faro",
    description: "Hotel boutique con encanto cerca de la Basílica del Señor de los Milagros.",
    rating: 4.8,
    priceRange: "$$",
    amenities: ["WiFi", "Desayuno incluido", "Terraza"],
  },
  {
    id: "hotel-chrisban",
    name: "Hotel Chrisban",
    image: "/placeholder.svg?height=200&width=300&text=Hotel%20Chrisban",
    description: "Hotel familiar con piscina y amplias habitaciones para una estancia cómoda.",
    rating: 4.4,
    priceRange: "$$",
    amenities: ["Piscina", "WiFi", "Parque infantil", "Restaurante"],
  },
]

export default function HotelesPage() {
  const { user } = useAuth() || { user: null }
  const { addFavorite, removeFavorite, isFavorite } = useFavorites() || {
    addFavorite: async () => false,
    removeFavorite: async () => false,
    isFavorite: () => false,
  }

  const handleToggleFavorite = async (hotel: any) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      const isFav = isFavorite(hotel.id)
      if (isFav) {
        await removeFavorite(hotel.id)
      } else {
        await addFavorite({
          id: hotel.id,
          name: hotel.name,
          type: "hotel",
          image: hotel.image,
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
          <h1 className="text-3xl font-bold mb-6">Hoteles en Guadalajara de Buga</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filtros */}
            <div className="md:w-1/4">
              <div className="border rounded-lg p-4 sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Filtros</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Rango de precio</h3>
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

                  <div>
                    <h3 className="font-medium mb-2">Servicios</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="amenity-pool" />
                        <Label htmlFor="amenity-pool">Piscina</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="amenity-wifi" />
                        <Label htmlFor="amenity-wifi">WiFi gratis</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="amenity-breakfast" />
                        <Label htmlFor="amenity-breakfast">Desayuno incluido</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="amenity-parking" />
                        <Label htmlFor="amenity-parking">Estacionamiento</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Calificación</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating-4plus" />
                        <Label htmlFor="rating-4plus">4+ estrellas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating-3plus" />
                        <Label htmlFor="rating-3plus">3+ estrellas</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de hoteles */}
            <div className="md:w-3/4">
              <div className="space-y-6">
                {hotels.map((hotel) => {
                  const isFav = isFavorite(hotel.id)

                  return (
                    <Card key={hotel.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative h-48 md:h-auto">
                          <Image
                            src={hotel.image || "/placeholder.svg"}
                            alt={hotel.name}
                            fill
                            className="object-cover"
                          />
                          {user && (
                            <Button
                              variant={isFav ? "default" : "outline"}
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
                              onClick={() => handleToggleFavorite(hotel)}
                            >
                              <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : "text-gray-600"}`} />
                              <span className="sr-only">{isFav ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
                            </Button>
                          )}
                        </div>
                        <CardContent className="p-6 md:w-2/3">
                          <Link href={`/buscar-plan/hoteles/${hotel.id}`}>
                            <div className="flex justify-between items-start">
                              <h2 className="text-xl font-semibold hover:text-primary transition-colors cursor-pointer">
                                {hotel.name}
                              </h2>
                              <div className="flex items-center">
                                <span className="bg-primary/10 text-primary font-medium px-2 py-1 rounded text-sm">
                                  {hotel.rating}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{hotel.description}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {hotel.amenities.map((amenity, index) => (
                                <span key={index} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                            <div className="mt-4">
                              <span className="font-medium">{hotel.priceRange}</span>
                              <span className="text-sm text-muted-foreground"> / noche</span>
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

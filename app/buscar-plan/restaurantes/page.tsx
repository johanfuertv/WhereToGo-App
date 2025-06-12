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

const restaurants = [
  {
    id: "peru-cook",
    name: "Peru Cook",
    image:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/4f/fe/5e/direccion-carrera-5-calle.jpg?w=900&h=-1&s=1",
    description: "Restaurante de comida peruana con los mejores ceviches y tiraditos.",
    rating: 4.5,
    priceRange: "$$",
    openNow: true,
  },
  {
    id: "chuleta-don-carlos",
    name: "Chuleta Don Carlos",
    image: "/placeholder.svg?height=200&width=300&text=Chuleta%20Don%20Carlos",
    description: "Especialidad en carnes y chuletas a la parrilla con sabor vallecaucano.",
    rating: 4.7,
    priceRange: "$$",
    openNow: true,
  },
  {
    id: "panaderia-casita-del-pandebono",
    name: "Panadería Casita del Pandebono",
    image: "/placeholder.svg?height=200&width=300&text=Casita%20del%20Pandebono",
    description: "Panadería tradicional con los mejores pandebonos y buñuelos del Valle.",
    rating: 4.8,
    priceRange: "$",
    openNow: false,
  },
]

export default function RestaurantesPage() {
  const { user } = useAuth() || { user: null }
  const { addFavorite, removeFavorite, isFavorite } = useFavorites() || {
    addFavorite: async () => false,
    removeFavorite: async () => false,
    isFavorite: () => false,
  }

  const handleToggleFavorite = async (restaurant: any) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      const isFav = isFavorite(restaurant.id)
      if (isFav) {
        await removeFavorite(restaurant.id)
      } else {
        await addFavorite({
          id: restaurant.id,
          name: restaurant.name,
          type: "restaurant",
          image: restaurant.image,
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
          <h1 className="text-3xl font-bold mb-6">Restaurantes en Guadalajara de Buga</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filtros */}
            <div className="md:w-1/4">
              <div className="border rounded-lg p-4 sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Filtros</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Disponibilidad</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="open-now" />
                      <Label htmlFor="open-now">Abierto ahora</Label>
                    </div>
                  </div>

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
                    <h3 className="font-medium mb-2">Tipo de cocina</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cuisine-colombian" />
                        <Label htmlFor="cuisine-colombian">Colombiana</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cuisine-peruvian" />
                        <Label htmlFor="cuisine-peruvian">Peruana</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cuisine-bakery" />
                        <Label htmlFor="cuisine-bakery">Panadería</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de restaurantes */}
            <div className="md:w-3/4">
              <div className="space-y-6">
                {restaurants.map((restaurant) => {
                  const isFav = isFavorite(restaurant.id)

                  return (
                    <Card key={restaurant.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative h-48 md:h-auto">
                          <Image
                            src={restaurant.image || "/placeholder.svg"}
                            alt={restaurant.name}
                            fill
                            className="object-cover"
                          />
                          {user && (
                            <Button
                              variant={isFav ? "default" : "outline"}
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
                              onClick={() => handleToggleFavorite(restaurant)}
                            >
                              <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : "text-gray-600"}`} />
                              <span className="sr-only">{isFav ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
                            </Button>
                          )}
                        </div>
                        <CardContent className="p-6 md:w-2/3">
                          <Link href={`/buscar-plan/restaurantes/${restaurant.id}`}>
                            <div className="flex justify-between items-start">
                              <h2 className="text-xl font-semibold hover:text-primary transition-colors cursor-pointer">
                                {restaurant.name}
                              </h2>
                              <div className="flex items-center">
                                <span className="bg-primary/10 text-primary font-medium px-2 py-1 rounded text-sm">
                                  {restaurant.rating}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{restaurant.description}</p>
                            <div className="flex items-center mt-4 text-sm">
                              <span className="mr-4">{restaurant.priceRange}</span>
                              <span className={restaurant.openNow ? "text-green-600" : "text-red-600"}>
                                {restaurant.openNow ? "Abierto ahora" : "Cerrado"}
                              </span>
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

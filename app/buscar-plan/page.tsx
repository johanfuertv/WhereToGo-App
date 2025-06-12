"use client"

import { useState, useMemo, memo } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Utensils, Hotel, Compass } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"

// Importar CityMap dinámicamente para evitar errores de SSR y mejorar rendimiento
const CityMap = dynamic(() => import("@/components/city-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  ),
})

// Memoizar componentes para mejor rendimiento
const RestaurantCard = memo(({ restaurant }: { restaurant: any }) => (
  <Link href={`/buscar-plan/restaurantes/${restaurant.id}`} className="block">
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
      <div className="relative h-48">
        <Image
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={restaurant.id === "peru-cook"} // Priorizar Peru Cook
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{restaurant.priceRange}</p>
        <p className="text-sm line-clamp-2">{restaurant.description}</p>
      </CardContent>
    </Card>
  </Link>
))

const HotelCard = memo(({ hotel }: { hotel: any }) => (
  <Link href={`/buscar-plan/hoteles/${hotel.id}`} className="block">
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
      <div className="relative h-48">
        <Image
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{hotel.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{hotel.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{hotel.priceRange}</p>
        <p className="text-sm line-clamp-2">{hotel.description}</p>
      </CardContent>
    </Card>
  </Link>
))

const ActivityCard = memo(({ activity }: { activity: any }) => (
  <Link href={`/buscar-plan/actividades/${activity.id}`} className="block">
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
      <div className="relative h-48">
        <Image
          src={activity.image || "/placeholder.svg"}
          alt={activity.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{activity.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{activity.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{activity.duration}</p>
        <p className="text-sm line-clamp-2">{activity.description}</p>
      </CardContent>
    </Card>
  </Link>
))

// Datos optimizados con lazy loading
const useRestaurants = () =>
  useMemo(
    () => [
      {
        id: "peru-cook",
        name: "Peru Cook",
        image:
          "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/4f/fe/5e/direccion-carrera-5-calle.jpg?w=900&h=-1&s=1",
        rating: 4.5,
        priceRange: "$$",
        description: "Auténtica comida peruana en el corazón de Buga",
      },
      {
        id: "chuleta-don-carlos",
        name: "Chuleta Don Carlos",
        image: "/placeholder.svg?height=200&width=300&text=Chuleta%20Don%20Carlos",
        rating: 4.7,
        priceRange: "$$",
        description: "Especialidad en carnes y chuletas vallecaucanas",
      },
      {
        id: "panaderia-casita-del-pandebono",
        name: "Panadería Casita del Pandebono",
        image: "/placeholder.svg?height=200&width=300&text=Casita%20del%20Pandebono",
        rating: 4.8,
        priceRange: "$",
        description: "Tradicionales pandebonos y buñuelos vallecaucanos",
      },
    ],
    [],
  )

const useHotels = () =>
  useMemo(
    () => [
      {
        id: "hotel-guadalajara",
        name: "Hotel Guadalajara",
        image: "/placeholder.svg?height=200&width=300&text=Hotel%20Guadalajara",
        rating: 4.6,
        priceRange: "$$$",
        description: "Hotel de 4 estrellas en el centro de la ciudad",
      },
      {
        id: "hotel-el-faro",
        name: "Hotel El Faro",
        image: "/placeholder.svg?height=200&width=300&text=Hotel%20El%20Faro",
        rating: 4.4,
        priceRange: "$$",
        description: "Hotel boutique cerca de la Basílica",
      },
      {
        id: "hotel-chrisban",
        name: "Hotel Chrisban",
        image: "/placeholder.svg?height=200&width=300&text=Hotel%20Chrisban",
        rating: 4.3,
        priceRange: "$$",
        description: "Hotel familiar con piscina y restaurante",
      },
    ],
    [],
  )

const useActivities = () =>
  useMemo(
    () => [
      {
        id: "visita-a-la-basilica",
        name: "Visita a la Basílica",
        image: "/placeholder.svg?height=200&width=300&text=Basílica",
        rating: 4.9,
        duration: "2 horas",
        description: "Visita guiada al famoso santuario religioso",
      },
      {
        id: "tour-por-el-centro-historico",
        name: "Tour por el Centro Histórico",
        image: "/placeholder.svg?height=200&width=300&text=Centro%20Histórico",
        rating: 4.7,
        duration: "3 horas",
        description: "Recorrido por las calles coloniales y edificios históricos",
      },
      {
        id: "reserva-natural-laguna-de-sonso",
        name: "Reserva Natural Laguna de Sonso",
        image: "/placeholder.svg?height=200&width=300&text=Laguna%20de%20Sonso",
        rating: 4.8,
        duration: "Medio día",
        description: "Excursión a la reserva natural más importante del Valle del Cauca",
      },
    ],
    [],
  )

export default function BuscarPlanPage() {
  const [activeTab, setActiveTab] = useState("mapa")

  const restaurants = useRestaurants()
  const hotels = useHotels()
  const activities = useActivities()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Hero Section Optimizado */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Descubre Guadalajara de Buga
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explora los mejores restaurantes, hoteles y actividades en esta hermosa ciudad del Valle del Cauca
            </p>
          </div>

          <Tabs defaultValue="mapa" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="mapa" className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="restaurantes" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Restaurantes
              </TabsTrigger>
              <TabsTrigger value="hoteles" className="flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                Hoteles
              </TabsTrigger>
              <TabsTrigger value="actividades" className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Actividades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mapa" className="space-y-8">
              {/* Mapa Principal */}
              <div className="h-[500px] relative z-10 rounded-lg overflow-hidden shadow-lg">
                <CityMap />
              </div>

              {/* Cards de Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Restaurantes</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Descubre la gastronomía local y disfruta de los mejores sabores
                    </p>
                    <Link href="/buscar-plan/restaurantes">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver restaurantes
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Hotel className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Hoteles</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Encuentra el alojamiento perfecto para tu estancia en Buga
                    </p>
                    <Link href="/buscar-plan/hoteles">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver hoteles
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Compass className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Actividades</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explora las mejores experiencias y atracciones de la ciudad
                    </p>
                    <Link href="/buscar-plan/actividades">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver actividades
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="restaurantes" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Restaurantes Destacados</h2>
                <Link href="/buscar-plan/restaurantes">
                  <Button variant="outline">Ver todos</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hoteles" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Hoteles Recomendados</h2>
                <Link href="/buscar-plan/hoteles">
                  <Button variant="outline">Ver todos</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actividades" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Actividades Populares</h2>
                <Link href="/buscar-plan/actividades">
                  <Button variant="outline">Ver todas</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

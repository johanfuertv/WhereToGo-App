"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-context"
import { useFavorites } from "@/components/favorites-context"
import { useReviewsService } from "@/services/reviews-service"
import {
  MapPin,
  Phone,
  Globe,
  Star,
  StarHalf,
  Loader2,
  Heart,
  AlertCircle,
  Wifi,
  Coffee,
  Car,
  Utensils,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import CityMap from "@/components/city-map"
import RatingDisplay from "@/components/rating-display"
import RatingInput from "@/components/rating-input"

const hotels = [
  {
    id: "hotel-guadalajara",
    name: "Hotel Guadalajara",
    image: "/placeholder.svg?height=400&width=800&text=Hotel%20Guadalajara",
    description:
      "Hotel de 4 estrellas con todas las comodidades en el centro de Buga. Ofrecemos habitaciones amplias y elegantes, servicio de restaurante, piscina, gimnasio y salones para eventos. Nuestra ubicación privilegiada permite a nuestros huéspedes acceder fácilmente a los principales atractivos turísticos de la ciudad.",
    rating: 4.6,
    priceRange: "$$$",
    address: "Calle 3 #5-27, Guadalajara de Buga",
    phone: "+57 321 456 7890",
    website: "www.hotelguadalajara.com",
    amenities: ["Piscina", "WiFi", "Restaurante", "Estacionamiento", "Gimnasio", "Aire acondicionado"],
    rooms: [
      { type: "Estándar", price: "150.000", capacity: "2 personas" },
      { type: "Superior", price: "220.000", capacity: "2-3 personas" },
      { type: "Suite", price: "350.000", capacity: "2-4 personas" },
    ],
    position: [3.9005, -76.299],
    checkIn: "3:00 PM",
    checkOut: "12:00 PM",
  },
  {
    id: "hotel-el-faro",
    name: "Hotel El Faro",
    image: "/placeholder.svg?height=400&width=800&text=Hotel%20El%20Faro",
    description:
      "Hotel boutique con encanto cerca de la Basílica del Señor de los Milagros. Nuestras habitaciones están decoradas con un estilo colonial que refleja la historia de Buga, ofreciendo una experiencia auténtica y acogedora. Disfrute de nuestro desayuno típico vallecaucano incluido en la tarifa.",
    rating: 4.8,
    priceRange: "$$",
    address: "Carrera 6 #7-45, Guadalajara de Buga",
    phone: "+57 322 789 0123",
    website: "www.hotelelfaro.com",
    amenities: ["WiFi", "Desayuno incluido", "Terraza", "Aire acondicionado", "TV por cable"],
    rooms: [
      { type: "Estándar", price: "120.000", capacity: "2 personas" },
      { type: "Superior", price: "180.000", capacity: "2-3 personas" },
    ],
    position: [3.903, -76.3],
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "hotel-chrisban",
    name: "Hotel Chrisban",
    image: "/placeholder.svg?height=400&width=800&text=Hotel%20Chrisban",
    description:
      "Hotel familiar con piscina y amplias habitaciones para una estancia cómoda. Ideal para familias y grupos que buscan un ambiente tranquilo y acogedor. Contamos con áreas verdes, parque infantil y zona de barbacoa para que disfrute con sus seres queridos.",
    rating: 4.4,
    priceRange: "$$",
    address: "Avenida 8 #12-56, Guadalajara de Buga",
    phone: "+57 323 012 3456",
    website: "www.hotelchrisban.com",
    amenities: ["Piscina", "WiFi", "Parque infantil", "Restaurante", "Estacionamiento", "Jardines"],
    rooms: [
      { type: "Estándar", price: "110.000", capacity: "2 personas" },
      { type: "Familiar", price: "190.000", capacity: "4 personas" },
      { type: "Cabaña", price: "250.000", capacity: "6 personas" },
    ],
    position: [3.899, -76.297],
    checkIn: "3:00 PM",
    checkOut: "1:00 PM",
  },
]

export default function HotelDetailPage() {
  const params = useParams()
  const { id } = params

  const [hotel, setHotel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [otherHotels, setOtherHotels] = useState<any[]>([])
  const [isFav, setIsFav] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [error, setError] = useState<string | null>(null)

  // Initialize auth and favorites outside of useEffect to avoid hook call issues
  const auth = useAuth()
  const { user } = auth

  const favoritesService = useFavorites()
  const { addFavorite, removeFavorite, isFavorite, isServiceAvailable: isFavoritesAvailable } = favoritesService

  // Inicializar el servicio de reseñas
  const {
    reviews,
    isLoading: reviewsLoading,
    isServiceAvailable: isReviewsAvailable,
    addReview,
    getUserReview,
    updateReview,
  } = useReviewsService(id as string, "hotel")

  // Estado para el formulario de reseñas
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const userReview = getUserReview()

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      const foundHotel = hotels.find((h) => h.id === id)
      if (foundHotel) {
        setHotel(foundHotel)
        setOtherHotels(hotels.filter((h) => h.id !== id))
      }
      setLoading(false)
    }, 500)
  }, [id])

  useEffect(() => {
    if (hotel) {
      try {
        setIsFav(isFavorite(hotel.id))
      } catch (error) {
        console.warn("Error checking favorite status:", error)
      }
    }
  }, [hotel, isFavorite])

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      setError(null)
      if (isFav) {
        await removeFavorite(hotel.id)
        setIsFav(false)
      } else {
        await addFavorite({
          id: hotel.id,
          name: hotel.name,
          type: "hotel",
          image: hotel.image,
          location: "Guadalajara de Buga",
        })
        setIsFav(true)
      }
    } catch (error) {
      console.error("Error al gestionar favorito:", error)
      setError(error instanceof Error ? error.message : "Error al gestionar favorito")
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError(null)
    setReviewSuccess(null)
    setIsSubmitting(true)

    try {
      if (userReview && isEditing) {
        await updateReview(userReview.id, rating, comment)
        setIsEditing(false)
        setReviewSuccess("Tu reseña ha sido actualizada correctamente")
      } else {
        await addReview(rating, comment)
        setReviewSuccess("Tu reseña ha sido publicada correctamente")
      }
      setComment("")
      setRating(5)
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Error al enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReview = () => {
    if (userReview) {
      setRating(userReview.rating)
      setComment(userReview.comment)
      setIsEditing(true)
      setReviewSuccess(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setRating(5)
    setComment("")
    setReviewError(null)
    setReviewSuccess(null)
  }

  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-primary text-primary" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className="h-4 w-4 text-muted-foreground" />
        ))}
      </div>
    )
  }

  const SelectableRatingStars = () => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
            <Star className={`h-6 w-6 ${rating >= star ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
    )
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "desayuno incluido":
        return <Coffee className="h-4 w-4" />
      case "estacionamiento":
        return <Car className="h-4 w-4" />
      case "restaurante":
        return <Utensils className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Hotel no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              Lo sentimos, el hotel que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/buscar-plan/hoteles">
              <Button>Ver todos los hoteles</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Añadir el mensaje de error en la UI
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Imagen principal */}
        <div className="relative h-[300px] md:h-[400px]">
          <Image src={hotel.image || "/placeholder.svg"} alt={hotel.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="container py-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-2 text-white">
                <RatingDisplay placeId={hotel.id} placeType="hotel" size="md" />
                <span className="text-sm">•</span>
                <span className="text-sm">{hotel.priceRange}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de favoritos */}
        <div className="container relative">
          <Button
            variant={isFav ? "default" : "outline"}
            size="sm"
            className="absolute -top-6 right-6 rounded-full h-12 w-12 p-0 flex items-center justify-center"
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-5 w-5 ${isFav ? "fill-white" : ""}`} />
            <span className="sr-only">{isFav ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
          </Button>
        </div>

        {/* Mensaje de error para favoritos */}
        {error && (
          <div className="container mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Contenido principal */}
        <div className="container py-8">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="rooms">Habitaciones</TabsTrigger>
              <TabsTrigger value="rating">Calificar</TabsTrigger>
              <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-8">
              {/* Descripción */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Descripción general</h2>
                <p className="text-muted-foreground">{hotel.description}</p>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Información de contacto</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{hotel.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span>{hotel.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <a
                          href={`https://${hotel.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {hotel.website}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Horarios</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Check-in:</span>
                        <span className="font-medium">{hotel.checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-out:</span>
                        <span className="font-medium">{hotel.checkOut}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Servicios */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Servicios</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hotel.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-3 rounded-md">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Ubicación</h2>
                <div className="h-[400px] relative z-10">
                  <CityMap />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="space-y-8">
              <h2 className="text-xl font-semibold mb-3">Habitaciones disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotel.rooms.map((room: any, index: number) => (
                  <Card key={index}>
                    <div className="relative h-48">
                      <Image
                        src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(room.type)}`}
                        alt={room.type}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{room.type}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Capacidad:</span>
                          <span>{room.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Precio por noche:</span>
                          <span className="font-medium">COP ${room.price}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4">Reservar ahora</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rating" className="space-y-6">
              <h2 className="text-xl font-semibold">Califica {hotel.name}</h2>
              <RatingInput
                placeId={hotel.id}
                placeType="hotel"
                placeName={hotel.name}
                onRatingSubmitted={() => {
                  console.log("Calificación enviada")
                }}
              />
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Opiniones sobre {hotel.name}</h2>

                {!isReviewsAvailable && (
                  <Alert variant="warning" className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      El servicio de reseñas está temporalmente no disponible. Mostrando datos almacenados localmente.
                    </AlertDescription>
                  </Alert>
                )}

                {reviewError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{reviewError}</AlertDescription>
                  </Alert>
                )}

                {reviewSuccess && (
                  <Alert variant="default" className="bg-green-50 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{reviewSuccess}</AlertDescription>
                  </Alert>
                )}

                {/* Formulario para dejar reseña */}
                {user && (!userReview || isEditing) && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        {isEditing ? "Editar tu opinión" : `Comparte tu opinión sobre ${hotel.name}`}
                      </h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Tu calificación</label>
                          <SelectableRatingStars />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="comment" className="block text-sm font-medium">
                            Tu comentario
                          </label>
                          <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={`Comparte tu experiencia en ${hotel.name}...`}
                            rows={4}
                            required
                            disabled={isSubmitting || !isReviewsAvailable}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={isSubmitting || !isReviewsAvailable}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Actualizar opinión" : "Enviar opinión"}
                          </Button>

                          {isEditing && (
                            <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Reseña del usuario actual */}
                {userReview && !isEditing && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h3 className="font-semibold">
                                {user?.name} <span className="text-xs text-primary">(Tú)</span>
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {new Date(userReview.date).toLocaleDateString()}
                              </p>
                            </div>
                            <RatingStars rating={userReview.rating} />
                          </div>
                          <p className="text-sm">{userReview.comment}</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-xs mt-2"
                            onClick={handleEditReview}
                            disabled={!isReviewsAvailable}
                          >
                            Editar opinión
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de reseñas */}
                {reviewsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reviews.filter((review) => !user || review.userId !== user.id).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews
                      .filter((review) => !user || review.userId !== user.id)
                      .map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <h3 className="font-semibold">{review.userName}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(review.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <RatingStars rating={review.rating} />
                                </div>
                                <p className="text-sm">{review.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {user && userReview
                        ? "No hay más opiniones sobre este hotel."
                        : "No hay opiniones sobre este hotel. ¡Sé el primero en compartir tu experiencia!"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hoteles recomendados */}
        <div className="bg-muted/30 py-8">
          <div className="container">
            <h2 className="text-2xl font-semibold mb-6">Otros hoteles que te pueden gustar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherHotels.map((item) => (
                <Link href={`/buscar-plan/hoteles/${item.id}`} key={item.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <span className="text-sm">{item.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.priceRange}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

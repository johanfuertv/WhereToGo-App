"use client"

import type React from "react"
import { useState, useEffect, useMemo, memo } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-context"
import { useReviewsService } from "@/services/reviews-service"
import { MapPin, Phone, Globe, Star, StarHalf, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import RatingDisplay from "@/components/rating-display"
import RatingInput from "@/components/rating-input"
import FavoriteButton from "@/components/favorite-button"

// Importar CityMap dinámicamente para evitar errores de SSR
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
  <Link href={`/buscar-plan/restaurantes/${restaurant.id}`}>
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48">
        <Image
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Botón de favoritos en la tarjeta */}
        <div className="absolute top-2 right-2">
          <FavoriteButton
            place={{
              id: restaurant.id,
              name: restaurant.name,
              type: "restaurant",
              image: restaurant.image,
              location: "Guadalajara de Buga",
            }}
            size="sm"
            className="bg-white/90 hover:bg-white shadow-lg"
          />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{restaurant.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm">{restaurant.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{restaurant.priceRange}</p>
      </CardContent>
    </Card>
  </Link>
))

const useRestaurants = () =>
  useMemo(
    () => [
      {
        id: "peru-cook",
        name: "Peru Cook",
        image:
          "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/4f/fe/5e/direccion-carrera-5-calle.jpg?w=900&h=-1&s=1",
        description:
          "Peru Cook es un restaurante especializado en gastronomía peruana, ofreciendo una experiencia culinaria auténtica con platos como ceviche, lomo saltado, ají de gallina y más. Nuestros chefs utilizan ingredientes frescos y técnicas tradicionales para transportar a nuestros comensales a las diversas regiones de Perú a través de sus sabores.",
        rating: 4.5,
        priceRange: "$$",
        address: "Calle 4 #12-34, Guadalajara de Buga",
        phone: "+57 315 123 4567",
        website: "www.perucook.com",
        hours: {
          monday: "12:00 PM - 10:00 PM",
          tuesday: "12:00 PM - 10:00 PM",
          wednesday: "12:00 PM - 10:00 PM",
          thursday: "12:00 PM - 10:00 PM",
          friday: "12:00 PM - 11:00 PM",
          saturday: "12:00 PM - 11:00 PM",
          sunday: "12:00 PM - 9:00 PM",
        },
        position: [3.9015, -76.2995],
        openNow: true,
      },
      {
        id: "chuleta-don-carlos",
        name: "Chuleta Don Carlos",
        image: "/placeholder.svg?height=400&width=800&text=Chuleta%20Don%20Carlos",
        description:
          "Chuleta Don Carlos es un restaurante tradicional vallecaucano especializado en carnes a la parrilla y la famosa chuleta valluna. Con más de 25 años de experiencia, ofrecemos los mejores cortes de carne, acompañados de patacones, arroz y ensalada fresca. Un lugar ideal para disfrutar de la auténtica gastronomía del Valle del Cauca en un ambiente familiar.",
        rating: 4.7,
        priceRange: "$$",
        address: "Carrera 8 #5-67, Guadalajara de Buga",
        phone: "+57 318 765 4321",
        website: "www.chuletadoncarlos.com",
        hours: {
          monday: "12:00 PM - 9:00 PM",
          tuesday: "12:00 PM - 9:00 PM",
          wednesday: "12:00 PM - 9:00 PM",
          thursday: "12:00 PM - 9:00 PM",
          friday: "12:00 PM - 10:00 PM",
          saturday: "12:00 PM - 10:00 PM",
          sunday: "12:00 PM - 9:00 PM",
        },
        position: [3.9, -76.298],
        openNow: true,
      },
      {
        id: "panaderia-casita-del-pandebono",
        name: "Panadería Casita del Pandebono",
        image: "/placeholder.svg?height=400&width=800&text=Casita%20del%20Pandebono",
        description:
          "La Panadería Casita del Pandebono es un lugar emblemático en Buga donde se elaboran los tradicionales pandebonos, buñuelos y otras delicias de la panadería vallecaucana. Con recetas transmitidas por generaciones, ofrecemos productos frescos horneados diariamente, acompañados de café colombiano de la mejor calidad. Un rincón acogedor para disfrutar de la tradición gastronómica del Valle.",
        rating: 4.8,
        priceRange: "$",
        address: "Calle 7 #9-45, Guadalajara de Buga",
        phone: "+57 312 987 6543",
        website: "www.casitadelpandebono.com",
        hours: {
          monday: "6:00 AM - 8:00 PM",
          tuesday: "6:00 AM - 8:00 PM",
          wednesday: "6:00 AM - 8:00 PM",
          thursday: "6:00 AM - 8:00 PM",
          friday: "6:00 AM - 9:00 PM",
          saturday: "6:00 AM - 9:00 PM",
          sunday: "7:00 AM - 7:00 PM",
        },
        position: [3.902, -76.3005],
        openNow: false,
      },
    ],
    [],
  )

export default function RestaurantDetailPage() {
  const params = useParams()
  const { id } = params

  const restaurants = useRestaurants()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [otherRestaurants, setOtherRestaurants] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("info")

  // Initialize auth
  const auth = useAuth()
  const { user } = auth

  // Inicializar el servicio de reseñas
  const {
    reviews,
    isLoading: reviewsLoading,
    isServiceAvailable: isReviewsAvailable,
    addReview,
    getUserReview,
    updateReview,
  } = useReviewsService(id as string, "restaurant")

  // Estado para el formulario de reseñas con NÚMEROS en lugar de estrellas
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const userReview = getUserReview()

  useEffect(() => {
    // Optimizar carga de datos
    const foundRestaurant = restaurants.find((r) => r.id === id)
    if (foundRestaurant) {
      setRestaurant(foundRestaurant)
      setOtherRestaurants(restaurants.filter((r) => r.id !== id))
    }
    setLoading(false)
  }, [id, restaurants])

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
      setHoveredRating(0)
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
    setHoveredRating(0)
    setReviewError(null)
    setReviewSuccess(null)
  }

  const handleNumberClick = (number: number) => {
    setRating(number)
  }

  const handleNumberHover = (number: number) => {
    setHoveredRating(number)
  }

  const handleMouseLeave = () => {
    setHoveredRating(0)
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Muy malo"
      case 2:
        return "Malo"
      case 3:
        return "Regular"
      case 4:
        return "Bueno"
      case 5:
        return "Excelente"
      default:
        return ""
    }
  }

  const RatingStars = memo(({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className="h-4 w-4 text-muted-foreground" />
        ))}
      </div>
    )
  })

  // Componente de números para calificar (reemplaza las estrellas en el formulario)
  const NumberRatingSelector = () => {
    const displayRating = hoveredRating || rating

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">Selecciona un número del 1 al 5 para calificar:</p>
        <div className="flex justify-center gap-3" onMouseLeave={handleMouseLeave}>
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              type="button"
              className={`
                w-12 h-12 rounded-full border-2 font-bold text-lg transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${
                  displayRating >= number
                    ? "bg-primary text-white border-primary shadow-lg transform scale-110"
                    : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary hover:scale-105"
                }
                ${isSubmitting || !isReviewsAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              onClick={() => handleNumberClick(number)}
              onMouseEnter={() => handleNumberHover(number)}
              disabled={isSubmitting || !isReviewsAvailable}
            >
              {number}
            </button>
          ))}
        </div>
        {displayRating > 0 && (
          <p className="text-center text-sm font-medium text-primary">{getRatingText(displayRating)}</p>
        )}
      </div>
    )
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

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              Lo sentimos, el restaurante que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/buscar-plan/restaurantes">
              <Button>Ver todos los restaurantes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Imagen principal con título y botón de favoritos */}
        <div className="relative h-[300px] md:h-[400px]">
          <Image
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Contenido sobre la imagen */}
          <div className="absolute inset-0 flex items-end">
            <div className="container py-6 flex justify-between items-end w-full">
              {/* Información del restaurante */}
              <div className="text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-2">
                  <RatingDisplay placeId={restaurant.id} placeType="restaurant" size="md" />
                  <span className="text-sm">•</span>
                  <span className="text-sm">{restaurant.priceRange}</span>
                </div>
              </div>

              {/* Botón de favoritos a la DERECHA */}
              <div className="flex-shrink-0">
                <FavoriteButton
                  place={{
                    id: restaurant.id,
                    name: restaurant.name,
                    type: "restaurant",
                    image: restaurant.image,
                    location: "Guadalajara de Buga",
                  }}
                  size="lg"
                  className="h-14 w-14 rounded-full shadow-xl bg-white/95 hover:bg-white border-2 border-white/20"
                  showText={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="container py-8">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="rating">Calificar</TabsTrigger>
              <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-8">
              {/* Descripción */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Descripción general</h2>
                <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Información de contacto</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{restaurant.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span>{restaurant.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <a
                          href={`https://${restaurant.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {restaurant.website}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Horario</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Lunes</span>
                        <span>{restaurant.hours.monday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Martes</span>
                        <span>{restaurant.hours.tuesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Miércoles</span>
                        <span>{restaurant.hours.wednesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jueves</span>
                        <span>{restaurant.hours.thursday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Viernes</span>
                        <span>{restaurant.hours.friday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábado</span>
                        <span>{restaurant.hours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domingo</span>
                        <span>{restaurant.hours.sunday}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ubicación */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Ubicación</h2>
                <div className="h-[400px] relative z-10 rounded-lg overflow-hidden shadow-lg">
                  <CityMap />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rating" className="space-y-6">
              <h2 className="text-xl font-semibold">Califica {restaurant.name}</h2>
              <RatingInput
                placeId={restaurant.id}
                placeType="restaurant"
                placeName={restaurant.name}
                onRatingSubmitted={() => {
                  console.log("Calificación enviada")
                }}
              />
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Opiniones sobre {restaurant.name}</h2>

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

                {/* Formulario para dejar reseña CON NÚMEROS */}
                {user && (!userReview || isEditing) && (
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        {isEditing ? "Editar tu opinión" : `Comparte tu opinión sobre ${restaurant.name}`}
                      </h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Tu calificación</label>
                          <NumberRatingSelector />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="comment" className="block text-sm font-medium">
                            Tu comentario
                          </label>
                          <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={`Comparte tu experiencia en ${restaurant.name}...`}
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
                  <Card className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow duration-300">
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
                                {new Date(userReview.date).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleEditReview}>
                              Editar
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <RatingStars rating={userReview.rating} />
                            <span className="text-sm text-muted-foreground">({userReview.rating}/5)</span>
                          </div>
                          <p className="text-sm">{userReview.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de reseñas */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews
                      .filter((review) => review.userId !== user?.id)
                      .map((review) => (
                        <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="font-semibold">{review.userName}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(review.date).toLocaleDateString("es-ES", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <RatingStars rating={review.rating} />
                                  <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
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
                    <p className="text-muted-foreground">Aún no hay opiniones sobre este restaurante.</p>
                    {user && (
                      <p className="text-sm text-muted-foreground mt-2">¡Sé el primero en compartir tu experiencia!</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Otros restaurantes */}
          {otherRestaurants.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Otros restaurantes que te pueden interesar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

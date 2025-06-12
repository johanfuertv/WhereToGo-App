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
import { Star, StarHalf, Loader2, Heart, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import RatingDisplay from "@/components/rating-display"
import RatingInput from "@/components/rating-input"

// Importar CityMap dinámicamente para evitar errores de SSR
const CityMap = dynamic(() => import("@/components/city-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  ),
})

const activities = [
  {
    id: "visita-a-la-basilica",
    name: "Visita a la Basílica",
    image: "/placeholder.svg?height=400&width=800&text=Basílica",
    description:
      "Visita guiada a la famosa Basílica del Señor de los Milagros, el principal atractivo religioso de Buga. Conoce la historia de este importante santuario religioso, su arquitectura y las tradiciones que lo rodean. Un guía experto te llevará por los rincones más importantes de este lugar sagrado, explicando su significado cultural y religioso para Colombia.",
    rating: 4.9,
    priceRange: "$",
    address: "Calle 3 #16-24, Centro Histórico, Guadalajara de Buga",
    duration: "2 horas",
    category: "Cultural",
    schedule: "Lunes a domingo: 8:00 AM - 6:00 PM",
    groupSize: "Hasta 20 personas",
    includes: ["Guía turístico", "Folleto informativo", "Acceso a todas las áreas"],
    position: [3.9027, -76.3011],
    price: "25.000",
  },
  {
    id: "tour-por-el-centro-historico",
    name: "Tour por el Centro Histórico",
    image: "/placeholder.svg?height=400&width=800&text=Centro%20Histórico",
    description:
      "Recorrido por las calles coloniales y los edificios históricos del centro de Guadalajara de Buga. Este tour te llevará a través de la historia de la ciudad, visitando edificios coloniales, plazas históricas y monumentos importantes. Conocerás la evolución de Buga desde sus orígenes hasta la actualidad, mientras disfrutas de la arquitectura y el ambiente de una de las ciudades más antiguas de Colombia.",
    rating: 4.7,
    priceRange: "$",
    address: "Plaza Cabal, Centro, Guadalajara de Buga",
    duration: "3 horas",
    category: "Cultural",
    schedule: "Martes a domingo: 9:00 AM y 2:00 PM",
    groupSize: "Hasta 15 personas",
    includes: ["Guía turístico", "Refrigerio", "Mapa del centro histórico"],
    position: [3.9012, -76.2978],
    price: "30.000",
  },
  {
    id: "reserva-natural-laguna-de-sonso",
    name: "Reserva Natural Laguna de Sonso",
    image: "/placeholder.svg?height=400&width=800&text=Laguna%20de%20Sonso",
    description:
      "Excursión a la reserva natural más importante del Valle del Cauca, hogar de numerosas especies de aves. La Laguna de Sonso es un humedal de gran importancia ecológica donde podrás observar más de 160 especies de aves, tanto residentes como migratorias. El recorrido incluye caminatas por senderos ecológicos, observación de fauna y flora, y un paseo en bote por la laguna para apreciar el ecosistema desde otra perspectiva.",
    rating: 4.8,
    priceRange: "$$",
    address: "Km 8 vía Buga-Mediacanoa, Valle del Cauca",
    duration: "Medio día",
    category: "Naturaleza",
    schedule: "Miércoles a domingo: 7:00 AM - 4:00 PM",
    groupSize: "Hasta 12 personas",
    includes: [
      "Transporte desde Buga",
      "Guía especializado",
      "Equipo de observación de aves",
      "Refrigerio",
      "Paseo en bote",
    ],
    position: [3.865, -76.35],
    price: "85.000",
  },
]

export default function ActivityDetailPage() {
  const params = useParams()
  const { id } = params

  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [otherActivities, setOtherActivities] = useState<any[]>([])
  const [isFav, setIsFav] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [error, setError] = useState<string | null>(null)

  // Initialize auth and favorites outside of useEffect to avoid hook call issues
  const auth = useAuth() || { user: null }
  const { user } = auth

  const favoritesService = useFavorites() || {
    addFavorite: async () => false,
    removeFavorite: async () => false,
    isFavorite: () => false,
    isServiceAvailable: true,
  }

  const { addFavorite, removeFavorite, isFavorite, isServiceAvailable: isFavoritesAvailable } = favoritesService

  // Inicializar el servicio de reseñas
  const {
    reviews,
    isLoading: reviewsLoading,
    isServiceAvailable: isReviewsAvailable,
    addReview,
    getUserReview,
    updateReview,
  } = useReviewsService(id as string, "activity")

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
      const foundActivity = activities.find((a) => a.id === id)
      if (foundActivity) {
        setActivity(foundActivity)
        setOtherActivities(activities.filter((a) => a.id !== id))
      }
      setLoading(false)
    }, 500)
  }, [id])

  useEffect(() => {
    if (activity) {
      try {
        setIsFav(isFavorite(activity.id))
      } catch (error) {
        console.warn("Error checking favorite status:", error)
      }
    }
  }, [activity, isFavorite])

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos")
      return
    }

    try {
      setError(null)
      if (isFav) {
        await removeFavorite(activity.id)
        setIsFav(false)
      } else {
        await addFavorite({
          id: activity.id,
          name: activity.name,
          type: "activity",
          image: activity.image,
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

  if (!activity) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Actividad no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              Lo sentimos, la actividad que buscas no existe o ha sido eliminada.
            </p>
            <Link href="/buscar-plan/actividades">
              <Button>Ver todas las actividades</Button>
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
        {/* Imagen principal */}
        <div className="relative h-[300px] md:h-[400px]">
          <Image src={activity.image || "/placeholder.svg"} alt={activity.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="container py-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{activity.name}</h1>
              <div className="flex items-center gap-2 text-white">
                <RatingDisplay placeId={activity.id} placeType="activity" size="md" />
                <span className="text-sm">•</span>
                <span className="text-sm">{activity.priceRange}</span>
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
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="rating">Calificar</TabsTrigger>
              <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-8">
              {/* Descripción */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Descripción general</h2>
                <p className="text-muted-foreground">{activity.description}</p>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Información básica</h3>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Detalles de la actividad */}
              <h2 className="text-xl font-semibold">Detalles de la actividad</h2>
            </TabsContent>

            <TabsContent value="rating" className="space-y-6">
              <h2 className="text-xl font-semibold">Califica {activity.name}</h2>
              <RatingInput
                placeId={activity.id}
                placeType="activity"
                placeName={activity.name}
                onRatingSubmitted={() => {
                  console.log("Calificación enviada")
                }}
              />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {/* Sección de opiniones */}
              <h2 className="text-xl font-semibold">Opiniones de otros usuarios</h2>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

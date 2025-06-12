"use client"

import type React from "react"

import { useState } from "react"
import { useReviewsService } from "@/services/reviews-service"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, StarHalf, AlertCircle, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CityReviewsProps {
  cityId: string
}

export default function CityReviews({ cityId }: CityReviewsProps) {
  // Inicializar auth con valores por defecto en caso de error
  const authResult = useAuth()
  const auth = authResult ? authResult : { user: null }
  const { user } = auth

  // Inicializar el servicio de reseñas
  const { reviews, isLoading, isServiceAvailable, addReview, getUserReview, updateReview } = useReviewsService(
    cityId,
    "city",
  )

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const userReview = getUserReview()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (!isServiceAvailable) {
        throw new Error(
          "El servicio de reseñas no está disponible. No puedes dejar tu opinión ahora mismo. Por favor, inicia el microservicio de reseñas con el comando: cd microservices/reviews-service && node server.js",
        )
      }

      if (userReview && isEditing) {
        await updateReview(userReview.id, rating, comment)
        setIsEditing(false)
        setSuccess("Tu reseña ha sido actualizada correctamente")
      } else {
        await addReview(rating, comment)
        setSuccess("Tu reseña ha sido publicada correctamente")
      }
      setComment("")
      setRating(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = () => {
    if (userReview) {
      setRating(userReview.rating)
      setComment(userReview.comment)
      setIsEditing(true)
      setSuccess(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setRating(5)
    setComment("")
    setError(null)
    setSuccess(null)
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isServiceAvailable && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            El servicio de reseñas está temporalmente no disponible. Mostrando datos almacenados localmente.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {user && (!userReview || isEditing) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">
              {isEditing ? "Editar tu opinión" : "Comparte tu opinión sobre Guadalajara de Buga"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Comparte tu experiencia en Guadalajara de Buga..."
                  rows={4}
                  required
                  disabled={isSubmitting || !isServiceAvailable}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || !isServiceAvailable}>
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
                    <p className="text-xs text-muted-foreground">{new Date(userReview.date).toLocaleDateString()}</p>
                  </div>
                  <RatingStars rating={userReview.rating} />
                </div>
                <p className="text-sm">{userReview.comment}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs mt-2"
                  onClick={handleEditClick}
                  disabled={!isServiceAvailable}
                >
                  Editar opinión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.filter((review) => !user || review.userId !== user.id).length > 0 ? (
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
                          <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
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
              ? "No hay más opiniones sobre este lugar. ¡Sé el primero en compartir tu experiencia!"
              : "No hay opiniones sobre este lugar. ¡Sé el primero en compartir tu experiencia!"}
          </p>
        </div>
      )}
    </div>
  )
}

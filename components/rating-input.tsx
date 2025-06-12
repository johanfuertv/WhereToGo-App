"use client"

import React from "react"

import { useState, useCallback, memo, useRef } from "react"
import { Star, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRatings } from "./ratings-context"
import { useAuth } from "./auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface RatingInputProps {
  placeId: string
  placeName: string
  onRatingSubmitted?: () => void
  className?: string
}

const RatingInput = memo(({ placeId, placeName, onRatingSubmitted, className }: RatingInputProps) => {
  const { user } = useAuth()
  const { submitRating, isServiceAvailable } = useRatings()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const isMountedRef = useRef(true)

  const handleStarClick = useCallback((value: number) => {
    setRating(value)
    setIsExpanded(true)
  }, [])

  const handleStarHover = useCallback((value: number) => {
    setHoveredRating(value)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast({
        title: "¡Inicia sesión! ✨",
        description: "Necesitas una cuenta para calificar lugares",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Selecciona una calificación",
        description: "Por favor, selecciona al menos una estrella",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await submitRating({
        placeId,
        rating,
        comment: comment.trim(),
        userId: user.id,
        userName: user.name,
      })

      if (isMountedRef.current) {
        toast({
          title: "¡Calificación enviada! ⭐",
          description: isServiceAvailable
            ? `Tu calificación de ${rating} estrellas para ${placeName} ha sido guardada`
            : `Tu calificación se guardó localmente y se sincronizará cuando el servicio esté disponible`,
        })

        // Resetear formulario
        setRating(0)
        setComment("")
        setIsExpanded(false)
        setHoveredRating(0)

        // Callback opcional
        onRatingSubmitted?.()
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error al enviar calificación:", error)
        toast({
          title: "Error al enviar calificación",
          description: "No pudimos guardar tu calificación. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }, [user, rating, comment, placeId, placeName, submitRating, isServiceAvailable, toast, onRatingSubmitted])

  const handleCancel = useCallback(() => {
    setRating(0)
    setComment("")
    setIsExpanded(false)
    setHoveredRating(0)
  }, [])

  // Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Título */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Califica tu experiencia</h3>
      </div>

      {/* Estrellas */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={cn(
              "p-1 rounded-full transition-all duration-200 hover:scale-110 will-change-transform",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            )}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={isSubmitting}
          >
            <Star
              className={cn(
                "h-8 w-8 transition-all duration-200",
                hoveredRating >= star || rating >= star
                  ? "fill-yellow-400 text-yellow-400 scale-110"
                  : "fill-none text-gray-300 hover:text-yellow-400",
              )}
            />
          </button>
        ))}

        {rating > 0 && <span className="ml-3 text-sm font-medium text-gray-600">{rating} de 5 estrellas</span>}
      </div>

      {/* Formulario expandido */}
      {isExpanded && (
        <div className="space-y-4 animate-fade-in-up">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comparte tu experiencia (opcional)
            </label>
            <Textarea
              id="comment"
              placeholder={`Cuéntanos qué te pareció ${placeName}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1">{comment.length}/500 caracteres</div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="gradient-primary text-white hover:scale-105 transition-all btn-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Enviar calificación
                </>
              )}
            </Button>

            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="hover:bg-gray-50">
              Cancelar
            </Button>

            {!isServiceAvailable && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Se guardará localmente</span>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de ayuda */}
      {!isExpanded && rating === 0 && (
        <p className="text-sm text-gray-500">Haz clic en las estrellas para calificar este lugar</p>
      )}
    </div>
  )
})

RatingInput.displayName = "RatingInput"

export default RatingInput

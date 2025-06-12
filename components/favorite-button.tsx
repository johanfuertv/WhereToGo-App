"use client"

import { useState, useEffect, memo } from "react"
import { Heart, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "./favorites-context"
import { useAuth } from "./auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  placeId: string
  placeName: string
  placeType: "restaurant" | "hotel" | "activity"
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

// Memoizar el componente para evitar re-renders innecesarios
const FavoriteButton = memo(
  ({
    placeId,
    placeName,
    placeType,
    className = "",
    variant = "outline",
    size = "default",
    showText = true,
  }: FavoriteButtonProps) => {
    const { user } = useAuth()
    const { addFavorite, removeFavorite, isFavorite, isServiceAvailable } = useFavorites()
    const { toast } = useToast()
    const [isFav, setIsFav] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    // Verificar si es favorito al cargar
    useEffect(() => {
      if (user) {
        const checkFavorite = async () => {
          try {
            const result = await isFavorite(placeId)
            setIsFav(result)
          } catch (error) {
            console.error("Error al verificar favorito:", error)
          }
        }
        checkFavorite()
      }
    }, [user, placeId, isFavorite])

    const handleToggleFavorite = async () => {
      if (!user) {
        toast({
          title: "¡Inicia sesión! ✨",
          description: "Necesitas una cuenta para guardar tus lugares favoritos",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      setIsAnimating(true)

      try {
        // Actualización optimista de la UI
        const newState = !isFav
        setIsFav(newState)

        if (newState) {
          await addFavorite({
            id: placeId,
            name: placeName,
            type: placeType,
          })
          toast({
            title: "¡Añadido a favoritos! 💖",
            description: isServiceAvailable
              ? `${placeName} está ahora en tu lista de favoritos`
              : `${placeName} guardado localmente (se sincronizará cuando el servicio esté disponible)`,
          })
        } else {
          await removeFavorite(placeId)
          toast({
            title: "Eliminado de favoritos",
            description: `${placeName} ya no está en tu lista de favoritos`,
          })
        }
      } catch (error) {
        // Revertir el estado en caso de error
        setIsFav(!isFav)
        console.error("Error al gestionar favorito:", error)
        toast({
          title: "¡Oops! Algo salió mal",
          description: "No pudimos actualizar tus favoritos. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setTimeout(() => setIsAnimating(false), 600)
      }
    }

    return (
      <Button
        variant={isFav ? "default" : variant}
        size={size}
        className={cn(
          "relative overflow-hidden transition-all duration-300 will-change-transform",
          isFav
            ? "bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105"
            : "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 hover:scale-105",
          isAnimating && "animate-pulse-glow",
          className,
        )}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        title={
          isServiceAvailable
            ? isFav
              ? "Quitar de favoritos"
              : "Añadir a favoritos"
            : isFav
              ? "Quitar de favoritos (guardado localmente)"
              : "Añadir a favoritos (se guardará localmente)"
        }
      >
        {/* Efecto de brillo */}
        {isFav && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
        )}

        <div className="flex items-center gap-2 relative z-10">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Heart
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  isFav ? "fill-current scale-110" : "fill-none",
                  isAnimating && "animate-bounce-gentle",
                )}
              />
              {isFav && !isLoading && (
                <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse absolute -top-1 -right-1" />
              )}
            </>
          )}

          {showText && (
            <span className="font-medium">
              {isLoading ? "..." : isFav ? "¡Favorito!" : "Añadir a favoritos"}
              {!isServiceAvailable && <span className="text-xs ml-1 opacity-75">(local)</span>}
            </span>
          )}
        </div>
      </Button>
    )
  },
)

FavoriteButton.displayName = "FavoriteButton"

export default FavoriteButton

"use client"

import { Star, StarHalf } from "lucide-react"
import { useRatingsService } from "@/services/ratings-service"
import { Skeleton } from "@/components/ui/skeleton"
import { memo } from "react"

interface RatingDisplayProps {
  placeId: string
  placeType: "restaurant" | "hotel" | "activity" | "city"
  showCount?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

// Memoizar el componente para evitar re-renders innecesarios
const RatingDisplay = memo(function RatingDisplay({
  placeId,
  placeType,
  showCount = true,
  size = "md",
  className = "",
}: RatingDisplayProps) {
  const { ratingAverage, isLoading, isServiceAvailable } = useRatingsService(placeId, placeType)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
        ))}
        {hasHalfStar && <StarHalf className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className={`${sizeClasses[size]} text-gray-300`} />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className={`${sizeClasses[size]} rounded-full`} />
          ))}
        </div>
        {showCount && <Skeleton className={`h-4 w-8 ${textSizeClasses[size]}`} />}
      </div>
    )
  }

  if (!ratingAverage || !isServiceAvailable) {
    // Mostrar calificación por defecto si el servicio no está disponible
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <RatingStars rating={4.5} />
        {showCount && <span className={`${textSizeClasses[size]} text-muted-foreground`}>4.5</span>}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RatingStars rating={ratingAverage.averageRating} />
      {showCount && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          {ratingAverage.averageRating} ({ratingAverage.totalRatings})
        </span>
      )}
    </div>
  )
})

export default RatingDisplay

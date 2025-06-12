import { Star, StarHalf } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const reviews = [
  {
    id: 1,
    name: "Carolina Martínez",
    location: "Bogotá",
    rating: 5,
    comment: "Excelente servicio, encontré el hospedaje perfecto para mis vacaciones en Cartagena. ¡Muy recomendado!",
  },
  {
    id: 2,
    name: "Andrés Gómez",
    location: "Medellín",
    rating: 4.5,
    comment:
      "La aplicación es muy intuitiva y me ayudó a planificar todo mi viaje por el Valle del Cauca. El transporte llegó puntual.",
  },
  {
    id: 3,
    name: "Luisa Fernández",
    location: "Cali",
    rating: 5,
    comment: "Encontré ofertas increíbles para mi viaje familiar. El mapa fue muy útil para ubicarnos en Buga.",
  },
  {
    id: 4,
    name: "Juan Carlos Pérez",
    location: "Tuluá",
    rating: 4,
    comment: "Muy buena plataforma para encontrar opciones de transporte. Podría mejorar con más filtros de búsqueda.",
  },
]

function RatingStars({ rating }: { rating: number }) {
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

export default function Reviews() {
  return (
    <section className="py-12 container">
      <h2 className="text-3xl font-bold text-center mb-2">Reseñas</h2>
      <p className="text-center text-muted-foreground mb-8">Lo que dicen nuestros usuarios sobre WhereToGo</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={`/placeholder.svg?text=${review.name.charAt(0)}`} />
                  <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold">{review.name}</h3>
                      <p className="text-sm text-muted-foreground">{review.location}</p>
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
    </section>
  )
}

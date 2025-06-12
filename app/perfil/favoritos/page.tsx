"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useFavorites } from "@/components/favorites-context"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Loader2, AlertCircle, Server, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"

export default function FavoritosPage() {
  const { user } = useAuth()
  const { favorites, isLoading, isServiceAvailable, removeFavorite } = useFavorites()
  const [activeTab, setActiveTab] = useState<"all" | "restaurants" | "hotels" | "activities">("all")
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredFavorites =
    activeTab === "all"
      ? favorites
      : favorites.filter((fav) => {
          if (activeTab === "restaurants") return fav.type === "restaurant"
          if (activeTab === "hotels") return fav.type === "hotel"
          if (activeTab === "activities") return fav.type === "activity"
          return true
        })

  const handleRemoveFavorite = async (id: string) => {
    try {
      setError(null)
      setRemovingId(id)
      await removeFavorite(id)
    } catch (error) {
      console.error("Error al eliminar favorito:", error)
      setError(error instanceof Error ? error.message : "Error al eliminar favorito")
    } finally {
      setRemovingId(null)
    }
  }

  // Mostrar loading inicial hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
              <p className="text-muted-foreground mb-6">Debes iniciar sesión para acceder a tus favoritos.</p>
            </div>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Si el servicio no está disponible, mostrar error prominente
  if (!isServiceAvailable) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <Server className="h-20 w-20 text-red-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4 text-red-600">Servicio no disponible</h1>
              <p className="text-lg text-muted-foreground mb-6">
                El microservicio de favoritos no está en funcionamiento en este momento.
              </p>
            </div>

            <Alert variant="destructive" className="mb-8 text-left">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base">
                <strong>Para activar el servicio de favoritos:</strong>
                <br />
                <br />
                1. Abre una terminal en tu proyecto
                <br />
                2. Navega a la carpeta del microservicio:
                <br />
                <code className="bg-red-100 px-2 py-1 rounded text-sm">cd microservices/favorites-service</code>
                <br />
                <br />
                3. Ejecuta el servidor:
                <br />
                <code className="bg-red-100 px-2 py-1 rounded text-sm">node server.js</code>
                <br />
                <br />
                4. Verifica que aparezca el mensaje: "🔗 Servicio de Favoritos ejecutándose en http://localhost:3001"
                <br />
                <br />
                5. Recarga esta página
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Recargar página
              </Button>
              <Link href="/buscar-plan">
                <Button variant="outline">Explorar lugares</Button>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Información técnica</h3>
              <p className="text-sm text-blue-700">
                Los favoritos requieren que el microservicio esté ejecutándose en el puerto 3001. Una vez activado,
                podrás ver, añadir y eliminar tus lugares favoritos.
              </p>
            </div>
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
        <div className="container py-8">
          {/* Header fijo para evitar movimiento */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mis Favoritos</h1>
            <p className="text-muted-foreground">Aquí encontrarás todos los lugares que has guardado como favoritos</p>
          </div>

          {/* Alertas */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tabs con altura mínima para evitar saltos */}
          <div className="min-h-[600px]">
            <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todos ({favorites.length})</TabsTrigger>
                <TabsTrigger value="restaurants">
                  Restaurantes ({favorites.filter((f) => f.type === "restaurant").length})
                </TabsTrigger>
                <TabsTrigger value="hotels">Hoteles ({favorites.filter((f) => f.type === "hotel").length})</TabsTrigger>
                <TabsTrigger value="activities">
                  Actividades ({favorites.filter((f) => f.type === "activity").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="min-h-[500px]">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFavorites.map((favorite) => (
                      <Card
                        key={favorite.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative">
                          <div className="relative h-48">
                            <Image
                              src={favorite.image || "/placeholder.svg"}
                              alt={favorite.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            disabled={removingId === favorite.id}
                          >
                            {removingId === favorite.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className="h-4 w-4 fill-white" />
                            )}
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <Link href={`/buscar-plan/${favorite.type}s/${favorite.id}`}>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer mb-1">
                              {favorite.name}
                            </h3>
                          </Link>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{favorite.location}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">
                              {favorite.type === "restaurant" && "Restaurante"}
                              {favorite.type === "hotel" && "Hotel"}
                              {favorite.type === "activity" && "Actividad"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      {activeTab === "all"
                        ? "No tienes favoritos guardados"
                        : `No tienes ${
                            activeTab === "restaurants"
                              ? "restaurantes"
                              : activeTab === "hotels"
                                ? "hoteles"
                                : "actividades"
                          } favoritos`}
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {activeTab === "all"
                        ? "Explora restaurantes, hoteles y actividades y guárdalos como favoritos para acceder rápidamente a ellos."
                        : `Explora ${
                            activeTab === "restaurants"
                              ? "restaurantes"
                              : activeTab === "hotels"
                                ? "hoteles"
                                : "actividades"
                          } y guárdalos como favoritos.`}
                    </p>
                    <Link href="/buscar-plan">
                      <Button>Explorar lugares</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

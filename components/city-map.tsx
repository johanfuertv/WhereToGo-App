"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

// Importar dinámicamente los componentes de react-leaflet para evitar errores de SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }, // Esto es crucial - evita que se intente renderizar en el servidor
)

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

export default function CityMap() {
  const [isMounted, setIsMounted] = useState(false)

  // Coordinates for Guadalajara de Buga, Colombia
  const position = [3.9008, -76.2983]

  // Points of interest in Buga
  const pointsOfInterest = [
    {
      name: "Basílica del Señor de los Milagros",
      position: [3.9027, -76.3011],
      description: "Famoso santuario religioso",
      type: "activity",
    },
    {
      name: "Parque Cabal",
      position: [3.9012, -76.2978],
      description: "Parque central de la ciudad",
      type: "activity",
    },
    {
      name: "Hotel Guadalajara",
      position: [3.9005, -76.299],
      description: "Hotel de 4 estrellas en el centro",
      type: "hotel",
    },
    {
      name: "Hotel El Faro",
      position: [3.903, -76.3],
      description: "Hotel boutique cerca de la Basílica",
      type: "hotel",
    },
    {
      name: "Hotel Chrisban",
      position: [3.899, -76.297],
      description: "Hotel familiar con piscina",
      type: "hotel",
    },
    {
      name: "Peru Cook",
      position: [3.9015, -76.2995],
      description: "Restaurante de comida peruana",
      type: "restaurant",
    },
    {
      name: "Chuleta Don Carlos",
      position: [3.9, -76.298],
      description: "Especialidad en carnes y chuletas",
      type: "restaurant",
    },
    {
      name: "Panadería Casita del Pandebono",
      position: [3.902, -76.3005],
      description: "Panadería tradicional vallecaucana",
      type: "restaurant",
    },
  ]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[500px] relative z-10">
      {isMounted && (
        <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pointsOfInterest.map((poi, index) => (
            <Marker key={index} position={poi.position}>
              <Popup>
                <div>
                  <h3 className="font-bold">{poi.name}</h3>
                  <p>{poi.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {poi.type === "hotel" && "Hotel"}
                    {poi.type === "restaurant" && "Restaurante"}
                    {poi.type === "activity" && "Actividad"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}

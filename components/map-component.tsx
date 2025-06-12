"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

export default function MapComponent() {
  // Coordinates for Guadalajara de Buga, Colombia
  const position = [3.9008, -76.2983]

  // Points of interest in Buga
  const pointsOfInterest = [
    {
      name: "Basílica del Señor de los Milagros",
      position: [3.9027, -76.3011],
      description: "Famoso santuario religioso",
    },
    { name: "Parque Cabal", position: [3.9012, -76.2978], description: "Parque central de la ciudad" },
    { name: "Estación del Ferrocarril", position: [3.8982, -76.2956], description: "Estación histórica" },
    { name: "Catedral de San Pedro", position: [3.9018, -76.2991], description: "Catedral principal de Buga" },
  ]

  return (
    <MapContainer center={position} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
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
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

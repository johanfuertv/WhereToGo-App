"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bus, Building } from "lucide-react"

const transportOptions = [
  { name: "Bus Expreso", description: "Servicio directo entre ciudades principales", price: "Desde $25.000" },
  { name: "Minivan Compartida", description: "Servicio puerta a puerta", price: "Desde $35.000" },
  { name: "Taxi Intermunicipal", description: "Servicio exclusivo", price: "Desde $120.000" },
  { name: "Transporte Turístico", description: "Incluye paradas en sitios de interés", price: "Desde $45.000" },
]

const accommodationOptions = [
  {
    name: "Hotel Boutique",
    description: "Alojamiento con encanto en el centro histórico",
    price: "Desde $150.000/noche",
  },
  { name: "Hostal Económico", description: "Opción económica para mochileros", price: "Desde $30.000/noche" },
  { name: "Apartamento Turístico", description: "Ideal para familias o grupos", price: "Desde $200.000/noche" },
  { name: "Finca Campestre", description: "Experiencia rural auténtica", price: "Desde $280.000/noche" },
]

export default function Services() {
  const [showTransport, setShowTransport] = useState(false)
  const [showAccommodation, setShowAccommodation] = useState(false)

  return (
    <section className="py-12 bg-muted">
      <div className="container">
        <Tabs defaultValue="transport" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="transport" className="flex items-center gap-2">
                <Bus className="h-4 w-4" />
                Transporte
              </TabsTrigger>
              <TabsTrigger value="accommodation" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hospedajes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="transport">
            <div className="text-center mb-6">
              <Button onClick={() => setShowTransport(!showTransport)} variant="outline">
                {showTransport ? "Ocultar transportes" : "Mostrar transportes"}
              </Button>
            </div>

            {showTransport && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transportOptions.map((option, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Bus className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{option.name}</h3>
                          <p className="text-muted-foreground">{option.description}</p>
                          <p className="font-medium mt-2">{option.price}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accommodation">
            <div className="text-center mb-6">
              <Button onClick={() => setShowAccommodation(!showAccommodation)} variant="outline">
                {showAccommodation ? "Ocultar hospedajes" : "Mostrar hospedajes"}
              </Button>
            </div>

            {showAccommodation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accommodationOptions.map((option, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{option.name}</h3>
                          <p className="text-muted-foreground">{option.description}</p>
                          <p className="font-medium mt-2">{option.price}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

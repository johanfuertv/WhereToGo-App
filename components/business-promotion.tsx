"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2 } from "lucide-react"

export default function BusinessPromotion() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log("Business promotion email:", email)
    setSubmitted(true)
    setEmail("")
  }

  return (
    <section className="py-12 bg-primary/5">
      <div className="container max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Promociona tu negocio</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aumenta la visibilidad de tu hotel, restaurante o servicio turístico. Miles de viajeros están buscando
            opciones como la tuya.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-green-800 font-medium text-lg mb-2">¡Gracias por tu interés!</h3>
            <p className="text-green-700">
              Nos pondremos en contacto contigo pronto para discutir cómo podemos promocionar tu negocio.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Empezar ahora</Button>
          </form>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="font-bold text-lg mb-2">Mayor visibilidad</h3>
            <p className="text-sm text-muted-foreground">
              Llega a miles de viajeros que buscan servicios como el tuyo.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Más reservas</h3>
            <p className="text-sm text-muted-foreground">Aumenta tus ventas y ocupación con nuestra plataforma.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Gestión sencilla</h3>
            <p className="text-sm text-muted-foreground">Panel de control fácil de usar para gestionar tu presencia.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

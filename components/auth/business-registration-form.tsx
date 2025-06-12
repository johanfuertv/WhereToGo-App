"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, type BusinessType } from "./auth-context"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BusinessRegistrationFormProps {
  onBack: () => void
  onSuccess: () => void
}

export default function BusinessRegistrationForm({ onBack, onSuccess }: BusinessRegistrationFormProps) {
  const { register, isLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "hotel" as BusinessType,
    address: "",
    city: "",
    description: "",
  })

  const [paymentMethod, setPaymentMethod] = useState({
    type: "credit_card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    bankName: "",
    accountNumber: "",
  })

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccountData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBusinessData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBusinessTypeChange = (value: string) => {
    setBusinessData((prev) => ({ ...prev, businessType: value as BusinessType }))
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentMethod((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentTypeChange = (value: string) => {
    setPaymentMethod((prev) => ({ ...prev, type: value }))
  }

  const validateStep1 = () => {
    if (accountData.password !== accountData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setError(null)
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    setError(null)
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await register(
        accountData.name,
        accountData.email,
        accountData.password,
        "business",
        {
          name: businessData.businessName,
          type: businessData.businessType,
          address: businessData.address,
          city: businessData.city,
          description: businessData.description,
        },
        {
          type: paymentMethod.type as "credit_card" | "bank_account",
          lastFour:
            paymentMethod.type === "credit_card"
              ? paymentMethod.cardNumber.slice(-4)
              : paymentMethod.accountNumber.slice(-4),
          bank: paymentMethod.type === "bank_account" ? paymentMethod.bankName : undefined,
        },
      )
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Registro de Cuenta Anunciante</h3>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between mb-4">
        <div className={`flex-1 text-center pb-2 border-b-2 ${step === 1 ? "border-primary" : "border-muted"}`}>
          Cuenta
        </div>
        <div className={`flex-1 text-center pb-2 border-b-2 ${step === 2 ? "border-primary" : "border-muted"}`}>
          Negocio
        </div>
        <div className={`flex-1 text-center pb-2 border-b-2 ${step === 3 ? "border-primary" : "border-muted"}`}>
          Pago
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                value={accountData.name}
                onChange={handleAccountChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={accountData.email}
                onChange={handleAccountChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={accountData.password}
                onChange={handleAccountChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={accountData.confirmPassword}
                onChange={handleAccountChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input
                id="businessName"
                name="businessName"
                value={businessData.businessName}
                onChange={handleBusinessChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Tipo de negocio</Label>
              <Select value={businessData.businessType} onValueChange={handleBusinessTypeChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de negocio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel / Hospedaje</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                  <SelectItem value="tour">Tour / Actividad</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={businessData.address}
                onChange={handleBusinessChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                value={businessData.city}
                onChange={handleBusinessChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del negocio</Label>
              <Textarea
                id="description"
                name="description"
                value={businessData.description}
                onChange={handleBusinessChange}
                required
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Tabs defaultValue="credit_card" onValueChange={handlePaymentTypeChange}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="credit_card">Tarjeta de crédito</TabsTrigger>
                  <TabsTrigger value="bank_account">Cuenta bancaria</TabsTrigger>
                </TabsList>
                <TabsContent value="credit_card" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número de tarjeta</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentMethod.cardNumber}
                      onChange={handlePaymentChange}
                      required={paymentMethod.type === "credit_card"}
                      disabled={isLoading}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={paymentMethod.cardName}
                      onChange={handlePaymentChange}
                      required={paymentMethod.type === "credit_card"}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Fecha de expiración</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentMethod.expiryDate}
                        onChange={handlePaymentChange}
                        required={paymentMethod.type === "credit_card"}
                        disabled={isLoading}
                        placeholder="MM/AA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={paymentMethod.cvv}
                        onChange={handlePaymentChange}
                        required={paymentMethod.type === "credit_card"}
                        disabled={isLoading}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bank_account" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nombre del banco</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={paymentMethod.bankName}
                      onChange={handlePaymentChange}
                      required={paymentMethod.type === "bank_account"}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Número de cuenta</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      value={paymentMethod.accountNumber}
                      onChange={handlePaymentChange}
                      required={paymentMethod.type === "bank_account"}
                      disabled={isLoading}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" className="rounded border-gray-300" required />
                <Label htmlFor="terms" className="text-sm">
                  Acepto los{" "}
                  <Button variant="link" className="p-0 h-auto text-xs">
                    términos y condiciones
                  </Button>{" "}
                  y la{" "}
                  <Button variant="link" className="p-0 h-auto text-xs">
                    política de privacidad
                  </Button>
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isLoading}>
              Anterior
            </Button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <Button type="button" onClick={handleNextStep} disabled={isLoading}>
              Siguiente
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Completar registro
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

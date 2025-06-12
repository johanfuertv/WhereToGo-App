import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-context"
import { FavoritesProvider } from "@/components/favorites-context"
import { ReviewsProvider } from "@/components/reviews-context"
import { RatingsProvider } from "@/components/ratings-context"
import { NotificationsProvider } from "@/components/notifications/notifications-context"
import { ServiceStatusIndicator } from "@/components/service-status-indicator"
import { ClientToaster } from "@/components/client-toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WhereToGo - Planifica tu viaje por Colombia",
  description: "Descubre los mejores destinos, transportes y hospedajes en Colombia",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FavoritesProvider>
              <ReviewsProvider>
                <RatingsProvider>
                  <NotificationsProvider>
                    {children}
                    <ServiceStatusIndicator />
                    <ClientToaster />
                  </NotificationsProvider>
                </RatingsProvider>
              </ReviewsProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

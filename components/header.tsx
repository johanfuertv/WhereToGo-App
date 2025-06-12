"use client"

import { useState, useEffect, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Sparkles, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth/auth-context"
import LoginModal from "./auth/login-modal"
import RegisterModal from "./auth/register-modal"
import UserMenu from "./auth/user-menu"
import NotificationBell from "./notifications/notification-bell"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// Memoizar el componente para evitar re-renders innecesarios
const Header = memo(() => {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isMobile = useMobile()

  // Detectar scroll para efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Cerrar menú al redimensionar a desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false)
    }
  }, [isMobile])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: "/", label: "Inicio", icon: "🏠" },
    { href: "/buscar-plan", label: "Buscar Plan", icon: "🔍" },
    { href: "/buscar-plan/restaurantes", label: "Restaurantes", icon: "🍽️" },
    { href: "/buscar-plan/hoteles", label: "Hoteles", icon: "🏨" },
    { href: "/buscar-plan/actividades", label: "Actividades", icon: "🎯" },
  ]

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled ? "bg-white/95 backdrop-blur-md border-b shadow-lg" : "bg-white border-b",
        )}
      >
        <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <MapPin className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient">WhereToGo</span>
              <span className="text-xs text-muted-foreground -mt-1">Descubre Colombia</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 will-change-transform",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                )}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell - Always visible */}
            <NotificationBell />

            {/* User Menu or Auth Buttons */}
            {user ? (
              <UserMenu />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowLoginModal(true)}
                  className="hover:bg-primary/10 btn-glow"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => setShowRegisterModal(true)}
                  className="gradient-primary text-white hover:scale-105 transition-transform btn-glow"
                >
                  Registrarse
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-primary/10 hover:scale-110 transition-all"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-md animate-fade-in-up">
            <div className="container px-4 py-4 mx-auto sm:px-6">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover-lift will-change-transform",
                      "animate-fade-in-up",
                      pathname === link.href
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="mr-3 text-lg">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}

                {!user && (
                  <div className="pt-4 space-y-2 border-t">
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-primary/10 btn-glow"
                      onClick={() => setShowLoginModal(true)}
                    >
                      <span className="mr-2">👤</span>
                      Iniciar Sesión
                    </Button>
                    <Button
                      className="w-full justify-start gradient-primary text-white btn-glow"
                      onClick={() => setShowRegisterModal(true)}
                    >
                      <span className="mr-2">✨</span>
                      Registrarse
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
    </>
  )
})

Header.displayName = "Header"

export default Header

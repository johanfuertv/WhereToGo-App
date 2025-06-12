import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/40">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">WhereToGo</h3>
            <p className="text-sm text-muted-foreground">
              Tu plataforma para descubrir y planificar viajes increíbles por Colombia.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Sobre Nosotros</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Nuestra Historia
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Equipo
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Prensa
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Trabaja con nosotros
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Ciudades Populares</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Cali
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Medellín
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Cartagena
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Bogotá
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Santa Marta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">info@wheretogo.co</li>
              <li className="text-muted-foreground">+57 300 123 4567</li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Soporte
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} WhereToGo. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
              Términos y Condiciones
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

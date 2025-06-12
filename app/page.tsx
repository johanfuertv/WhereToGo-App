import Header from "@/components/header"
import Hero from "@/components/hero"
import Destinations from "@/components/destinations"
import Services from "@/components/services"
import Reviews from "@/components/reviews"
import BusinessPromotion from "@/components/business-promotion"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Destinations />
        <Services />
        <Reviews />
        <BusinessPromotion />
      </main>
      <Footer />
    </div>
  )
}

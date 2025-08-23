import { Navbar } from "../../components/navbar"
import { WalletStatus } from "../../components/wallet-status"
import { HeroSection } from "../../components/hero-section"
import { FeaturesSection } from "../../components/features-section"
import { Footer } from "../../components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WalletStatus />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

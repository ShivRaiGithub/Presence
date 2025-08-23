"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  const { isConnected, connectWallet } = useWallet()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Ripple background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Ripple SVG pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ripples" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ripples)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Proof of Presence Platform
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Presence
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Issue NFTs to verify community membership and event attendance. Build trust, create connections, and prove
            your presence in the digital world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={connectWallet}
                className="ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Connect Wallet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                asChild
                className="ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <a href="/creator">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              asChild
              className="ripple-effect text-lg px-8 py-6 rounded-xl border-2 hover:bg-primary/5 transition-all duration-300 bg-transparent"
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  const { isConnected, connectWallet } = useWallet()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 min-h-screen flex items-center">


{/* Main concentric circles SVG background */}
<div className="absolute inset-0 flex items-center justify-center">
  <svg
    width="800"
    height="800"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className="scale-150 translate-x-200"
  >
    <defs>
      <linearGradient id="concentricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }} />
      </linearGradient>

      <radialGradient id="fadeMask" cx="50%" cy="50%" r="70%">
        <stop offset="0%" style={{ stopColor: "white", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "white", stopOpacity: 0 }} />
      </radialGradient>

      <mask id="fadeOut">
        <rect width="100%" height="100%" fill="url(#fadeMask)" />
      </mask>
    </defs>

    <g mask="url(#fadeOut)" opacity="0.5">
      <circle cx="32" cy="32" r="2" fill="url(#concentricGradient)" />
      <circle cx="32" cy="32" r="6" stroke="url(#concentricGradient)" strokeWidth="2" fill="none" />
      <circle cx="32" cy="32" r="14" stroke="url(#concentricGradient)" strokeWidth="2" fill="none" />
      <circle cx="32" cy="32" r="22" stroke="url(#concentricGradient)" strokeWidth="2" fill="none" />
      <circle cx="32" cy="32" r="30" stroke="url(#concentricGradient)" strokeWidth="2" fill="none" />
    </g>
  </svg>
</div>




      {/* Centered content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
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
          Issue NFTs and grow your Community. <br />
          Receive NFTs and prove your Presence.
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
            <a href="#features" suppressHydrationWarning>Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
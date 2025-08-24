"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
         <Link href="/" suppressHydrationWarning={true} className="flex items-center space-x-2">
      {/* Gradient circle from SVG, scaled 1.5x */}
      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
        <svg
          width="48"
          height="48"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="2" fill="url(#logo-gradient)" />
          <circle cx="32" cy="32" r="6" stroke="url(#logo-gradient)" strokeWidth="2" fill="none" />
          <circle cx="32" cy="32" r="14" stroke="url(#logo-gradient)" strokeWidth="2" fill="none" />
          <circle cx="32" cy="32" r="22" stroke="url(#logo-gradient)" strokeWidth="2" fill="none" />
          <circle cx="32" cy="32" r="30" stroke="url(#logo-gradient)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Presence text with same gradient */}
      <span className="font-bold text-xl bg-clip-text text-transparent bg-[linear-gradient(135deg,#3b82f6_0%,#06b6d4_100%)]">
        Presence
      </span>
    </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" suppressHydrationWarning className="text-foreground/80 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/profile"  suppressHydrationWarning={true} className="text-foreground/80 hover:text-foreground transition-colors">
              Profile
            </Link>
            <Link href="/creator"  suppressHydrationWarning={true}  className="text-foreground/80 hover:text-foreground transition-colors">
              Creator&apos;s Corner
            </Link>
            {/* <Link href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
              Contact
            </Link> */}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ripple-effect"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Wallet connection */}
            {isConnected ? (
              <Button variant="outline" onClick={disconnectWallet} className="ripple-effect bg-transparent">
                <Wallet className="h-4 w-4 mr-2" />
                {formatAddress(account!)}
              </Button>
            ) : (
              <Button
                onClick={connectWallet}
                className="ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

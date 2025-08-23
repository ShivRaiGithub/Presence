"use client"

import { useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink, Loader2, Plus, MapPin, Clock } from "lucide-react"
import Link from "next/link"

export function EventsSection() {
  const { allEvents, loadAllContracts, isConnected } = useWallet()

  useEffect(() => {
    loadAllContracts()
  }, [loadAllContracts])

  // Mock data for demonstration since contracts aren't connected yet
  const mockEvents = [
    {
      address: "0x4567890123def1234567890123ef123456789012",
      type: "event" as const,
      name: "Web3 Summit 2024",
      description:
        "The premier conference for Web3 developers, featuring talks on DeFi, NFTs, and blockchain innovation.",
      metadataURI: "ipfs://QmWeb3Summit",
      totalSupply: 450,
      levels: 2,
      location: "San Francisco, CA",
      date: "March 15-17, 2024",
    },
    {
      address: "0x5678901234ef12345678901234f1234567890123",
      type: "event" as const,
      name: "NFT Art Exhibition",
      description: "Exclusive digital art exhibition showcasing the latest NFT collections from emerging artists.",
      metadataURI: "ipfs://QmNFTArt",
      totalSupply: 120,
      levels: 1,
      location: "Virtual Event",
      date: "April 8, 2024",
    },
    {
      address: "0x6789012345f123456789012345f12345678901234",
      type: "event" as const,
      name: "DeFi Developer Workshop",
      description: "Hands-on workshop for developers looking to build decentralized finance applications.",
      metadataURI: "ipfs://QmDeFiWorkshop",
      totalSupply: 85,
      levels: 3,
      location: "New York, NY",
      date: "May 22, 2024",
    },
  ]

  const displayEvents = allEvents.length > 0 ? allEvents : mockEvents

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Latest Events</h2>
            <p className="text-muted-foreground">Join events and earn proof-of-attendance NFTs</p>
          </div>
          {isConnected && (
            <Button asChild className="ripple-effect bg-gradient-to-r from-accent to-primary">
              <Link href="/creator">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          )}
        </div>

        {displayEvents.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayEvents.slice(0, 6).map((event) => (
              <Card
                key={event.address}
                className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-2 hover:border-accent/20 group"
              >
                <CardHeader className="pb-4">
                  {/* Event visual */}
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern
                            id={`event-ripples-${event.address}`}
                            x="0"
                            y="0"
                            width="30"
                            height="30"
                            patternUnits="userSpaceOnUse"
                          >
                            <circle
                              cx="15"
                              cy="15"
                              r="12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                              opacity="0.4"
                            />
                            <circle
                              cx="15"
                              cy="15"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                              opacity="0.3"
                            />
                            <circle
                              cx="15"
                              cy="15"
                              r="4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                              opacity="0.2"
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#event-ripples-${event.address})`} />
                      </svg>
                    </div>
                    <Calendar className="h-12 w-12 text-accent relative z-10" />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-accent transition-colors">{event.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        Event
                      </Badge>
                      <Badge variant="outline">
                        {event.levels} Level{event.levels > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">{event.description}</CardDescription>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{(event as any).date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{(event as any).location}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Attendees:</span>
                      <span className="font-semibold text-accent">{event.totalSupply}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contract:</span>
                      <span className="font-mono text-xs">{formatAddress(event.address)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 ripple-effect bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                    >
                      <Link href={`/mint/${event.address}/1`}>Get Ticket</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="ripple-effect bg-transparent">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {displayEvents.length > 6 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="ripple-effect bg-transparent">
              View All Events
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

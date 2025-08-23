"use client"

import { useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, ExternalLink, Loader2, Plus } from "lucide-react"
import Link from "next/link"

export function CommunitiesSection() {
  const { allCommunities, loadAllContracts, isConnected } = useWallet()

  useEffect(() => {
    loadAllContracts()
  }, [loadAllContracts])

  // Mock data for demonstration since contracts aren't connected yet
  const mockCommunities = [
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      type: "community" as const,
      name: "Tech Innovators Hub",
      description: "A community for technology enthusiasts, developers, and innovators to connect and share knowledge.",
      metadataURI: "ipfs://QmTechInnovators",
      totalSupply: 156,
      levels: 3,
    },
    {
      address: "0x2345678901bcdef12345678901cdef1234567890",
      type: "community" as const,
      name: "Digital Artists Collective",
      description: "Creative community bringing together digital artists, designers, and NFT creators.",
      metadataURI: "ipfs://QmDigitalArtists",
      totalSupply: 89,
      levels: 2,
    },
    {
      address: "0x3456789012cdef123456789012def12345678901",
      type: "community" as const,
      name: "Web3 Builders",
      description: "Community of Web3 developers, blockchain enthusiasts, and decentralized application builders.",
      metadataURI: "ipfs://QmWeb3Builders",
      totalSupply: 234,
      levels: 4,
    },
  ]

  const displayCommunities = allCommunities.length > 0 ? allCommunities : mockCommunities

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Latest Communities</h2>
            <p className="text-muted-foreground">Discover and join vibrant communities</p>
          </div>
          {isConnected && (
            <Button asChild className="ripple-effect bg-gradient-to-r from-primary to-accent">
              <Link href="/creator">
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Link>
            </Button>
          )}
        </div>

        {displayCommunities.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading communities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCommunities.slice(0, 6).map((community) => (
              <Card
                key={community.address}
                className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-2 hover:border-primary/20 group"
              >
                <CardHeader className="pb-4">
                  {/* Community visual */}
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern
                            id={`ripples-${community.address}`}
                            x="0"
                            y="0"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                          >
                            <circle
                              cx="20"
                              cy="20"
                              r="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                              opacity="0.3"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r="10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                              opacity="0.2"
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#ripples-${community.address})`} />
                      </svg>
                    </div>
                    <Users className="h-12 w-12 text-primary relative z-10" />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {community.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        <Users className="h-3 w-3 mr-1" />
                        Community
                      </Badge>
                      <Badge variant="outline">{community.levels} Levels</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">{community.description}</CardDescription>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Members:</span>
                      <span className="font-semibold text-primary">{community.totalSupply}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contract:</span>
                      <span className="font-mono text-xs">{formatAddress(community.address)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      <Link href={`/mint/${community.address}/1`}>Join Community</Link>
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

        {displayCommunities.length > 6 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="ripple-effect bg-transparent">
              View All Communities
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

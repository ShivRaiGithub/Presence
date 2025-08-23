"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, ExternalLink, Loader2 } from "lucide-react"
import Image from "next/image"
import { Check, Copy } from "lucide-react"


export function NFTCollection() {
  const { userNFTs, isLoadingNFTs, loadUserNFTs } = useWallet()
  const [selectedTab, setSelectedTab] = useState("all")
  const [copied, setCopied] = useState(false)

const handleCopy = (address: string) => {
  navigator.clipboard.writeText(address)
  setCopied(true)
  setTimeout(() => setCopied(false), 1500)
}


  const communityNFTs = userNFTs.filter((nft) => nft.contractType === "community")
  const eventNFTs = userNFTs.filter((nft) => nft.contractType === "event")

  const getFilteredNFTs = () => {
    switch (selectedTab) {
      case "communities":
        return communityNFTs
      case "events":
        return eventNFTs
      default:
        return userNFTs
    }
  }

    const resolveIPFS = (uri: string) => {
    if (!uri) return ""
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "https://ipfs.io/ipfs/")
    }
    if (/^[a-zA-Z0-9]{46,}$/.test(uri)) {
      return `https://ipfs.io/ipfs/${uri}`
    }
    return uri
  }


  const formatContractAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoadingNFTs) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your NFT collection...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My NFT Collection</h2>
        <Button variant="outline" onClick={loadUserNFTs} className="ripple-effect bg-transparent">
          Refresh
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All NFTs ({userNFTs.length})</TabsTrigger>
          <TabsTrigger value="communities">Communities ({communityNFTs.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({eventNFTs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {getFilteredNFTs().length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                {selectedTab === "communities" ? (
                  <Users className="h-8 w-8 text-muted-foreground" />
                ) : selectedTab === "events" ? (
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <div className="text-2xl">🎫</div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {selectedTab === "all"
                    ? "No NFTs Found"
                    : selectedTab === "communities"
                      ? "No Community NFTs"
                      : "No Event NFTs"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {selectedTab === "all"
                    ? "You haven't minted any NFTs yet. Join communities and attend events to start collecting!"
                    : selectedTab === "communities"
                      ? "Join communities to earn membership NFTs and prove your participation."
                      : "Attend events to earn proof-of-attendance NFTs and build your event history."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredNFTs().map((nft) => (
                <Card
                  key={`${nft.contractAddress}-${nft.tokenId}`}
                  className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-2 hover:border-primary/20"
                >
                  <CardHeader className="pb-4">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-muted mb-4">
                      {nft.imageUrl ? (
                        <Image
                          src={nft.imageUrl || "/placeholder.svg"}
                          alt={nft.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          {nft.contractType === "community" ? (
                            <Users className="h-12 w-12 text-primary" />
                          ) : (
                            <Calendar className="h-12 w-12 text-accent" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg leading-tight">{nft.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={nft.contractType === "community" ? "default" : "secondary"}>
                            {nft.contractType === "community" ? (
                              <Users className="h-3 w-3 mr-1" />
                            ) : (
                              <Calendar className="h-3 w-3 mr-1" />
                            )}
                            {nft.contractType}
                          </Badge>
                          <Badge variant="outline">Level {nft.level}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-2">{nft.description}</CardDescription>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Token ID:</span>
                        <span className="font-mono">#{nft.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contract:</span>
<button
  className="flex items-center font-mono text-primary hover:underline cursor-pointer"
  onClick={() => handleCopy(nft.contractAddress)}
>
  {formatContractAddress(nft.contractAddress)}
  {copied ? (
    <Check className="h-3 w-3 ml-1 text-green-500" />
  ) : (
    <Copy className="h-3 w-3 ml-1 opacity-70" />
  )}
</button>


                      </div>
                    </div>
                    {nft.metadataURI && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-4 ripple-effect"
                       onClick={() => window.open(resolveIPFS(nft.metadataURI), "_blank")}
                      >
                        View Metadata
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

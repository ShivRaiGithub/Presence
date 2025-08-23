"use client"

import { useWallet } from "@/contexts/wallet-context"
import type { CreatorContract } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Settings, ExternalLink, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface ContractMetadata {
  name: string
  description: string
  image?: string
  type: string
  created?: string
}

export function CreatorContracts() {
  const { creatorContracts, isLoadingContracts, loadCreatorContracts, getContractDetails } = useWallet()
  const [contractMetadata, setContractMetadata] = useState<Record<string, ContractMetadata>>({})
  const [loadingMetadata, setLoadingMetadata] = useState<Record<string, boolean>>({})
  // State to track images that fail to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const fetchMetadata = useCallback(async (contract: CreatorContract) => {
    if (loadingMetadata[contract.address] || contractMetadata[contract.address]) {
      return
    }
    setLoadingMetadata(prev => ({ ...prev, [contract.address]: true }))
    try {
      const details = await getContractDetails(contract.address, contract.type)
      let metadata: ContractMetadata = {
        name: details.name,
        description: details.description,
        type: details.contractType.toLowerCase(),
      }
      if (details.metadataURI) {
        try {
          const response = await fetch(details.metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'))
          if (response.ok) {
            const fetchedMetadata = await response.json()
            metadata = { ...metadata, ...fetchedMetadata }
          }
        } catch (error) {
          console.warn(`Failed to fetch metadata for ${contract.address}:`, error)
        }
      }
      setContractMetadata(prev => ({ ...prev, [contract.address]: metadata }))
    } catch (error) {
      console.error(`Error processing metadata for ${contract.address}:`, error)
    } finally {
      setLoadingMetadata(prev => ({ ...prev, [contract.address]: false }))
    }
  }, [getContractDetails, contractMetadata, loadingMetadata]) // Added dependencies

  useEffect(() => {
    creatorContracts.forEach(contract => {
      fetchMetadata(contract)
    })
  }, [creatorContracts, fetchMetadata])

  if (isLoadingContracts) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your contracts...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Contracts</CardTitle>
            <CardDescription>Manage your deployed communities and events</CardDescription>
          </div>
          <Button variant="outline" onClick={loadCreatorContracts} className="ripple-effect bg-transparent">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {creatorContracts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Deploy your first community or event contract to start issuing NFTs and building your presence.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {creatorContracts.map((contract) => {
              const metadata = contractMetadata[contract.address]
              const isLoadingMeta = loadingMetadata[contract.address]
              const hasImageLoadFailed = failedImages[contract.address]

              return (
                <Card
                  key={contract.address}
                  className="ripple-effect hover:shadow-md transition-all duration-300 bg-background/50"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* --- REFACTORED Image Display Logic --- */}
                      <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        {isLoadingMeta ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : metadata?.image && !hasImageLoadFailed ? (
                          <Image
                            src={metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                            alt={metadata.name || "Contract image"}
                            width={64}
                            height={64}
                            className="object-cover rounded-lg w-full h-full"
                            onError={() => {
                              // On error, update state to show the fallback icon
                              setFailedImages(prev => ({ ...prev, [contract.address]: true }))
                            }}
                          />
                        ) : (
                          // Fallback icon
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Contract Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">
                            {metadata?.name || contract.name}
                          </h3>
                          <Badge variant={contract.type === "community" ? "default" : "secondary"}>
                            {contract.type === "community" ? (
                              <Users className="h-3 w-3 mr-1" />
                            ) : (
                              <Calendar className="h-3 w-3 mr-1" />
                            )}
                            {metadata?.type || contract.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">
                          {metadata?.description || "No description available."}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Members: {contract.totalSupply}</span>
                          <span>Levels: {contract.levels}</span>
                          <span className="font-mono">{formatAddress(contract.address)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                         <Button asChild size="sm" variant="outline" className="ripple-effect bg-transparent">
                           <Link href={`/manage/${contract.address}`}>
                             <Settings className="h-4 w-4 mr-2" />
                             Manage
                           </Link>
                         </Button>
                         <Button asChild variant="ghost" size="sm" className="ripple-effect">
                            <a href={`https://sepolia.etherscan.io/address/${contract.address}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                         </Button>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
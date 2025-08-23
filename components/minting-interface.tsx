"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Calendar, CheckCircle, AlertCircle, Loader2, ArrowLeft, ExternalLink } from "lucide-react"
import Image from "next/image"

interface MintingInterfaceProps {
  contractAddress: string
  level: number
}

// Enhanced interface to include all available information from wallet context
interface ContractInfo {
  name: string
  description: string
  type: "community" | "event"
  metadataURI?: string
  image?: string
  // Additional fields from allCommunities/allEvents arrays
  totalSupply?: number
  levels?: number
  // Additional fields from metadata
  creator?: string
  symbol?: string
  external_url?: string
  attributes?: any[]
  // Level-specific metadata for NFT preview (this is what the actual NFT will have)
  nftImage?: string
  nftName?: string
  nftDescription?: string
  nftAttributes?: any[]
  nftExternalUrl?: string
}

export function MintingInterface({ contractAddress, level }: MintingInterfaceProps) {
  const router = useRouter()
  const { 
    checkMintEligibility, 
    mintNFT, 
    account, 
    error, 
    clearError,
    allCommunities,
    allEvents,
    getContractDetails,
    provider,
    signer
  } = useWallet()
  
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null)
  const [eligibility, setEligibility] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const [levelImageLoadFailed, setLevelImageLoadFailed] = useState(false)
  const [nftImageLoadFailed, setNftImageLoadFailed] = useState(false)
  const [levelMetadataURI, setLevelMetadataURI] = useState<string | null>(null)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Helper function to convert IPFS URI to HTTP URL
  const convertIPFSToHTTP = (ipfsUri: string, gateway: string): string => {
    if (!ipfsUri) return ''
    
    // Handle different IPFS URI formats
    if (ipfsUri.startsWith('ipfs://')) {
      // Format: ipfs://QmHash or ipfs://bafyHash
      const hash = ipfsUri.replace('ipfs://', '')
      return `${gateway}${hash}`
    } else if (ipfsUri.startsWith('Qm') || ipfsUri.startsWith('baf')) {
      // Direct hash
      return `${gateway}${ipfsUri}`
    } else if (ipfsUri.startsWith('https://')) {
      // Already an HTTP URL
      return ipfsUri
    } else {
      // Assume it's a hash
      return `${gateway}${ipfsUri}`
    }
  }

  // Helper function to fetch metadata from IPFS with multiple gateway fallbacks
  const fetchMetadataFromIPFS = async (metadataURI: string): Promise<any> => {
    if (!metadataURI) return null;

    // List of IPFS gateways to try in order
    const gateways = [
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://gateway.ipfs.io/ipfs/'
    ];


    for (let i = 0; i < gateways.length; i++) {
      const gateway = gateways[i];
      try {
        const url = convertIPFSToHTTP(metadataURI, gateway);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const metadata = await response.json();
            return metadata;
          } else {
            console.warn(`Invalid content type from ${gateway}: ${contentType}`)
            continue;
          }
        } else {
          console.warn(`HTTP error from ${gateway}: ${response.status} ${response.statusText}`)
          continue;
        }
      } catch (error) {
        console.warn(`Failed to fetch metadata from ${gateway}:`, error);
        // Continue to next gateway
        continue;
      }
    }

    console.error(`Failed to fetch metadata from all gateways for ${metadataURI}`);
    return null;
  }

  // Helper function to get additional contract info from blockchain
  const getAdditionalContractInfo = async (contractAddress: string, contractType: "community" | "event") => {
    try {
      if (!provider) return {}
      
      // Import ethers and contract ABI (adjust path as needed)
      const { ethers } = await import("ethers")
      const { getContractABI } = await import("@/lib/contracts")
      
      const contract = new ethers.Contract(contractAddress, getContractABI(contractType), provider)
      
      const [symbol, owner, totalSupply, levels] = await Promise.all([
        contract.symbol().catch(() => ""),
        contract.owner().catch(() => ""),
        contract.totalSupply().catch(() => 0),
        contract.levelCount().catch(() => 0)
      ])
      
      return {
        symbol,
        creator: owner,
        totalSupply: Number(totalSupply),
        levels: Number(levels)
      }
    } catch (error) {
      console.warn("Failed to get additional contract info:", error)
      return {}
    }
  }

  // Helper function to get level-specific metadata
  const getLevelMetadata = async (contractAddress: string, contractType: "community" | "event", level: number) => {
    try {
      if (!provider) return {}
      
      const { ethers } = await import("ethers")
      const { getContractABI } = await import("@/lib/contracts")
      
      const contract = new ethers.Contract(contractAddress, getContractABI(contractType), provider)
      
      // Try to get level-specific metadata URI
      const levelMetadataURI = await contract.levelMetadataURIs(level).catch(() => null)
      
      if (levelMetadataURI) {
        const levelMetadata = await fetchMetadataFromIPFS(levelMetadataURI)
        if (levelMetadata) {
          return {
            nftName: levelMetadata.name,
            nftDescription: levelMetadata.description,
            nftImage: levelMetadata.image,
            nftAttributes: levelMetadata.attributes,
            nftExternalUrl: levelMetadata.external_url
          }
        }
      }
    } catch (error) {
      console.warn("Failed to get level metadata:", error)
    }
    return {}
  }

  const loadContractInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      clearError()

      // Determine contract type by checking the context arrays
      const communityContract = allCommunities.find(c => c.address.toLowerCase() === contractAddress.toLowerCase())
      const eventContract = allEvents.find(e => e.address.toLowerCase() === contractAddress.toLowerCase())
      
      const contractFromArray = communityContract || eventContract
      const contractType = communityContract ? "community" : eventContract ? "event" : null

      if (!contractType || !contractFromArray) {
        setContractInfo(null)
        return
      }

      // Start with basic info from the arrays
      let finalInfo: ContractInfo = {
        name: contractFromArray.name,
        description: contractFromArray.description || "No description available.",
        type: contractType,
        totalSupply: Number(contractFromArray.totalSupply),
        levels: contractFromArray.levels,
      }

      // Get contract details from blockchain
      try {
        const details = await getContractDetails(contractAddress, contractType)
        finalInfo = {
          ...finalInfo,
          name: details.name || finalInfo.name,
          description: details.description || finalInfo.description,
          metadataURI: details.metadataURI,
        }
      } catch (detailsError) {
        console.warn("Failed to get contract details from blockchain:", detailsError)
      }

      // Get additional contract info (symbol, creator, etc.)
      const additionalInfo = await getAdditionalContractInfo(contractAddress, contractType)
      finalInfo = { ...finalInfo, ...additionalInfo }

      // If a metadata URI exists, fetch it from IPFS and merge any additional properties
      if (finalInfo.metadataURI) {
        try {
          const contractMetadata = await fetchMetadataFromIPFS(finalInfo.metadataURI)
          if (contractMetadata) {
            finalInfo = { ...finalInfo, ...contractMetadata }
          }
        } catch (fetchError) {
          console.warn(`Failed to fetch contract metadata from ${finalInfo.metadataURI}:`, fetchError)
        }
      }

      // Get level-specific metadata for NFT preview
      const levelMetadata = await getLevelMetadata(contractAddress, contractType, level)
      finalInfo = { ...finalInfo, ...levelMetadata }
      
      setContractInfo(finalInfo)

      // Check eligibility if the wallet is connected
      if (account) {
        try {
          const eligibilityResult = await checkMintEligibility(contractAddress, level)
          setEligibility(eligibilityResult)
        } catch (eligibilityError) {
          console.error("Failed to check eligibility:", eligibilityError)
          setEligibility({ isEligible: false, hasAlreadyMinted: false })
        }
      } else {
        setEligibility({ isEligible: false, hasAlreadyMinted: false })
      }

    } catch (error) {
      console.error("Failed to load contract info:", error)
      setContractInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [contractAddress, level, account, allCommunities, allEvents, getContractDetails, checkMintEligibility, clearError, provider])

  useEffect(() => {
    // Only load if contracts are available in the context
    if (contractAddress && (allCommunities.length > 0 || allEvents.length > 0)) {
      loadContractInfo()
    } else if (contractAddress) {
      // Show loading state if contracts are still being fetched by the context
      setIsLoading(true)
    }
  }, [contractAddress, allCommunities, allEvents, loadContractInfo])

  const handleMint = async () => {
    if (!account) {
      clearError()
      return
    }

    try {
      setIsMinting(true)
      clearError()

      const hash = await mintNFT(contractAddress, level)
      setTxHash(hash)
      setMintSuccess(true)

      setTimeout(() => {
        router.push("/profile")
      }, 3000)
    } catch (error) {
      console.error("Minting failed:", error)
    } finally {
      setIsMinting(false)
    }
  }

  // Helper function to render image with IPFS gateway fallback
  const renderImage = (imageUri: string, alt: string, onError: () => void, className: string = "") => {
    if (!imageUri) return null;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const currentSrc = (e.target as HTMLImageElement).src;
      const gateways = [
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/',
        'https://gateway.ipfs.io/ipfs/'
      ];

      // Find current gateway index
      const currentGatewayIndex = gateways.findIndex(gateway => currentSrc.includes(gateway.replace('https://', '').replace('/ipfs/', '')));
      
      if (currentGatewayIndex < gateways.length - 1) {
        // Try next gateway
        const nextGateway = gateways[currentGatewayIndex + 1];
        (e.target as HTMLImageElement).src = convertIPFSToHTTP(imageUri, nextGateway);
      } else {
        // All gateways failed
        onError();
      }
    };

    return (
      <Image
        src={convertIPFSToHTTP(imageUri, 'https://gateway.pinata.cloud/ipfs/')}
        alt={alt}
        width={400}
        height={400}
        className={className}
        onError={handleImageError}
        priority
      />
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading contract information...</p>
      </div>
    )
  }

  if (!contractInfo) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">Contract Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The contract address could not be found or is not available in the current network.
        </p>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground">Contract Address:</p>
          <p className="font-mono text-xs bg-muted p-2 rounded break-all">{contractAddress}</p>
        </div>
        <Button onClick={() => router.push("/")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  if (mintSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-500/20">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Minting Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your {contractInfo.type === "community" ? "membership" : "attendance"} NFT has been successfully minted. You will be redirected to your profile shortly.
            </p>
            {txHash && (
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted-foreground">Transaction Hash:</p>
                <p className="font-mono text-xs bg-muted p-2 rounded break-all">{txHash}</p>
              </div>
            )}
            <div className="flex space-x-4 justify-center">
              <Button onClick={() => router.push("/profile")} className="ripple-effect">
                View Profile
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="ripple-effect bg-transparent">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button onClick={() => router.back()} variant="ghost" className="ripple-effect">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Information */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {contractInfo.type === "community" ? <Users className="h-5 w-5 text-primary" /> : <Calendar className="h-5 w-5 text-accent" />}
              <span>Contract Information</span>
            </CardTitle>
            <CardDescription>
              {contractInfo.type === "community" ? "Community Membership Contract" : "Event Attendance Contract"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contract Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : contractInfo.image && !imageLoadFailed ? (
                renderImage(
                  contractInfo.image,
                  contractInfo.name || "Contract image",
                  () => setImageLoadFailed(true),
                  "object-cover rounded-lg w-full h-full"
                )
              ) : (
                contractInfo.type === "community" ? (
                  <Users className="h-20 w-20 text-primary/50" />
                ) : (
                  <Calendar className="h-20 w-20 text-accent/50" />
                )
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{contractInfo.name}</h3>
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge variant={contractInfo.type === "community" ? "default" : "secondary"}>
                  {contractInfo.type === "community" ? <Users className="h-3 w-3 mr-1" /> : <Calendar className="h-3 w-3 mr-1" />}
                  {contractInfo.type}
                </Badge>
                {contractInfo.symbol && <Badge variant="outline">{contractInfo.symbol}</Badge>}
              </div>
              <p className="text-muted-foreground">{contractInfo.description}</p>
              
              {contractInfo.external_url && (
                <div className="mt-2">
                  <a 
                    href={contractInfo.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Learn More
                  </a>
                </div>
              )}

              {contractInfo.attributes && contractInfo.attributes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Contract Attributes:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {contractInfo.attributes.slice(0, 4).map((attr: any, index: number) => (
                      <div key={index} className="bg-muted/50 rounded p-2 text-xs">
                        <div className="font-medium">{attr.trait_type}</div>
                        <div className="text-muted-foreground">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NFT Preview & Minting Interface */}
        <div className="space-y-6">
          {/* NFT Level Preview */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>NFT Preview - Level {level}</span>
                {contractInfo.levels && level > contractInfo.levels && <Badge variant="destructive">Invalid Level</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Level-specific NFT Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : contractInfo.nftImage && !nftImageLoadFailed ? (
                  renderImage(
                    contractInfo.nftImage,
                    contractInfo.nftName || `Level ${level} NFT`,
                    () => setNftImageLoadFailed(true),
                    "object-cover rounded-lg w-full h-full"
                  )
                ) : contractInfo.image && !imageLoadFailed ? (
                  renderImage(
                    contractInfo.image,
                    contractInfo.name || "Contract image",
                    () => setImageLoadFailed(true),
                    "object-cover rounded-lg w-full h-full"
                  )
                ) : (
                  <div className="text-center">
                    {contractInfo.type === "community" ? (
                      <Users className="h-16 w-16 text-primary/50 mx-auto mb-2" />
                    ) : (
                      <Calendar className="h-16 w-16 text-accent/50 mx-auto mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">Level {level} NFT</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">
                  {contractInfo.nftName || `${contractInfo.name} - Level ${level}`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {contractInfo.nftDescription || `Level ${level} ${contractInfo.type === "community" ? "membership" : "attendance"} NFT`}
                </p>

                {contractInfo.nftExternalUrl && (
                  <div className="mt-2">
                    <a 
                      href={contractInfo.nftExternalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      NFT Details
                    </a>
                  </div>
                )}

                {contractInfo.nftAttributes && contractInfo.nftAttributes.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-2">NFT Attributes:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {contractInfo.nftAttributes.slice(0, 4).map((attr: any, index: number) => (
                        <div key={index} className="bg-secondary/20 rounded p-2 text-xs">
                          <div className="font-medium">{attr.trait_type}</div>
                          <div className="text-muted-foreground">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                    {contractInfo.nftAttributes.length > 4 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{contractInfo.nftAttributes.length - 4} more attributes
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Minting Interface */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Mint Your NFT</CardTitle>
              <CardDescription>
                {contractInfo.type === "community" ? "Join this community and get your membership NFT" : "Get your proof-of-attendance NFT for this event"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract:</span>
                  <span className="font-mono">{formatAddress(contractAddress)}</span>
                </div>
                {contractInfo.creator && contractInfo.creator !== "Unknown" && contractInfo.creator !== "" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator:</span>
                    <span className="font-mono">{formatAddress(contractInfo.creator)}</span>
                  </div>
                )}
                {contractInfo.totalSupply !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supply:</span>
                    <span>{contractInfo.totalSupply}</span>
                  </div>
                )}
                {contractInfo.levels !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max level:</span>
                    <span>{contractInfo.levels}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minting Level:</span>
                  <Badge variant="secondary">Level {level}</Badge>
                </div>
                {account && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Address:</span>
                    <span className="font-mono">{formatAddress(account)}</span>
                  </div>
                )}
              </div>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              {contractInfo.levels && level > contractInfo.levels && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Invalid level. This contract only has {contractInfo.levels} levels available.</AlertDescription></Alert>}
              {!account && <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please connect your wallet to check eligibility and mint NFTs.</AlertDescription></Alert>}

              {eligibility && account && (!contractInfo.levels || level <= contractInfo.levels) && (
                <div className="space-y-4">
                  {eligibility.hasAlreadyMinted ? (
                    <Alert><CheckCircle className="h-4 w-4" /><AlertDescription>You have already minted this NFT level.</AlertDescription></Alert>
                  ) : eligibility.isEligible ? (
                    <Alert><CheckCircle className="h-4 w-4" /><AlertDescription>You are eligible to mint this NFT!</AlertDescription></Alert>
                  ) : (
                    <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>You are not eligible to mint this NFT. Contact the creator for access.</AlertDescription></Alert>
                  )}
                </div>
              )}

              <Button
                onClick={handleMint}
                disabled={!account || (contractInfo.levels && level > contractInfo.levels) || !eligibility?.isEligible || eligibility?.hasAlreadyMinted || isMinting}
                className="w-full ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                size="lg"
              >
                {isMinting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Minting...</>
                  : !account ? "Connect Wallet"
                  : (contractInfo.levels && level > contractInfo.levels) ? "Invalid Level"
                  : eligibility?.hasAlreadyMinted ? "Already Minted"
                  : eligibility?.isEligible ? `Mint ${contractInfo.type === "community" ? "Membership" : "Attendance"} NFT`
                  : "Not Eligible"}
              </Button>

              <div className="flex space-x-2">
                  <a 
                      href={`https://sepolia.etherscan.io/address/${contractAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                  >
                      <Button variant="outline" size="sm" className="w-full ripple-effect bg-transparent">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Contract
                      </Button>
                  </a>
                <Button variant="outline" size="sm" className="flex-1 ripple-effect bg-transparent" onClick={() => router.push("/")}>Explore More</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
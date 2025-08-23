"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Users, Trash2, Loader2, CheckCircle, AlertCircle, Clipboard, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ContractMetadata {
  name: string
  description: string
  image?: string
  type: string
  created?: string
  allowlistedCount?: number
  levelNames?: string[]
}

interface ContractManagementProps {
  contractAddress: string
}

export function ContractManagement({ contractAddress }: ContractManagementProps) {
  // ADDED: getContractDetails to ensure we get the freshest data
  const { addLevel, addToAllowlist, removeFromAllowlist, error, clearError, creatorContracts, getContractDetails } = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [contractMetadata, setContractMetadata] = useState<ContractMetadata | null>(null)
  const [loadingMetadata, setLoadingMetadata] = useState(true)
  const [hasImageLoadFailed, setHasImageLoadFailed] = useState(false)

  // Form states
  const [newLevelMetadata, setNewLevelMetadata] = useState("")
  const [allowlistAddresses, setAllowlistAddresses] = useState("")
  const [allowlistLevel, setAllowlistLevel] = useState("1")
  const [removeAddresses, setRemoveAddresses] = useState("")
  const [removeLevel, setRemoveLevel] = useState("1")
  const [mintLevel, setMintLevel] = useState("1")
  const [mintLink, setMintLink] = useState("")

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // REWRITTEN: Fetch contract metadata using getContractDetails
  useEffect(() => {
    const fetchContractMetadata = async () => {
      setLoadingMetadata(true)
      setHasImageLoadFailed(false)

      const contractInList = creatorContracts.find(c => c.address === contractAddress)
      if (!contractInList) {
        setLoadingMetadata(false)
        return // Can't proceed if we don't know the contract type
      }

      try {
        // Use the dedicated function to get the most recent contract details
        const details = await getContractDetails(contractAddress, contractInList.type)
        
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
            console.warn(`Failed to fetch metadata for ${contractAddress}:`, error)
          }
        }
        setContractMetadata(metadata)
      } catch (error) {
        console.error(`Error fetching contract details:`, error)
      } finally {
        setLoadingMetadata(false)
      }
    }

    if (creatorContracts.length > 0) {
      fetchContractMetadata()
    }
  }, [contractAddress, creatorContracts, getContractDetails]) // ADDED: getContractDetails dependency

  // ... (rest of the component functions are unchanged)

  const handleGenerateMintLink = () => {
    if (!mintLevel || Number(mintLevel) < 1) return
    const link = `${window.location.origin}/mint/${contractAddress}/${mintLevel}`
    setMintLink(link)
    navigator.clipboard.writeText(link)
  }

  const handleAddLevel = async () => {
    if (!newLevelMetadata.trim()) return
    try {
      setIsLoading(true)
      clearError()
      setSuccess(null)
      await addLevel(contractAddress, newLevelMetadata)
      setSuccess("Level added successfully!")
      setNewLevelMetadata("")
    } catch (error) {
      console.error("Failed to add level:", error)
    } finally {
      setIsLoading(false)
    }
  }

const handleAddToAllowlist = async () => {
  if (!allowlistAddresses.trim()) return
  
  try {
    setIsLoading(true)
    clearError()
    setSuccess(null)
    
    // Enhanced address parsing and validation
    const addresses = allowlistAddresses
      .split(/[\n,]/) // Support both newlines and commas
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0)
      .filter((addr) => {
        // Basic Ethereum address validation
        if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
          console.warn(`Invalid address format: ${addr}`)
          return false
        }
        return true
      })
    
    if (addresses.length === 0) {
      setError("No valid addresses found. Please ensure addresses are in the format 0x...")
      return
    }
    
    const level = Number.parseInt(allowlistLevel)
    
    // Debug logging
    console.log("Adding to allowlist:")
    console.log("- Contract:", contractAddress)
    console.log("- Addresses:", addresses)
    console.log("- Level:", level)
    console.log("- Number of addresses:", addresses.length)
    
    await addToAllowlist(contractAddress, addresses, level)
    setSuccess(`Added ${addresses.length} addresses to allowlist!`)
    setAllowlistAddresses("")
    
  } catch (error) {
    console.error("Failed to add to allowlist:", error)
  } finally {
    setIsLoading(false)
  }
}

  const handleRemoveFromAllowlist = async () => {
    if (!removeAddresses.trim()) return
    try {
      setIsLoading(true)
      clearError()
      setSuccess(null)
      const addresses = removeAddresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)
      await removeFromAllowlist(contractAddress, addresses, Number.parseInt(removeLevel))
      setSuccess(`Removed ${addresses.length} addresses from allowlist!`)
      setRemoveAddresses("")
    } catch (error) {
      console.error("Failed to remove from allowlist:", error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Image display logic is already correct */}
            <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              {loadingMetadata ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : contractMetadata?.image && !hasImageLoadFailed ? (
                <Image
                  src={contractMetadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                  alt={contractMetadata.name || "Contract image"}
                  width={64}
                  height={64}
                  className="object-cover rounded-lg w-full h-full"
                  onError={() => {
                    setHasImageLoadFailed(true)
                  }}
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Contract Info */}
            <div className="flex-1">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <span>{contractMetadata?.name || "Contract Management"}</span>
              </CardTitle>
              <CardDescription className="mt-2">
                {contractMetadata?.description || `Manage levels and allowlists for contract: ${formatAddress(contractAddress)}`}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {contractMetadata?.type || "Contract"}
                </Badge>
                <span className="text-sm text-muted-foreground font-mono">
                  {formatAddress(contractAddress)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {/* ... (rest of the JSX is unchanged) ... */}
      <Tabs defaultValue="levels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="levels">Add Levels</TabsTrigger>
          <TabsTrigger value="allowlist">Manage Allowlist</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mintlink">Mint Link</TabsTrigger>
        </TabsList>

        {/* Add Levels Tab */}
        <TabsContent value="levels" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Level</span>
              </CardTitle>
              <CardDescription>Add a new level with metadata URI for your contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metadata-uri">Metadata URI</Label>
                <Input
                  id="metadata-uri"
                  placeholder="ipfs://... or https://..."
                  value={newLevelMetadata}
                  onChange={(e) => setNewLevelMetadata(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddLevel}
                disabled={!newLevelMetadata.trim() || isLoading}
                className="w-full ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Level...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Level
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Allowlist Tab */}
        <TabsContent value="allowlist" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add to Allowlist */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span>Add to Allowlist</span>
                </CardTitle>
                <CardDescription>Add addresses to the allowlist for a specific level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allowlist-level">Level</Label>
                  <Input
                    id="allowlist-level"
                    type="number"
                    min="1"
                    value={allowlistLevel}
                    onChange={(e) => setAllowlistLevel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowlist-addresses">Addresses (one per line)</Label>
                  <Textarea
                    id="allowlist-addresses"
                    placeholder="0x123...&#10;0x234..."
                    value={allowlistAddresses}
                    onChange={(e) => setAllowlistAddresses(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleAddToAllowlist}
                  disabled={!allowlistAddresses.trim() || isLoading}
                  className="w-full ripple-effect bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Add to Allowlist
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Remove from Allowlist */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span>Remove from Allowlist</span>
                </CardTitle>
                <CardDescription>Remove addresses from the allowlist for a specific level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remove-level">Level</Label>
                  <Input
                    id="remove-level"
                    type="number"
                    min="1"
                    value={removeLevel}
                    onChange={(e) => setRemoveLevel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remove-addresses">Addresses (one per line)</Label>
                  <Textarea
                    id="remove-addresses"
                    placeholder="0x123...&#10;0x234..."
                    value={removeAddresses}
                    onChange={(e) => setRemoveAddresses(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleRemoveFromAllowlist}
                  disabled={!removeAddresses.trim() || isLoading}
                  className="w-full ripple-effect bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove from Allowlist
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

       {/* Overview Tab */}
<TabsContent value="overview" className="space-y-6">
  <Card className="bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <CardTitle>Contract Overview</CardTitle>
      <CardDescription>Summary of your contract&apos;s current state</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {Number(creatorContracts.find(c => c.address === contractAddress)?.levels ?? 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Levels</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-accent">
            {Number(creatorContracts.find(c => c.address === contractAddress)?.totalSupply ?? 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Supply</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {isLoading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            ) : (
              contractMetadata?.allowlistedCount || 0
            )}
          </div>
          <div className="text-sm text-muted-foreground">Allowlisted Users</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Contract Address</Label>
        <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">{contractAddress}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({
          length: Number(creatorContracts.find(c => c.address === contractAddress)?.levels ?? 0),
        }).map((_, index) => (
          <Badge key={index} variant="outline">
            Level {index + 1}: {contractMetadata?.levelNames?.[index] || `Level ${index + 1}`}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>
</TabsContent>

        
        {/* Mint Link Tab */}
        <TabsContent value="mintlink" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clipboard className="h-4 w-4 text-primary" />
                <span>Generate Mint Link</span>
              </CardTitle>
              <CardDescription>Create a direct mint link for a specific level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mint-level">Level</Label>
                <Input
                  id="mint-level"
                  type="number"
                  min="1"
                  value={mintLevel}
                  onChange={(e) => setMintLevel(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerateMintLink}
                className="w-full ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Generate Link
              </Button>
              {mintLink && (
                <div className="mt-2 p-2 bg-muted rounded font-mono text-sm flex items-center justify-between">
                  <span className="truncate pr-2">{mintLink}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(mintLink)}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}
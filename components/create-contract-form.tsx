"use client"

import { useState } from "react"
import Image from "next/image"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Calendar, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface FormData {
  name: string
  symbol: string
  displayName: string
  description: string
  imageUrl: string
  imageFile: File | null
}

// Function to upload file to IPFS using Pinata
const uploadToIPFS = async (file: File | object): Promise<string> => {
  try {
    if (file instanceof File) {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to upload to IPFS: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    } else {
      // For JSON metadata
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
        },
        body: JSON.stringify({
          pinataContent: file,
          pinataMetadata: {
            name: `metadata-${Date.now()}.json`,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to upload metadata to IPFS: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    }
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}
export function CreateContractForm() {
  const {
    deployCommunity,
    deployEvent,
    presenceCommunityFactoryAddress,
    presenceEventFactoryAddress,
    loadCreatorContracts,
    error,
  } = useWallet()
  const [activeTab, setActiveTab] = useState("community")
  const [isDeploying, setIsDeploying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    symbol: "",
    displayName: "",
    description: "",
    imageUrl: "", // Used for local preview
    imageFile: null,
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDeploy = async (type: "community" | "event") => {
    const factoryAddress =
      type === "community"
        ? presenceCommunityFactoryAddress
        : presenceEventFactoryAddress
    
    // Guard clause to ensure an image is present
    if (!factoryAddress || !formData.imageFile) {
      alert("Please fill all required fields and upload an image.")
      return
    }

    try {
      setIsDeploying(true)
      setDeployedAddress(null)

      // Upload image to IPFS
      let finalImageUrl = ""
      setIsUploading(true)
      try {
        finalImageUrl = await uploadToIPFS(formData.imageFile)
      } catch (error) {
        console.error("Failed to upload image:", error)
        throw new Error("Failed to upload image to IPFS")
      } finally {
        setIsUploading(false)
      }

      // Create metadata object
      const metadata = {
        name: formData.displayName,
        description: formData.description,
        image: finalImageUrl, // Use the IPFS URL
        type: type,
        created: new Date().toISOString(),
      }

      // Upload metadata to IPFS
      const metadataURI = await uploadToIPFS(metadata)

      // Deploy contract
      let address: string
      if (type === "community") {
        address = await deployCommunity(
          formData.name,
          formData.symbol,
          formData.displayName,
          formData.description,
          metadataURI
        )
      } else {
        address = await deployEvent(
          formData.name,
          formData.symbol,
          formData.displayName,
          formData.description,
          metadataURI
        )
      }

      setDeployedAddress(address)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await loadCreatorContracts()

      // Reset form
      setFormData({
        name: "",
        symbol: "",
        displayName: "",
        description: "",
        imageUrl: "",
        imageFile: null,
      })
    } catch (error) {
      console.error("Deployment failed:", error)
    } finally {
      setIsDeploying(false)
    }
  }

  // UPDATED: Form is not valid until an image file is also selected
  const isFormValid =
    formData.name &&
    formData.symbol &&
    formData.displayName &&
    formData.description &&
    !!formData.imageFile

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <span>Create New</span>
        </CardTitle>
        <CardDescription>
          Create a new community or event contract to start issuing NFTs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Community</span>
            </TabsTrigger>
            <TabsTrigger value="event" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Event</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contract Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., TechCommunityNFT"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., TECH"
                  value={formData.symbol}
                  onChange={(e) =>
                    handleInputChange("symbol", e.target.value.toUpperCase())
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">
                {activeTab === "community" ? "Community" : "Event"} Name
              </Label>
              <Input
                id="displayName"
                placeholder={
                  activeTab === "community"
                    ? "e.g., Tech Innovators Hub"
                    : "e.g., Web3 Summit 2024"
                }
                value={formData.displayName}
                onChange={(e) =>
                  handleInputChange("displayName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={
                  activeTab === "community"
                    ? "Describe your community..."
                    : "Describe your event..."
                }
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
              />
            </div>

            {/* --- SIMPLIFIED IMAGE HANDLING SECTION --- */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageFile">Upload Image</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData((prev) => ({
                        ...prev,
                        imageFile: file,
                        imageUrl: URL.createObjectURL(file), // show preview
                      }))
                    }
                  }}
                  className="file-input"
                  disabled={isDeploying || isUploading}
                />
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-background/50 border">
                  <p className="absolute top-2 left-2 text-xs bg-black/50 text-white p-1 rounded">
                    Preview
                  </p>
                  <Image
                    src={formData.imageUrl}
                    alt="Image Preview"
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {deployedAddress && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully Created! Contract address: {deployedAddress}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => handleDeploy(activeTab as "community" | "event")}
              disabled={
                !isFormValid ||
                isDeploying ||
                isUploading ||
                !(activeTab === "community"
                  ? presenceCommunityFactoryAddress
                  : presenceEventFactoryAddress)
              }
              className="w-full ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? "Uploading Image..." : `Deploying ${activeTab}...`}
                </>
              ) : (
                <>Create {activeTab === "community" ? "Community" : "Event"}</>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
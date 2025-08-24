"use client"
import React, { createContext, useContext, useState, ReactNode } from "react"

interface NFT {
  tokenId: string
  level: number
  contractAddress: string
  contractType: "community" | "event"
  name: string
  description: string
  metadataURI: string
  imageUrl?: string
}

interface CreatorContract {
  address: string
  type: "community" | "event"
  name: string
  description: string
  metadataURI: string
  totalSupply: number
  levels: number
}

interface EnhancedNFTData {
  tokenId: string
  level: number
  contractAddress: string
  contractType: "community" | "event"
  name: string
  description: string
  metadataURI: string
  imageUrl?: string
  // Enhanced metadata from tokenURI
  nftMetadata?: {
    name?: string
    description?: string
    image?: string
    attributes?: any[]
    [key: string]: any
  }
  // Contract metadata
  contractMetadata?: {
    name?: string
    description?: string
    image?: string
    [key: string]: any
  }
}

interface EnhancedContractData {
  address: string
  type: "community" | "event"
  name: string
  description: string
  metadataURI: string
  totalSupply: number
  levels: number
  // Enhanced metadata from contract metadataURI
  contractMetadata?: {
    name?: string
    description?: string
    image?: string
    category?: string
    tags?: string[]
    [key: string]: any
  }
}

interface AIContextType {
  // AI features
  generateImage: (prompt: string) => Promise<string>
  getSuggestions: (
    userNFTs: NFT[], 
    allCommunities: CreatorContract[], 
    allEvents: CreatorContract[]
  ) => Promise<string[]>
  isLoadingSuggestions: boolean

  // Error handling
  error: string | null
  clearError: () => void
}

interface AIProviderProps {
  children: ReactNode
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Helper function to convert IPFS hash to gateway URL
  const getIPFSUrl = (uri: string): string => {
    if (uri.startsWith('ipfs://')) {
      return uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
    } else if (uri.startsWith('bafkrei') || uri.startsWith('Qm')) {
      return `https://ipfs.io/ipfs/${uri}`
    }
    return uri
  }

  // Helper function to fetch metadata from URI
  const fetchMetadata = async (uri: string): Promise<any> => {
    try {
      if (!uri || uri.trim() === '') return null
      
      const metadataUrl = getIPFSUrl(uri)
      const response = await fetch(metadataUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const metadata = await response.json()
      return metadata
    } catch (error) {
      console.warn(`Failed to fetch metadata from ${uri}:`, error)
      return null
    }
  }

  // Enhanced data fetching for user NFTs
  const fetchEnhancedNFTData = async (userNFTs: NFT[]): Promise<EnhancedNFTData[]> => {
    const enhancedNFTs: EnhancedNFTData[] = []

    for (const nft of userNFTs) {
      try {
        const enhancedNFT: EnhancedNFTData = { ...nft }

        // Fetch NFT metadata from tokenURI
        if (nft.metadataURI) {
          const nftMetadata = await fetchMetadata(nft.metadataURI)
          if (nftMetadata) {
            enhancedNFT.nftMetadata = nftMetadata
          }
        }

        enhancedNFTs.push(enhancedNFT)
      } catch (error) {
        console.warn(`Failed to enhance NFT ${nft.tokenId}:`, error)
        enhancedNFTs.push({ ...nft }) // Add without enhancement
      }
    }

    return enhancedNFTs
  }

  // Enhanced data fetching for contracts
  const fetchEnhancedContractData = async (contracts: CreatorContract[]): Promise<EnhancedContractData[]> => {
    const enhancedContracts: EnhancedContractData[] = []

    for (const contract of contracts) {
      try {
        const enhancedContract: EnhancedContractData = { ...contract }

        // Fetch contract metadata from metadataURI
        if (contract.metadataURI) {
          const contractMetadata = await fetchMetadata(contract.metadataURI)
          if (contractMetadata) {
            enhancedContract.contractMetadata = contractMetadata
          }
        }

        enhancedContracts.push(enhancedContract)
      } catch (error) {
        console.warn(`Failed to enhance contract ${contract.address}:`, error)
        enhancedContracts.push({ ...contract }) // Add without enhancement
      }
    }

    return enhancedContracts
  }

  // Call Gemini API for suggestions
  const callGeminiAPI = async (prompt: string): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file")
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    return data.candidates[0].content.parts[0].text
  }

  // Image generation using Pollinations AI (Free)
  const generateImage = async (prompt: string): Promise<string> => {
    try {
      setError(null)
      console.log("Generating image for prompt:", prompt)
      
      // Option 1: Pollinations AI (Completely free, no API key needed)
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&model=flux&nologo=true&enhance=true`
      
      // Test if the image loads successfully
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(pollinationsUrl)
        img.onerror = () => {
          console.warn("Pollinations failed, using placeholder")
          resolve("/placeholder.svg?height=512&width=512&query=" + encodeURIComponent(prompt))
        }
        img.src = pollinationsUrl
      })

    } catch (err: any) {
      console.error("Failed to generate image:", err)
      setError(err.message || "Failed to generate image")
      throw err
    }
  }

  // Alternative implementation using Hugging Face (requires free API key)
  const generateImageHuggingFace = async (prompt: string): Promise<string> => {
    try {
      const hfApiKey = process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY
      
      if (!hfApiKey) {
        throw new Error("Hugging Face API key not found")
      }

      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: "blurry, bad quality, distorted",
              num_inference_steps: 20,
              guidance_scale: 7.5,
              width: 512,
              height: 512
            }
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      return imageUrl
    } catch (err: any) {
      console.error("Hugging Face API failed:", err)
      setError(err.message || "Failed to generate image")
      throw err
    }
  }

  const getSuggestions = async (
    userNFTs: NFT[], 
    allCommunities: CreatorContract[], 
    allEvents: CreatorContract[]
  ): Promise<string[]> => {
    try {
      setIsLoadingSuggestions(true)
      setError(null)

      // Fetch enhanced data for all inputs
      const [enhancedUserNFTs, enhancedCommunities, enhancedEvents] = await Promise.all([
        fetchEnhancedNFTData(userNFTs),
        fetchEnhancedContractData(allCommunities),
        fetchEnhancedContractData(allEvents)
      ])

      // Create comprehensive prompt for Gemini
      const prompt = `
You are an AI assistant that analyzes user preferences based on their NFT collection and suggests relevant communities and events.

## User's Current NFT Collection:
${enhancedUserNFTs.map(nft => `
**NFT #${nft.tokenId}** (Level ${nft.level})
- Type: ${nft.contractType}
- Contract: ${nft.name}
- Description: ${nft.description}
- NFT Metadata: ${nft.nftMetadata ? JSON.stringify(nft.nftMetadata, null, 2) : 'Not available'}
`).join('\n')}

## Available Communities:
${enhancedCommunities.map(community => `
**${community.name}** (${community.address})
- Description: ${community.description}
- Total Supply: ${community.totalSupply}
- Levels: ${community.levels}
- Metadata: ${community.contractMetadata ? JSON.stringify(community.contractMetadata, null, 2) : 'Not available'}
`).join('\n')}

## Available Events:
${enhancedEvents.map(event => `
**${event.name}** (${event.address})
- Description: ${event.description}
- Total Supply: ${event.totalSupply}
- Levels: ${event.levels}
- Metadata: ${event.contractMetadata ? JSON.stringify(event.contractMetadata, null, 2) : 'Not available'}
`).join('\n')}

Based on the user's current NFT collection, their interests, and the available communities and events, please suggest 5-7 specific communities or events that would be most relevant to them. 

For each suggestion, provide:
1. The exact name of the community/event
2. A brief reason why it matches their interests
3. Whether it's a community or event

Format your response as a JSON array of strings, where each string contains the suggestion in this format:
"[COMMUNITY/EVENT] Name - Reason for recommendation"

Example format:
["[COMMUNITY] Tech Innovators - Based on your blockchain NFTs, you'd enjoy this tech community", "[EVENT] Art Gallery Opening - Your art collection shows interest in creative events"]

Return only the JSON array, no additional text.
`

      const geminiResponse = await callGeminiAPI(prompt)
      
      // Parse the JSON response
      try {
        // Try to extract JSON from the response
        const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0])
          return Array.isArray(suggestions) ? suggestions : []
        } else {
          // Fallback: split by lines and clean up
          return geminiResponse
            .split('\n')
            .filter(line => line.trim().length > 0)
            .slice(0, 7) // Limit to 7 suggestions
        }
      } catch (parseError) {
        console.warn("Failed to parse JSON response, using fallback parsing")
        // Fallback parsing
        return geminiResponse
          .split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 7)
      }

    } catch (err: any) {
      console.error("Failed to get suggestions:", err)
      setError(err.message || "Failed to get suggestions")
      
      // Return fallback suggestions
      return [
        "[COMMUNITY] Tech Community NFT Collection - Based on your interests in blockchain technology",
        "[EVENT] Art & Design Event Series - Your collection shows appreciation for creative works",
        "[COMMUNITY] Gaming Tournament Community - Perfect for gamers and competitive spirits"
      ]
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const clearError = () => setError(null)

  const value: AIContextType = {
    generateImage,
    getSuggestions,
    isLoadingSuggestions,
    error,
    clearError,
  }

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}
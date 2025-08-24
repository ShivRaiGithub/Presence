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

  // Improved JSON extraction function
  const extractJSONFromResponse = (response: string): string[] => {
    try {
      // Remove any markdown formatting
      let cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim()
      
      // Try to find JSON array in the response
      const jsonPatterns = [
        /\[[\s\S]*?\]/,           // Standard array pattern
        /(\[[\s\S]*?\])/g,       // Multiple arrays
        /"[^"]*"(?:\s*,\s*"[^"]*")*/g  // Simple string array pattern
      ]

      for (const pattern of jsonPatterns) {
        const match = cleanResponse.match(pattern)
        if (match) {
          try {
            const parsed = JSON.parse(match[0])
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.filter(item => typeof item === 'string')
            }
          } catch (e) {
            continue
          }
        }
      }

      // If JSON parsing fails, try to extract suggestions using regex
      const suggestionLines = cleanResponse.split('\n').filter(line => 
        line.includes('[COMMUNITY]') || line.includes('[EVENT]') ||
        line.match(/^\d+\.\s*\*\*.*\*\*/) || // Numbered list with bold
        line.match(/^[-•*]\s*.*/) // Bullet points
      )

      if (suggestionLines.length > 0) {
        return suggestionLines.map(line => line.replace(/^\d+\.\s*|-\s*|•\s*|\*\s*/, '').trim())
      }

      return []
    } catch (error) {
      console.warn("Failed to extract JSON from response:", error)
      return []
    }
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
          temperature: 0.3,  // Reduced for more consistent JSON output
          topK: 20,          // Reduced for more focused responses
          topP: 0.8,         // Reduced for more consistent output
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

const getSuggestions = async (
  userNFTs: NFT[], 
  allCommunities: CreatorContract[], 
  allEvents: CreatorContract[]
): Promise<string[]> => {
  try {
    setIsLoadingSuggestions(true)
    setError(null)

    // If no communities or events available, return empty array
    if (allCommunities.length === 0 && allEvents.length === 0) {
      return []
    }

    // Identify communities/events user is already part of
    const userContractAddresses = new Set(userNFTs.map(nft => nft.contractAddress.toLowerCase()))
    const userCommunities = allCommunities.filter(c => userContractAddresses.has(c.address.toLowerCase()))
    const userEvents = allEvents.filter(e => userContractAddresses.has(e.address.toLowerCase()))
    const availableCommunities = allCommunities.filter(c => !userContractAddresses.has(c.address.toLowerCase()))
    const availableEvents = allEvents.filter(e => !userContractAddresses.has(e.address.toLowerCase()))

    // Fetch enhanced data for all inputs
    const [enhancedUserNFTs, enhancedAllCommunities, enhancedAllEvents] = await Promise.all([
      fetchEnhancedNFTData(userNFTs),
      fetchEnhancedContractData(allCommunities),
      fetchEnhancedContractData(allEvents)
    ])

    const enhancedUserCommunities = enhancedAllCommunities.filter(c => userContractAddresses.has(c.address.toLowerCase()))
    const enhancedUserEvents = enhancedAllEvents.filter(e => userContractAddresses.has(e.address.toLowerCase()))
    const enhancedAvailableCommunities = enhancedAllCommunities.filter(c => !userContractAddresses.has(c.address.toLowerCase()))
    const enhancedAvailableEvents = enhancedAllEvents.filter(e => !userContractAddresses.has(e.address.toLowerCase()))

    // Simplified prompt for better JSON consistency
    const prompt = `
You are an AI assistant that provides NFT community recommendations. You must respond with ONLY a valid JSON array of strings.

## User's NFT Collection:
${enhancedUserNFTs.map(nft => `
- NFT #${nft.tokenId}: ${nft.name} (${nft.contractType}, Level ${nft.level})
  Description: ${nft.description}
  ${nft.nftMetadata?.name ? `Metadata: ${nft.nftMetadata.name}` : ''}
`).join('')}

## Available NEW Communities/Events (user NOT member):
${[...enhancedAvailableCommunities, ...enhancedAvailableEvents].map((item, index) => `
${index + 1}. ${item.name} (${item.type})
   Description: ${item.description}
   ${item.contractMetadata?.description ? `Details: ${item.contractMetadata.description}` : ''}
`).join('')}

## User's EXISTING Communities/Events:
${[...enhancedUserCommunities, ...enhancedUserEvents].map((item, index) => `
${index + 1}. ${item.name} (${item.type}) - ALREADY MEMBER
   Description: ${item.description}
`).join('')}

INSTRUCTIONS:
1. Prioritize NEW communities/events from the "Available NEW" section
2. If no good NEW matches, suggest EXISTING communities with "already a member" note
3. Maximum 5 suggestions
4. Use EXACT names from the lists above

CRITICAL: Respond with ONLY a JSON array in this exact format:
["[TYPE] Exact_Name - reason", "[TYPE] Another_Name - reason"]

Where TYPE is either COMMUNITY or EVENT, and use the exact names from above lists.

JSON Response:`

    console.log("Sending prompt to Gemini:", prompt.substring(0, 500) + "...")
    const geminiResponse = await callGeminiAPI(prompt)
    console.log("Received Gemini response:", geminiResponse)
    
    // Parse the JSON response using improved extraction
    const suggestions = extractJSONFromResponse(geminiResponse)
    
    if (suggestions.length > 0) {
      // Verify suggestions reference actual available names
      const allAvailableNames = [
        ...enhancedAllCommunities.map(c => c.name),
        ...enhancedAllEvents.map(e => e.name)
      ]
      
      // Filter valid suggestions that reference available names
      const validSuggestions = suggestions.filter(suggestion => {
        const nameMatch = suggestion.match(/\[(?:COMMUNITY|EVENT)\]\s*([^-]+)/)
        if (nameMatch) {
          const suggestedName = nameMatch[1].trim()
          return allAvailableNames.some(availableName => 
            availableName.toLowerCase().includes(suggestedName.toLowerCase()) ||
            suggestedName.toLowerCase().includes(availableName.toLowerCase()) ||
            availableName.toLowerCase() === suggestedName.toLowerCase()
          )
        }
        // Also accept suggestions that mention known community/event names
        return allAvailableNames.some(name => 
          suggestion.toLowerCase().includes(name.toLowerCase())
        )
      })
      
      if (validSuggestions.length > 0) {
        return validSuggestions.slice(0, 5) // Limit to 5 suggestions
      }
    }
    
    // Fallback: Create suggestions from available communities/events
    console.log("Using fallback suggestions")
    const fallbackSuggestions = []
    
    // First try new communities/events
    const newOptions = [...enhancedAvailableCommunities, ...enhancedAvailableEvents]
    if (newOptions.length > 0) {
      fallbackSuggestions.push(
        ...newOptions.slice(0, 3).map(item => 
          `[${item.type.toUpperCase()}] ${item.name} - Matches your interests`
        )
      )
    }
    
    // Then add existing ones if needed
    const existingOptions = [...enhancedUserCommunities, ...enhancedUserEvents]
    if (fallbackSuggestions.length < 3 && existingOptions.length > 0) {
      fallbackSuggestions.push(
        ...existingOptions.slice(0, 3 - fallbackSuggestions.length).map(item => 
          `[${item.type.toUpperCase()}] ${item.name} - You are already a member`
        )
      )
    }
    
    return fallbackSuggestions.slice(0, 5)

  } catch (err: any) {
    console.error("Failed to get suggestions:", err)
    setError(err.message || "Failed to get suggestions")
    
    // Emergency fallback: Return user's existing communities
    if (userNFTs.length > 0) {
      const userContractAddresses = new Set(userNFTs.map(nft => nft.contractAddress.toLowerCase()))
      const userCommunities = allCommunities.filter(c => userContractAddresses.has(c.address.toLowerCase()))
      const userEvents = allEvents.filter(e => userContractAddresses.has(e.address.toLowerCase()))
      
      if (userCommunities.length > 0 || userEvents.length > 0) {
        return [...userCommunities, ...userEvents]
          .slice(0, 3)
          .map(item => `[${item.type.toUpperCase()}] ${item.name} - You are already a member`)
      }
    }
    
    return []
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
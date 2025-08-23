"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { ethers } from "ethers"
import { getContractABI, CONTRACT_ADDRESSES } from "@/lib/contracts"

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

export interface CreatorContract {
  address: string
  type: "community" | "event"
  name: string
  description: string
  metadataURI: string
  totalSupply: number
  levels: number
  contractType?: string  // From getContractDetails
  contractName?: string  // From getContractDetails
  contractDescription?: string  // From getContractDetails
  contractMetadataURI?: string // From getContractDetails
}

interface MintEligibility {
  isEligible: boolean
  hasAlreadyMinted: boolean
  level: number
  contractAddress: string
}

interface WalletContextType {
  // Wallet connection
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  
  // Contract Details
  getContractDetails: (contractAddress: string, contractType: "community" | "event") => Promise<{
    contractType: string
    name: string
    description: string
    metadataURI: string
  }>

  // User NFTs and profile
  userNFTs: NFT[]
  loadUserNFTs: () => Promise<void>
  isLoadingNFTs: boolean

  // Creator contracts
  creatorContracts: CreatorContract[]
  loadCreatorContracts: () => Promise<void>
  isLoadingContracts: boolean

  // All contracts (for home page)
  allCommunities: CreatorContract[]
  allEvents: CreatorContract[]
  loadAllContracts: () => Promise<void>

  // Contract deployment
  deployCommunity: (
    name: string,
    symbol: string,
    communityName: string,
    description: string,
    metadataURI: string,
  ) => Promise<string>
  deployEvent: (
    name: string,
    symbol: string,
    eventName: string,
    description: string,
    metadataURI: string,
  ) => Promise<string>

  // Minting functionality
  checkMintEligibility: (contractAddress: string, level: number) => Promise<MintEligibility>
  mintNFT: (contractAddress: string, level: number) => Promise<string>

  // Contract management (for creators)
  addLevel: (contractAddress: string, metadataURI: string) => Promise<void>
  addToAllowlist: (contractAddress: string, users: string[], level: number) => Promise<void>
  removeFromAllowlist: (contractAddress: string, users: string[], level: number) => Promise<void>

  // Contract addresses (to be set by user)
  presenceEventFactoryAddress: string
  presenceCommunityFactoryAddress: string

  // AI features (placeholders)
  generateImage: (prompt: string) => Promise<string>
  getSuggestions: (userNFTs: NFT[]) => Promise<string[]>

  // Error handling
  error: string | null
  clearError: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])
  const [creatorContracts, setCreatorContracts] = useState<CreatorContract[]>([])
  const [allCommunities, setAllCommunities] = useState<CreatorContract[]>([])
  const [allEvents, setAllEvents] = useState<CreatorContract[]>([])
  const presenceEventFactoryAddress = CONTRACT_ADDRESSES.presenceEventFactory
  const presenceCommunityFactoryAddress = CONTRACT_ADDRESSES.presenceCommunityFactory
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [isLoadingContracts, setIsLoadingContracts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setIsConnecting(true)
        setError(null)

        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()

        setProvider(provider)
        setSigner(signer)
        setAccount(accounts[0])
        setIsConnected(true)

        // Store connection in localStorage
        localStorage.setItem("walletConnected", "true")
      } catch (error: any) {
        console.error("Failed to connect wallet:", error)
        setError(error.message || "Failed to connect wallet")
      } finally {
        setIsConnecting(false)
      }
    } else {
      setError("Please install MetaMask or another Web3 wallet")
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)
    setUserNFTs([])
    setCreatorContracts([])
    setAllCommunities([])
    setAllEvents([])
    setError(null)
    localStorage.removeItem("walletConnected")
  }

  // Factory contract helpers
  const getCommunityFactoryContract = () => {
    if (!signer || !presenceCommunityFactoryAddress) {
      throw new Error("Wallet not connected or community factory not configured")
    }
    return new ethers.Contract(
      presenceCommunityFactoryAddress,
      getContractABI("communityFactory"),
      signer
    )
  }

  const getEventFactoryContract = () => {
    if (!signer || !presenceEventFactoryAddress) {
      throw new Error("Wallet not connected or event factory not configured")
    }
    return new ethers.Contract(
      presenceEventFactoryAddress,
      getContractABI("eventFactory"),
      signer
    )
  }

  // Helper to get contract instance for communities/events
  const getContract = (address: string, contractType: "community" | "event") => {
    if (!signer) {
      throw new Error("Wallet not connected")
    }
    return new ethers.Contract(address, getContractABI(contractType), signer)
  }

const loadUserNFTs = useCallback(async () => {
  if (!account || !signer) return;

  try {
    setIsLoadingNFTs(true);
    setError(null);

    const userNFTs: NFT[] = [];

    // Helper function to convert IPFS hash to gateway URL
    const getIPFSUrl = (uri: string): string => {
      if (uri.startsWith('ipfs://')) {
        return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      } else if (uri.startsWith('bafkrei') || uri.startsWith('Qm')) {
        // Direct IPFS hash
        return `https://ipfs.io/ipfs/${uri}`;
      }
      return uri; // Already a full URL
    };

    // Helper function to fetch metadata and extract image URL
    const fetchImageUrl = async (tokenURI: string): Promise<string> => {
      try {
        const metadataUrl = getIPFSUrl(tokenURI);
        const response = await fetch(metadataUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        const metadata = await response.json();
        
        // Handle IPFS image URLs as well
        const imageUrl = metadata.image ? getIPFSUrl(metadata.image) : '/placeholder-nft.png';
        return imageUrl;
      } catch (error) {
        console.warn(`Failed to fetch metadata from ${tokenURI}:`, error);
        return '/placeholder-nft.png';
      }
    };

    // --- Load NFTs from all community contracts ---
    for (const community of allCommunities) {
      try {
        const contract = getContract(community.address, "community");

        // 🔹 Get all tokenIds owned by user (custom getter)
        const tokenIds: bigint[] = await contract.getUserLevelsMinted(account);

        for (const tokenId of tokenIds) {
          const level = await contract.getTokenLevel(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const imageUrl = await fetchImageUrl(tokenURI);

          userNFTs.push({
            tokenId: tokenId.toString(),
            level: level.toString(),
            contractAddress: community.address,
            contractType: "community",
            name: community.name,
            description: community.description,
            metadataURI: tokenURI,
            imageUrl: imageUrl,
          });
        }
      } catch (err) {
        console.warn(`Failed to load NFTs from community ${community.address}:`, err);
      }
    }

    // --- Load NFTs from all event contracts ---
    for (const event of allEvents) {
      try {
        const contract = getContract(event.address, "event");

        // 🔹 Same custom getter for event NFTs
        const tokenIds: bigint[] = await contract.getUserLevelsMinted(account);

        for (const tokenId of tokenIds) {
          const level = await contract.getTokenLevel(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const imageUrl = await fetchImageUrl(tokenURI);

          userNFTs.push({
            tokenId: tokenId.toString(),
            level: level.toString(),
            contractAddress: event.address,
            contractType: "event",
            name: event.name,
            description: event.description,
            metadataURI: tokenURI,
            imageUrl: imageUrl,
          });
        }
      } catch (err) {
        console.warn(`Failed to load NFTs from event ${event.address}:`, err);
      }
    }

    setUserNFTs(userNFTs);
  } catch (err) {
    console.error("Failed to load user NFTs:", err);
    setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setIsLoadingNFTs(false);
  }
}, [account, signer, allCommunities, allEvents]);

  // Load all contracts (for home page)
const loadAllContracts = async () => {
  if (!provider) return

  try {
    setError(null)

    const communities: CreatorContract[] = []
    const events: CreatorContract[] = []

    // Load all community contracts
    try {
      const communityFactory = new ethers.Contract(
        presenceCommunityFactoryAddress,
        getContractABI("communityFactory"),
        provider
      )

      const addresses: string[] = await communityFactory.getAllCommunityContracts()

      for (const contractAddress of addresses) {
        try {
          const contract = new ethers.Contract(contractAddress, getContractABI("community"), provider)
          const name = await contract.name()
          const totalSupply = await contract.totalSupply()
          const levels = await contract.levelCount();

          communities.push({
            address: contractAddress,
            type: "community",
            name,
            description: "Community contract",
            metadataURI: "",
            totalSupply: totalSupply.toString(),
            levels: levels
          })
        } catch (error) {
          console.warn(`Failed to load community contract ${contractAddress}:`, error)
        }
      }
    } catch (error) {
      console.warn("Failed to load all community contracts:", error)
    }

    // Load all event contracts
    try {
      const eventFactory = new ethers.Contract(
        presenceEventFactoryAddress,
        getContractABI("eventFactory"),
        provider
      )

      const addresses: string[] = await eventFactory.getAllEventContracts()

      for (const contractAddress of addresses) {
        try {
          const contract = new ethers.Contract(contractAddress, getContractABI("event"), provider)
          const name = await contract.name()
          const totalSupply = await contract.totalSupply()
          const levels = await contract.levelCount();

          events.push({
            address: contractAddress,
            type: "event",
            name,
            description: "Event contract",
            metadataURI: "",
            totalSupply: totalSupply.toString(),
            levels: levels,
          })
        } catch (error) {
          console.warn(`Failed to load event contract ${contractAddress}:`, error)
        }
      }
    } catch (error) {
      console.warn("Failed to load all event contracts:", error)
    }

    setAllCommunities(communities)
    setAllEvents(events)
  } catch (error: any) {
    console.error("Failed to load all contracts:", error)
    setError(error.message || "Failed to load contracts")
  }
}

const loadCreatorContracts = useCallback(async () => {
  if (!account || !signer) return

  try {
    setIsLoadingContracts(true)
    setError(null)

    const contracts: CreatorContract[] = []

    // --- Load Community Contracts ---
    try {
      const communityFactory = getCommunityFactoryContract()
      const addresses: string[] = await communityFactory.getAllCommunityContracts()

      for (const contractAddress of addresses) {
        try {
          const contract = getContract(contractAddress, "community")
          const owner = await contract.owner()

          if (owner.toLowerCase() === account.toLowerCase()) {
            const name = await contract.name()
            const totalSupply = await contract.totalSupply()
            const levels = await contract.levelCount();


            contracts.push({
              address: contractAddress,
              type: "community",
              name,
              description: "Community contract",
              metadataURI: "",
              totalSupply: totalSupply.toString(),
              levels: levels
            })
          }
        } catch (err) {
          console.warn(`Failed to load community contract ${contractAddress}:`, err)
        }
      }
    } catch (err) {
      console.warn("Failed to load community contracts:", err)
    }

    // --- Load Event Contracts ---
    try {
      const eventFactory = getEventFactoryContract()
      const addresses: string[] = await eventFactory.getAllEventContracts()

      for (const contractAddress of addresses) {
        try {
          const contract = getContract(contractAddress, "event")
          const owner = await contract.owner()

          if (owner.toLowerCase() === account.toLowerCase()) {
            const name = await contract.name()
            const totalSupply = await contract.totalSupply()
            const levels = await contract.levelCount();


            contracts.push({
              address: contractAddress,
              type: "event",
              name,
              description: "Event contract",
              metadataURI: "",
              totalSupply: totalSupply.toString(),
              levels: levels
            })
          }
        } catch (err) {
          console.warn(`Failed to load event contract ${contractAddress}:`, err)
        }
      }
    } catch (err) {
      console.warn("Failed to load event contracts:", err)
    }

    setCreatorContracts(contracts)
  } catch (err) {
    console.error("Failed to load creator contracts:", err)
    setError(err instanceof Error ? err.message : "Unknown error")
  } finally {
    setIsLoadingContracts(false)
  }
}, [account, signer])


  const deployCommunity = async (
    name: string,
    symbol: string,
    communityName: string,
    description: string,
    metadataURI: string,
  ): Promise<string> => {
    try {
      setError(null)
      const factory = getCommunityFactoryContract()

      // Call the deploy function on the factory contract
      const tx = await factory.deployCommunity(name, symbol, communityName, description, metadataURI)
      const receipt = await tx.wait()

      // Find the CommunityDeployed event to get the new contract address
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === factory.interface.getEvent("CommunityDeployed").topicHash
      )

      if (event) {
        const parsedEvent = factory.interface.parseLog(event)
        return parsedEvent.args.contractAddress
      }

      throw new Error("Failed to get deployed contract address")
    } catch (error: any) {
      console.error("Failed to deploy community:", error)
      setError(error.message || "Failed to deploy community")
      throw error
    }
  }

  const deployEvent = async (
    name: string,
    symbol: string,
    eventName: string,
    description: string,
    metadataURI: string,
  ): Promise<string> => {
    try {
      setError(null)
      const factory = getEventFactoryContract()

      const tx = await factory.deployEvent(name, symbol, eventName, description, metadataURI)
      const receipt = await tx.wait()

      // Find the EventDeployed event to get the new contract address
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === factory.interface.getEvent("EventDeployed").topicHash
      )

      if (event) {
        const parsedEvent = factory.interface.parseLog(event)
        return parsedEvent.args.contractAddress
      }

      throw new Error("Failed to get deployed contract address")
    } catch (error: any) {
      console.error("Failed to deploy event:", error)
      setError(error.message || "Failed to deploy event")
      throw error
    }
  }

  const checkMintEligibility = async (contractAddress: string, level: number): Promise<MintEligibility> => {
    try {
      setError(null)

      if (!account) {
        throw new Error("Wallet not connected")
      }

      // Determine contract type based on which array it's in
      const contractType = allCommunities.some(c => c.address === contractAddress) ? "community" : "event"
      const contract = getContract(contractAddress, contractType)

      // Check if user is eligible for this level
      const isEligible = await contract.isEligible(account, level)
      
      // Check if user has already minted this level
      const hasAlreadyMinted = await contract.hasUserMinted(account, level)

      return {
        isEligible,
        hasAlreadyMinted,
        level,
        contractAddress,
      }
    } catch (error: any) {
      console.error("Failed to check mint eligibility:", error)
      setError(error.message || "Failed to check eligibility")
      throw error
    }
  }

  const mintNFT = async (contractAddress: string, level: number): Promise<string> => {
    try {
      setError(null)
      if (!account) {
        throw new Error("Wallet not connected")
      }

      // Determine contract type
      const contractType = allCommunities.some(c => c.address === contractAddress) ? "community" : "event"
      const contract = getContract(contractAddress, contractType)

      // Mint the NFT
      const tx = await contract.mint(level)
      const receipt = await tx.wait()

      return receipt.hash
    } catch (error: any) {
      console.error("Failed to mint NFT:", error)
      setError(error.message || "Failed to mint NFT")
      throw error
    }
  }

  const addLevel = async (contractAddress: string, metadataURI: string): Promise<void> => {
    try {
      setError(null)

      // Determine contract type
      const contractType = creatorContracts.find(c => c.address === contractAddress)?.type
      if (!contractType) {
        throw new Error("Contract not found in creator contracts")
      }

      const contract = getContract(contractAddress, contractType)
      const tx = await contract.addLevel(metadataURI)
      await tx.wait()
    } catch (error: any) {
      console.error("Failed to add level:", error)
      setError(error.message || "Failed to add level")
      throw error
    }
  }

  const addToAllowlist = async (contractAddress: string, users: string[], level: number): Promise<void> => {
    try {
      setError(null)

      const contractType = creatorContracts.find(c => c.address === contractAddress)?.type
      if (!contractType) {
        throw new Error("Contract not found in creator contracts")
      }

      const contract = getContract(contractAddress, contractType)
      const tx = await contract.addToAllowlist(users, level)
      await tx.wait()
    } catch (error: any) {
      console.error("Failed to add to allowlist:", error)
      setError(error.message || "Failed to add to allowlist")
      throw error
    }
  }

  const removeFromAllowlist = async (contractAddress: string, users: string[], level: number): Promise<void> => {
    try {
      setError(null)

      const contractType = creatorContracts.find(c => c.address === contractAddress)?.type
      if (!contractType) {
        throw new Error("Contract not found in creator contracts")
      }

      const contract = getContract(contractAddress, contractType)
      const tx = await contract.removeFromAllowlist(users, level)
      await tx.wait()
    } catch (error: any) {
      console.error("Failed to remove from allowlist:", error)
      setError(error.message || "Failed to remove from allowlist")
      throw error
    }
  }

  const getContractDetails = async (contractAddress: string, contractType: "community" | "event") => {
    try {
      setError(null)
      const contract = getContract(contractAddress, contractType)
      const [type, name, description, metadataURI] = await contract.getContractDetails()
      return {
        contractType: type,
        name,
        description,
        metadataURI,
      }
    } catch (error: any) {
      console.error("Failed to get contract details:", error)
      setError(error.message || "Failed to get contract details")
      throw error
    }
  }

  // AI placeholder functions
  const generateImage = async (prompt: string): Promise<string> => {
    // TODO: Replace with actual AI image generation API
    console.log("Generating image for prompt:", prompt)
    return "/placeholder.svg?height=400&width=400&query=" + encodeURIComponent(prompt)
  }

  const getSuggestions = async (userNFTs: NFT[]): Promise<string[]> => {
    // TODO: Replace with actual Gemini API call
    console.log("Getting suggestions based on NFTs:", userNFTs)
    return ["Tech Community NFT Collection", "Art & Design Event Series", "Gaming Tournament Badge"]
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [])

  // Auto-connect on page load if previously connected
  useEffect(() => {
    if (typeof window !== "undefined") {
      const wasConnected = localStorage.getItem("walletConnected")
      if (wasConnected === "true" && window.ethereum) {
        connectWallet()
      }
    }
  }, [])

  // Load contracts when provider is available
  useEffect(() => {
    if (provider) {
      loadAllContracts()
    }
  }, [provider])


  // Load user-specific data when account changes
useEffect(() => {
  if (!account) return

  const loadData = async () => {
    
        await loadUserNFTs()
        await loadCreatorContracts()
   
  }

  loadData()
}, [account])



  const value: WalletContextType = {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    userNFTs,
    loadUserNFTs,
    isLoadingNFTs,
    creatorContracts,
    loadCreatorContracts,
    isLoadingContracts,
    allCommunities,
    allEvents,
    loadAllContracts,
    deployCommunity,
    deployEvent,
    checkMintEligibility,
    mintNFT,
    addLevel,
    addToAllowlist,
    removeFromAllowlist,
    presenceEventFactoryAddress,
    presenceCommunityFactoryAddress,
    generateImage,
    getSuggestions,
    error,
    clearError,
    getContractDetails,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
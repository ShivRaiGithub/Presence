"use client"

import { useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Navbar } from "@/components/navbar"
import { WalletStatus } from "@/components/wallet-status"
import { ProfileHeader } from "@/components/profile-header"
import { NFTCollection } from "@/components/nft-collection"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export default function ProfilePage() {
  const { isConnected, connectWallet, loadUserNFTs, presenceEventFactoryAddress, presenceCommunityFactoryAddress } = useWallet()

  useEffect(() => {
    if (isConnected && (presenceEventFactoryAddress || presenceCommunityFactoryAddress)) {
      loadUserNFTs()
    }
  }, [isConnected, presenceEventFactoryAddress,presenceCommunityFactoryAddress, loadUserNFTs])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <WalletStatus />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect your wallet to view your NFT collection and manage your presence tokens.
              </p>
            </div>
            <Button
              size="lg"
              onClick={connectWallet}
              className="ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Wallet className="h-5 w-5 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WalletStatus />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader />
        <NFTCollection />
      </div>
    </div>
  )
}

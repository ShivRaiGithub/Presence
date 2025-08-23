"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"
import { Navbar } from "@/components/navbar"
import { WalletStatus } from "@/components/wallet-status"
import { MintingInterface } from "@/components/minting-interface"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export default function MintPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, connectWallet } = useWallet()
  const [contractAddress, setContractAddress] = useState<string>("")
  const [level, setLevel] = useState<number>(0)

  useEffect(() => {
    if (params.address && params.level) {
      setContractAddress(params.address as string)
      setLevel(Number.parseInt(params.level as string))
    }
  }, [params])

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
                Connect your wallet to mint your NFT and join this community or event.
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

  if (!contractAddress || !level) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Invalid Mint URL</h1>
            <p className="text-muted-foreground mt-2">Please check the contract address and level.</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Go Home
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MintingInterface contractAddress={contractAddress} level={level} />
      </div>
    </div>
  )
}

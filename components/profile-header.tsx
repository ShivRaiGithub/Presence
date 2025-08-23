"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent } from "@/components/ui/card"
import { User, Trophy, Users, Calendar } from "lucide-react"

export function ProfileHeader() {
  const { account, userNFTs } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const communityNFTs = userNFTs.filter((nft) => nft.contractType === "community")
  const eventNFTs = userNFTs.filter((nft) => nft.contractType === "event")

  return (
    <div className="space-y-6 mb-8">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <User className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">{account && formatAddress(account)}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{userNFTs.length}</div>
            <div className="text-sm text-muted-foreground">Total NFTs</div>
          </CardContent>
        </Card>

        <Card className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">{communityNFTs.length}</div>
            <div className="text-sm text-muted-foreground">Communities</div>
          </CardContent>
        </Card>

        <Card className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{eventNFTs.length}</div>
            <div className="text-sm text-muted-foreground">Events</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

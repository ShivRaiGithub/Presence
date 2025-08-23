"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent } from "@/components/ui/card"
import { Palette, Calendar, Users, Zap } from "lucide-react"

export function CreatorHeader() {
  const { account, creatorContracts } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const communityContracts = creatorContracts.filter((contract) => contract.type === "community")
  const eventContracts = creatorContracts.filter((contract) => contract.type === "event")
  const totalMembers = creatorContracts.reduce((sum, contract) => sum + contract.totalSupply, 0)

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <Palette className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Creator's Corner</h1>
          <p className="text-muted-foreground">{account && formatAddress(account)}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{creatorContracts.length}</div>
            <div className="text-sm text-muted-foreground">Total Contracts</div>
          </CardContent>
        </Card>

        <Card className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">{communityContracts.length}</div>
            <div className="text-sm text-muted-foreground">Communities</div>
          </CardContent>
        </Card>

        <Card className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{eventContracts.length}</div>
            <div className="text-sm text-muted-foreground">Events</div>
          </CardContent>
        </Card>

        <Card className="ripple-effect hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">{totalMembers}</div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

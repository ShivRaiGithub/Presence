"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { useAI } from "@/contexts/ai-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { User, Trophy, Users, Calendar, Sparkles, Lightbulb, Loader2 } from "lucide-react"

export function ProfileHeader() {
  const { account, userNFTs, allCommunities, allEvents } = useWallet()
  const { getSuggestions } = useAI()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const communityNFTs = userNFTs.filter((nft) => nft.contractType === "community")
  const eventNFTs = userNFTs.filter((nft) => nft.contractType === "event")

  const handleGetSuggestions = async () => {
    try {
      setIsGeneratingSuggestions(true)
      
      // If user has no NFTs, show some available contracts instead of calling API
      if (userNFTs.length === 0) {
        const fallbackSuggestions = []
        
        // Add a few community suggestions
        if (allCommunities.length > 0) {
          allCommunities.slice(0, 3).forEach(community => {
            fallbackSuggestions.push(`[COMMUNITY] ${community.name} - ${community.description}`)
          })
        }
        
        // Add a few event suggestions
        if (allEvents.length > 0) {
          allEvents.slice(0, 3).forEach(event => {
            fallbackSuggestions.push(`[EVENT] ${event.name} - ${event.description}`)
          })
        }
        
        // If no contracts available, show generic message
        if (fallbackSuggestions.length === 0) {
          fallbackSuggestions.push("No communities or events available at the moment. Check back later!")
        }
        
        setSuggestions(fallbackSuggestions)
      } else {
        // User has NFTs, call the AI API for personalized suggestions
        const newSuggestions = await getSuggestions(userNFTs, allCommunities, allEvents)
        setSuggestions(newSuggestions)
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

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

      {/* AI Suggestions Section */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">
                {/* {userNFTs.length === 0 ? "Communities & Events" : "AI Suggestions"} */}
                AI Suggestions
              </h3>
              <p className="text-sm text-muted-foreground">
                {/* {userNFTs.length === 0 
                  ? "Discover communities and events you can join" 
                  : "Get personalized suggestions based on your Presence"} */}
                  Get personalized suggestions based on your Presence
              </p>
            </div>
          </div>

          <Button
            onClick={handleGetSuggestions}
            disabled={isGeneratingSuggestions}
            className="w-full ripple-effect bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
          >
            {isGeneratingSuggestions ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {/* {userNFTs.length === 0 ? "Browse Available Options" : "Get Suggestions"} */}
                Get Suggestions
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label>
                {userNFTs.length === 0 ? "Available Options" : "Suggested Ideas"}
              </Label>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Badge key={index} variant="outline" className="block w-full text-left p-3 h-auto whitespace-normal">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
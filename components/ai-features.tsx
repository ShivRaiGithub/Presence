"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ImageIcon, Lightbulb, Loader2 } from "lucide-react"

export function AIFeatures() {
  const { generateImage, getSuggestions, userNFTs } = useWallet()
  const [imagePrompt, setImagePrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return

    try {
      setIsGeneratingImage(true)
      const imageUrl = await generateImage(imagePrompt)
      setGeneratedImage(imageUrl)
    } catch (error) {
      console.error("Failed to generate image:", error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleGetSuggestions = async () => {
    try {
      setIsGeneratingSuggestions(true)
      const newSuggestions = await getSuggestions(userNFTs)
      setSuggestions(newSuggestions)
    } catch (error) {
      console.error("Failed to get suggestions:", error)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Image Generation */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <span>AI Image Generator</span>
          </CardTitle>
          <CardDescription>Generate custom images for your communities and events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-prompt">Image Prompt</Label>
            <Textarea
              id="image-prompt"
              placeholder="Describe the image you want to generate..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerateImage}
            disabled={!imagePrompt.trim() || isGeneratingImage}
            className="w-full ripple-effect bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            {isGeneratingImage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {generatedImage && (
            <div className="space-y-2">
              <Label>Generated Image</Label>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </div>
              <Input value={generatedImage} readOnly className="text-xs" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-accent" />
            </div>
            <span>AI Suggestions</span>
          </CardTitle>
          <CardDescription>Get personalized suggestions based on your NFT collection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                Get Suggestions
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Suggested Ideas</Label>
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

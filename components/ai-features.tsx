"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, ImageIcon, Loader2, Download } from "lucide-react"
import { useAI } from "@/contexts/ai-context"
import Image from "next/image"
export function AIFeatures() {
  const { generateImage } = useAI()
  const [imagePrompt, setImagePrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

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

const handleDownload = () => {
  if (!generatedImage) return
  window.open(generatedImage, "_blank")
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
            <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
              <Image
                src={generatedImage || "/placeholder.svg"}
                alt="Generated"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                priority
              />
            </div>
            <Input value={generatedImage} readOnly className="text-xs" />
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="mt-2 w-full ripple-effect"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  )
}

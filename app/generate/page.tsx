"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Loader2, Home, Grid3x3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to generate image. Please try again.")
        return
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl)
      } else {
        throw new Error("No image URL returned")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      alert("Failed to generate image. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedImage) return

    setIsSaving(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: generatedImage,
          prompt,
        }),
      })

      if (response.ok) {
        alert("Image saved to feed!")
        setPrompt("")
        setGeneratedImage(null)
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("[v0] Error saving post:", error)
      alert("Failed to save image. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-6 h-6" />
            Generative Instagram
          </Link>

          <nav className="flex gap-2 items-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="ghost" size="sm">
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Create AI Art</h1>
          <p className="text-muted-foreground">Describe what you want to see and let AI bring it to life</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Prompt</label>
              <Textarea
                placeholder="A serene landscape with mountains at sunset, vibrant colors, digital art style..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </Card>

        {generatedImage && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <Image src={generatedImage || "/placeholder.svg"} alt={prompt} fill className="object-cover" />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save to Feed"
                  )}
                </Button>
                <Button onClick={handleGenerate} variant="outline" disabled={isGenerating}>
                  Regenerate
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

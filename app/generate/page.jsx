"use client"

import { useState } from "react"
// import { useSession, signOut } from "next-auth/react"
// import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Loader2, Home, Grid3x3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function GeneratePage() {
  // Authentication is optional - uncomment if needed
  // const { data: session, status } = useSession()
  // const router = useRouter()
  
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState(null)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedImage(null)
    setGeneratedPrompt("")
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || "Failed to generate image. Please try again."
        setError(errorMsg)
        return
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl)
        setGeneratedPrompt(data.prompt || prompt)
      } else {
        throw new Error("No image URL returned")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      setError(`Network error: ${error.message || "Failed to connect to the server. Please check your connection and try again."}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePublish = async () => {
    if (!generatedImage) return

    setIsPublishing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: generatedImage,
          prompt: generatedPrompt || prompt,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Image published successfully!")
        setPrompt("")
        setGeneratedImage(null)
        setGeneratedPrompt("")
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorMsg = data.error || "Failed to publish image. Please try again."
        setError(errorMsg)
      }
    } catch (error) {
      console.error("Error publishing image:", error)
      setError(`Network error: ${error.message || "Failed to publish image. Please try again."}`)
    } finally {
      setIsPublishing(false)
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
            {/* Auth button - uncomment if using authentication */}
            {/* <Button 
              variant="ghost" 
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4" />
            </Button> */}
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

        {error && (
          <Card className="p-4 mb-6 border-red-500 bg-red-50 dark:bg-red-950">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="p-4 mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
          </Card>
        )}

        {generatedImage && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <Image src={generatedImage || "/placeholder.svg"} alt={generatedPrompt || prompt} fill className="object-cover" />
              </div>

              {generatedPrompt && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Prompt used:</p>
                  <p>{generatedPrompt}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handlePublish} disabled={isPublishing} className="flex-1 gap-2">
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish"
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
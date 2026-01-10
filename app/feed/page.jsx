"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Home, Loader2, Heart } from "lucide-react"

export default function FeedPage() {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)
  const [updatingHearts, setUpdatingHearts] = useState(new Set())

  useEffect(() => {
    fetchFeed()
  }, [page])

  const fetchFeed = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/feed?page=${page}&limit=10`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch feed")
      }

      setImages(data.images || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching feed:", error)
      setError(error.message || "Failed to load feed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleHeartClick = async (imageId, currentHearts) => {
    // Optimistic update
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === imageId ? { ...img, hearts: currentHearts + 1 } : img
      )
    )

    setUpdatingHearts((prev) => new Set(prev).add(imageId))

    try {
      const response = await fetch("/api/feed", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: imageId,
          hearts: currentHearts + 1,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Revert optimistic update on error
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === imageId ? { ...img, hearts: currentHearts } : img
          )
        )
        throw new Error(data.error || "Failed to update hearts")
      }

      // Update with actual response
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === imageId ? data : img
        )
      )
    } catch (error) {
      console.error("Error updating hearts:", error)
      alert(error.message || "Failed to update hearts. Please try again.")
    } finally {
      setUpdatingHearts((prev) => {
        const next = new Set(prev)
        next.delete(imageId)
        return next
      })
    }
  }

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
            <Link href="/generate">
              <Button size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Create
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Community Feed</h1>
          <p className="text-muted-foreground">Explore AI-generated art from the community</p>
        </div>

        {error && (
          <Card className="p-4 mb-6 border-red-500 bg-red-50 dark:bg-red-950">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <Button
              onClick={fetchFeed}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </Card>
        )}

        {isLoading && images.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : images.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No images yet. Be the first to create something!</p>
            <Link href="/generate">
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Your First Image
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={image.prompt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleHeartClick(image.id, image.hearts)}
                        disabled={updatingHearts.has(image.id)}
                        className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            updatingHearts.has(image.id)
                              ? "animate-pulse"
                              : ""
                          }`}
                          fill={image.hearts > 0 ? "currentColor" : "none"}
                        />
                        <span>{image.hearts}</span>
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total images)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevPage}
                  disabled={page === 1 || isLoading}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleLoadMore}
                  disabled={page >= totalPages || isLoading}
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : page < totalPages ? (
                    "Next"
                  ) : (
                    "End"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

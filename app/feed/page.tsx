"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Home, Loader2 } from "lucide-react"

interface Post {
  id: number
  image_url: string
  prompt: string
  created_at: string
  user_id: string | null
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("[v0] Error fetching posts:", error)
    } finally {
      setIsLoading(false)
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet. Be the first to create something!</p>
            <Link href="/generate">
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Your First Image
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative aspect-square bg-muted">
                  <Image src={post.image_url || "/placeholder.svg"} alt={post.prompt} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.prompt}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal for selected post */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={selectedPost.image_url || "/placeholder.svg"}
                    alt={selectedPost.prompt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">AI Creator</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedPost.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Prompt</h3>
                    <p className="text-sm text-muted-foreground">{selectedPost.prompt}</p>
                  </div>

                  <Button variant="outline" onClick={() => setSelectedPost(null)} className="mt-4">
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

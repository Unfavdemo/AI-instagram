import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Grid3x3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-5xl font-bold mb-4 text-balance">Generative Instagram</h1>

        <p className="text-xl text-muted-foreground mb-12 text-pretty">
          Create stunning AI-generated images and share them with the community
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/generate">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Image
            </Button>
          </Link>

          <Link href="/feed">
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-transparent">
              <Grid3x3 className="w-5 h-5" />
              Explore Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useUser } from "@stackframe/stack"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/generate")
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Sparkles className="w-7 h-7" />
            Generative Instagram
          </Link>
          <p className="text-muted-foreground text-sm">Sign in to create and share AI art</p>
        </div>

        <div id="stack-auth-container" className="min-h-[400px]">
          {/* Stack Auth UI will be rendered here */}
        </div>
      </Card>
    </div>
  )
}

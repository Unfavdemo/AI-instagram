import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json()

    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: "Image URL and prompt are required" }, { status: 400 })
    }

    await sql`
      INSERT INTO posts (image_url, prompt)
      VALUES (${imageUrl}, ${prompt})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving post:", error)
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const posts = await sql`
      SELECT 
        id,
        image_url,
        prompt,
        created_at,
        user_id
      FROM posts
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("[v0] Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

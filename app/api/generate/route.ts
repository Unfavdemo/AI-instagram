import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: error.error?.message || "Failed to generate image with OpenAI" },
        { status: response.status },
      )
    }

    const data = await response.json()
    const imageUrl = data.data[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error in generate API:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}

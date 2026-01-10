import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { imageUrl, prompt } = body

    // Validation: Check if imageUrl exists
    if (imageUrl === undefined || imageUrl === null) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
    }

    // Validation: Check if prompt exists
    if (prompt === undefined || prompt === null) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    }

    // Validation: Check if imageUrl is a string
    if (typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl must be a string" }, { status: 400 })
    }

    // Validation: Check if prompt is a string
    if (typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt must be a string" }, { status: 400 })
    }

    // Validation: Check if imageUrl is not empty
    if (imageUrl.trim() === "") {
      return NextResponse.json({ error: "imageUrl cannot be empty" }, { status: 400 })
    }

    // Note: Empty prompt is allowed (edge case per requirements)

    try {
      const publishedImage = await prisma.publishedImage.create({
        data: {
          imageUrl: imageUrl.trim(),
          prompt: prompt.trim(),
          // hearts defaults to 0 via schema
          // createdAt defaults to now() via schema
        },
      })

      return NextResponse.json(publishedImage, { status: 201 })
    } catch (error) {
      console.error("Database error in publish API:", error)
      return NextResponse.json(
        { error: "Failed to publish image" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in publish API:", error)
    return NextResponse.json(
      { error: "Failed to publish image" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    // Handle Request object - Next.js provides request.url as a string
    const url = new URL(request.url)
    const { searchParams } = url
    
    // Parse query parameters with defaults
    let page = parseInt(searchParams.get("page") || "1", 10)
    let limit = parseInt(searchParams.get("limit") || "10", 10)

    // Validation: Check if page is valid (must be positive integer)
    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: "Invalid page parameter" }, { status: 400 })
    }

    // Validation: Check if limit is valid (must be positive integer)
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ error: "Invalid limit parameter" }, { status: 400 })
    }

    // Cap limit at 50
    if (limit > 50) {
      limit = 50
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    try {
      // Fetch images with pagination, ordered by createdAt descending (newest first)
      const images = await prisma.publishedImage.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      })

      // Get total count for pagination metadata
      const total = await prisma.publishedImage.count()

      // Calculate total pages
      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        images,
        total,
        page,
        totalPages,
      })
    } catch (error) {
      console.error("Database error in feed GET API:", error)
      return NextResponse.json(
        { error: "Failed to fetch feed" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in feed GET API:", error)
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 },
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, hearts } = body

    // Validation: Check if id exists
    if (id === undefined || id === null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    // Validation: Check if hearts exists
    if (hearts === undefined || hearts === null) {
      return NextResponse.json({ error: "hearts is required" }, { status: 400 })
    }

    // Validation: Check if id is a number
    if (typeof id !== "number" || isNaN(id)) {
      return NextResponse.json({ error: "id must be a number" }, { status: 400 })
    }

    // Validation: Check if hearts is a number
    if (typeof hearts !== "number" || isNaN(hearts)) {
      return NextResponse.json({ error: "hearts must be a number" }, { status: 400 })
    }

    // Validation: Check if hearts is non-negative
    if (hearts < 0) {
      return NextResponse.json({ error: "hearts must be non-negative" }, { status: 400 })
    }

    try {
      // Check if image exists first
      const existingImage = await prisma.publishedImage.findUnique({
        where: { id },
      })

      if (!existingImage) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 })
      }

      // Update with atomic operation
      const updatedImage = await prisma.publishedImage.update({
        where: { id },
        data: { hearts },
      })

      return NextResponse.json(updatedImage)
    } catch (error) {
      // Handle Prisma errors (including not found)
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Image not found" }, { status: 404 })
      }

      console.error("Database error in feed PUT API:", error)
      return NextResponse.json(
        { error: "Failed to update hearts" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in feed PUT API:", error)
    return NextResponse.json(
      { error: "Failed to update hearts" },
      { status: 500 },
    )
  }
}

import { describe, it, expect, beforeEach, vi } from "vitest"
import { PUT } from "../app/api/feed/route.js"
import prisma from "../lib/prisma.js"

// Mock Prisma
vi.mock("../lib/prisma.js", () => {
  const mockPrisma = {
    publishedImage: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  }
  return {
    default: mockPrisma,
  }
})

describe("API: PUT /api/feed", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body) => ({
    json: async () => body,
    headers: {
      get: () => "application/json",
    },
  })

  it("Test FP.1: Update hearts with valid data returns 200", async () => {
    const existingImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 5,
      createdAt: new Date(),
    }

    const updatedImage = {
      ...existingImage,
      hearts: 10,
    }

    prisma.publishedImage.findUnique.mockResolvedValueOnce(existingImage)
    prisma.publishedImage.update.mockResolvedValueOnce(updatedImage)

    const request = createRequest({
      id: 1,
      hearts: 10,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hearts).toBe(10)
  })

  it("Test FP.2: Missing id returns 400", async () => {
    const request = createRequest({
      hearts: 10,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("id is required")
  })

  it("Test FP.3: Missing hearts returns 400", async () => {
    const request = createRequest({
      id: 1,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("hearts is required")
  })

  it("Test FP.4: Non-existent id returns 404", async () => {
    prisma.publishedImage.findUnique.mockResolvedValueOnce(null)

    const request = createRequest({
      id: 999,
      hearts: 5,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe("Image not found")
  })

  it("Test FP.5: Non-number id returns 400", async () => {
    const request = createRequest({
      id: "not-a-number",
      hearts: 5,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("id must be a number")
  })

  it("Test FP.6: Non-number hearts returns 400", async () => {
    const request = createRequest({
      id: 1,
      hearts: "not-a-number",
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("hearts must be a number")
  })

  it("Test FP.7: Negative hearts returns 400", async () => {
    const request = createRequest({
      id: 1,
      hearts: -5,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("hearts must be non-negative")
  })

  it("Test FP.8: Hearts set to 0 works", async () => {
    const existingImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 10,
      createdAt: new Date(),
    }

    const updatedImage = {
      ...existingImage,
      hearts: 0,
    }

    prisma.publishedImage.findUnique.mockResolvedValueOnce(existingImage)
    prisma.publishedImage.update.mockResolvedValueOnce(updatedImage)

    const request = createRequest({
      id: 1,
      hearts: 0,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hearts).toBe(0)
  })

  it("Test FP.9: Database updated correctly", async () => {
    const existingImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 3,
      createdAt: new Date(),
    }

    const updatedImage = {
      ...existingImage,
      hearts: 7,
    }

    prisma.publishedImage.findUnique.mockResolvedValueOnce(existingImage)
    prisma.publishedImage.update.mockResolvedValueOnce(updatedImage)

    const request = createRequest({
      id: 1,
      hearts: 7,
    })

    await PUT(request)

    expect(prisma.publishedImage.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { hearts: 7 },
    })
  })

  it("Test FP.10: Atomic update works", async () => {
    const existingImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 5,
      createdAt: new Date(),
    }

    const updatedImage = {
      ...existingImage,
      hearts: 15,
    }

    prisma.publishedImage.findUnique.mockResolvedValueOnce(existingImage)
    prisma.publishedImage.update.mockResolvedValueOnce(updatedImage)

    const request = createRequest({
      id: 1,
      hearts: 15,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hearts).toBe(15)
    expect(prisma.publishedImage.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { hearts: 15 },
    })
  })

  it("Test FP.11: Database error returns 500", async () => {
    const existingImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 5,
      createdAt: new Date(),
    }

    prisma.publishedImage.findUnique.mockResolvedValueOnce(existingImage)
    prisma.publishedImage.update.mockRejectedValueOnce(new Error("Database error"))

    const request = createRequest({
      id: 1,
      hearts: 10,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to update hearts")
  })

  it("Test FP.12: Prisma P2025 error returns 404", async () => {
    const existingImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 5,
      createdAt: new Date(),
    }

    prisma.publishedImage.findUnique.mockResolvedValueOnce(existingImage)
    const prismaError = new Error("Record not found")
    prismaError.code = "P2025"
    prisma.publishedImage.update.mockRejectedValueOnce(prismaError)

    const request = createRequest({
      id: 1,
      hearts: 10,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe("Image not found")
  })

  it("Test FP.13: Response includes updated image object", async () => {
    const existingImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test prompt",
      hearts: 2,
      createdAt: new Date(),
    }

    const updatedImage = {
      ...existingImage,
      hearts: 8,
    }

    prisma.publishedImage.findUnique.mockResolvedValueOnce(existingImage)
    prisma.publishedImage.update.mockResolvedValueOnce(updatedImage)

    const request = createRequest({
      id: 1,
      hearts: 8,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("id")
    expect(data).toHaveProperty("imageUrl")
    expect(data).toHaveProperty("prompt")
    expect(data).toHaveProperty("hearts")
    expect(data).toHaveProperty("createdAt")
    expect(data.hearts).toBe(8)
  })
})

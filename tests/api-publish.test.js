import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "../app/api/publish/route.js"
import prisma from "../lib/prisma.js"

// Mock Prisma
vi.mock("../lib/prisma.js", () => {
  const mockPrisma = {
    publishedImage: {
      create: vi.fn(),
    },
  }
  return {
    default: mockPrisma,
  }
})

describe("API: POST /api/publish", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body) => ({
    json: async () => body,
    headers: {
      get: () => "application/json",
    },
  })

  it("Test P.1: Publish with valid data returns 201", async () => {
    const mockImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "A beautiful landscape",
      hearts: 0,
      createdAt: new Date(),
    }

    prisma.publishedImage.create.mockResolvedValueOnce(mockImage)

    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
      prompt: "A beautiful landscape",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe(1)
    expect(data.imageUrl).toBe("https://example.com/image.jpg")
    expect(data.prompt).toBe("A beautiful landscape")
  })

  it("Test P.2: Missing imageUrl returns 400", async () => {
    const request = createRequest({
      prompt: "Test prompt",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("imageUrl is required")
  })

  it("Test P.3: Missing prompt returns 400", async () => {
    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("prompt is required")
  })

  it("Test P.4: Missing both fields returns 400", async () => {
    const request = createRequest({})

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("imageUrl is required")
  })

  it("Test P.5: Empty imageUrl returns 400", async () => {
    const request = createRequest({
      imageUrl: "",
      prompt: "Test",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("imageUrl cannot be empty")
  })

  it("Test P.6: Empty prompt allowed returns 201", async () => {
    const mockImage = {
      id: 1,
      imageUrl: "https://example.com/image.jpg",
      prompt: "",
      hearts: 0,
      createdAt: new Date(),
    }

    prisma.publishedImage.create.mockResolvedValueOnce(mockImage)

    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
      prompt: "",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.prompt).toBe("")
  })

  it("Test P.7: Record created in database", async () => {
    const mockImage = {
      id: 2,
      imageUrl: "https://example.com/test.jpg",
      prompt: "Test prompt",
      hearts: 0,
      createdAt: new Date(),
    }

    prisma.publishedImage.create.mockResolvedValueOnce(mockImage)

    const request = createRequest({
      imageUrl: "https://example.com/test.jpg",
      prompt: "Test prompt",
    })

    await POST(request)

    expect(prisma.publishedImage.create).toHaveBeenCalledWith({
      data: {
        imageUrl: "https://example.com/test.jpg",
        prompt: "Test prompt",
      },
    })
  })

  it("Test P.8: Default hearts is 0", async () => {
    const mockImage = {
      id: 3,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 0,
      createdAt: new Date(),
    }

    prisma.publishedImage.create.mockResolvedValueOnce(mockImage)

    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.hearts).toBe(0)
  })

  it("Test P.9: createdAt auto-generated", async () => {
    const createdAt = new Date()
    const mockImage = {
      id: 4,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
      hearts: 0,
      createdAt,
    }

    prisma.publishedImage.create.mockResolvedValueOnce(mockImage)

    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.createdAt).toBeDefined()
    expect(new Date(data.createdAt)).toBeInstanceOf(Date)
  })

  it("Test P.10: Response has all fields", async () => {
    const mockImage = {
      id: 5,
      imageUrl: "https://example.com/image.jpg",
      prompt: "Complete test",
      hearts: 0,
      createdAt: new Date(),
    }

    prisma.publishedImage.create.mockResolvedValueOnce(mockImage)

    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
      prompt: "Complete test",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data).toHaveProperty("id")
    expect(data).toHaveProperty("imageUrl")
    expect(data).toHaveProperty("prompt")
    expect(data).toHaveProperty("hearts")
    expect(data).toHaveProperty("createdAt")
  })

  it("Test P.11: Database error returns 500", async () => {
    prisma.publishedImage.create.mockRejectedValueOnce(new Error("Database error"))

    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
      prompt: "Test",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to publish image")
  })

  it("Test P.12: Non-string imageUrl returns 400", async () => {
    const request = createRequest({
      imageUrl: 123,
      prompt: "Test",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("imageUrl must be a string")
  })

  it("Test P.13: Non-string prompt returns 400", async () => {
    const request = createRequest({
      imageUrl: "https://example.com/image.jpg",
      prompt: 123,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("prompt must be a string")
  })
})

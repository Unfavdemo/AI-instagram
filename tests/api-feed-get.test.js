import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET } from "../app/api/feed/route.js"
import prisma from "../lib/prisma.js"

// Mock Prisma
vi.mock("../lib/prisma.js", () => {
  const mockPrisma = {
    publishedImage: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  }
  return {
    default: mockPrisma,
  }
})

describe("API: GET /api/feed", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (queryParams = {}) => {
    const url = new URL("http://localhost:3000/api/feed")
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value.toString())
      }
    })

    return {
      url: url.toString(),
      headers: {
        get: () => "application/json",
      },
    }
  }

  it("Test FG.1: Get feed with defaults returns 200", async () => {
    const mockImages = [
      {
        id: 1,
        imageUrl: "https://example.com/image1.jpg",
        prompt: "Test 1",
        hearts: 0,
        createdAt: new Date(),
      },
    ]

    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(1)

    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.images).toBeDefined()
    expect(data.total).toBe(1)
    expect(data.page).toBe(1)
    expect(data.totalPages).toBe(1)
  })

  it("Test FG.2: Get feed page 1 returns first 10", async () => {
    const mockImages = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      imageUrl: `https://example.com/image${i + 1}.jpg`,
      prompt: `Test ${i + 1}`,
      hearts: 0,
      createdAt: new Date(),
    }))

    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(25)

    const request = createRequest({ page: "1", limit: "10" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.images.length).toBe(10)
    expect(data.page).toBe(1)
  })

  it("Test FG.3: Get feed page 2 with limit 5 works", async () => {
    const mockImages = Array.from({ length: 5 }, (_, i) => ({
      id: i + 6,
      imageUrl: `https://example.com/image${i + 6}.jpg`,
      prompt: `Test ${i + 6}`,
      hearts: 0,
      createdAt: new Date(),
    }))

    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(15)

    const request = createRequest({ page: "2", limit: "5" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.images.length).toBe(5)
    expect(data.page).toBe(2)
    expect(prisma.publishedImage.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      orderBy: { createdAt: "desc" },
    })
  })

  it("Test FG.4: Images ordered by createdAt desc", async () => {
    const mockImages = [
      {
        id: 3,
        imageUrl: "https://example.com/image3.jpg",
        prompt: "Newest",
        hearts: 0,
        createdAt: new Date("2024-01-03"),
      },
      {
        id: 2,
        imageUrl: "https://example.com/image2.jpg",
        prompt: "Middle",
        hearts: 0,
        createdAt: new Date("2024-01-02"),
      },
      {
        id: 1,
        imageUrl: "https://example.com/image1.jpg",
        prompt: "Oldest",
        hearts: 0,
        createdAt: new Date("2024-01-01"),
      },
    ]

    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(3)

    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.publishedImage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    )
  })

  it("Test FG.5: Total count is correct", async () => {
    const mockImages = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      imageUrl: `https://example.com/image${i + 1}.jpg`,
      prompt: `Test ${i + 1}`,
      hearts: 0,
      createdAt: new Date(),
    }))

    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(42)

    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(42)
  })

  it("Test FG.6: totalPages calculated correctly", async () => {
    const mockImages = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      imageUrl: `https://example.com/image${i + 1}.jpg`,
      prompt: `Test ${i + 1}`,
      hearts: 0,
      createdAt: new Date(),
    }))

    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(25)

    const request = createRequest({ limit: "10" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalPages).toBe(3) // Math.ceil(25/10) = 3
  })

  it("Test FG.7: Page defaults to 1", async () => {
    const mockImages = []
    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(0)

    const request = createRequest({ limit: "10" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.page).toBe(1)
    expect(prisma.publishedImage.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" },
    })
  })

  it("Test FG.8: Limit defaults to 10", async () => {
    const mockImages = []
    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(0)

    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.publishedImage.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" },
    })
  })

  it("Test FG.9: Invalid page returns 400", async () => {
    const request = createRequest({ page: "0" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid page parameter")
  })

  it("Test FG.10: Invalid limit returns 400", async () => {
    const request = createRequest({ limit: "0" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid limit parameter")
  })

  it("Test FG.11: Limit exceeding max capped at 50", async () => {
    const mockImages = []
    prisma.publishedImage.findMany.mockResolvedValueOnce(mockImages)
    prisma.publishedImage.count.mockResolvedValueOnce(0)

    const request = createRequest({ limit: "100" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.publishedImage.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 50,
      orderBy: { createdAt: "desc" },
    })
  })

  it("Test FG.12: Empty database returns empty array", async () => {
    prisma.publishedImage.findMany.mockResolvedValueOnce([])
    prisma.publishedImage.count.mockResolvedValueOnce(0)

    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.images).toEqual([])
    expect(data.total).toBe(0)
  })

  it("Test FG.13: Database error returns 500", async () => {
    prisma.publishedImage.findMany.mockRejectedValueOnce(new Error("Database error"))

    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to fetch feed")
  })

  it("Test FG.14: Negative page returns 400", async () => {
    const request = createRequest({ page: "-1" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid page parameter")
  })

  it("Test FG.15: Negative limit returns 400", async () => {
    const request = createRequest({ limit: "-5" })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid limit parameter")
  })
})

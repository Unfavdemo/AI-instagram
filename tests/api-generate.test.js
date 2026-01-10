import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "../app/api/generate/route.js"

// Mock environment variable
process.env.OPENAI_API_KEY = "test-api-key"

// Mock fetch globally
global.fetch = vi.fn()

describe("API: POST /api/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body) => ({
    json: async () => body,
    headers: {
      get: () => "application/json",
    },
  })

  it("Test G.1: Generate with valid prompt returns 200", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ url: "https://example.com/generated.jpg" }],
      }),
    })

    const request = createRequest({ prompt: "A beautiful sunset" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.imageUrl).toBe("https://example.com/generated.jpg")
    expect(data.prompt).toBe("A beautiful sunset")
  })

  it("Test G.2: Missing prompt returns 400", async () => {
    const request = createRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt is required")
  })

  it("Test G.3: Empty prompt returns 400", async () => {
    const request = createRequest({ prompt: "" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt cannot be empty")
  })

  it("Test G.4: Null prompt returns 400", async () => {
    const request = createRequest({ prompt: null })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt is required")
  })

  it("Test G.5: Non-string prompt returns 400", async () => {
    const request = createRequest({ prompt: 123 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt must be a string")
  })

  it("Test G.6: Response has imageUrl field", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ url: "https://example.com/test.jpg" }],
      }),
    })

    const request = createRequest({ prompt: "Test prompt" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("imageUrl")
    expect(typeof data.imageUrl).toBe("string")
  })

  it("Test G.7: Response has prompt field", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ url: "https://example.com/test.jpg" }],
      }),
    })

    const request = createRequest({ prompt: "Test prompt for response" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("prompt")
    expect(data.prompt).toBe("Test prompt for response")
  })

  it("Test G.8: OpenAI API error returns 500", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: "API error occurred" },
      }),
    })

    const request = createRequest({ prompt: "Valid prompt" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })

  it("Test G.9: Uses DALL-E 2 model with 512x512 size", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ url: "https://example.com/test.jpg" }],
      }),
    })

    const request = createRequest({ prompt: "Test" })
    await POST(request)

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/images/generations",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
        }),
        body: JSON.stringify({
          model: "dall-e-2",
          prompt: "Test",
          n: 1,
          size: "512x512",
        }),
      })
    )
  })
})

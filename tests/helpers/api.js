/**
 * Helper functions for API testing
 */

export function createTestRequest(method, body = null, queryParams = null) {
  const url = new URL("http://localhost:3000/api/test")
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  return {
    method,
    url: url.toString(),
    json: async () => body,
    headers: {
      get: (name) => {
        if (name.toLowerCase() === "content-type") {
          return "application/json"
        }
        return null
      },
    },
  }
}

export function createMockRequest(method, body = null, queryParams = null) {
  const url = queryParams
    ? `http://localhost:3000/api/test?${new URLSearchParams(queryParams).toString()}`
    : "http://localhost:3000/api/test"

  return {
    method,
    url,
    json: async () => body || {},
    headers: {
      get: () => "application/json",
    },
  }
}

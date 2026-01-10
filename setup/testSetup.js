import { beforeAll, beforeEach, afterEach } from "vitest"
import prisma from "../lib/prisma.js"

// Set up database schema before all tests
beforeAll(async () => {
  try {
    // Connect to database and ensure schema is ready
    // Note: In a real setup, you would run migrations or db push before tests
    // For now, we'll just ensure connection works
    await prisma.$connect()
  } catch (error) {
    console.error("Error connecting to database:", error)
    // Don't throw - let individual tests handle connection errors
    console.warn("Warning: Database connection failed. Make sure DATABASE_URL is set and database is accessible.")
  }
})

// Clean up database before each test
beforeEach(async () => {
  try {
    await prisma.publishedImage.deleteMany({})
  } catch (error) {
    console.error("Error cleaning database:", error)
  }
})

// Disconnect Prisma after each test
afterEach(async () => {
  try {
    // Don't disconnect after each test to maintain connection pool
    // Connection will be cleaned up by test runner
  } catch (error) {
    // Ignore disconnection errors
  }
})

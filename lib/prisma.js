import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import ws from "ws"

// Configure WebSocket constructor for Node.js environment
neonConfig.webSocketConstructor = ws

// Singleton pattern for Prisma Client in Next.js
// Prevents multiple instances during hot reload in development
const globalForPrisma = globalThis

let prisma

if (!globalForPrisma.prisma) {
  // Create a connection pool for Neon
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set")
    throw new Error("DATABASE_URL environment variable is not set")
  }

  try {
    // Create pool and adapter (these can be reused)
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)
    globalForPrisma.prisma = new PrismaClient({ adapter })
  } catch (error) {
    console.error("Error initializing Prisma Client:", error)
    throw error
  }
}

prisma = globalForPrisma.prisma

export default prisma

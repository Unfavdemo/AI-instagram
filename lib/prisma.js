import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import ws from "ws"

// Configure WebSocket constructor for Node.js environment
neonConfig.webSocketConstructor = ws

// Create a connection pool for Neon
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create pool and adapter (these can be reused)
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

// Singleton pattern for Prisma Client in Next.js
// Prevents multiple instances during hot reload in development
const globalForPrisma = globalThis

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma

export default prisma

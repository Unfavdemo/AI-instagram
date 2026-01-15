import { config } from "dotenv"
import { defineConfig, env } from "prisma/config"

// Load environment variables from .env file for Prisma CLI
config()

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
})

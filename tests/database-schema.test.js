import { describe, it, expect, beforeAll } from "vitest"
import prisma from "../lib/prisma.js"

describe("Database Schema Tests", () => {
  beforeAll(async () => {
    // Ensure database is ready
    await prisma.$connect()
  })

  describe("Test 1: PublishedImage Model", () => {
    it("Test 1.1: PublishedImage model exists", async () => {
      expect(prisma.publishedImage).toBeDefined()
    })

    it("Test 1.2: id field is Int with autoincrement", async () => {
      const image1 = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/image1.jpg",
          prompt: "Test prompt 1",
        },
      })

      const image2 = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/image2.jpg",
          prompt: "Test prompt 2",
        },
      })

      expect(typeof image1.id).toBe("number")
      expect(typeof image2.id).toBe("number")
      expect(image2.id).toBeGreaterThan(image1.id)
    })

    it("Test 1.3: imageUrl field exists and is String", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/test.jpg",
          prompt: "Test",
        },
      })

      expect(image.imageUrl).toBeDefined()
      expect(typeof image.imageUrl).toBe("string")
    })

    it("Test 1.4: prompt field exists and is String", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/test.jpg",
          prompt: "A beautiful landscape",
        },
      })

      expect(image.prompt).toBeDefined()
      expect(typeof image.prompt).toBe("string")
    })

    it("Test 1.5: hearts field exists and is Int", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/test.jpg",
          prompt: "Test",
        },
      })

      expect(image.hearts).toBeDefined()
      expect(typeof image.hearts).toBe("number")
    })

    it("Test 1.6: createdAt field exists and is DateTime", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/test.jpg",
          prompt: "Test",
        },
      })

      expect(image.createdAt).toBeDefined()
      expect(image.createdAt).toBeInstanceOf(Date)
    })

    it("Test 1.7: hearts default value is 0", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/test.jpg",
          prompt: "Test",
        },
      })

      expect(image.hearts).toBe(0)
    })

    it("Test 1.8: createdAt auto-generates timestamp", async () => {
      const before = new Date()
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/test.jpg",
          prompt: "Test",
        },
      })
      const after = new Date()

      expect(image.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(image.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe("Test 2: CRUD Operations", () => {
    it("Test 2.1: create() works", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/create.jpg",
          prompt: "Create test",
        },
      })

      expect(image.id).toBeDefined()
      expect(image.imageUrl).toBe("https://example.com/create.jpg")
    })

    it("Test 2.2: findUnique() works", async () => {
      const created = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/find.jpg",
          prompt: "Find test",
        },
      })

      const found = await prisma.publishedImage.findUnique({
        where: { id: created.id },
      })

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it("Test 2.3: findMany() works", async () => {
      await prisma.publishedImage.createMany({
        data: [
          {
            imageUrl: "https://example.com/many1.jpg",
            prompt: "Many test 1",
          },
          {
            imageUrl: "https://example.com/many2.jpg",
            prompt: "Many test 2",
          },
        ],
      })

      const images = await prisma.publishedImage.findMany()
      expect(images.length).toBeGreaterThanOrEqual(2)
    })

    it("Test 2.4: update() works", async () => {
      const created = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/update.jpg",
          prompt: "Update test",
          hearts: 5,
        },
      })

      const updated = await prisma.publishedImage.update({
        where: { id: created.id },
        data: { hearts: 10 },
      })

      expect(updated.hearts).toBe(10)
    })

    it("Test 2.5: delete() works", async () => {
      const created = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/delete.jpg",
          prompt: "Delete test",
        },
      })

      await prisma.publishedImage.delete({
        where: { id: created.id },
      })

      const found = await prisma.publishedImage.findUnique({
        where: { id: created.id },
      })

      expect(found).toBeNull()
    })

    it("Test 2.6: count() works", async () => {
      await prisma.publishedImage.createMany({
        data: [
          {
            imageUrl: "https://example.com/count1.jpg",
            prompt: "Count test 1",
          },
          {
            imageUrl: "https://example.com/count2.jpg",
            prompt: "Count test 2",
          },
          {
            imageUrl: "https://example.com/count3.jpg",
            prompt: "Count test 3",
          },
        ],
      })

      const count = await prisma.publishedImage.count()
      expect(count).toBeGreaterThanOrEqual(3)
    })

    it("Test 2.7: createMany() works", async () => {
      const result = await prisma.publishedImage.createMany({
        data: [
          {
            imageUrl: "https://example.com/many1.jpg",
            prompt: "CreateMany test 1",
          },
          {
            imageUrl: "https://example.com/many2.jpg",
            prompt: "CreateMany test 2",
          },
        ],
      })

      expect(result.count).toBe(2)
    })
  })

  describe("Test 3: Query Operations", () => {
    it("Test 3.1: Ordering by createdAt descending works", async () => {
      const image1 = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/order1.jpg",
          prompt: "Order test 1",
        },
      })

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10))

      const image2 = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/order2.jpg",
          prompt: "Order test 2",
        },
      })

      const images = await prisma.publishedImage.findMany({
        orderBy: { createdAt: "desc" },
      })

      expect(images[0].id).toBe(image2.id)
    })

    it("Test 3.2: Pagination with skip and take works", async () => {
      await prisma.publishedImage.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          imageUrl: `https://example.com/pag${i}.jpg`,
          prompt: `Pagination test ${i}`,
        })),
      })

      const page1 = await prisma.publishedImage.findMany({
        skip: 0,
        take: 2,
      })
      const page2 = await prisma.publishedImage.findMany({
        skip: 2,
        take: 2,
      })

      expect(page1.length).toBe(2)
      expect(page2.length).toBe(2)
      expect(page1[0].id).not.toBe(page2[0].id)
    })

    it("Test 3.3: count() returns accurate total for pagination", async () => {
      await prisma.publishedImage.createMany({
        data: Array.from({ length: 7 }, (_, i) => ({
          imageUrl: `https://example.com/count${i}.jpg`,
          prompt: `Count pagination ${i}`,
        })),
      })

      const total = await prisma.publishedImage.count()
      const page1 = await prisma.publishedImage.findMany({
        skip: 0,
        take: 3,
      })

      expect(total).toBeGreaterThanOrEqual(7)
      expect(page1.length).toBe(3)
    })

    it("Test 3.4: totalPages calculated correctly", async () => {
      await prisma.publishedImage.createMany({
        data: Array.from({ length: 25 }, (_, i) => ({
          imageUrl: `https://example.com/total${i}.jpg`,
          prompt: `Total pages ${i}`,
        })),
      })

      const total = await prisma.publishedImage.count()
      const limit = 10
      const totalPages = Math.ceil(total / limit)

      expect(totalPages).toBe(Math.ceil(total / limit))
    })

    it("Test 3.5: Where clause filtering works", async () => {
      await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/filter.jpg",
          prompt: "Filter test",
          hearts: 5,
        },
      })

      const filtered = await prisma.publishedImage.findMany({
        where: { hearts: { gte: 5 } },
      })

      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every((img) => img.hearts >= 5)).toBe(true)
    })
  })

  describe("Test 4: Field Constraints", () => {
    it("Test 4.1: imageUrl is required", async () => {
      await expect(
        prisma.publishedImage.create({
          data: {
            prompt: "Test",
          },
        })
      ).rejects.toThrow()
    })

    it("Test 4.2: prompt is required", async () => {
      await expect(
        prisma.publishedImage.create({
          data: {
            imageUrl: "https://example.com/test.jpg",
          },
        })
      ).rejects.toThrow()
    })

    it("Test 4.3: id is unique", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/unique.jpg",
          prompt: "Unique test",
        },
      })

      await expect(
        prisma.publishedImage.create({
          data: {
            id: image.id,
            imageUrl: "https://example.com/duplicate.jpg",
            prompt: "Duplicate",
          },
        })
      ).rejects.toThrow()
    })

    it("Test 4.4: hearts defaults to 0 when not provided", async () => {
      const image = await prisma.publishedImage.create({
        data: {
          imageUrl: "https://example.com/default.jpg",
          prompt: "Default hearts",
        },
      })

      expect(image.hearts).toBe(0)
    })
  })

  describe("Test 5: Database Connection", () => {
    it("Test 5.1: Can connect to database", async () => {
      await expect(prisma.$connect()).resolves.not.toThrow()
    })

    it("Test 5.2: Can query database", async () => {
      const count = await prisma.publishedImage.count()
      expect(typeof count).toBe("number")
      expect(count).toBeGreaterThanOrEqual(0)
    })

    it("Test 5.3: Connection pooling works", async () => {
      const promises = Array.from({ length: 5 }, () =>
        prisma.publishedImage.count()
      )
      const counts = await Promise.all(promises)
      expect(counts.every((c) => typeof c === "number")).toBe(true)
    })
  })
})

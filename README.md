# Generative Instagram with AI

[![TS.3.3](https://img.shields.io/badge/TS.3.3-ORM%20Configuration-blue)](https://example.com)
[![TS.3.4](https://img.shields.io/badge/TS.3.4-API%20Architecture-green)](https://example.com)

A full-stack application that generates AI images using OpenAI's DALL·E 2 API and shares them in a social feed. Built with Next.js, Prisma ORM, and PostgreSQL via Neon.

## 📸 Project Overview

Instagram is so 2023! Instead of taking photos yourself, you'll generate them with AI and share them with friends and the world. This project demonstrates mastery of backend development with ORM configuration and API architecture design.

## 🎯 Technical Skills Assessment

This project demonstrates the following competencies:
- **TS.3.3**: Configure servers (Object Relational Mapping with Prisma)
- **TS.3.4**: Design systems & architecture (RESTful API design and data flow)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.1 (App Router), React 19.2.3
- **Backend**: Next.js API Routes (Node.js)
- **ORM**: Prisma 7.2.0 with Neon adapter
- **Database**: PostgreSQL via Neon.com (serverless)
- **AI Service**: OpenAI DALL·E 2 API
- **Testing**: Vitest 4.0.16
- **Package Manager**: pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **pnpm** ([Installation guide](https://pnpm.io/installation))
- **Neon.com account** ([Sign up for free](https://neon.tech))
- **OpenAI API key** with DALL·E 2 access ([Get API key](https://platform.openai.com/api-keys))

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-github-classroom-repo>
cd <repo-name>
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database connection string for Neon PostgreSQL
# Must include ?sslmode=require
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# OpenAI API Key for DALL·E 2 image generation
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

**Important**: Make sure your `DATABASE_URL` includes `?sslmode=require` at the end.

### 3. Database Setup (TS.3.3)

Generate Prisma Client:

```bash
npx prisma generate
```

Create and apply migration:

```bash
npx prisma migrate dev --name init
```

Optional: Open Prisma Studio to view data:

```bash
npx prisma studio
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch
```

## 📁 Project Structure

```
/
├── app/
│   ├── page.jsx                 # Landing page
│   ├── generate/
│   │   └── page.jsx             # Generate page
│   ├── feed/
│   │   └── page.jsx             # Feed page
│   └── api/
│       ├── generate/
│       │   └── route.js         # POST /api/generate
│       ├── publish/
│       │   └── route.js         # POST /api/publish
│       └── feed/
│           └── route.js         # GET & PUT /api/feed
├── prisma/
│   ├── schema.prisma            # PublishedImage model
│   └── migrations/              # Migration files
├── lib/
│   └── prisma.js                # Prisma client configuration
├── tests/
│   ├── database-schema.test.js
│   ├── api-generate.test.js
│   ├── api-publish.test.js
│   ├── api-feed-get.test.js
│   └── api-feed-put.test.js
├── setup/
│   └── testSetup.js             # Vitest setup configuration
├── docs/
│   ├── API.md                   # API documentation
│   ├── DATA-FLOW.md             # Data flow documentation
│   └── architecture-diagram.png # Architecture diagram
├── .env (gitignored)
├── .env.example
├── prisma.config.ts
├── vitest.config.js
└── README.md
```

## 📚 Documentation

- **[API Documentation](./docs/API.md)** - Complete API endpoint reference
- **[Data Flow Documentation](./docs/DATA-FLOW.md)** - Detailed data flow diagrams
- **[Architecture Diagram](./docs/architecture-diagram.png)** - System architecture visualization

## 🧪 Testing

The project includes comprehensive test coverage with Vitest:

- **Database Schema Tests**: 15+ tests for Prisma model validation
- **API Generate Tests**: 8+ tests for image generation endpoint
- **API Publish Tests**: 10+ tests for publishing endpoint
- **API Feed GET Tests**: 12+ tests for feed retrieval with pagination
- **API Feed PUT Tests**: 10+ tests for hearts update functionality

All tests must pass to demonstrate competency. Run tests with:

```bash
pnpm test
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm migrate` | Run database migrations |
| `npx prisma studio` | Open Prisma Studio GUI |
| `npx prisma generate` | Generate Prisma Client |

## 🗄️ Database Schema

The `PublishedImage` model includes:

- `id`: Auto-incrementing integer (primary key)
- `imageUrl`: String (required, mapped to `image_url`)
- `prompt`: String (required)
- `hearts`: Integer (default: 0)
- `createdAt`: DateTime (auto-generated, mapped to `created_at`)

## 🔌 API Endpoints

### POST /api/generate
Generate an AI image using DALL·E 2.

### POST /api/publish
Publish a generated image to the feed.

### GET /api/feed
Retrieve paginated feed of published images.

### PUT /api/feed
Update hearts count for an image.

See [API Documentation](./docs/API.md) for complete details.

## 🐛 Troubleshooting

### Issue: Prisma Client not found
**Solution**:
```bash
npx prisma generate
# Restart your dev server after generating
```

### Issue: Database connection errors
**Solution**:
- Check `DATABASE_URL` in `.env` is correct
- Ensure connection string includes `?sslmode=require`
- Verify Neon database is active (not hibernated)
- Check if using Pool adapter (not Client)

### Issue: OpenAI API errors
**Solution**:
- Verify `OPENAI_API_KEY` is set in `.env`
- Check API key has DALL·E 2 access
- Ensure account has credits available
- Check for rate limiting (wait and retry)

### Issue: Tests timing out
**Solution**:
- Increase timeout in `vitest.config.js` (`hookTimeout: 60000`)
- Verify `DATABASE_URL` is accessible from test environment
- Check if using Pool adapter in test setup
- Ensure `.env` file is in project root

### Issue: Migration fails
**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name init
```

## 📝 Submission Checklist

Before submitting, verify:

- [ ] All dependencies installed (`pnpm install`)
- [ ] `DATABASE_URL` set in `.env`
- [ ] `OPENAI_API_KEY` set in `.env`
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Migrations applied (`npx prisma migrate dev`)
- [ ] All 55+ tests pass (`pnpm test`)
- [ ] No test warnings or errors
- [ ] All 4 API endpoints working
- [ ] Frontend pages working (Generate & Feed)
- [ ] Architecture diagram created
- [ ] Data flow documentation written
- [ ] API documentation complete
- [ ] Code committed to GitHub
- [ ] README.md updated with your implementation details

## 📖 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Neon PostgreSQL](https://neon.tech/docs)
- [OpenAI DALL·E 2 API](https://platform.openai.com/docs/guides/images)
- [Vitest Testing Framework](https://vitest.dev/)

## 📄 License

This is an educational project for technical skills assessment (TS.3.3 & TS.3.4).

## 👤 Author

Generated for educational purposes as part of the Generative Instagram with AI project.

---

**Note**: This project demonstrates mastery of ORM configuration (TS.3.3) and API architecture design (TS.3.4). All requirements must be met and tests must pass for successful completion.

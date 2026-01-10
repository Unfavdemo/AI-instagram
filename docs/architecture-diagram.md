# Architecture Diagram

System architecture for Generative Instagram with AI application.

## Text-Based Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                     (React/Next.js Frontend)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │ Generate     │         │ Feed         │                    │
│  │ Page         │         │ Page         │                    │
│  │              │         │              │                    │
│  │ - Prompt     │         │ - Image Grid │                    │
│  │   Input      │         │ - Pagination │                    │
│  │ - Generate   │         │ - Hearts     │                    │
│  │   Button     │         │   Button     │                    │
│  │ - Image      │         │              │                    │
│  │   Display    │         │              │                    │
│  │ - Publish    │         │              │                    │
│  │   Button     │         │              │                    │
│  └──────┬───────┘         └──────┬───────┘                    │
│         │                        │                             │
│         └────────────┬───────────┘                             │
│                      │                                         │
└──────────────────────┼─────────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │
┌──────────────────────┼─────────────────────────────────────────┐
│                      │        API ROUTES LAYER                 │
│                      │      (Next.js API Routes)               │
├──────────────────────┼─────────────────────────────────────────┤
│                      │                                         │
│         ┌────────────┴────────────┐                           │
│         │                         │                            │
│  ┌──────▼──────┐         ┌───────▼────────┐                  │
│  │ POST        │         │ POST           │                   │
│  │ /api/       │         │ /api/publish   │                   │
│  │ generate    │         │                │                   │
│  │             │         │                │                   │
│  │ - Validate  │         │ - Validate     │                   │
│  │   prompt    │         │   imageUrl     │                   │
│  │ - Call      │         │   prompt       │                   │
│  │   OpenAI    │         │ - Save to DB   │                   │
│  │ - Return    │         │ - Return 201   │                   │
│  │   imageUrl  │         │                │                   │
│  └─────────────┘         └────────┬───────┘                   │
│                                    │                            │
│         ┌──────────────────────────┼──────────┐               │
│         │                          │          │                │
│  ┌──────▼──────────┐      ┌───────▼────────┐ │               │
│  │ GET             │      │ PUT            │ │               │
│  │ /api/feed       │      │ /api/feed      │ │               │
│  │                 │      │                │ │               │
│  │ - Parse page    │      │ - Validate id  │ │               │
│  │   limit         │      │   hearts       │ │               │
│  │ - Paginate      │      │ - Find image   │ │               │
│  │ - Order desc    │      │ - Update       │ │               │
│  │ - Return        │      │   hearts       │ │               │
│  │   paginated     │      │ - Return 200   │ │               │
│  │   results       │      │                │ │               │
│  └─────────────────┘      └────────────────┘                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                      │
                      │
┌─────────────────────┼─────────────────────────────────────────┐
│                     │     PRISMA ORM LAYER                    │
│                     │   (Object-Relational Mapping)           │
├─────────────────────┼─────────────────────────────────────────┤
│                     │                                         │
│  ┌──────────────────▼──────────────────────┐                │
│  │         Prisma Client                   │                │
│  │  (with Neon Adapter + Pool)             │                │
│  │                                         │                │
│  │  - Pool connection management           │                │
│  │  - Query building                       │                │
│  │  - Type safety                          │                │
│  │  - Migration support                    │                │
│  └──────────────────┬──────────────────────┘                │
│                     │                                         │
│  ┌──────────────────▼──────────────────────┐                │
│  │      PublishedImage Model               │                │
│  │                                         │                │
│  │  - id: Int @id @default(autoincrement) │                │
│  │  - imageUrl: String @map("image_url")  │                │
│  │  - prompt: String                      │                │
│  │  - hearts: Int @default(0)             │                │
│  │  - createdAt: DateTime @default(now()) │                │
│  │    @map("created_at")                  │                │
│  └──────────────────┬──────────────────────┘                │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ SQL Queries
                      │
┌─────────────────────┼─────────────────────────────────────────┐
│                     │     DATABASE LAYER                      │
│                     │   (Neon PostgreSQL)                     │
├─────────────────────┼─────────────────────────────────────────┤
│                     │                                         │
│  ┌──────────────────▼──────────────────────┐                │
│  │     Neon Serverless PostgreSQL          │                │
│  │                                         │                │
│  │  ┌──────────────────────────────────┐  │                │
│  │  │  published_images table          │  │                │
│  │  │                                  │  │                │
│  │  │  id (SERIAL PRIMARY KEY)         │  │                │
│  │  │  image_url (TEXT)                │  │                │
│  │  │  prompt (TEXT)                   │  │                │
│  │  │  hearts (INTEGER DEFAULT 0)      │  │                │
│  │  │  created_at (TIMESTAMP)          │  │                │
│  │  └──────────────────────────────────┘  │                │
│  │                                         │                │
│  │  - Connection pooling                  │                │
│  │  - SSL required                        │                │
│  │  - Serverless scaling                  │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                      │
                      │
┌─────────────────────┼─────────────────────────────────────────┐
│                     │     EXTERNAL SERVICES                   │
│                     │                                         │
├─────────────────────┼─────────────────────────────────────────┤
│                     │                                         │
│  ┌──────────────────▼──────────────────────┐                │
│  │      OpenAI DALL·E 2 API                │                │
│  │                                         │                │
│  │  Endpoint:                              │                │
│  │  /v1/images/generations                 │                │
│  │                                         │                │
│  │  Request:                               │                │
│  │  - model: "dall-e-2"                    │                │
│  │  - prompt: string                       │                │
│  │  - n: 1                                 │                │
│  │  - size: "512x512"                      │                │
│  │                                         │                │
│  │  Response:                              │                │
│  │  - data[0].url: image URL               │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Arrows

### Image Generation Flow
```
User Input → Generate Page → POST /api/generate → OpenAI API → Image URL → Display
```

### Publishing Flow
```
Generated Image → Publish Button → POST /api/publish → Prisma → Database → Success
```

### Feed Retrieval Flow
```
Feed Page → GET /api/feed → Prisma → Database Query → Paginated Results → Display
```

### Hearts Update Flow
```
Heart Click → PUT /api/feed → Prisma → Database Update → Updated Count → UI Update
```

## Component Interactions

1. **Client to API**: HTTP REST requests (GET, POST, PUT)
2. **API to Prisma**: JavaScript function calls with type-safe queries
3. **Prisma to Database**: SQL queries via connection pool
4. **API to OpenAI**: HTTP REST requests with Bearer token authentication

## Key Technologies

- **Frontend**: Next.js 16.1.1 (App Router), React 19.2.3
- **Backend**: Next.js API Routes (Node.js)
- **ORM**: Prisma 7.2.0 with Neon adapter
- **Database**: PostgreSQL via Neon.com (serverless)
- **AI Service**: OpenAI DALL·E 2 API
- **Testing**: Vitest 4.0.16

## Architecture Principles

1. **Separation of Concerns**: Clear boundaries between client, API, ORM, and database layers
2. **Type Safety**: Prisma provides type-safe database queries
3. **Connection Pooling**: Efficient database connection management with Neon Pool
4. **RESTful Design**: Standard HTTP methods and status codes
5. **Error Handling**: Consistent error responses across all layers
6. **Scalability**: Serverless architecture for both database and API routes

## Security Considerations

- Environment variables for sensitive data (API keys, database URLs)
- SSL required for database connections (`?sslmode=require`)
- Input validation at API layer
- Type validation before database operations
- No direct database access from client

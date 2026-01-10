# Data Flow Documentation

This document describes the data flow through the Generative Instagram with AI application.

## Overview

The application follows a client-server architecture with the following main flows:
1. Image Generation Flow
2. Publishing Flow
3. Feed Retrieval Flow
4. Hearts Update Flow

---

## 1. Image Generation Flow

**Purpose**: Generate an AI image from a text prompt using OpenAI's DALL·E 2 API.

### Flow Diagram

```
User Input (Prompt)
    ↓
[Generate Page] (app/generate/page.jsx)
    ↓
POST /api/generate
    ↓
[Validation Layer]
    ├─ Check prompt exists
    ├─ Check prompt is string
    └─ Check prompt is not empty
    ↓
[OpenAI API Call]
    ├─ Model: dall-e-2
    ├─ Size: 512x512
    └─ n: 1
    ↓
[Response Processing]
    ├─ Extract imageUrl from response.data[0].url
    └─ Return { imageUrl, prompt }
    ↓
[Display Image] (Generate Page)
    └─ Show generated image with prompt
```

### Detailed Steps

1. **User Input**: User enters a text prompt in the Generate page textarea
2. **Client Request**: Frontend sends POST request to `/api/generate` with `{ prompt: "..." }`
3. **Validation**: API validates:
   - Prompt is not `undefined` or `null` → 400 if missing
   - Prompt is a string type → 400 if not string
   - Prompt is not empty after trimming → 400 if empty
4. **OpenAI API Call**: 
   - Endpoint: `https://api.openai.com/v1/images/generations`
   - Model: `dall-e-2`
   - Size: `512x512`
   - Returns image URL
5. **Response**: API returns `{ imageUrl: "...", prompt: "..." }`
6. **Display**: Frontend displays the generated image and shows "Publish" button

### Error Handling

- **400 Bad Request**: Invalid prompt (missing, wrong type, empty)
- **500 Internal Server Error**: OpenAI API errors or network failures
- All errors are logged to console and returned to client

---

## 2. Publishing Flow

**Purpose**: Save a generated image to the database so it appears in the feed.

### Flow Diagram

```
[Generated Image Displayed]
    ↓
User Clicks "Publish" Button
    ↓
POST /api/publish
    Body: { imageUrl, prompt }
    ↓
[Validation Layer]
    ├─ Check imageUrl exists and is string
    ├─ Check prompt exists and is string
    └─ Check imageUrl is not empty
    ↓
[Prisma ORM]
    ├─ prisma.publishedImage.create()
    ├─ Default hearts: 0
    └─ Default createdAt: now()
    ↓
[Database Insert]
    INSERT INTO published_images (...)
    ↓
[Response: 201 Created]
    Return complete image object
    ↓
[Success Message]
    Display "Image published successfully!"
```

### Detailed Steps

1. **User Action**: User clicks "Publish" button after generating an image
2. **Client Request**: Frontend sends POST to `/api/publish` with `{ imageUrl, prompt }`
3. **Validation**: API validates:
   - `imageUrl` exists, is string, and not empty → 400 if invalid
   - `prompt` exists and is string → 400 if invalid
   - Note: Empty prompt is allowed (edge case)
4. **Database Insert**: 
   - Uses Prisma: `prisma.publishedImage.create({ data: { imageUrl, prompt } })`
   - Schema defaults: `hearts = 0`, `createdAt = now()`
5. **Response**: Returns complete object with all fields including `id` and `createdAt`
6. **Confirmation**: Frontend shows success message and clears form

### Error Handling

- **400 Bad Request**: Missing or invalid `imageUrl` or `prompt`
- **500 Internal Server Error**: Database connection or insertion errors
- Errors are logged and user sees error message

---

## 3. Feed Retrieval Flow

**Purpose**: Retrieve paginated list of published images for the feed page.

### Flow Diagram

```
[Feed Page Load / Pagination Click]
    ↓
GET /api/feed?page=1&limit=10
    ↓
[Query Parameter Parsing]
    ├─ page: parseInt(default: 1)
    └─ limit: parseInt(default: 10, max: 50)
    ↓
[Validation]
    ├─ Check page ≥ 1
    └─ Check limit ≥ 1
    ↓
[Pagination Calculation]
    ├─ skip = (page - 1) * limit
    └─ take = limit (capped at 50)
    ↓
[Database Queries]
    ├─ prisma.publishedImage.findMany({ skip, take, orderBy: { createdAt: "desc" } })
    └─ prisma.publishedImage.count()
    ↓
[Response Processing]
    ├─ totalPages = Math.ceil(total / limit)
    └─ Return { images, total, page, totalPages }
    ↓
[Display Feed]
    ├─ Render image grid
    └─ Show pagination controls
```

### Detailed Steps

1. **Page Load**: Feed page loads or user clicks pagination button
2. **Client Request**: Frontend sends GET to `/api/feed?page=1&limit=10`
3. **Parameter Parsing**: 
   - Parse `page` query param (default: 1)
   - Parse `limit` query param (default: 10, max: 50)
4. **Validation**:
   - `page` must be ≥ 1 → 400 if invalid
   - `limit` must be ≥ 1 → 400 if invalid
   - `limit` > 50 is capped at 50
5. **Database Queries**:
   - `findMany()` with `skip` and `take` for pagination
   - `orderBy: { createdAt: "desc" }` for newest first
   - `count()` for total number of images
6. **Response Processing**:
   - Calculate `totalPages = Math.ceil(total / limit)`
   - Return `{ images: [...], total, page, totalPages }`
7. **Display**: Frontend renders image grid with pagination controls

### Error Handling

- **400 Bad Request**: Invalid page or limit parameters
- **500 Internal Server Error**: Database query errors
- Empty database returns `{ images: [], total: 0, page: 1, totalPages: 0 }`

---

## 4. Hearts Update Flow

**Purpose**: Update the hearts (likes) count for an image when user clicks the heart button.

### Flow Diagram

```
[Heart Button Click]
    ↓
[Optimistic UI Update]
    ├─ Immediately increment hearts in UI
    └─ Disable button (show loading state)
    ↓
PUT /api/feed
    Body: { id, hearts: currentHearts + 1 }
    ↓
[Validation Layer]
    ├─ Check id exists and is number
    ├─ Check hearts exists and is number
    └─ Check hearts ≥ 0
    ↓
[Database Check]
    prisma.publishedImage.findUnique({ where: { id } })
    ↓ (if exists)
[Atomic Update]
    prisma.publishedImage.update({ where: { id }, data: { hearts } })
    ↓
[Response: 200 OK]
    Return updated image object
    ↓
[UI Update]
    Update with actual response data
```

### Detailed Steps

1. **User Action**: User clicks heart button on an image card
2. **Optimistic Update**: 
   - Immediately increment hearts count in UI (before API call)
   - Disable button to prevent double-clicks
   - Show loading/disabled state
3. **Client Request**: Frontend sends PUT to `/api/feed` with `{ id, hearts: newValue }`
4. **Validation**: API validates:
   - `id` exists, is number → 400 if invalid
   - `hearts` exists, is number, ≥ 0 → 400 if invalid
5. **Existence Check**: 
   - `findUnique({ where: { id } })` → 404 if not found
6. **Atomic Update**: 
   - `update({ where: { id }, data: { hearts } })` 
   - Prevents race conditions with concurrent updates
7. **Response**: Returns updated image object with new hearts count
8. **UI Update**: 
   - If success: Update UI with actual response (in case of conflicts)
   - If error: Revert optimistic update and show error message

### Error Handling

- **400 Bad Request**: Invalid `id` or `hearts` parameters
- **404 Not Found**: Image ID doesn't exist in database
- **500 Internal Server Error**: Database update errors
- On error: Revert optimistic update and show error message

---

## Data Models

### PublishedImage

```javascript
{
  id: number,           // Auto-increment, primary key
  imageUrl: string,     // Required, mapped to image_url
  prompt: string,       // Required
  hearts: number,       // Default: 0
  createdAt: Date       // Auto-generated, mapped to created_at
}
```

---

## Database Operations

### Create (Publish)
```javascript
prisma.publishedImage.create({
  data: { imageUrl, prompt }
})
```

### Read (Feed)
```javascript
prisma.publishedImage.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" }
})

prisma.publishedImage.count()
```

### Update (Hearts)
```javascript
prisma.publishedImage.update({
  where: { id },
  data: { hearts }
})
```

---

## External Services

### OpenAI DALL·E 2 API

- **Endpoint**: `https://api.openai.com/v1/images/generations`
- **Authentication**: Bearer token via `OPENAI_API_KEY`
- **Model**: `dall-e-2`
- **Size**: `512x512`
- **Response**: `{ data: [{ url: "..." }] }`

### Neon PostgreSQL

- **Type**: Serverless PostgreSQL
- **ORM**: Prisma with Neon adapter
- **Connection**: Pool-based (not Client) for connection pooling
- **SSL**: Required (`?sslmode=require`)

---

## Error Propagation

All errors follow this pattern:

1. **Catch**: Try-catch blocks in API routes
2. **Log**: `console.error()` for debugging
3. **Response**: Return appropriate HTTP status code with error message
4. **Display**: Frontend shows error message to user
5. **Recovery**: User can retry or take corrective action

---

## Performance Considerations

- **Connection Pooling**: Uses Neon Pool adapter for efficient database connections
- **Pagination**: Limits results to prevent large data transfers
- **Optimistic UI**: Immediate feedback for hearts updates
- **Caching**: Consider adding caching for feed data in production
- **Rate Limiting**: OpenAI API has rate limits; consider implementing client-side throttling

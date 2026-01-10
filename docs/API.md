# API Documentation

Complete API reference for the Generative Instagram with AI application.

## Base URL

All API endpoints are prefixed with `/api`

## Endpoints

### 1. POST /api/generate

Generate an AI image using OpenAI's DALL·E 2 API.

#### Request

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "prompt": "string (required)"
}
```

**Validation Rules**:
- `prompt` is required (cannot be `undefined` or `null`)
- `prompt` must be a string type
- `prompt` cannot be an empty string (after trimming)

#### Success Response

**Status Code**: `200 OK`

**Body**:
```json
{
  "imageUrl": "https://example.com/generated-image.jpg",
  "prompt": "A beautiful sunset over mountains"
}
```

#### Error Responses

**Status Code**: `400 Bad Request`

Missing prompt:
```json
{
  "error": "Prompt is required"
}
```

Empty prompt:
```json
{
  "error": "Prompt cannot be empty"
}
```

Non-string prompt:
```json
{
  "error": "Prompt must be a string"
}
```

**Status Code**: `500 Internal Server Error`

OpenAI API error:
```json
{
  "error": "Failed to generate image with OpenAI"
}
```

Missing API key:
```json
{
  "error": "OpenAI API key is not configured"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A serene landscape with mountains at sunset"}'
```

#### Example Response

```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/private/...",
  "prompt": "A serene landscape with mountains at sunset"
}
```

---

### 2. POST /api/publish

Publish a generated image to the community feed.

#### Request

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "imageUrl": "string (required)",
  "prompt": "string (required)"
}
```

**Validation Rules**:
- `imageUrl` is required (cannot be `undefined` or `null`)
- `imageUrl` must be a string type
- `imageUrl` cannot be an empty string (after trimming)
- `prompt` is required (cannot be `undefined` or `null`)
- `prompt` must be a string type
- `prompt` can be empty string (edge case allowed)

#### Success Response

**Status Code**: `201 Created`

**Body**:
```json
{
  "id": 1,
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "A beautiful landscape",
  "hearts": 0,
  "createdAt": "2024-01-09T12:00:00.000Z"
}
```

#### Error Responses

**Status Code**: `400 Bad Request`

Missing imageUrl:
```json
{
  "error": "imageUrl is required"
}
```

Missing prompt:
```json
{
  "error": "prompt is required"
}
```

Empty imageUrl:
```json
{
  "error": "imageUrl cannot be empty"
}
```

Invalid types:
```json
{
  "error": "imageUrl must be a string"
}
```

**Status Code**: `500 Internal Server Error`

Database error:
```json
{
  "error": "Failed to publish image"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/publish \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/generated-image.jpg",
    "prompt": "A serene landscape with mountains at sunset"
  }'
```

#### Example Response

```json
{
  "id": 42,
  "imageUrl": "https://example.com/generated-image.jpg",
  "prompt": "A serene landscape with mountains at sunset",
  "hearts": 0,
  "createdAt": "2024-01-09T15:30:45.123Z"
}
```

---

### 3. GET /api/feed

Retrieve a paginated list of published images from the feed.

#### Request

**Method**: `GET`

**Query Parameters**:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (must be ≥ 1) |
| `limit` | integer | 10 | 50 | Items per page (must be ≥ 1, capped at 50) |

#### Success Response

**Status Code**: `200 OK`

**Body**:
```json
{
  "images": [
    {
      "id": 3,
      "imageUrl": "https://example.com/image3.jpg",
      "prompt": "Latest image",
      "hearts": 5,
      "createdAt": "2024-01-09T16:00:00.000Z"
    },
    {
      "id": 2,
      "imageUrl": "https://example.com/image2.jpg",
      "prompt": "Second image",
      "hearts": 2,
      "createdAt": "2024-01-09T15:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

**Response Fields**:
- `images`: Array of image objects (ordered by `createdAt` descending, newest first)
- `total`: Total number of images in database
- `page`: Current page number
- `totalPages`: Total number of pages (calculated as `Math.ceil(total / limit)`)

#### Error Responses

**Status Code**: `400 Bad Request`

Invalid page:
```json
{
  "error": "Invalid page parameter"
}
```

Invalid limit:
```json
{
  "error": "Invalid limit parameter"
}
```

**Status Code**: `500 Internal Server Error`

Database error:
```json
{
  "error": "Failed to fetch feed"
}
```

#### Example Requests

Get first page (default):
```bash
curl http://localhost:3000/api/feed
```

Get second page with 5 items:
```bash
curl "http://localhost:3000/api/feed?page=2&limit=5"
```

#### Example Response

```json
{
  "images": [
    {
      "id": 10,
      "imageUrl": "https://example.com/image10.jpg",
      "prompt": "Newest image",
      "hearts": 12,
      "createdAt": "2024-01-09T17:00:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "totalPages": 1
}
```

**Note**: If `limit` exceeds 50, it is automatically capped at 50.

---

### 4. PUT /api/feed

Update the hearts count for a published image.

#### Request

**Method**: `PUT`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "id": "number (required)",
  "hearts": "number (required, non-negative integer)"
}
```

**Validation Rules**:
- `id` is required (cannot be `undefined` or `null`)
- `id` must be a number type
- `hearts` is required (cannot be `undefined` or `null`)
- `hearts` must be a number type
- `hearts` must be non-negative (≥ 0)
- `hearts` can be 0

#### Success Response

**Status Code**: `200 OK`

**Body**:
```json
{
  "id": 1,
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "A beautiful landscape",
  "hearts": 15,
  "createdAt": "2024-01-09T12:00:00.000Z"
}
```

#### Error Responses

**Status Code**: `400 Bad Request`

Missing id:
```json
{
  "error": "id is required"
}
```

Missing hearts:
```json
{
  "error": "hearts is required"
}
```

Invalid id type:
```json
{
  "error": "id must be a number"
}
```

Invalid hearts type:
```json
{
  "error": "hearts must be a number"
}
```

Negative hearts:
```json
{
  "error": "hearts must be non-negative"
}
```

**Status Code**: `404 Not Found`

Image not found:
```json
{
  "error": "Image not found"
}
```

**Status Code**: `500 Internal Server Error`

Database error:
```json
{
  "error": "Failed to update hearts"
}
```

#### Example Request

```bash
curl -X PUT http://localhost:3000/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "hearts": 10
  }'
```

#### Example Response

```json
{
  "id": 1,
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "A beautiful landscape",
  "hearts": 10,
  "createdAt": "2024-01-09T12:00:00.000Z"
}
```

**Note**: This is an atomic update operation that prevents race conditions.

---

## Status Code Summary

| Status Code | Usage |
|-------------|-------|
| `200 OK` | Successful GET or PUT request |
| `201 Created` | Successful POST request that created a resource |
| `400 Bad Request` | Invalid request parameters or validation errors |
| `404 Not Found` | Resource not found (e.g., image ID doesn't exist) |
| `500 Internal Server Error` | Server error (database, API, or unexpected errors) |

## Common Patterns

### Pagination

All pagination follows the pattern:
- `skip = (page - 1) * limit`
- `totalPages = Math.ceil(total / limit)`
- Results are ordered by `createdAt` descending (newest first)

### Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Human-readable error message"
}
```

Errors are logged to the console for debugging.

### Validation

All endpoints validate input types and required fields before processing. Invalid inputs return `400 Bad Request` with descriptive error messages.

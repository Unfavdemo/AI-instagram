# Setup Guide - Quick Start

Follow these steps to get the project running:

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

**Important**: 
- Your `DATABASE_URL` must include `?sslmode=require`
- Get your Neon database URL from your Neon dashboard
- Get your OpenAI API key from https://platform.openai.com/api-keys

## 3. Initialize Database

Generate Prisma Client:

```bash
npx prisma generate
```

Create and apply migration:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the `published_images` table
- Set up all required fields and constraints
- Generate the Prisma Client

## 4. Verify Setup

Run tests to verify everything works:

```bash
pnpm test
```

All tests should pass. If any fail, check:
- Your `.env` file has correct `DATABASE_URL`
- Your database is accessible and not hibernated
- Prisma Client is generated (`npx prisma generate`)

## 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Common Issues

### Prisma Client not found
```bash
npx prisma generate
```

### Database connection errors
- Check `DATABASE_URL` includes `?sslmode=require`
- Verify database is active in Neon dashboard
- Test connection: `npx prisma db push`

### OpenAI API errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has DALL·E 2 access
- Ensure account has credits

### Tests failing
- Ensure `.env` file exists in project root
- Run `npx prisma generate` first
- Check database connection is working

## Next Steps

1. Visit `/generate` to create AI images
2. Visit `/feed` to see published images
3. Test the hearts feature by clicking heart icons
4. Check pagination works on the feed page

## Project Structure

- `app/api/` - API routes (generate, publish, feed)
- `app/generate/` - Image generation page
- `app/feed/` - Feed page with pagination
- `prisma/schema.prisma` - Database schema
- `lib/prisma.js` - Prisma client configuration
- `tests/` - Test files

For more details, see [README.md](./README.md).

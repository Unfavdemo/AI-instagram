-- Create posts table to store AI-generated images
-- Note: Run 002_create_users_table.sql first to create the users table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Create index on created_at for sorting feed by date
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Add foreign key constraint after users table is created
-- This will be handled in 002_create_users_table.sql

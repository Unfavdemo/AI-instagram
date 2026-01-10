-- Create users table for NextAuth authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update posts table to make user_id nullable initially (for backward compatibility)
-- If you want to require user_id, you can change this
ALTER TABLE posts ALTER COLUMN user_id DROP NOT NULL;

-- Add foreign key constraint if it doesn't exist
-- Note: This might fail if the constraint already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_posts_user_id'
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT fk_posts_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;
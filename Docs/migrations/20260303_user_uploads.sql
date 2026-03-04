-- Migration: user_uploads table
-- Date: 2026-03-03
-- Purpose: Persist reference image uploads so users can reuse them across chats

CREATE TABLE user_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  filename TEXT,
  file_size INTEGER,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_uploads_user_date
ON user_uploads(user_id, created_at DESC);

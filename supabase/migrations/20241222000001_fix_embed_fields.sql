-- Fix embed fields in shared_links table
-- This migration ensures the embed fields exist and handles any existing data

-- First, check if the columns exist and add them if they don't
DO $$
BEGIN
    -- Add embed_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shared_links' 
        AND column_name = 'embed_type'
    ) THEN
        ALTER TABLE shared_links ADD COLUMN embed_type TEXT;
        COMMENT ON COLUMN shared_links.embed_type IS 'Type of embed: youtube, twitter, spotify, soundcloud, codepen, figma, canva';
    END IF;
    
    -- Add embed_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shared_links' 
        AND column_name = 'embed_data'
    ) THEN
        ALTER TABLE shared_links ADD COLUMN embed_data JSONB;
        COMMENT ON COLUMN shared_links.embed_data IS 'JSON data containing embed information like video_id, tweet_id, etc.';
    END IF;
END $$;

-- Enable realtime for shared_links table (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'shared_links'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE shared_links;
    END IF;
END $$;

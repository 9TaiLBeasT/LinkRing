-- Add embed fields to shared_links table
ALTER TABLE shared_links 
ADD COLUMN IF NOT EXISTS embed_type TEXT,
ADD COLUMN IF NOT EXISTS embed_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN shared_links.embed_type IS 'Type of embed: youtube, twitter, spotify, soundcloud, codepen, figma, canva';
COMMENT ON COLUMN shared_links.embed_data IS 'JSON data containing embed information like video_id, tweet_id, etc.';

-- Enable realtime for shared_links table (only if not already added)
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'shared_links'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE shared_links;
    END IF;
END $;

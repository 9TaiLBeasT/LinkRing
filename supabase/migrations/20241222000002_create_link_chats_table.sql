-- Create link_chats table for ephemeral chat functionality
-- Messages expire after 16 hours from link creation

-- Create the link_chats table
CREATE TABLE IF NOT EXISTS link_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    link_id UUID NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_link_chats_link_id ON link_chats(link_id);
CREATE INDEX IF NOT EXISTS idx_link_chats_created_at ON link_chats(created_at);
CREATE INDEX IF NOT EXISTS idx_link_chats_user_id ON link_chats(user_id);

-- Enable Row Level Security
ALTER TABLE link_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see chat messages for links in rings they are members of
-- and only if the message is within 16 hours of the link creation
CREATE POLICY "Users can view link chats for their rings" ON link_chats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_links sl
            JOIN ring_members rm ON sl.ring_id = rm.ring_id
            WHERE sl.id = link_chats.link_id
            AND rm.user_id = auth.uid()
            AND link_chats.created_at >= sl.created_at
            AND link_chats.created_at <= sl.created_at + INTERVAL '16 hours'
        )
    );

-- Users can insert chat messages for links in rings they are members of
-- and only if the link is within 16 hours of creation
CREATE POLICY "Users can send messages to link chats in their rings" ON link_chats
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM shared_links sl
            JOIN ring_members rm ON sl.ring_id = rm.ring_id
            WHERE sl.id = link_chats.link_id
            AND rm.user_id = auth.uid()
            AND NOW() <= sl.created_at + INTERVAL '16 hours'
        )
    );

-- Users can update their own messages (within 5 minutes of creation)
CREATE POLICY "Users can edit their own messages" ON link_chats
    FOR UPDATE
    USING (
        user_id = auth.uid()
        AND created_at >= NOW() - INTERVAL '5 minutes'
        AND EXISTS (
            SELECT 1 FROM shared_links sl
            JOIN ring_members rm ON sl.ring_id = rm.ring_id
            WHERE sl.id = link_chats.link_id
            AND rm.user_id = auth.uid()
        )
    );

-- Users can delete their own messages (within 5 minutes of creation)
CREATE POLICY "Users can delete their own messages" ON link_chats
    FOR DELETE
    USING (
        user_id = auth.uid()
        AND created_at >= NOW() - INTERVAL '5 minutes'
        AND EXISTS (
            SELECT 1 FROM shared_links sl
            JOIN ring_members rm ON sl.ring_id = rm.ring_id
            WHERE sl.id = link_chats.link_id
            AND rm.user_id = auth.uid()
        )
    );

-- Enable realtime for link_chats table
ALTER PUBLICATION supabase_realtime ADD TABLE link_chats;

-- Create a function to clean up expired chat messages
CREATE OR REPLACE FUNCTION cleanup_expired_link_chats()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete messages that are older than 16 hours from their link's creation
    DELETE FROM link_chats
    WHERE id IN (
        SELECT lc.id
        FROM link_chats lc
        JOIN shared_links sl ON lc.link_id = sl.id
        WHERE lc.created_at < sl.created_at + INTERVAL '16 hours'
        AND lc.created_at < NOW() - INTERVAL '16 hours'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to the function
COMMENT ON FUNCTION cleanup_expired_link_chats() IS 'Cleans up chat messages that are older than 16 hours from their link creation time';

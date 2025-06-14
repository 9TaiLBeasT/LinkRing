-- Create function to clean up expired chat messages (older than 16 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_link_chats()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete messages older than 16 hours
  DELETE FROM link_chats 
  WHERE created_at < NOW() - INTERVAL '16 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup every hour
-- Note: This requires pg_cron extension which may not be available in all Supabase plans
-- Alternative: Use Supabase Edge Functions with cron triggers

-- Grant execute permission to authenticated users (for manual cleanup if needed)
GRANT EXECUTE ON FUNCTION cleanup_expired_link_chats() TO authenticated;

-- Add comment
COMMENT ON FUNCTION cleanup_expired_link_chats() IS 'Cleans up chat messages older than 16 hours to maintain database performance';

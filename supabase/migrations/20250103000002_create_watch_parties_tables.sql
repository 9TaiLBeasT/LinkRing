-- Create watch_parties table
CREATE TABLE IF NOT EXISTS watch_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 hours'),
  is_active BOOLEAN DEFAULT true,
  ring_id UUID,
  invite_code TEXT UNIQUE,
  current_time_position REAL DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  embed_type TEXT,
  embed_data JSONB,
  viewer_count INTEGER DEFAULT 0,
  CONSTRAINT fk_watch_parties_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_watch_parties_ring_id FOREIGN KEY (ring_id) REFERENCES rings(id) ON DELETE SET NULL
);

-- Create watch_party_messages table
CREATE TABLE IF NOT EXISTS watch_party_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'reaction')),
  CONSTRAINT fk_watch_party_messages_party_id FOREIGN KEY (party_id) REFERENCES watch_parties(id) ON DELETE CASCADE,
  CONSTRAINT fk_watch_party_messages_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create watch_party_users table (for tracking active viewers)
CREATE TABLE IF NOT EXISTS watch_party_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  party_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT fk_watch_party_users_party_id FOREIGN KEY (party_id) REFERENCES watch_parties(id) ON DELETE CASCADE,
  CONSTRAINT fk_watch_party_users_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, party_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watch_parties_owner_id ON watch_parties(owner_id);
CREATE INDEX IF NOT EXISTS idx_watch_parties_is_public ON watch_parties(is_public);
CREATE INDEX IF NOT EXISTS idx_watch_parties_is_active ON watch_parties(is_active);
CREATE INDEX IF NOT EXISTS idx_watch_parties_category ON watch_parties(category);
CREATE INDEX IF NOT EXISTS idx_watch_parties_created_at ON watch_parties(created_at);
CREATE INDEX IF NOT EXISTS idx_watch_party_messages_party_id ON watch_party_messages(party_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_messages_user_id ON watch_party_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_messages_created_at ON watch_party_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_watch_party_users_party_id ON watch_party_users(party_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_users_user_id ON watch_party_users(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_users_user_id_active ON watch_party_users(user_id, is_active);

-- Function to generate unique invite codes for watch parties
CREATE OR REPLACE FUNCTION generate_watch_party_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM watch_parties WHERE invite_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired watch parties
CREATE OR REPLACE FUNCTION cleanup_expired_watch_parties()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired watch parties
  DELETE FROM watch_parties 
  WHERE expires_at < NOW() OR is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update viewer count
CREATE OR REPLACE FUNCTION update_watch_party_viewer_count(party_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  -- Count active viewers in the last 30 seconds
  SELECT COUNT(*) INTO count
  FROM watch_party_users 
  WHERE party_id = party_uuid 
    AND is_active = true 
    AND last_seen > (NOW() - INTERVAL '30 seconds');
  
  -- Update the watch party viewer count
  UPDATE watch_parties 
  SET viewer_count = count 
  WHERE id = party_uuid;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for watch party tables
ALTER PUBLICATION supabase_realtime ADD TABLE watch_parties;
ALTER PUBLICATION supabase_realtime ADD TABLE watch_party_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE watch_party_users;

CREATE TABLE IF NOT EXISTS saved_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  link_id UUID REFERENCES shared_links(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, link_id)
);

alter publication supabase_realtime add table saved_links;

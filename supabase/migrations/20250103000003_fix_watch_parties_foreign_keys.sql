-- This migration is now redundant since the foreign keys are added in the main migration
-- But we'll keep it to ensure the constraints exist if they were missed

-- Add foreign key constraint for owner_id to users table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watch_parties') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_watch_parties_owner_id'
            AND table_name = 'watch_parties'
        ) THEN
            ALTER TABLE watch_parties 
            ADD CONSTRAINT fk_watch_parties_owner_id 
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END
$$;

-- Add foreign key constraints for user_id in watch_party_messages if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watch_party_messages') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_watch_party_messages_user_id'
            AND table_name = 'watch_party_messages'
        ) THEN
            ALTER TABLE watch_party_messages 
            ADD CONSTRAINT fk_watch_party_messages_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END
$$;

-- Add foreign key constraints for user_id in watch_party_users if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watch_party_users') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_watch_party_users_user_id'
            AND table_name = 'watch_party_users'
        ) THEN
            ALTER TABLE watch_party_users 
            ADD CONSTRAINT fk_watch_party_users_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END
$$;

-- Create additional indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_watch_party_messages_user_id ON watch_party_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_users_user_id_active ON watch_party_users(user_id, is_active);
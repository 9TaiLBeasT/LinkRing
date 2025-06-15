-- Add username field to users table
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;

-- Create index for faster username lookups
CREATE INDEX idx_users_username ON users(username);

-- Add constraint to ensure username is lowercase and alphanumeric with underscores
ALTER TABLE users ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$');

-- Add constraint for minimum username length
ALTER TABLE users ADD CONSTRAINT username_length CHECK (length(username) >= 3);

-- Update existing users with temporary usernames based on their email or full_name
UPDATE users 
SET username = CASE 
  WHEN email IS NOT NULL THEN 
    lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9]', '_', 'g'))
  WHEN full_name IS NOT NULL THEN 
    lower(regexp_replace(full_name, '[^a-z0-9]', '_', 'g'))
  ELSE 
    'user_' || substr(id::text, 1, 8)
END
WHERE username IS NULL;

-- Handle duplicate usernames by appending numbers
WITH duplicate_usernames AS (
  SELECT username, 
         ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
  FROM users 
  WHERE username IS NOT NULL
)
UPDATE users 
SET username = users.username || '_' || (duplicate_usernames.rn - 1)
FROM duplicate_usernames 
WHERE users.username = duplicate_usernames.username 
  AND duplicate_usernames.rn > 1;

-- Make username NOT NULL after populating existing records
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Add comment
COMMENT ON COLUMN users.username IS 'Unique username for user identification, lowercase alphanumeric with underscores only';

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL
);

-- Optional: Add indexes for commonly queried fields
CREATE INDEX idx_users_email ON users(email);

-- Optional: Add unique constraint on email if needed
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Optional: Add comments to document the table
COMMENT ON TABLE users IS 'Table storing user information';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.name IS 'User''s name';
COMMENT ON COLUMN users.email IS 'User''s email address';
COMMENT ON COLUMN users.password IS 'User''s hashed password';

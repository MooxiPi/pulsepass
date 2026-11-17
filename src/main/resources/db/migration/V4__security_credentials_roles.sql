CREATE TABLE user_credentials (
 user_id BIGINT PRIMARY KEY REFERENCES users(id),
 password_hash VARCHAR(100) NOT NULL
);
CREATE TABLE user_roles (
 user_id BIGINT NOT NULL REFERENCES users(id),
 role VARCHAR(16) NOT NULL CHECK (role IN ('USER', 'STAFF', 'ADMIN')),
 PRIMARY KEY (user_id, role)
);
-- Existing users intentionally have no credential: no shared or default password.

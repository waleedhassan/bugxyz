CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_bug_id ON comments(bug_id);

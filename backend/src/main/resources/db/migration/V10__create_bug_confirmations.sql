CREATE TABLE bug_confirmations (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    confirmed BOOLEAN NOT NULL,
    environment_id BIGINT REFERENCES environment_snapshots(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bug_id, user_id)
);

CREATE INDEX idx_bug_confirmations_bug_id ON bug_confirmations(bug_id);

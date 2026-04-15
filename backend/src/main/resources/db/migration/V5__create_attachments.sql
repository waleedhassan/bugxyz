CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    uploader_id BIGINT NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_bug_id ON attachments(bug_id);

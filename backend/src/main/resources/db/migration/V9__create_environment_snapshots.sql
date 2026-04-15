CREATE TABLE environment_snapshots (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    os VARCHAR(100),
    os_version VARCHAR(50),
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    device_type VARCHAR(50),
    screen_resolution VARCHAR(20),
    app_version VARCHAR(50),
    additional_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_environment_snapshots_bug_id ON environment_snapshots(bug_id);

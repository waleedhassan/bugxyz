CREATE TABLE bugs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    reporter_id BIGINT NOT NULL REFERENCES users(id),
    assignee_id BIGINT REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    bug_type VARCHAR(20) NOT NULL DEFAULT 'BUG',
    tags TEXT[] DEFAULT '{}',
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    affected_version VARCHAR(50),
    fixed_version VARCHAR(50),
    reproducibility_score DECIMAL(5,2) DEFAULT 0,
    predicted_severity VARCHAR(20),
    predicted_fix_hours DECIMAL(6,2),
    is_stale BOOLEAN NOT NULL DEFAULT FALSE,
    stale_since TIMESTAMPTZ,
    technical_debt BOOLEAN NOT NULL DEFAULT FALSE,
    debt_category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_bugs_project_id ON bugs(project_id);
CREATE INDEX idx_bugs_assignee_id ON bugs(assignee_id);
CREATE INDEX idx_bugs_reporter_id ON bugs(reporter_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);
CREATE INDEX idx_bugs_created_at ON bugs(created_at);
CREATE INDEX idx_bugs_tags ON bugs USING GIN(tags);
CREATE INDEX idx_bugs_fulltext ON bugs USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

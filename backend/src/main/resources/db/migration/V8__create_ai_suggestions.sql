CREATE TABLE ai_suggestions (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL,
    suggestion JSONB NOT NULL,
    confidence DECIMAL(5,2),
    is_accepted BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_suggestions_bug_id ON ai_suggestions(bug_id);

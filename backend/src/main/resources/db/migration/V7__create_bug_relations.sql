CREATE TABLE bug_relations (
    id BIGSERIAL PRIMARY KEY,
    source_bug_id BIGINT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    target_bug_id BIGINT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    relation_type VARCHAR(30) NOT NULL,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_bug_id, target_bug_id, relation_type)
);

CREATE INDEX idx_bug_relations_source ON bug_relations(source_bug_id);
CREATE INDEX idx_bug_relations_target ON bug_relations(target_bug_id);

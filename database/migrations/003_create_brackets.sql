-- Migration: Create brackets table

CREATE TYPE bracket_status_type AS ENUM ('active', 'completed');

CREATE TABLE brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bracket_group bracket_group_type NOT NULL,
    status bracket_status_type DEFAULT 'active',
    current_round INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brackets_status ON brackets(status);

CREATE TRIGGER update_brackets_updated_at BEFORE UPDATE ON brackets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

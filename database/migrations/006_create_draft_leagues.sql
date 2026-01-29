-- Migration: Create draft_leagues table

CREATE TYPE league_status_type AS ENUM ('setup', 'drafting', 'active', 'completed');
CREATE TYPE scoring_type AS ENUM ('bracket_based', 'custom');

CREATE TABLE draft_leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    status league_status_type DEFAULT 'setup',
    max_teams INTEGER DEFAULT 8,
    episodes_per_team INTEGER DEFAULT 10,
    scoring_type scoring_type DEFAULT 'bracket_based',
    current_draft_pick INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

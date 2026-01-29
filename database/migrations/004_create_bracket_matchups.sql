-- Migration: Create bracket_matchups table

CREATE TYPE matchup_status_type AS ENUM ('pending', 'active', 'completed');

CREATE TABLE bracket_matchups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bracket_id UUID NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    matchup_position INTEGER NOT NULL,
    episode1_id UUID REFERENCES episodes(id),
    episode2_id UUID REFERENCES episodes(id),
    winner_episode_id UUID REFERENCES episodes(id),
    status matchup_status_type DEFAULT 'pending',
    vote_count_ep1 INTEGER DEFAULT 0,
    vote_count_ep2 INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bracket_id, round_number, matchup_position)
);

CREATE INDEX idx_matchups_bracket ON bracket_matchups(bracket_id);
CREATE INDEX idx_matchups_status ON bracket_matchups(status);

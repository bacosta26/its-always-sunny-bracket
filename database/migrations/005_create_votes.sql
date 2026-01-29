-- Migration: Create votes table

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matchup_id UUID NOT NULL REFERENCES bracket_matchups(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, matchup_id)
);

CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_matchup ON votes(matchup_id);

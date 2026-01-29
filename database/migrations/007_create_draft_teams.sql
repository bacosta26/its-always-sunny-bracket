-- Migration: Create draft_teams table

CREATE TABLE draft_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES draft_leagues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    team_name VARCHAR(255) NOT NULL,
    draft_position INTEGER NOT NULL,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, user_id),
    UNIQUE(league_id, team_name),
    UNIQUE(league_id, draft_position)
);

CREATE INDEX idx_draft_teams_league ON draft_teams(league_id);

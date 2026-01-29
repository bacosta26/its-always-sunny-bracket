-- Migration: Create draft_picks table

CREATE TABLE draft_picks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES draft_leagues(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES draft_teams(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id),
    pick_number INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, episode_id),
    UNIQUE(league_id, pick_number)
);

CREATE INDEX idx_draft_picks_league ON draft_picks(league_id);
CREATE INDEX idx_draft_picks_team ON draft_picks(team_id);

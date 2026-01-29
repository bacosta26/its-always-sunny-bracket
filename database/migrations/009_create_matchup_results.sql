-- Migration: Create matchup_results table

CREATE TABLE matchup_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES draft_leagues(id) ON DELETE CASCADE,
    team1_id UUID NOT NULL REFERENCES draft_teams(id),
    team2_id UUID NOT NULL REFERENCES draft_teams(id),
    week_number INTEGER NOT NULL,
    team1_score INTEGER,
    team2_score INTEGER,
    winner_team_id UUID REFERENCES draft_teams(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, week_number, team1_id, team2_id)
);

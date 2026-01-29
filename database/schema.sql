-- Complete database schema for It's Always Sunny Brackets

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE bracket_group_type AS ENUM ('early', 'late');
CREATE TYPE bracket_status_type AS ENUM ('active', 'completed');
CREATE TYPE matchup_status_type AS ENUM ('pending', 'active', 'completed');
CREATE TYPE league_status_type AS ENUM ('setup', 'drafting', 'active', 'completed');
CREATE TYPE scoring_type AS ENUM ('bracket_based', 'custom');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Episodes table
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    description TEXT,
    air_date DATE,
    bracket_group bracket_group_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season_number, episode_number)
);

-- Brackets table
CREATE TABLE brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bracket_group bracket_group_type NOT NULL,
    status bracket_status_type DEFAULT 'active',
    current_round INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bracket matchups table
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

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matchup_id UUID NOT NULL REFERENCES bracket_matchups(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, matchup_id)
);

-- Draft leagues table
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

-- Draft teams table
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

-- Draft picks table
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

-- Matchup results table (for head-to-head draft competitions)
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

-- Create indexes for better query performance
CREATE INDEX idx_episodes_bracket_group ON episodes(bracket_group);
CREATE INDEX idx_episodes_season ON episodes(season_number);
CREATE INDEX idx_brackets_status ON brackets(status);
CREATE INDEX idx_matchups_bracket ON bracket_matchups(bracket_id);
CREATE INDEX idx_matchups_status ON bracket_matchups(status);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_matchup ON votes(matchup_id);
CREATE INDEX idx_draft_teams_league ON draft_teams(league_id);
CREATE INDEX idx_draft_picks_league ON draft_picks(league_id);
CREATE INDEX idx_draft_picks_team ON draft_picks(team_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brackets_updated_at BEFORE UPDATE ON brackets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

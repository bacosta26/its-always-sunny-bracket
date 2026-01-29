-- Migration: Create episodes table

CREATE TYPE bracket_group_type AS ENUM ('early', 'late');

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

CREATE INDEX idx_episodes_bracket_group ON episodes(bracket_group);
CREATE INDEX idx_episodes_season ON episodes(season_number);

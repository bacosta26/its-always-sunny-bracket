-- Add team flag column to draft_teams
ALTER TABLE draft_teams
ADD COLUMN team_flag VARCHAR(50) DEFAULT 'red-wine';

-- Valid flag options:
-- Chardee MacDennis themed: red-wine (Thundermen ⚡), white-wine (Golden Geese 🪿), golden-chalice (Electric Boogaloo 💃)
-- Show themed: kitten-mittens, greenman, aluminum-monster, cricket, rum-ham, fight-milk

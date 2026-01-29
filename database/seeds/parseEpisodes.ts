import * as fs from 'fs';
import * as path from 'path';

interface Episode {
  title: string;
  season: number;
  episode: number;
  bracketGroup: 'early' | 'late';
}

// Parse CSV files and generate episodes.json
function parseCSV(filePath: string, startSeason: number, bracketGroup: 'early' | 'late'): Episode[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  const episodes: Episode[] = [];

  // First line contains season headers
  const headers = lines[0].split(',');

  // Process each subsequent line (each line is an episode number)
  for (let i = 1; i < lines.length; i++) {
    const episodeTitles = lines[i].split(',');

    episodeTitles.forEach((title, seasonIndex) => {
      if (title && title.trim() && title.trim() !== '') {
        const season = startSeason + seasonIndex;
        episodes.push({
          title: title.trim(),
          season,
          episode: i,
          bracketGroup
        });
      }
    });
  }

  return episodes;
}

// Main execution
const earlySeasons = parseCSV(
  path.join(__dirname, '../../its_always_sunny_seasons_1_8.csv'),
  1,
  'early'
);

const lateSeasons = parseCSV(
  path.join(__dirname, '../../its_always_sunny_seasons_9_16.csv'),
  9,
  'late'
);

const allEpisodes = [...earlySeasons, ...lateSeasons];

// Sort by season and episode
allEpisodes.sort((a, b) => {
  if (a.season !== b.season) return a.season - b.season;
  return a.episode - b.episode;
});

// Write to JSON file
fs.writeFileSync(
  path.join(__dirname, 'episodes.json'),
  JSON.stringify(allEpisodes, null, 2)
);

console.log(`Generated ${allEpisodes.length} episodes`);
console.log(`Early seasons (1-8): ${earlySeasons.length} episodes`);
console.log(`Late seasons (9-16): ${lateSeasons.length} episodes`);

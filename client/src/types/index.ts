export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export type BracketGroup = 'early' | 'late';
export type BracketStatus = 'active' | 'completed';
export type MatchupStatus = 'pending' | 'active' | 'completed';

export interface Episode {
  id: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  description?: string;
  airDate?: string;
  bracketGroup: BracketGroup;
}

export interface Bracket {
  id: string;
  name: string;
  bracketGroup: BracketGroup;
  status: BracketStatus;
  currentRound: number;
}

export interface Matchup {
  id: string;
  bracketId: string;
  roundNumber: number;
  matchupPosition: number;
  episode1?: Episode;
  episode2?: Episode;
  winnerEpisode?: Episode;
  status: MatchupStatus;
  voteCountEp1: number;
  voteCountEp2: number;
  userVote?: string; // episode ID user voted for
}

export interface DraftLeague {
  id: string;
  name: string;
  status: 'setup' | 'drafting' | 'active' | 'completed';
  maxTeams: number;
  episodesPerTeam: number;
  currentDraftPick?: number;
}

export interface DraftTeam {
  id: string;
  leagueId: string;
  userId: string;
  teamName: string;
  draftPosition: number;
  totalScore: number;
}

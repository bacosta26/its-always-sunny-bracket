import api from './api';
import { Bracket, Matchup, BracketGroup } from '../types';

interface BracketDetailsResponse {
  bracket: Bracket;
  matchups: Matchup[];
}

interface CurrentRoundResponse {
  bracket: Bracket;
  matchups: Matchup[];
}

interface BracketStatusResponse {
  id: string;
  status: 'active' | 'completed';
  currentRound: number;
  updatedAt: string;
}

interface MatchupVoteResponse {
  matchup: {
    id: string;
    episode1?: {
      id: string;
      title: string;
      season_number: number;
      episode_number: number;
    };
    episode2?: {
      id: string;
      title: string;
      season_number: number;
      episode_number: number;
    };
    voteCountEp1: number;
    voteCountEp2: number;
    status: string;
    winner?: {
      id: string;
      title: string;
      season_number: number;
      episode_number: number;
    };
  };
  userVote: string | null;
}

// Transform snake_case API response to camelCase
const transformBracket = (bracket: any): Bracket => ({
  id: bracket.id,
  name: bracket.name,
  bracketGroup: bracket.bracket_group,
  status: bracket.status,
  currentRound: bracket.current_round,
});

export const bracketService = {
  async getAllBrackets() {
    const { data } = await api.get<{ brackets: any[] }>('/brackets');
    return data.brackets.map(transformBracket);
  },

  async getAllEpisodes() {
    const { data } = await api.get<{ episodes: any[] }>('/brackets/episodes');
    // Transform snake_case to camelCase
    return data.episodes.map(ep => ({
      id: ep.id,
      title: ep.title,
      seasonNumber: ep.season_number,
      episodeNumber: ep.episode_number,
      description: ep.description,
      airDate: ep.air_date,
      bracketGroup: ep.bracket_group,
    }));
  },

  async getBracketDetails(bracketId: string) {
    const { data } = await api.get<any>(`/brackets/${bracketId}`);
    return {
      bracket: transformBracket(data.bracket),
      matchups: data.matchups,
    };
  },

  async getCurrentRound(bracketId: string) {
    const { data } = await api.get<any>(`/brackets/${bracketId}/current`);
    return {
      bracket: transformBracket(data.bracket),
      matchups: data.matchups,
    };
  },

  async getCurrentRoundWithVotes(bracketId: string) {
    const { data } = await api.get<any>(`/brackets/${bracketId}/current-with-votes`);
    return {
      bracket: transformBracket(data.bracket),
      matchups: data.matchups,
    };
  },

  async getAllMatchupsWithVotes(bracketId: string) {
    const { data } = await api.get<any>(`/brackets/${bracketId}/all-matchups-with-votes`);
    return {
      bracket: transformBracket(data.bracket),
      matchups: data.matchups,
    };
  },

  async getBracketStatus(bracketId: string) {
    const { data } = await api.get<BracketStatusResponse>(`/brackets/${bracketId}/status`);
    return data;
  },

  async castVote(matchupId: string, episodeId: string) {
    const { data } = await api.post('/votes', { matchupId, episodeId });
    return data;
  },

  async getMatchupVotes(matchupId: string) {
    const { data } = await api.get<MatchupVoteResponse>(`/votes/matchup/${matchupId}`);
    return data;
  },

  async getUserVotes(userId: string) {
    const { data } = await api.get(`/votes/user/${userId}`);
    return data.votes;
  },
};

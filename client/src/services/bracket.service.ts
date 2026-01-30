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

export const bracketService = {
  async getAllBrackets() {
    const { data } = await api.get<{ brackets: Bracket[] }>('/brackets');
    return data.brackets;
  },

  async getBracketDetails(bracketId: string) {
    const { data } = await api.get<BracketDetailsResponse>(`/brackets/${bracketId}`);
    return data;
  },

  async getCurrentRound(bracketId: string) {
    const { data } = await api.get<CurrentRoundResponse>(`/brackets/${bracketId}/current`);
    return data;
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

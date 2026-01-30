import api from './api';

export interface DraftLeague {
  id: string;
  name: string;
  createdBy: string;
  status: 'setup' | 'drafting' | 'active' | 'completed';
  maxTeams: number;
  episodesPerTeam: number;
  scoringType: 'bracket_based' | 'custom';
  currentDraftPick?: number;
  createdAt: string;
}

export interface DraftTeam {
  id: string;
  leagueId: string;
  userId: string;
  teamName: string;
  draftPosition: number;
  totalScore: number;
}

export interface DraftPick {
  id: string;
  leagueId: string;
  teamId: string;
  episodeId: string;
  pickNumber: number;
  roundNumber: number;
  episode: {
    id: string;
    title: string;
    season_number: number;
    episode_number: number;
  };
}

export const draftService = {
  async createLeague(
    name: string,
    maxTeams: number = 8,
    episodesPerTeam: number = 10,
    scoringType: 'bracket_based' | 'custom' = 'bracket_based'
  ) {
    const { data } = await api.post('/drafts', {
      name,
      maxTeams,
      episodesPerTeam,
      scoringType,
    });
    return data.league as DraftLeague;
  },

  async getAllLeagues() {
    const { data } = await api.get<{ leagues: DraftLeague[] }>('/drafts');
    return data.leagues;
  },

  async getUserLeagues() {
    const { data } = await api.get<{ leagues: DraftLeague[] }>('/drafts/user');
    return data.leagues;
  },

  async getLeagueDetails(leagueId: string) {
    const { data } = await api.get<{
      league: DraftLeague;
      teams: DraftTeam[];
      picks: DraftPick[];
      currentPickingTeam: DraftTeam | null;
      availableEpisodeCount: number;
    }>(`/drafts/${leagueId}`);
    return data;
  },

  async joinLeague(leagueId: string, teamName: string) {
    const { data } = await api.post(`/drafts/${leagueId}/join`, { teamName });
    return data;
  },

  async startDraft(leagueId: string) {
    const { data } = await api.post(`/drafts/${leagueId}/start`);
    return data;
  },

  async makePick(leagueId: string, episodeId: string) {
    const { data } = await api.post(`/drafts/${leagueId}/pick`, { episodeId });
    return data;
  },

  async getCurrentState(leagueId: string) {
    const { data } = await api.get<{
      status: string;
      currentPick: number | null;
      currentPickingTeam: DraftTeam | null;
      pickCount: number;
    }>(`/drafts/${leagueId}/current`);
    return data;
  },

  async getTeamRoster(teamId: string) {
    const { data } = await api.get<{
      team: DraftTeam;
      picks: DraftPick[];
    }>(`/drafts/teams/${teamId}`);
    return data;
  },
};

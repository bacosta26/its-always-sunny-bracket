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

// Transform snake_case API response to camelCase
const transformLeague = (league: any): DraftLeague => ({
  id: league.id,
  name: league.name,
  createdBy: league.created_by,
  status: league.status,
  maxTeams: league.max_teams,
  episodesPerTeam: league.episodes_per_team,
  scoringType: league.scoring_type,
  currentDraftPick: league.current_draft_pick,
  createdAt: league.created_at,
});

const transformTeam = (team: any): DraftTeam => ({
  id: team.id,
  leagueId: team.league_id,
  userId: team.user_id,
  teamName: team.team_name,
  draftPosition: team.draft_position,
  totalScore: team.total_score,
});

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
    return transformLeague(data.league);
  },

  async getAllLeagues() {
    const { data } = await api.get<{ leagues: any[] }>('/drafts');
    return data.leagues.map(transformLeague);
  },

  async getUserLeagues() {
    const { data } = await api.get<{ leagues: any[] }>('/drafts/user');
    return data.leagues.map(transformLeague);
  },

  async getLeagueDetails(leagueId: string) {
    const { data } = await api.get<any>(`/drafts/${leagueId}`);
    return {
      league: transformLeague(data.league),
      teams: data.teams.map(transformTeam),
      picks: data.picks,
      currentPickingTeam: data.currentPickingTeam ? transformTeam(data.currentPickingTeam) : null,
      availableEpisodeCount: data.availableEpisodeCount,
    };
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
    const { data } = await api.get<any>(`/drafts/${leagueId}/current`);
    return {
      status: data.status,
      currentPick: data.currentPick,
      currentPickingTeam: data.currentPickingTeam ? transformTeam(data.currentPickingTeam) : null,
      pickCount: data.pickCount,
    };
  },

  async getTeamRoster(teamId: string) {
    const { data } = await api.get<any>(`/drafts/teams/${teamId}`);
    return {
      team: transformTeam(data.team),
      picks: data.picks,
    };
  },
};

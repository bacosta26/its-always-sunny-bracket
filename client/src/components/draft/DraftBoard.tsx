import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { draftService, DraftLeague, DraftTeam, DraftPick } from '../../services/draft.service';
import { Episode } from '../../types';
import { bracketService } from '../../services/bracket.service';
import { useAuth } from '../../context/AuthContext';
import { usePolling } from '../../hooks/usePolling';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

export const DraftBoard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [league, setLeague] = useState<DraftLeague | null>(null);
  const [teams, setTeams] = useState<DraftTeam[]>([]);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [currentPickingTeam, setCurrentPickingTeam] = useState<DraftTeam | null>(null);
  const [availableEpisodes, setAvailableEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [joining, setJoining] = useState(false);

  const userTeam = teams.find(t => t.userId === user?.userId);
  const isCreator = league?.createdBy === user?.userId;
  const isDrafting = league?.status === 'drafting';
  const isUserTurn = isDrafting && currentPickingTeam?.id === userTeam?.id;

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      const [leagueData, allEpisodes] = await Promise.all([
        draftService.getLeagueDetails(id),
        bracketService.getAllEpisodes ? bracketService.getAllEpisodes() : Promise.resolve([]),
      ]);

      setLeague(leagueData.league);
      setTeams(leagueData.teams);
      setPicks(leagueData.picks);
      setCurrentPickingTeam(leagueData.currentPickingTeam);

      // Filter out already picked episodes
      const pickedIds = new Set(leagueData.picks.map(p => p.episodeId));
      const available = allEpisodes.filter((ep: Episode) => !pickedIds.has(ep.id));
      setAvailableEpisodes(available);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load draft');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll every 5 seconds during draft
  usePolling(fetchData, 5000, isDrafting);

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setJoining(true);
    try {
      await draftService.joinLeague(id, teamName);
      toast.success('Joined league!');
      await fetchData();
      setTeamName('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join league');
    } finally {
      setJoining(false);
    }
  };

  const handleStartDraft = async () => {
    if (!id) return;

    try {
      await draftService.startDraft(id);
      toast.success('Draft started!');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start draft');
    }
  };

  const handleMakePick = async (episodeId: string) => {
    if (!id || !isUserTurn) return;

    try {
      await draftService.makePick(id, episodeId);
      toast.success('Pick made!');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to make pick');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!league) {
    return (
      <div className="container-custom py-12">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">League Not Found</h2>
          <button onClick={() => navigate('/drafts')} className="btn-primary">
            Back to Drafts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/drafts')} className="text-blue-600 hover:underline mb-4">
          ← Back to Drafts
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{league.name}</h1>
            <p className="text-gray-600">
              {teams.length} / {league.maxTeams} teams
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-full font-semibold ${
              league.status === 'setup'
                ? 'bg-gray-100 text-gray-800'
                : league.status === 'drafting'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {league.status === 'setup' ? 'Waiting for Teams' : league.status === 'drafting' ? 'Drafting!' : 'Active'}
          </div>
        </div>
      </div>

      {/* Join League Form */}
      {league.status === 'setup' && !userTeam && user && (
        <div className="card mb-8 bg-blue-50 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4">Join This League</h2>
          <form onSubmit={handleJoinLeague} className="flex gap-4">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Your Team Name"
              className="input-field flex-1"
              required
              minLength={3}
            />
            <button type="submit" disabled={joining} className="btn-primary">
              {joining ? 'Joining...' : 'Join League'}
            </button>
          </form>
        </div>
      )}

      {/* Start Draft Button */}
      {league.status === 'setup' && isCreator && teams.length >= 2 && (
        <div className="card mb-8 bg-green-50 border-2 border-green-200 text-center">
          <p className="mb-4">Ready to start! All teams can now draft.</p>
          <button onClick={handleStartDraft} className="btn-primary">
            Start Draft
          </button>
        </div>
      )}

      {/* Current Pick Info */}
      {isDrafting && currentPickingTeam && (
        <div className={`card mb-8 ${isUserTurn ? 'bg-yellow-100 border-4 border-yellow-400' : 'bg-gray-50'}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {isUserTurn ? '🎯 YOUR TURN TO PICK! 🎯' : 'Current Pick'}
            </h2>
            <p className="text-lg">
              <strong>{currentPickingTeam.teamName}</strong> is picking
            </p>
            <p className="text-gray-600">
              Pick #{league.currentDraftPick} (Round {Math.ceil((league.currentDraftPick || 1) / teams.length)})
            </p>
          </div>
        </div>
      )}

      {/* Teams */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Teams</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`p-4 rounded-lg border-2 ${
                team.id === currentPickingTeam?.id
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <h3 className="font-bold">{team.teamName}</h3>
              <p className="text-sm text-gray-600">Draft Position: {team.draftPosition}</p>
              <p className="text-sm text-gray-600">
                Picks: {picks.filter(p => p.teamId === team.id).length} / {league.episodesPerTeam}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Episodes (for drafting) */}
      {isDrafting && isUserTurn && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Episodes - Pick One!</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {availableEpisodes.map((episode) => (
              <button
                key={episode.id}
                onClick={() => handleMakePick(episode.id)}
                className="p-4 text-left rounded-lg border-2 border-gray-200 hover:border-sunny-yellow hover:bg-yellow-50 transition-all"
              >
                <h3 className="font-semibold">{episode.title}</h3>
                <p className="text-sm text-gray-600">
                  S{episode.seasonNumber}E{episode.episodeNumber}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Draft Picks History */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Draft Picks</h2>
        {picks.length === 0 ? (
          <p className="text-gray-600">No picks yet</p>
        ) : (
          <div className="space-y-2">
            {picks.slice().reverse().slice(0, 10).map((pick) => {
              const team = teams.find(t => t.id === pick.teamId);
              return (
                <div key={pick.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold">#{pick.pickNumber}</span> - {team?.teamName}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{pick.episode.title}</div>
                    <div className="text-sm text-gray-600">
                      S{pick.episode.season_number}E{pick.episode.episode_number}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { draftService, DraftLeague, DraftTeam, DraftPick } from '../../services/draft.service';
import { Episode } from '../../types';
import { bracketService } from '../../services/bracket.service';
import { useAuth } from '../../context/AuthContext';
import { usePolling } from '../../hooks/usePolling';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { FlagSelector } from './FlagSelector';
import { getFlagIcon } from '../../utils/flags';
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
  const [selectedFlag, setSelectedFlag] = useState('red-wine');
  const [joining, setJoining] = useState(false);

  const userTeam = teams.find(t => t.userId === user?.id);
  const isCreator = league?.createdBy === user?.id;
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
      await draftService.joinLeague(id, teamName, selectedFlag);
      toast.success('Joined league!');
      await fetchData();
      setTeamName('');
      setSelectedFlag('red-wine');
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
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #2d0000 100%)' }}>
        <div className="container-custom py-12">
          <div className="p-8 bg-gradient-to-br from-red-950 to-black border-4 border-yellow-600 rounded-lg text-center">
            <h2 className="text-3xl font-black text-yellow-300 mb-4">⚠️ GAME NOT FOUND ⚠️</h2>
            <button
              onClick={() => navigate('/drafts')}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-black rounded-lg"
            >
              ← RETURN TO GAMES
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentRound = Math.ceil((league.currentDraftPick || 1) / teams.length);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #2d0000 100%)' }}>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/drafts')}
            className="text-yellow-300 hover:text-yellow-200 mb-4 font-bold flex items-center gap-2"
          >
            ← RETURN TO GAME SELECTION
          </button>

          <div className="p-6 bg-gradient-to-br from-red-950 to-black border-4 border-yellow-600 rounded-lg shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-yellow-300 mb-2">{league.name}</h1>
                <p className="text-red-200 font-semibold">
                  Players: {teams.length} / {league.maxTeams} • Round {currentRound}
                </p>
              </div>

              <div
                className={`px-6 py-3 rounded-lg font-black border-2 ${
                  league.status === 'setup'
                    ? 'bg-gray-800 text-gray-300 border-gray-600'
                    : league.status === 'drafting'
                    ? 'bg-yellow-700 text-black border-yellow-500 animate-pulse'
                    : 'bg-red-700 text-yellow-300 border-red-500'
                }`}
              >
                {league.status === 'setup' ? '📋 LEVEL 1: SETUP' : league.status === 'drafting' ? '🍷 LEVEL 2: DRAFTING' : '⚔️ LEVEL 3: BATTLE'}
              </div>
            </div>
          </div>
        </div>

        {/* Join League Form */}
        {league.status === 'setup' && !userTeam && user && (
          <div className="p-8 bg-gradient-to-br from-black to-red-950 border-4 border-yellow-600 rounded-lg shadow-2xl mb-8">
            <h2 className="text-2xl font-black text-yellow-300 mb-4 text-center">⚔️ JOIN THIS GAME ⚔️</h2>
            <form onSubmit={handleJoinLeague} className="space-y-6">
              <div>
                <label className="block text-yellow-300 font-bold mb-3 text-lg">
                  👤 PLAYER NAME
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter Your Player Name"
                  className="w-full px-4 py-3 bg-black border-2 border-yellow-700 rounded-lg text-yellow-100 font-semibold focus:border-yellow-400 focus:outline-none"
                  required
                  minLength={3}
                />
              </div>

              <FlagSelector selectedFlag={selectedFlag} onFlagSelect={setSelectedFlag} />

              <button
                type="submit"
                disabled={joining}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-black text-yellow-300 font-black text-lg rounded-lg shadow-xl border-2 border-yellow-600 transition-all transform hover:scale-105"
              >
                {joining ? 'JOINING...' : '🍷 JOIN GAME 🍷'}
              </button>
            </form>
          </div>
        )}

        {/* Start Draft Button */}
        {league.status === 'setup' && isCreator && teams.length >= 2 && (
          <div className="p-6 bg-gradient-to-br from-green-950 to-black border-4 border-green-600 rounded-lg shadow-2xl mb-8 text-center">
            <p className="text-green-300 text-lg font-bold mb-4">✅ GAME READY - All players may now begin drafting</p>
            <button
              onClick={handleStartDraft}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-black font-black text-lg rounded-lg shadow-xl border-2 border-green-400"
            >
              🍷 BEGIN DRAFTING PHASE 🍷
            </button>
          </div>
        )}

        {/* Current Pick Info */}
        {isDrafting && currentPickingTeam && (
          <div
            className={`p-8 mb-8 rounded-lg shadow-2xl border-4 ${
              isUserTurn
                ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-400 animate-pulse'
                : 'bg-gradient-to-br from-red-950 to-black border-red-800'
            }`}
          >
            <div className="text-center">
              <h2 className="text-3xl font-black mb-3" style={{ color: isUserTurn ? '#000' : '#fcd34d' }}>
                {isUserTurn ? '⚡ YOUR TURN - MAKE YOUR SELECTION! ⚡' : '⏳ AWAITING SELECTION ⏳'}
              </h2>
              <p className="text-xl font-bold mb-2" style={{ color: isUserTurn ? '#7c2d12' : '#fca5a5' }}>
                <span className="text-2xl mr-2">{getFlagIcon(currentPickingTeam.teamFlag)}</span>
                <strong>{currentPickingTeam.teamName}</strong> is selecting
              </p>
              <p className="font-semibold" style={{ color: isUserTurn ? '#991b1b' : '#fecaca' }}>
                Pick #{league.currentDraftPick} • Round {currentRound}
              </p>
            </div>
          </div>
        )}

        {/* Teams - Game Board Style */}
        <div className="p-6 bg-gradient-to-br from-red-950 to-black border-4 border-yellow-600 rounded-lg shadow-2xl mb-8">
          <h2 className="text-2xl font-black text-yellow-300 mb-6 text-center border-b-2 border-yellow-600 pb-3">
            🎯 PLAYERS 🎯
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const teamPicks = picks.filter(p => p.teamId === team.id).length;
              const isActive = team.id === currentPickingTeam?.id;
              return (
                <div
                  key={team.id}
                  className={`p-5 rounded-lg border-4 transition-all ${
                    isActive
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-900 to-yellow-800 shadow-xl shadow-yellow-500/50'
                      : 'border-red-800 bg-gradient-to-br from-black to-red-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getFlagIcon(team.teamFlag)}</span>
                      <h3 className="font-black text-lg text-yellow-300">{team.teamName}</h3>
                    </div>
                    {isActive && <span className="text-2xl animate-pulse">🍷</span>}
                  </div>
                  <div className="text-red-200 text-sm space-y-1">
                    <p>Position: <span className="font-bold text-yellow-400">#{team.draftPosition}</span></p>
                    <p>
                      Selections: <span className="font-bold text-yellow-400">{teamPicks} / {league.episodesPerTeam}</span>
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 bg-red-950 rounded-full h-3 border border-red-800">
                    <div
                      className="bg-gradient-to-r from-yellow-600 to-yellow-500 h-full rounded-full transition-all"
                      style={{ width: `${(teamPicks / league.episodesPerTeam) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Episodes (for drafting) */}
        {isDrafting && isUserTurn && (
          <div className="p-6 bg-gradient-to-br from-black to-red-950 border-4 border-yellow-500 rounded-lg shadow-2xl mb-8">
            <h2 className="text-3xl font-black text-yellow-300 mb-6 text-center border-b-2 border-yellow-600 pb-3">
              📺 MAKE YOUR SELECTION 📺
            </h2>
            <p className="text-center text-yellow-200 mb-6 font-semibold italic">
              "Choose wisely. There are no do-overs."
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
              {availableEpisodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => handleMakePick(episode.id)}
                  className="p-4 text-left rounded-lg border-3 border-red-700 bg-gradient-to-br from-red-950 to-black hover:border-yellow-500 hover:from-yellow-900 hover:to-red-900 hover:scale-105 transition-all shadow-lg"
                >
                  <h3 className="font-bold text-yellow-300 mb-2">{episode.title}</h3>
                  <p className="text-sm text-red-300 font-semibold">
                    S{episode.seasonNumber}E{episode.episodeNumber}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Draft Picks History */}
        <div className="p-6 bg-gradient-to-br from-red-950 to-black border-4 border-yellow-600 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-black text-yellow-300 mb-6 text-center border-b-2 border-yellow-600 pb-3">
            📜 SELECTION HISTORY 📜
          </h2>
          {picks.length === 0 ? (
            <p className="text-red-300 text-center italic">No selections yet. The game begins...</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {picks.slice().reverse().slice(0, 10).map((pick) => {
                const team = teams.find(t => t.id === pick.teamId);
                return (
                  <div
                    key={pick.id}
                    className="p-4 bg-gradient-to-r from-black to-red-950 rounded-lg border-2 border-red-800 flex justify-between items-center hover:border-yellow-700 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-yellow-400">#{pick.pickNumber}</span>
                      {team && <span className="text-lg">{getFlagIcon(team.teamFlag)}</span>}
                      <span className="text-red-300 font-bold">{team?.teamName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-300">{pick.episode.title}</div>
                      <div className="text-sm text-red-400 font-semibold">
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
    </div>
  );
};

import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ClipboardList } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import CourtMap from '../components/court/CourtMap';
import Scoreboard from '../components/game/Scoreboard';
import PlayerSelector from '../components/game/PlayerSelector';
import { QuickStatPanel } from '../components/game/StatPanel';
import PlayByPlay from '../components/game/PlayByPlay';
import Modal from '../components/layout/Modal';
import { CourtZone, StatType, StatEvent, Team } from '../types';
import { getZone } from '../components/court/zones';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface PendingPlay {
  zone: CourtZone;
  x: number;
  y: number;
}

export default function LiveGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const game = state.games.find((g) => g.id === gameId);

  // Which team we're logging for (home/away)
  const [loggingTeamId, setLoggingTeamId] = useState<string>(() => game?.homeTeamId ?? '');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [pendingPlay, setPendingPlay] = useState<PendingPlay | null>(null);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);

  if (!game) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-ios-gray mb-4">Game not found</div>
          <button onClick={() => navigate('/')} className="text-ios-blue btn-press">Dashboard</button>
        </div>
      </div>
    );
  }

  if (game.status === 'final') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center card max-w-xs mx-4">
          <div className="text-2xl mb-2">Game Over</div>
          <div className="text-ios-gray text-sm mb-4">This game is finalized.</div>
          <button
            onClick={() => navigate(`/game/${game.id}/review`)}
            className="bg-ios-blue text-white px-6 py-2.5 rounded-full text-sm font-semibold btn-press"
          >
            View Box Score
          </button>
        </div>
      </div>
    );
  }

  const loggingTeam: Team = loggingTeamId === game.homeTeamId ? game.homeTeam : game.awayTeam;
  const selectedPlayer = loggingTeam.players.find((p) => p.id === selectedPlayerId) ?? null;

  const handleZoneSelect = useCallback((zone: CourtZone, x: number, y: number) => {
    setPendingPlay({ zone, x, y });
  }, []);

  const handleLogStat = useCallback((type: StatType) => {
    if (!selectedPlayer) {
      showToast('Select a player first', 'error');
      return;
    }

    const event: StatEvent = {
      id: generateId(),
      gameId: game.id,
      teamId: loggingTeamId,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      playerNumber: selectedPlayer.number,
      type,
      quarter: game.quarter,
      clockTime: game.clockTime,
      courtZone: pendingPlay?.zone,
      courtX: pendingPlay?.x,
      courtY: pendingPlay?.y,
      timestamp: Date.now(),
    };

    dispatch({ type: 'ADD_EVENT', gameId: game.id, event });

    const statLabel: Record<StatType, string> = {
      FGM: '2PT Made',
      FGA: '2PT Miss',
      '3PM': '3PT Made',
      '3PA': '3PT Miss',
      FTM: 'FT Made',
      FTA: 'FT Miss',
      AST: 'Assist',
      TO: 'Turnover',
      STL: 'Steal',
      BLK: 'Block',
      OREB: 'Off Reb',
      DREB: 'Def Reb',
      PF: 'Foul',
      TF: 'Tech Foul',
    };

    showToast(`${selectedPlayer.name} — ${statLabel[type]}`, 'success');
    setPendingPlay(null);
  }, [selectedPlayer, loggingTeamId, game, pendingPlay, dispatch, showToast]);

  const handleQuickStat = useCallback((type: StatType) => {
    if (!selectedPlayer) {
      showToast('Select a player first', 'error');
      return;
    }
    const event: StatEvent = {
      id: generateId(),
      gameId: game.id,
      teamId: loggingTeamId,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      playerNumber: selectedPlayer.number,
      type,
      quarter: game.quarter,
      clockTime: game.clockTime,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_EVENT', gameId: game.id, event });
    showToast(`${selectedPlayer.name} — ${type}`, 'success');
  }, [selectedPlayer, loggingTeamId, game, dispatch, showToast]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', gameId: game.id, eventId });
    showToast('Play removed', 'info');
  }, [game.id, dispatch, showToast]);

  const handlePrevQuarter = () => {
    if (game.quarter <= 1) return;
    dispatch({ type: 'UPDATE_GAME', game: { ...game, quarter: game.quarter - 1 } });
  };

  const handleNextQuarter = () => {
    dispatch({ type: 'UPDATE_GAME', game: { ...game, quarter: game.quarter + 1 } });
  };

  const handleClockChange = (clockTime: string) => {
    dispatch({ type: 'UPDATE_GAME', game: { ...game, clockTime } });
  };

  const handleEndGame = () => {
    setShowEndGameConfirm(true);
  };

  const confirmEndGame = () => {
    dispatch({ type: 'END_GAME', gameId: game.id });
    setShowEndGameConfirm(false);
    navigate(`/game/${game.id}/review`);
  };

  const pendingZoneInfo = pendingPlay ? getZone(pendingPlay.zone) : null;

  // Get stats relevant to zone
  const getZoneStats = (): Array<{ type: StatType; label: string; color: string; bg: string }> => {
    if (!pendingPlay) return [];
    const zone = getZone(pendingPlay.zone);
    if (!zone) return [];

    if (zone.is3pt) {
      return [
        { type: '3PM', label: '3PT Made', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
        { type: '3PA', label: '3PT Miss', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
      ];
    }
    if (zone.id === 'ft-line') {
      return [
        { type: 'FTM', label: 'FT Made', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
        { type: 'FTA', label: 'FT Miss', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
      ];
    }
    return [
      { type: 'FGM', label: '2PT Made', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
      { type: 'FGA', label: '2PT Miss', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
      { type: 'AST', label: 'Assist', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
      { type: 'OREB', label: 'Off Reb', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
      { type: 'DREB', label: 'Def Reb', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
    ];
  };

  return (
    <div className="h-full flex flex-col bg-surface-primary overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-ios-blue text-sm font-semibold btn-press"
        >
          <ChevronLeft size={18} />
          Home
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">Live</span>
        </div>
        <button
          onClick={() => navigate(`/game/${game.id}/review`)}
          className="flex items-center gap-1 text-ios-blue text-sm font-semibold btn-press"
        >
          <ClipboardList size={16} />
          Review
        </button>
      </div>

      {/* Scoreboard */}
      <div className="px-3 pb-2 shrink-0">
        <Scoreboard
          game={game}
          onPrevQuarter={handlePrevQuarter}
          onNextQuarter={handleNextQuarter}
          onEndGame={handleEndGame}
          onClockChange={handleClockChange}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Court — left panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 p-2 min-h-0">
            <div className="h-full rounded-2xl overflow-hidden relative">
              <CourtMap
                onZoneSelect={handleZoneSelect}
                activeZone={pendingPlay?.zone ?? null}
                className="w-full h-full"
              />
              {/* Zone tap hint */}
              {!pendingPlay && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-xs text-white/60 font-medium">Tap zone to log a play</span>
                </div>
              )}
            </div>
          </div>

          {/* Play by Play — below court on mobile */}
          <div className="h-32 overflow-y-auto scrollbar-hide px-3 pb-2 lg:hidden">
            <div className="text-xs font-bold text-ios-gray uppercase tracking-wider mb-1">Play by Play</div>
            <PlayByPlay
              events={game.events}
              game={game}
              onDelete={handleDeleteEvent}
              compact
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 flex flex-col shrink-0 overflow-hidden border-l border-separator">

          {/* Team Toggle */}
          <div className="px-3 pt-2 pb-2 shrink-0">
            <div className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-2">Logging for</div>
            <div className="flex gap-1.5">
              <button
                onClick={() => { setLoggingTeamId(game.awayTeamId); setSelectedPlayerId(null); }}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold btn-press transition-all ${
                  loggingTeamId === game.awayTeamId ? 'text-white' : 'bg-surface-tertiary text-ios-gray'
                }`}
                style={loggingTeamId === game.awayTeamId ? { backgroundColor: game.awayTeam.color } : {}}
              >
                ✈ {game.awayTeam.abbreviation}
              </button>
              <button
                onClick={() => { setLoggingTeamId(game.homeTeamId); setSelectedPlayerId(null); }}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold btn-press transition-all ${
                  loggingTeamId === game.homeTeamId ? 'text-white' : 'bg-surface-tertiary text-ios-gray'
                }`}
                style={loggingTeamId === game.homeTeamId ? { backgroundColor: game.homeTeam.color } : {}}
              >
                🏠 {game.homeTeam.abbreviation}
              </button>
            </div>
          </div>

          {/* Player Selector */}
          <div className="px-3 pb-2 shrink-0">
            <div className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-2">Player</div>
            <div className="overflow-y-auto max-h-28 scrollbar-hide">
              <PlayerSelector
                players={loggingTeam.players}
                selectedPlayerId={selectedPlayerId}
                onSelect={(p) => setSelectedPlayerId(p.id)}
                teamColor={loggingTeam.color}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-3 pb-2 shrink-0">
            <div className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-2">Quick Stats</div>
            <QuickStatPanel onStat={handleQuickStat} />
          </div>

          {/* Play by Play — right panel on larger screens */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-3 border-t border-separator pt-2 hidden lg:block">
            <div className="text-xs font-bold text-ios-gray uppercase tracking-wider mb-1">Play by Play</div>
            <PlayByPlay
              events={game.events}
              game={game}
              onDelete={handleDeleteEvent}
              compact
            />
          </div>
        </div>
      </div>

      {/* Zone Shot Modal */}
      {pendingPlay && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPendingPlay(null)}
          />
          <div className="relative w-full max-w-lg bg-surface-secondary rounded-t-3xl shadow-2xl animate-slide-up">
            <div className="sheet-handle mt-4" />
            <div className="px-5 pb-6">
              {/* Zone title */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-ios-gray uppercase tracking-wider font-semibold mb-0.5">
                    {pendingZoneInfo?.is3pt ? '3-Point Zone' : 'Shot Zone'}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {pendingZoneInfo?.label ?? pendingPlay.zone}
                  </h3>
                </div>
                <button
                  onClick={() => setPendingPlay(null)}
                  className="text-ios-gray hover:text-white text-2xl leading-none btn-press"
                >
                  ×
                </button>
              </div>

              {/* Player selector in modal */}
              <div className="mb-4">
                <div className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-2">Player</div>
                <div className="overflow-x-auto scrollbar-hide">
                  <PlayerSelector
                    players={loggingTeam.players}
                    selectedPlayerId={selectedPlayerId}
                    onSelect={(p) => setSelectedPlayerId(p.id)}
                    teamColor={loggingTeam.color}
                  />
                </div>
              </div>

              {/* Zone-aware stat buttons */}
              <div>
                <div className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-2">Log Play</div>
                <div className="flex gap-2 flex-wrap">
                  {getZoneStats().map((stat) => (
                    <button
                      key={stat.type}
                      onClick={() => handleLogStat(stat.type)}
                      className="flex-1 min-w-[100px] py-3 px-4 rounded-xl font-bold text-sm btn-press transition-all hover:opacity-80"
                      style={{ color: stat.color, backgroundColor: stat.bg }}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Game Confirm */}
      {showEndGameConfirm && (
        <Modal title="End Game?" onClose={() => setShowEndGameConfirm(false)} size="sm">
          <div className="space-y-4 mt-2">
            <p className="text-ios-gray text-sm">
              This will finalize the game. You can still review and edit plays after.
            </p>
            <button
              onClick={confirmEndGame}
              className="w-full bg-ios-red text-white py-3 rounded-xl font-semibold btn-press"
            >
              End Game
            </button>
            <button
              onClick={() => setShowEndGameConfirm(false)}
              className="w-full bg-surface-tertiary text-white py-3 rounded-xl font-semibold btn-press"
            >
              Keep Playing
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

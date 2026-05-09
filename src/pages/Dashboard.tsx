
import { useNavigate } from 'react-router-dom';
import { Plus, Activity, Clock, Trophy } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { computeTeamScore } from '../utils/stats';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();

  const recentGames = [...state.games]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const activeGame = state.activeGameId
    ? state.games.find((g) => g.id === state.activeGameId)
    : null;

  const totalGames = state.games.length;
  const completedGames = state.games.filter((g) => g.status === 'final').length;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-6">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-ios-orange flex items-center justify-center">
              <span className="text-xs">🏀</span>
            </div>
            <span className="text-xs font-bold text-ios-orange tracking-widest uppercase">Keepscore</span>
          </div>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-ios-gray text-sm mt-1">Professional basketball scorekeeping</p>
        </div>

        {/* Active Game Banner */}
        {activeGame && (
          <div
            onClick={() => navigate(`/game/${activeGame.id}/live`)}
            className="card mb-6 border border-ios-green/30 cursor-pointer btn-press hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />
              <span className="text-xs font-bold text-ios-green tracking-widest uppercase">Live Game</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-xs text-ios-gray mb-1">{activeGame.awayTeam.abbreviation}</div>
                <div className="text-4xl font-black text-white">
                  {computeTeamScore(activeGame.events, activeGame.awayTeamId)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-ios-blue">Q{activeGame.quarter}</div>
                <div className="text-lg font-mono text-ios-gray">{activeGame.clockTime}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-ios-gray mb-1">{activeGame.homeTeam.abbreviation}</div>
                <div className="text-4xl font-black text-white">
                  {computeTeamScore(activeGame.events, activeGame.homeTeamId)}
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs text-ios-blue font-semibold">Tap to continue →</span>
            </div>
          </div>
        )}

        {/* New Game CTA */}
        {!activeGame && (
          <button
            onClick={() => navigate('/game/setup')}
            className="w-full card mb-6 flex items-center justify-center gap-3 border border-ios-blue/30 btn-press hover:border-ios-blue/60 transition-colors"
            style={{ minHeight: 80 }}
          >
            <div className="w-10 h-10 rounded-full bg-ios-blue flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold">New Game</div>
              <div className="text-ios-gray text-sm">Start scoring a game</div>
            </div>
          </button>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-black text-ios-blue">{state.teams.length}</div>
            <div className="text-xs text-ios-gray mt-1">Teams</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-black text-white">{totalGames}</div>
            <div className="text-xs text-ios-gray mt-1">Games</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-black text-ios-green">{completedGames}</div>
            <div className="text-xs text-ios-gray mt-1">Final</div>
          </div>
        </div>

        {/* Recent Games */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-ios-gray uppercase tracking-wider">Recent Games</h2>
            {activeGame && (
              <button
                onClick={() => navigate('/game/setup')}
                className="text-xs text-ios-blue font-semibold btn-press"
              >
                New Game
              </button>
            )}
          </div>

          {recentGames.length === 0 ? (
            <div className="card text-center py-8">
              <Trophy size={32} className="text-ios-gray mx-auto mb-3 opacity-40" />
              <div className="text-ios-gray text-sm">No games yet</div>
              <div className="text-ios-gray/60 text-xs mt-1">Start a new game to track stats</div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.map((game) => {
                const homeScore = computeTeamScore(game.events, game.homeTeamId);
                const awayScore = computeTeamScore(game.events, game.awayTeamId);
                const isLive = game.status === 'live';
                const isFinal = game.status === 'final';

                return (
                  <div
                    key={game.id}
                    onClick={() => navigate(isLive ? `/game/${game.id}/live` : `/game/${game.id}/review`)}
                    className="card cursor-pointer btn-press hover:bg-surface-tertiary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isLive && (
                          <div className="flex items-center gap-1">
                            <Activity size={12} className="text-ios-green" />
                            <span className="text-xs text-ios-green font-bold">LIVE</span>
                          </div>
                        )}
                        {isFinal && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-ios-gray" />
                            <span className="text-xs text-ios-gray">FINAL</span>
                          </div>
                        )}
                        <span className="text-xs text-ios-gray">{game.date}</span>
                      </div>
                      {game.venue && (
                        <span className="text-xs text-ios-gray truncate max-w-[120px]">{game.venue}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-white">{game.awayTeam.abbreviation}</span>
                        <span className="text-2xl font-black text-white tabular-nums">{awayScore}</span>
                      </div>
                      <span className="text-xs text-ios-gray">vs</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white tabular-nums">{homeScore}</span>
                        <span className="text-sm font-semibold text-white">{game.homeTeam.abbreviation}</span>
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
}

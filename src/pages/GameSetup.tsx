import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Play } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { Game, Team } from '../types';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function GameSetup() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [homeTeamId, setHomeTeamId] = useState<string>('');
  const [awayTeamId, setAwayTeamId] = useState<string>('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const canStart = homeTeamId && awayTeamId && homeTeamId !== awayTeamId;

  const handleStartGame = () => {
    if (!canStart) {
      showToast('Select two different teams', 'error');
      return;
    }

    const homeTeam = state.teams.find((t) => t.id === homeTeamId);
    const awayTeam = state.teams.find((t) => t.id === awayTeamId);

    if (!homeTeam || !awayTeam) {
      showToast('Teams not found', 'error');
      return;
    }

    const game: Game = {
      id: generateId(),
      homeTeamId,
      awayTeamId,
      homeTeam,
      awayTeam,
      quarter: 1,
      clockTime: '12:00',
      events: [],
      status: 'live',
      date,
      venue: venue.trim() || undefined,
      createdAt: Date.now(),
    };

    dispatch({ type: 'ADD_GAME', game });
    dispatch({ type: 'SET_ACTIVE_GAME', gameId: game.id });
    navigate(`/game/${game.id}/live`);
  };

  const TeamCard = ({ team, isSelected, onSelect }: { team: Team; isSelected: boolean; onSelect: () => void }) => (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl btn-press transition-all ${
        isSelected ? 'border-2' : 'border border-separator bg-surface-tertiary'
      }`}
      style={isSelected ? { borderColor: team.color, backgroundColor: `${team.color}15` } : {}}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
        style={{ backgroundColor: team.color }}
      >
        {team.abbreviation}
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold text-white">{team.name}</div>
        <div className="text-xs text-ios-gray">{team.players.length} players</div>
      </div>
      {isSelected && (
        <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: team.color }}>
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-6">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-ios-blue text-sm font-semibold btn-press mb-6"
        >
          <ChevronLeft size={18} />
          Dashboard
        </button>

        <h1 className="text-3xl font-black text-white mb-1">Game Setup</h1>
        <p className="text-ios-gray text-sm mb-8">Configure teams and game info</p>

        {state.teams.length < 2 ? (
          <div className="card text-center py-10">
            <div className="text-ios-gray mb-2">You need at least 2 teams</div>
            <button
              onClick={() => navigate('/teams')}
              className="text-ios-blue text-sm font-semibold btn-press"
            >
              Go to Teams →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Away Team */}
            <div>
              <div className="text-xs text-ios-gray font-bold uppercase tracking-wider mb-2">
                Away Team ✈
              </div>
              <div className="space-y-1.5">
                {state.teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    isSelected={awayTeamId === team.id}
                    onSelect={() => setAwayTeamId(team.id)}
                  />
                ))}
              </div>
            </div>

            {/* Home Team */}
            <div>
              <div className="text-xs text-ios-gray font-bold uppercase tracking-wider mb-2">
                Home Team 🏠
              </div>
              <div className="space-y-1.5">
                {state.teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    isSelected={homeTeamId === team.id}
                    onSelect={() => setHomeTeamId(team.id)}
                  />
                ))}
              </div>
            </div>

            {/* Same team warning */}
            {homeTeamId && awayTeamId && homeTeamId === awayTeamId && (
              <div className="text-ios-red text-xs text-center font-semibold">
                Home and Away teams must be different
              </div>
            )}

            {/* Game Details */}
            <div className="space-y-3">
              <div className="text-xs text-ios-gray font-bold uppercase tracking-wider">Game Details</div>
              <div>
                <label className="text-xs text-ios-gray mb-1 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-dark w-full"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="text-xs text-ios-gray mb-1 block">Venue (optional)</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Arena name, city..."
                  className="input-dark w-full"
                />
              </div>
            </div>

            {/* Start Game */}
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base btn-press transition-all ${
                canStart
                  ? 'bg-ios-blue text-white hover:opacity-90'
                  : 'bg-surface-tertiary text-ios-gray cursor-not-allowed'
              }`}
            >
              <Play size={18} fill={canStart ? 'white' : '#8E8E93'} />
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Download, FileText, Pencil, Trash2, Play } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import Modal from '../components/layout/Modal';
import { StatEvent, StatType, Player } from '../types';
import { computeTeamScore, computeTeamStats, formatPct } from '../utils/stats';
import { exportPDF, exportCSV } from '../utils/export';

const STAT_TYPES: StatType[] = [
  'FGM', 'FGA', '3PM', '3PA', 'FTM', 'FTA',
  'AST', 'TO', 'STL', 'BLK', 'OREB', 'DREB', 'PF', 'TF'
];

const statLabels: Record<StatType, string> = {
  FGM: '2PT Made', FGA: '2PT Miss', '3PM': '3PT Made', '3PA': '3PT Miss',
  FTM: 'FT Made', FTA: 'FT Miss', AST: 'Assist', TO: 'Turnover',
  STL: 'Steal', BLK: 'Block', OREB: 'Off Reb', DREB: 'Def Reb',
  PF: 'Personal Foul', TF: 'Tech Foul',
};

const statColors: Record<string, string> = {
  FGM: '#30D158', '3PM': '#30D158', FTM: '#30D158',
  FGA: '#FF453A', '3PA': '#FF453A', FTA: '#FF453A', TO: '#FF453A', TF: '#FF453A',
  PF: '#FF9F0A', OREB: '#FF9F0A', DREB: '#FF9F0A',
  AST: '#0A84FF', STL: '#0A84FF', BLK: '#0A84FF',
};

export default function GameReview() {
  const { gameId } = useParams<{ gameId: string }>();
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'boxscore' | 'playbyplay'>('boxscore');
  const [editingEvent, setEditingEvent] = useState<StatEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ type: StatType; clockTime: string; playerId: string }>({
    type: 'FGM', clockTime: '', playerId: ''
  });

  const game = state.games.find((g) => g.id === gameId);

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

  const homeScore = computeTeamScore(game.events, game.homeTeamId);
  const awayScore = computeTeamScore(game.events, game.awayTeamId);
  const homeStats = computeTeamStats(game.events, game.homeTeamId).sort((a, b) => b.pts - a.pts);
  const awayStats = computeTeamStats(game.events, game.awayTeamId).sort((a, b) => b.pts - a.pts);

  const handleEditEvent = (event: StatEvent) => {
    setEditingEvent(event);
    setEditForm({ type: event.type, clockTime: event.clockTime, playerId: event.playerId });
  };

  const handleSaveEdit = () => {
    if (!editingEvent) return;
    const team = editingEvent.teamId === game.homeTeamId ? game.homeTeam : game.awayTeam;
    const player = team.players.find((p) => p.id === editForm.playerId);
    const updatedEvent: StatEvent = {
      ...editingEvent,
      type: editForm.type,
      clockTime: editForm.clockTime,
      playerId: editForm.playerId,
      playerName: player?.name ?? editingEvent.playerName,
      playerNumber: player?.number ?? editingEvent.playerNumber,
    };
    dispatch({ type: 'UPDATE_EVENT', gameId: game.id, event: updatedEvent });
    showToast('Play updated', 'success');
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', gameId: game.id, eventId });
    showToast('Play deleted', 'info');
    setDeleteConfirmId(null);
  };

  const handleExportPDF = () => {
    try {
      exportPDF(game);
      showToast('PDF exported', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      exportCSV(game);
      showToast('CSV exported', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const sortedEvents = [...game.events].sort((a, b) => b.timestamp - a.timestamp);

  const BoxScoreTable = ({ teamId }: { teamId: string }) => {
    const team = teamId === game.homeTeamId ? game.homeTeam : game.awayTeam;
    const stats = teamId === game.homeTeamId ? homeStats : awayStats;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
          <span className="text-sm font-bold text-white">{team.name}</span>
          <span className="text-xs text-ios-gray ml-auto">
            {computeTeamScore(game.events, teamId)} pts
          </span>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-separator">
                <th className="text-left text-ios-gray font-semibold py-2 pl-4 pr-2 sticky left-0 bg-surface-primary min-w-[120px]">Player</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">PTS</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">REB</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">AST</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">TO</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">STL</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">BLK</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">FG</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2">3PT</th>
                <th className="text-right text-ios-gray font-semibold py-2 px-2 pr-4">FT</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-ios-gray py-4 pl-4">No stats recorded</td>
                </tr>
              ) : (
                stats.map((s, i) => (
                  <tr key={s.playerId} className={i % 2 === 0 ? '' : 'bg-surface-secondary/30'}>
                    <td className="py-2 pl-4 pr-2 sticky left-0 bg-surface-primary">
                      <span className="text-ios-gray mr-1">#{s.playerNumber}</span>
                      <span className="text-white font-medium">{s.playerName}</span>
                    </td>
                    <td className="text-right py-2 px-2 text-white font-bold">{s.pts}</td>
                    <td className="text-right py-2 px-2 text-white">{s.reb}</td>
                    <td className="text-right py-2 px-2 text-white">{s.ast}</td>
                    <td className="text-right py-2 px-2 text-white">{s.to}</td>
                    <td className="text-right py-2 px-2 text-white">{s.stl}</td>
                    <td className="text-right py-2 px-2 text-white">{s.blk}</td>
                    <td className="text-right py-2 px-2 text-ios-gray">
                      {s.fgm}-{s.fga}
                      <span className="text-ios-gray/60 ml-1">({formatPct(s.fgm, s.fga)})</span>
                    </td>
                    <td className="text-right py-2 px-2 text-ios-gray">
                      {s.threePm}-{s.threePa}
                    </td>
                    <td className="text-right py-2 px-2 pr-4 text-ios-gray">
                      {s.ftm}-{s.fta}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const eventTeamPlayers = (event: StatEvent): Player[] => {
    const team = event.teamId === game.homeTeamId ? game.homeTeam : game.awayTeam;
    return team.players;
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-6">
        {/* Back */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-ios-blue text-sm font-semibold btn-press"
          >
            <ChevronLeft size={18} />
            Home
          </button>
          {game.status === 'live' && (
            <button
              onClick={() => navigate(`/game/${game.id}/live`)}
              className="flex items-center gap-1 text-ios-green text-sm font-semibold btn-press"
            >
              <Play size={14} fill="currentColor" />
              Back to Live
            </button>
          )}
        </div>

        {/* Score header */}
        <div className="card mb-4">
          <div className="text-center mb-3">
            <div className="text-xs text-ios-gray uppercase tracking-wider font-semibold">
              {game.status === 'final' ? 'Final' : `Q${game.quarter} · ${game.clockTime}`}
            </div>
            <div className="text-xs text-ios-gray mt-0.5">{game.date}{game.venue ? ` · ${game.venue}` : ''}</div>
          </div>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: game.awayTeam.color }}>
                {game.awayTeam.abbreviation}
              </div>
              <div className="text-5xl font-black text-white tabular-nums">{awayScore}</div>
              <div className="text-xs text-ios-gray mt-1">{game.awayTeam.name}</div>
            </div>
            <div className="text-ios-gray text-lg font-light">vs</div>
            <div className="text-center">
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: game.homeTeam.color }}>
                {game.homeTeam.abbreviation}
              </div>
              <div className="text-5xl font-black text-white tabular-nums">{homeScore}</div>
              <div className="text-xs text-ios-gray mt-1">{game.homeTeam.name}</div>
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleExportPDF}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-secondary border border-separator text-sm font-semibold text-white btn-press hover:bg-surface-tertiary transition-colors"
          >
            <FileText size={15} className="text-ios-red" />
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-secondary border border-separator text-sm font-semibold text-white btn-press hover:bg-surface-tertiary transition-colors"
          >
            <Download size={15} className="text-ios-green" />
            Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-secondary p-1 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('boxscore')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold btn-press transition-colors ${
              activeTab === 'boxscore' ? 'bg-surface-tertiary text-white' : 'text-ios-gray'
            }`}
          >
            Box Score
          </button>
          <button
            onClick={() => setActiveTab('playbyplay')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold btn-press transition-colors ${
              activeTab === 'playbyplay' ? 'bg-surface-tertiary text-white' : 'text-ios-gray'
            }`}
          >
            Play by Play ({game.events.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'boxscore' ? (
          <div>
            <BoxScoreTable teamId={game.awayTeamId} />
            <BoxScoreTable teamId={game.homeTeamId} />
          </div>
        ) : (
          <div className="space-y-1">
            {sortedEvents.length === 0 ? (
              <div className="card text-center py-8">
                <div className="text-ios-gray text-sm">No plays recorded</div>
              </div>
            ) : (
              sortedEvents.map((event) => {
                const isHome = event.teamId === game.homeTeamId;
                const team = isHome ? game.homeTeam : game.awayTeam;
                const quarterLabel = event.quarter <= 4 ? `Q${event.quarter}` : `OT${event.quarter - 4}`;

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-surface-secondary transition-colors group"
                  >
                    <div className="text-xs text-ios-gray font-mono shrink-0 w-14">
                      {quarterLabel} {event.clockTime}
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                    <div className="text-xs text-white font-semibold shrink-0">
                      #{event.playerNumber} {event.playerName}
                    </div>
                    <div className="text-xs font-bold shrink-0" style={{ color: statColors[event.type] || '#fff' }}>
                      {statLabels[event.type] || event.type}
                    </div>
                    {event.courtZone && (
                      <div className="text-xs text-ios-gray/60 hidden sm:block truncate">{event.courtZone}</div>
                    )}
                    <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="w-6 h-6 rounded-full bg-surface-tertiary flex items-center justify-center text-ios-blue btn-press"
                      >
                        <Pencil size={10} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(event.id)}
                        className="w-6 h-6 rounded-full bg-surface-tertiary flex items-center justify-center text-ios-red btn-press"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <Modal title="Edit Play" onClose={() => setEditingEvent(null)} showHandle>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">Player</label>
              <select
                value={editForm.playerId}
                onChange={(e) => setEditForm({ ...editForm, playerId: e.target.value })}
                className="input-dark w-full bg-surface-tertiary"
                style={{ colorScheme: 'dark' }}
              >
                {eventTeamPlayers(editingEvent).map((p) => (
                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">Stat Type</label>
              <div className="flex flex-wrap gap-1.5">
                {STAT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setEditForm({ ...editForm, type })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold btn-press transition-colors ${
                      editForm.type === type ? 'bg-ios-blue text-white' : 'bg-surface-tertiary text-ios-gray'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">Clock Time</label>
              <input
                type="text"
                value={editForm.clockTime}
                onChange={(e) => setEditForm({ ...editForm, clockTime: e.target.value })}
                placeholder="4:23"
                className="input-dark w-full"
              />
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full bg-ios-blue text-white py-3 rounded-xl font-semibold btn-press"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <Modal title="Delete Play?" onClose={() => setDeleteConfirmId(null)} size="sm">
          <div className="space-y-4 mt-2">
            <p className="text-ios-gray text-sm">This play will be permanently removed from the game log.</p>
            <button
              onClick={() => handleDeleteEvent(deleteConfirmId)}
              className="w-full bg-ios-red text-white py-3 rounded-xl font-semibold btn-press"
            >
              Delete Play
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="w-full bg-surface-tertiary text-white py-3 rounded-xl font-semibold btn-press"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import Modal from '../components/layout/Modal';
import PlayerRow from '../components/teams/PlayerRow';
import { Player, Position, Team } from '../types';

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C', ''];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const TEAM_COLORS = ['#0A84FF', '#30D158', '#FF453A', '#FF9F0A', '#BF5AF2', '#FF375F', '#5AC8FA', '#FFD60A'];

interface PlayerFormData {
  name: string;
  number: string;
  position: Position;
}

const emptyPlayerForm: PlayerFormData = { name: '', number: '', position: '' };

export default function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const team = state.teams.find((t) => t.id === teamId);

  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerForm, setPlayerForm] = useState<PlayerFormData>(emptyPlayerForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTeamName, setEditTeamName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState('');

  if (!team) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-ios-gray mb-4">Team not found</div>
          <button onClick={() => navigate('/teams')} className="text-ios-blue text-sm btn-press">
            Back to Teams
          </button>
        </div>
      </div>
    );
  }

  const handleOpenAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerForm(emptyPlayerForm);
    setShowPlayerModal(true);
  };

  const handleOpenEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerForm({ name: player.name, number: player.number, position: player.position });
    setShowPlayerModal(true);
  };

  const handleSavePlayer = () => {
    if (!playerForm.name.trim()) {
      showToast('Player name is required', 'error');
      return;
    }
    if (!playerForm.number.trim()) {
      showToast('Jersey number is required', 'error');
      return;
    }

    let updatedPlayers: Player[];
    if (editingPlayer) {
      updatedPlayers = team.players.map((p) =>
        p.id === editingPlayer.id
          ? { ...p, name: playerForm.name.trim(), number: playerForm.number.trim(), position: playerForm.position }
          : p
      );
    } else {
      const newPlayer: Player = {
        id: generateId(),
        name: playerForm.name.trim(),
        number: playerForm.number.trim(),
        position: playerForm.position,
      };
      updatedPlayers = [...team.players, newPlayer];
    }

    const updatedTeam: Team = { ...team, players: updatedPlayers };
    dispatch({ type: 'UPDATE_TEAM', team: updatedTeam });
    showToast(editingPlayer ? 'Player updated' : 'Player added', 'success');
    setShowPlayerModal(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    const updatedTeam: Team = {
      ...team,
      players: team.players.filter((p) => p.id !== playerId),
    };
    dispatch({ type: 'UPDATE_TEAM', team: updatedTeam });
    showToast('Player removed', 'info');
  };

  const handleDeleteTeam = () => {
    dispatch({ type: 'DELETE_TEAM', teamId: team.id });
    showToast(`${team.name} deleted`, 'info');
    navigate('/teams');
  };

  const handleUpdateTeamName = () => {
    if (!teamNameInput.trim()) return;
    dispatch({ type: 'UPDATE_TEAM', team: { ...team, name: teamNameInput.trim() } });
    setEditTeamName(false);
    showToast('Team name updated', 'success');
  };

  const handleColorChange = (color: string) => {
    dispatch({ type: 'UPDATE_TEAM', team: { ...team, color } });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center gap-1 text-ios-blue text-sm font-semibold btn-press mb-6"
        >
          <ChevronLeft size={18} />
          Teams
        </button>

        {/* Team Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.abbreviation}
            </div>
            <div className="flex-1">
              {editTeamName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    className="input-dark flex-1"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTeamName(); if (e.key === 'Escape') setEditTeamName(false); }}
                  />
                  <button onClick={handleUpdateTeamName} className="text-ios-blue text-sm font-semibold btn-press">Save</button>
                </div>
              ) : (
                <div
                  className="text-xl font-black text-white cursor-pointer hover:text-ios-blue transition-colors"
                  onClick={() => { setTeamNameInput(team.name); setEditTeamName(true); }}
                  title="Click to edit"
                >
                  {team.name}
                </div>
              )}
              <div className="text-ios-gray text-sm mt-0.5">
                {team.players.length} player{team.players.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <div className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-2">Team Color</div>
            <div className="flex gap-2 flex-wrap">
              {TEAM_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-8 h-8 rounded-full btn-press"
                  style={{
                    backgroundColor: color,
                    outline: team.color === color ? '3px solid white' : '3px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Players section */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ios-gray uppercase tracking-wider">Roster</h2>
          <button
            onClick={handleOpenAddPlayer}
            className="flex items-center gap-1 text-ios-blue text-sm font-semibold btn-press"
          >
            <Plus size={14} />
            Add Player
          </button>
        </div>

        {team.players.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-ios-gray text-sm mb-3">No players on this roster</div>
            <button
              onClick={handleOpenAddPlayer}
              className="bg-ios-blue text-white px-5 py-2 rounded-full text-sm font-semibold btn-press"
            >
              Add First Player
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {[...team.players]
              .sort((a, b) => Number(a.number) - Number(b.number))
              .map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  onEdit={handleOpenEditPlayer}
                  onDelete={handleDeletePlayer}
                  teamColor={team.color}
                />
              ))}
          </div>
        )}

        {/* Delete team */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-ios-red text-sm font-semibold btn-press hover:bg-surface-secondary transition-colors"
        >
          <Trash2 size={15} />
          Delete Team
        </button>
      </div>

      {/* Player Modal */}
      {showPlayerModal && (
        <Modal
          title={editingPlayer ? 'Edit Player' : 'Add Player'}
          onClose={() => setShowPlayerModal(false)}
          showHandle
        >
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">Name</label>
              <input
                type="text"
                value={playerForm.name}
                onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                placeholder="Player name"
                className="input-dark w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">Jersey #</label>
              <input
                type="text"
                value={playerForm.number}
                onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                placeholder="23"
                maxLength={3}
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">Position</label>
              <div className="flex gap-2 flex-wrap">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos || 'none'}
                    onClick={() => setPlayerForm({ ...playerForm, position: pos })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold btn-press transition-colors ${
                      playerForm.position === pos
                        ? 'bg-ios-blue text-white'
                        : 'bg-surface-tertiary text-ios-gray'
                    }`}
                  >
                    {pos || 'None'}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSavePlayer}
              className="w-full bg-ios-blue text-white py-3 rounded-xl font-semibold btn-press hover:opacity-90 mt-2"
            >
              {editingPlayer ? 'Save Changes' : 'Add Player'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <Modal title="Delete Team?" onClose={() => setShowDeleteConfirm(false)} size="sm">
          <div className="space-y-4 mt-2">
            <p className="text-ios-gray text-sm">
              This will permanently delete <strong className="text-white">{team.name}</strong> and all {team.players.length} player{team.players.length !== 1 ? 's' : ''}. This cannot be undone.
            </p>
            <button
              onClick={handleDeleteTeam}
              className="w-full bg-ios-red text-white py-3 rounded-xl font-semibold btn-press"
            >
              Delete Team
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
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

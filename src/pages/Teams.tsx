import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Users } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import Modal from '../components/layout/Modal';
import { Team } from '../types';

const TEAM_COLORS = ['#0A84FF', '#30D158', '#FF453A', '#FF9F0A', '#BF5AF2', '#FF375F', '#5AC8FA', '#FFD60A'];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface TeamFormData {
  name: string;
  abbreviation: string;
  color: string;
}

export default function Teams() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [form, setForm] = useState<TeamFormData>({ name: '', abbreviation: '', color: TEAM_COLORS[0] });

  const handleCreateTeam = () => {
    if (!form.name.trim()) {
      showToast('Team name is required', 'error');
      return;
    }
    if (!form.abbreviation.trim()) {
      showToast('Abbreviation is required', 'error');
      return;
    }
    const team: Team = {
      id: generateId(),
      name: form.name.trim(),
      abbreviation: form.abbreviation.trim().toUpperCase().slice(0, 4),
      color: form.color,
      players: [],
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_TEAM', team });
    showToast(`${team.name} created`, 'success');
    setShowNewTeamModal(false);
    setForm({ name: '', abbreviation: '', color: TEAM_COLORS[0] });
    navigate(`/teams/${team.id}`);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Teams</h1>
            <p className="text-ios-gray text-sm mt-1">{state.teams.length} team{state.teams.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowNewTeamModal(true)}
            className="flex items-center gap-2 bg-ios-blue text-white px-4 py-2 rounded-full text-sm font-semibold btn-press hover:opacity-90"
          >
            <Plus size={16} />
            New Team
          </button>
        </div>

        {/* Teams List */}
        {state.teams.length === 0 ? (
          <div className="card text-center py-12">
            <Users size={40} className="text-ios-gray mx-auto mb-4 opacity-40" />
            <div className="text-white font-semibold mb-1">No teams yet</div>
            <div className="text-ios-gray text-sm mb-4">Create your first team to get started</div>
            <button
              onClick={() => setShowNewTeamModal(true)}
              className="bg-ios-blue text-white px-6 py-2.5 rounded-full text-sm font-semibold btn-press"
            >
              Create Team
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {state.teams.map((team) => (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="card cursor-pointer btn-press hover:bg-surface-tertiary transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Color badge */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.abbreviation}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold">{team.name}</div>
                    <div className="text-ios-gray text-sm">
                      {team.players.length} player{team.players.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-ios-gray shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Team Modal */}
      {showNewTeamModal && (
        <Modal title="New Team" onClose={() => setShowNewTeamModal(false)} showHandle>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">
                Team Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Los Angeles Lakers"
                className="input-dark w-full"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">
                Abbreviation
              </label>
              <input
                type="text"
                value={form.abbreviation}
                onChange={(e) => setForm({ ...form, abbreviation: e.target.value.toUpperCase().slice(0, 4) })}
                placeholder="LAL"
                maxLength={4}
                className="input-dark w-full"
              />
            </div>

            <div>
              <label className="text-xs text-ios-gray font-semibold uppercase tracking-wider mb-1.5 block">
                Team Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className="w-9 h-9 rounded-full btn-press transition-transform"
                    style={{
                      backgroundColor: color,
                      outline: form.color === color ? '3px solid white' : '3px solid transparent',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateTeam}
              className="w-full bg-ios-blue text-white py-3 rounded-xl font-semibold btn-press hover:opacity-90 mt-2"
            >
              Create Team
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

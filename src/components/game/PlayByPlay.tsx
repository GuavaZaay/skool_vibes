
import { Trash2 } from 'lucide-react';
import { StatEvent, Game } from '../../types';

interface PlayByPlayProps {
  events: StatEvent[];
  game: Game;
  onDelete?: (eventId: string) => void;
  compact?: boolean;
}

const statLabels: Record<string, string> = {
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
  PF: 'Personal Foul',
  TF: 'Tech Foul',
};

const statColors: Record<string, string> = {
  FGM: 'text-ios-green',
  '3PM': 'text-ios-green',
  FTM: 'text-ios-green',
  FGA: 'text-ios-red',
  '3PA': 'text-ios-red',
  FTA: 'text-ios-red',
  TO: 'text-ios-red',
  PF: 'text-ios-orange',
  TF: 'text-ios-red',
  AST: 'text-ios-blue',
  STL: 'text-ios-blue',
  BLK: 'text-ios-blue',
  OREB: 'text-ios-orange',
  DREB: 'text-ios-orange',
};

export default function PlayByPlay({ events, game, onDelete, compact = false }: PlayByPlayProps) {
  const sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-6 text-ios-gray text-sm">
        No plays logged yet. Tap a zone on the court to start.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {sorted.map((event) => {
        const isHome = event.teamId === game.homeTeamId;
        const team = isHome ? game.homeTeam : game.awayTeam;
        const colorClass = statColors[event.type] || 'text-white';
        const quarterLabel = event.quarter <= 4 ? `Q${event.quarter}` : `OT${event.quarter - 4}`;

        return (
          <div
            key={event.id}
            className={`flex items-center gap-2 px-3 ${compact ? 'py-1.5' : 'py-2'} rounded-xl hover:bg-surface-tertiary transition-colors group`}
          >
            {/* Quarter & Time */}
            <div className="text-xs text-ios-gray font-mono shrink-0 w-16">
              {quarterLabel} {event.clockTime}
            </div>

            {/* Team accent */}
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: team.color || '#8E8E93' }}
            />

            {/* Player */}
            <div className="text-xs text-white font-semibold shrink-0">
              #{event.playerNumber} {event.playerName}
            </div>

            {/* Stat */}
            <div className={`text-xs font-bold ${colorClass} shrink-0`}>
              {statLabels[event.type] || event.type}
            </div>

            {/* Zone */}
            {event.courtZone && (
              <div className="text-xs text-ios-gray shrink-0 hidden sm:block">
                ({event.courtZone})
              </div>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="ml-auto text-ios-gray hover:text-ios-red transition-colors opacity-0 group-hover:opacity-100 btn-press"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

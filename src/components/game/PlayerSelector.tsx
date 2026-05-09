
import { Player } from '../../types';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerId: string | null;
  onSelect: (player: Player) => void;
  teamColor?: string;
}

export default function PlayerSelector({ players, selectedPlayerId, onSelect, teamColor }: PlayerSelectorProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-4 text-ios-gray text-sm">
        No players on this team
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player) => {
        const isSelected = player.id === selectedPlayerId;
        return (
          <button
            key={player.id}
            onClick={() => onSelect(player)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl btn-press transition-all ${
              isSelected
                ? 'text-white'
                : 'bg-surface-tertiary text-ios-gray hover:text-white'
            }`}
            style={
              isSelected
                ? { backgroundColor: teamColor || '#0A84FF', color: 'white' }
                : {}
            }
          >
            <span className="text-xs font-black opacity-60">#{player.number}</span>
            <span className="text-sm font-semibold">{player.name}</span>
            {player.position && (
              <span className="text-xs opacity-50">{player.position}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

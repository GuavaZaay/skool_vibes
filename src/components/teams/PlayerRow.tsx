
import { Pencil, Trash2 } from 'lucide-react';
import { Player } from '../../types';

interface PlayerRowProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (playerId: string) => void;
  teamColor?: string;
}

export default function PlayerRow({ player, onEdit, onDelete, teamColor }: PlayerRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 bg-surface-tertiary rounded-xl group">
      {/* Number badge */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
        style={{ backgroundColor: teamColor || '#2C2C2E' }}
      >
        #{player.number}
      </div>

      {/* Name & Position */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{player.name}</div>
        {player.position && (
          <div className="text-xs text-ios-gray">{player.position}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(player)}
          className="w-7 h-7 rounded-full bg-surface-quaternary flex items-center justify-center text-ios-blue btn-press hover:bg-separator transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(player.id)}
          className="w-7 h-7 rounded-full bg-surface-quaternary flex items-center justify-center text-ios-red btn-press hover:bg-separator transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

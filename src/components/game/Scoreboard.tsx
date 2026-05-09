
import { ChevronLeft, ChevronRight, Square } from 'lucide-react';
import { Game } from '../../types';
import { computeTeamScore } from '../../utils/stats';

interface ScoreboardProps {
  game: Game;
  onPrevQuarter: () => void;
  onNextQuarter: () => void;
  onEndGame: () => void;
  onClockChange: (time: string) => void;
}

export default function Scoreboard({
  game,
  onPrevQuarter,
  onNextQuarter,
  onEndGame,
  onClockChange,
}: ScoreboardProps) {
  const homeScore = computeTeamScore(game.events, game.homeTeamId);
  const awayScore = computeTeamScore(game.events, game.awayTeamId);

  const quarterLabel = game.quarter <= 4 ? `Q${game.quarter}` : `OT${game.quarter - 4}`;

  return (
    <div className="bg-surface-secondary rounded-2xl p-3 flex items-center gap-3">
      {/* Away Team */}
      <div className="flex-1 text-center">
        <div
          className="text-xs font-bold tracking-widest mb-1 opacity-70"
          style={{ color: game.awayTeam.color || '#8E8E93' }}
        >
          {game.awayTeam.abbreviation}
        </div>
        <div className="text-5xl font-black tabular-nums leading-none text-white">
          {awayScore}
        </div>
        <div className="text-xs text-ios-gray mt-1 truncate">{game.awayTeam.name}</div>
      </div>

      {/* Center — Quarter & Clock */}
      <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevQuarter}
            className="w-6 h-6 rounded-full bg-surface-quaternary flex items-center justify-center btn-press hover:bg-separator transition-colors"
            disabled={game.quarter <= 1}
          >
            <ChevronLeft size={14} className={game.quarter <= 1 ? 'text-ios-gray/30' : 'text-ios-gray'} />
          </button>
          <span className="text-xs font-bold text-ios-blue tracking-wider px-2">
            {quarterLabel}
          </span>
          <button
            onClick={onNextQuarter}
            className="w-6 h-6 rounded-full bg-surface-quaternary flex items-center justify-center btn-press hover:bg-separator transition-colors"
          >
            <ChevronRight size={14} className="text-ios-gray" />
          </button>
        </div>

        {/* Clock */}
        <input
          type="text"
          value={game.clockTime}
          onChange={(e) => onClockChange(e.target.value)}
          className="bg-surface-tertiary border border-separator rounded-lg px-2 py-1 text-center text-lg font-mono font-bold text-white w-20 outline-none focus:border-ios-blue"
          placeholder="12:00"
          maxLength={5}
        />

        {/* End Game */}
        <button
          onClick={onEndGame}
          className="flex items-center gap-1 text-ios-red text-xs font-medium btn-press hover:opacity-80 mt-0.5"
        >
          <Square size={10} fill="currentColor" />
          End Game
        </button>
      </div>

      {/* Home Team */}
      <div className="flex-1 text-center">
        <div
          className="text-xs font-bold tracking-widest mb-1 opacity-70"
          style={{ color: game.homeTeam.color || '#8E8E93' }}
        >
          {game.homeTeam.abbreviation}
        </div>
        <div className="text-5xl font-black tabular-nums leading-none text-white">
          {homeScore}
        </div>
        <div className="text-xs text-ios-gray mt-1 truncate">{game.homeTeam.name}</div>
      </div>
    </div>
  );
}

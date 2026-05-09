
import { StatType, CourtZone } from '../../types';

interface StatButton {
  type: StatType;
  label: string;
  color: string;
  bg: string;
}

const allStats: StatButton[] = [
  { type: 'FGM', label: 'FGM', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  { type: 'FGA', label: 'FGA (Miss)', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
  { type: '3PM', label: '3PM', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  { type: '3PA', label: '3PA (Miss)', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
  { type: 'FTM', label: 'FT Made', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  { type: 'FTA', label: 'FT Miss', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
  { type: 'AST', label: 'Assist', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  { type: 'TO', label: 'Turnover', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
  { type: 'STL', label: 'Steal', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  { type: 'BLK', label: 'Block', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  { type: 'OREB', label: 'Off Reb', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
  { type: 'DREB', label: 'Def Reb', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
  { type: 'PF', label: 'Foul', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
  { type: 'TF', label: 'Tech Foul', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
];

// Court-zone aware stat buttons
function getRelevantStats(zone: CourtZone | null): StatButton[] {
  if (!zone) return allStats.filter(s => !['FGM', 'FGA', '3PM', '3PA'].includes(s.type));

  const is3pt = ['left-corner-3', 'right-corner-3', 'left-wing-3', 'right-wing-3', 'top-arc-3'].includes(zone);

  if (is3pt) {
    return [
      allStats.find(s => s.type === '3PM')!,
      allStats.find(s => s.type === '3PA')!,
      allStats.find(s => s.type === 'AST')!,
      allStats.find(s => s.type === 'OREB')!,
      allStats.find(s => s.type === 'DREB')!,
    ];
  }

  if (zone === 'ft-line') {
    return [
      allStats.find(s => s.type === 'FTM')!,
      allStats.find(s => s.type === 'FTA')!,
    ];
  }

  // Paint or midrange
  return [
    allStats.find(s => s.type === 'FGM')!,
    allStats.find(s => s.type === 'FGA')!,
    allStats.find(s => s.type === 'AST')!,
    allStats.find(s => s.type === 'OREB')!,
    allStats.find(s => s.type === 'DREB')!,
  ];
}

interface StatPanelProps {
  zone: CourtZone | null;
  onStat: (type: StatType) => void;
  showAll?: boolean;
}

export default function StatPanel({ zone, onStat, showAll = false }: StatPanelProps) {
  const stats = showAll ? allStats : getRelevantStats(zone);

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((stat) => (
        <button
          key={stat.type}
          onClick={() => onStat(stat.type)}
          className="flex-1 min-w-[80px] px-3 py-2.5 rounded-xl btn-press font-semibold text-sm transition-all hover:opacity-80 active:scale-95"
          style={{ color: stat.color, backgroundColor: stat.bg }}
        >
          {stat.label}
        </button>
      ))}
    </div>
  );
}

// Non-court quick stats (no zone required)
const quickStats: StatButton[] = [
  { type: 'AST', label: 'AST', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  { type: 'TO', label: 'TO', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
  { type: 'STL', label: 'STL', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  { type: 'BLK', label: 'BLK', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  { type: 'OREB', label: 'OREB', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
  { type: 'DREB', label: 'DREB', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
  { type: 'FTM', label: 'FTM', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  { type: 'FTA', label: 'FTA', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
  { type: 'PF', label: 'PF', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
  { type: 'TF', label: 'TF', color: '#FF453A', bg: 'rgba(255,69,58,0.15)' },
];

interface QuickStatPanelProps {
  onStat: (type: StatType) => void;
}

export function QuickStatPanel({ onStat }: QuickStatPanelProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {quickStats.map((stat) => (
        <button
          key={stat.type}
          onClick={() => onStat(stat.type)}
          className="px-2.5 py-1.5 rounded-lg btn-press font-bold text-xs transition-all hover:opacity-80"
          style={{ color: stat.color, backgroundColor: stat.bg }}
        >
          {stat.label}
        </button>
      ))}
    </div>
  );
}

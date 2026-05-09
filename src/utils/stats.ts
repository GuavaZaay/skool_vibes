import { StatEvent, PlayerStats } from '../types';

export function computeTeamScore(events: StatEvent[], teamId: string): number {
  return events
    .filter((e) => e.teamId === teamId)
    .reduce((pts, e) => {
      if (e.type === 'FGM') return pts + 2;
      if (e.type === '3PM') return pts + 3;
      if (e.type === 'FTM') return pts + 1;
      return pts;
    }, 0);
}

function emptyStats(playerId: string, playerName: string, playerNumber: string, teamId: string): PlayerStats {
  return {
    playerId,
    playerName,
    playerNumber,
    teamId,
    pts: 0,
    reb: 0,
    oreb: 0,
    dreb: 0,
    ast: 0,
    to: 0,
    stl: 0,
    blk: 0,
    pf: 0,
    fgm: 0,
    fga: 0,
    threePm: 0,
    threePa: 0,
    ftm: 0,
    fta: 0,
  };
}

export function computePlayerStats(events: StatEvent[], playerId: string): PlayerStats {
  const playerEvents = events.filter((e) => e.playerId === playerId);
  if (playerEvents.length === 0) {
    return emptyStats(playerId, '', '', '');
  }

  const first = playerEvents[0];
  const stats = emptyStats(playerId, first.playerName, first.playerNumber, first.teamId);

  for (const e of playerEvents) {
    switch (e.type) {
      case 'FGM':
        stats.fgm++;
        stats.fga++;
        stats.pts += 2;
        break;
      case 'FGA':
        stats.fga++;
        break;
      case '3PM':
        stats.threePm++;
        stats.threePa++;
        stats.fgm++;
        stats.fga++;
        stats.pts += 3;
        break;
      case '3PA':
        stats.threePa++;
        stats.fga++;
        break;
      case 'FTM':
        stats.ftm++;
        stats.fta++;
        stats.pts += 1;
        break;
      case 'FTA':
        stats.fta++;
        break;
      case 'OREB':
        stats.oreb++;
        stats.reb++;
        break;
      case 'DREB':
        stats.dreb++;
        stats.reb++;
        break;
      case 'AST':
        stats.ast++;
        break;
      case 'TO':
        stats.to++;
        break;
      case 'STL':
        stats.stl++;
        break;
      case 'BLK':
        stats.blk++;
        break;
      case 'PF':
        stats.pf++;
        break;
      case 'TF':
        stats.pf++;
        break;
    }
  }

  return stats;
}

export function computeTeamStats(events: StatEvent[], teamId: string): PlayerStats[] {
  const teamEvents = events.filter((e) => e.teamId === teamId);
  const playerIds = [...new Set(teamEvents.map((e) => e.playerId))];
  return playerIds.map((pid) => computePlayerStats(events, pid));
}

export function formatPct(made: number, attempted: number): string {
  if (attempted === 0) return '—';
  return `${Math.round((made / attempted) * 100)}%`;
}

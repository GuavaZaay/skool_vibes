export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C' | '';

export interface Player {
  id: string;
  name: string;
  number: string;
  position: Position;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  players: Player[];
  createdAt: number;
}

export type CourtZone =
  | 'paint'
  | 'ft-line'
  | 'left-corner-3'
  | 'right-corner-3'
  | 'left-wing-3'
  | 'right-wing-3'
  | 'top-arc-3'
  | 'left-mid'
  | 'right-mid'
  | 'left-elbow'
  | 'right-elbow';

export type StatType =
  | 'FGM' | 'FGA'
  | '3PM' | '3PA'
  | 'FTM' | 'FTA'
  | 'OREB' | 'DREB'
  | 'AST' | 'TO' | 'STL' | 'BLK'
  | 'PF' | 'TF';

export interface StatEvent {
  id: string;
  gameId: string;
  teamId: string;
  playerId: string;
  playerName: string;
  playerNumber: string;
  type: StatType;
  quarter: number;
  clockTime: string;
  courtZone?: CourtZone;
  courtX?: number;
  courtY?: number;
  timestamp: number;
}

export type GameStatus = 'setup' | 'live' | 'halftime' | 'final';

export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: Team;
  awayTeam: Team;
  quarter: number;
  clockTime: string;
  events: StatEvent[];
  status: GameStatus;
  date: string;
  venue?: string;
  createdAt: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  playerNumber: string;
  teamId: string;
  pts: number;
  reb: number;
  oreb: number;
  dreb: number;
  ast: number;
  to: number;
  stl: number;
  blk: number;
  pf: number;
  fgm: number;
  fga: number;
  threePm: number;
  threePa: number;
  ftm: number;
  fta: number;
}

export interface AppState {
  teams: Team[];
  games: Game[];
  activeGameId: string | null;
}

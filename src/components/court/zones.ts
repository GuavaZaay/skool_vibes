import { CourtZone } from '../../types';

export interface Zone {
  id: CourtZone;
  label: string;
  is3pt: boolean;
  color: string;
  // SVG path data — all zones within viewBox="0 0 500 470"
  // Basket at (250, 418), baseline at y=470
  // 10px = 1 foot
  path: string;
  // Approximate center for label placement
  labelX: number;
  labelY: number;
}

// Court geometry constants
// viewBox: 0 0 500 470
// Baseline: y=470
// Basket: x=250, y=418 (5.2ft from baseline)
// Paint: x=190 to x=310 (12ft wide), y=280 to y=470 (19ft from baseline)
// FT line: y=280
// 3pt arc: radius=238px from basket (23.75ft)
// Corner 3 boundary: x<=60 or x>=440, from y=329 down to baseline (corner 3 = 22ft)
// 3pt arc intersects y=329 at corners

// Arc path helpers
// The 3-point arc from corner to corner
// Corner 3s are straight lines at x=60 (left) and x=440 (right), from y=329 to y=470
// The arc connects x=60,y=329 to x=440,y=329 via the arc centered at (250,418)

export const zones: Zone[] = [
  {
    id: 'paint',
    label: 'Paint',
    is3pt: false,
    color: '#FF9F0A',
    // Rectangle from paint top to baseline, excluding FT circle interior overlap
    // Paint: x=190 to x=310, y=280 to y=470
    path: 'M 190 280 L 310 280 L 310 470 L 190 470 Z',
    labelX: 250,
    labelY: 395,
  },
  {
    id: 'ft-line',
    label: 'Free Throw',
    is3pt: false,
    color: '#FF9F0A',
    // The FT circle area above the paint rectangle
    // FT circle: center (250,280), radius 60px
    // Area above paint (y<280) within the FT circle
    // Approximate with a half-circle arc going upward
    path: 'M 190 280 A 60 60 0 0 1 310 280 Z',
    labelX: 250,
    labelY: 265,
  },
  {
    id: 'left-elbow',
    label: 'Left Elbow',
    is3pt: false,
    color: '#0A84FF',
    // Left side midrange at elbow (near FT line extended)
    // Left of paint (x<190), above corner 3 zone (y<329), within 3pt arc
    // Bounded: x=60 to 190, y=240 to 329
    path: 'M 60 329 L 60 240 L 190 240 L 190 280 L 190 329 Z',
    labelX: 125,
    labelY: 295,
  },
  {
    id: 'right-elbow',
    label: 'Right Elbow',
    is3pt: false,
    color: '#0A84FF',
    // Right side midrange at elbow
    // Right of paint (x>310), above corner 3 zone, within 3pt arc
    path: 'M 440 329 L 440 240 L 310 240 L 310 280 L 310 329 Z',
    labelX: 375,
    labelY: 295,
  },
  {
    id: 'left-mid',
    label: 'Left Mid',
    is3pt: false,
    color: '#0A84FF',
    // Left midrange above the elbow area
    // x=0 to 190, y=80 to 240 approximately, within 3pt arc
    path: 'M 60 240 L 60 150 Q 100 120 140 100 L 190 80 L 190 240 Z',
    labelX: 105,
    labelY: 190,
  },
  {
    id: 'right-mid',
    label: 'Right Mid',
    is3pt: false,
    color: '#0A84FF',
    // Right midrange
    path: 'M 440 240 L 440 150 Q 400 120 360 100 L 310 80 L 310 240 Z',
    labelX: 395,
    labelY: 190,
  },
  {
    id: 'left-corner-3',
    label: 'Left Corner 3',
    is3pt: true,
    color: '#30D158',
    // Left corner 3: x=0 to 60, y=329 to 470
    path: 'M 0 329 L 60 329 L 60 470 L 0 470 Z',
    labelX: 30,
    labelY: 400,
  },
  {
    id: 'right-corner-3',
    label: 'Right Corner 3',
    is3pt: true,
    color: '#30D158',
    // Right corner 3: x=440 to 500, y=329 to 470
    path: 'M 440 329 L 500 329 L 500 470 L 440 470 Z',
    labelX: 470,
    labelY: 400,
  },
  {
    id: 'left-wing-3',
    label: 'Left Wing 3',
    is3pt: true,
    color: '#30D158',
    // Left wing 3: from corner 3 boundary to the arc, mid-height
    // Bounded by: x=0-60 to arc, y=150 to 329
    // Arc connects (60, 329) going up and around
    path: 'M 0 329 L 60 329 L 60 150 Q 30 200 20 250 L 0 300 Z',
    labelX: 28,
    labelY: 245,
  },
  {
    id: 'right-wing-3',
    label: 'Right Wing 3',
    is3pt: true,
    color: '#30D158',
    // Right wing 3
    path: 'M 500 329 L 440 329 L 440 150 Q 470 200 480 250 L 500 300 Z',
    labelX: 472,
    labelY: 245,
  },
  {
    id: 'top-arc-3',
    label: 'Top of Arc',
    is3pt: true,
    color: '#30D158',
    // Top of the arc 3: above midrange areas
    // The top-center area beyond the 3pt arc
    path: 'M 60 150 L 140 100 L 190 80 L 250 70 L 310 80 L 360 100 L 440 150 L 440 80 L 250 20 L 60 80 Z',
    labelX: 250,
    labelY: 55,
  },
];

// Get zone by id
export function getZone(id: CourtZone): Zone | undefined {
  return zones.find((z) => z.id === id);
}

// Get zones relevant for a given stat context
export function getZoneStatTypes(zone: CourtZone): string[] {
  const z = getZone(zone);
  if (!z) return [];
  if (z.is3pt) return ['3PM', '3PA'];
  return ['FGM', 'FGA'];
}

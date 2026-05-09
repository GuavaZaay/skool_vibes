import React, { useRef } from 'react';
import { CourtZone } from '../../types';
import { zones } from './zones';

interface CourtMapProps {
  onZoneSelect: (zone: CourtZone, x: number, y: number) => void;
  activeZone?: CourtZone | null;
  className?: string;
}

export default function CourtMap({ onZoneSelect, activeZone, className = '' }: CourtMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleZoneClick = (e: React.MouseEvent<SVGPathElement>, zoneId: CourtZone) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 470 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onZoneSelect(zoneId, Math.round(x), Math.round(y));
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 500 470"
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="courtGrad" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#2A1A08" />
          <stop offset="100%" stopColor="#0F0A04" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="courtClip">
          <rect x="0" y="0" width="500" height="470" rx="0" />
        </clipPath>
      </defs>

      {/* Court surface */}
      <rect x="0" y="0" width="500" height="470" fill="url(#courtGrad)" />

      {/* Court border */}
      <rect x="2" y="2" width="496" height="466" fill="none" stroke="rgba(200,164,74,0.4)" strokeWidth="2" />

      {/* Paint rectangle */}
      <rect x="190" y="280" width="120" height="190" fill="rgba(200,164,74,0.06)" stroke="rgba(200,164,74,0.5)" strokeWidth="1.5" />

      {/* Free throw circle - top half (above FT line) */}
      <path
        d="M 190 280 A 60 60 0 0 1 310 280"
        fill="none"
        stroke="rgba(200,164,74,0.5)"
        strokeWidth="1.5"
      />
      {/* Free throw circle - bottom half (inside paint, dashed) */}
      <path
        d="M 190 280 A 60 60 0 0 0 310 280"
        fill="none"
        stroke="rgba(200,164,74,0.3)"
        strokeWidth="1.5"
        strokeDasharray="6,4"
      />

      {/* Three-point arc */}
      {/* The arc from left corner (60,329) to right corner (440,329) */}
      {/* Center of arc at basket (250,418), radius ≈ 238 */}
      <path
        d="M 60 329 A 238 238 0 0 1 440 329"
        fill="none"
        stroke="rgba(200,164,74,0.5)"
        strokeWidth="1.5"
      />

      {/* Corner 3 lines (vertical) */}
      <line x1="60" y1="329" x2="60" y2="470" stroke="rgba(200,164,74,0.5)" strokeWidth="1.5" />
      <line x1="440" y1="329" x2="440" y2="470" stroke="rgba(200,164,74,0.5)" strokeWidth="1.5" />

      {/* Backboard */}
      <line x1="215" y1="460" x2="285" y2="460" stroke="rgba(200,164,74,0.8)" strokeWidth="3" strokeLinecap="round" />
      {/* Backboard support */}
      <line x1="250" y1="460" x2="250" y2="454" stroke="rgba(200,164,74,0.6)" strokeWidth="1.5" />

      {/* Basket (rim) */}
      <circle cx="250" cy="418" r="10" fill="none" stroke="#FF9F0A" strokeWidth="2.5" opacity="0.9" />
      {/* Net suggestion */}
      <line x1="243" y1="425" x2="240" y2="434" stroke="#FF9F0A" strokeWidth="1" opacity="0.5" />
      <line x1="250" y1="428" x2="250" y2="437" stroke="#FF9F0A" strokeWidth="1" opacity="0.5" />
      <line x1="257" y1="425" x2="260" y2="434" stroke="#FF9F0A" strokeWidth="1" opacity="0.5" />

      {/* Restricted area arc (4ft radius ≈ 40px) */}
      <path
        d="M 210 418 A 40 40 0 0 1 290 418"
        fill="none"
        stroke="rgba(200,164,74,0.35)"
        strokeWidth="1.5"
        strokeDasharray="4,3"
      />

      {/* Half court line at top */}
      <line x1="0" y1="0" x2="500" y2="0" stroke="rgba(200,164,74,0.3)" strokeWidth="1" />

      {/* Clickable zone overlays */}
      {zones.map((zone) => {
        const isActive = activeZone === zone.id;
        return (
          <g key={zone.id}>
            <path
              d={zone.path}
              fill={isActive ? zone.color : 'transparent'}
              opacity={isActive ? 0.25 : 1}
              stroke={isActive ? zone.color : 'transparent'}
              strokeWidth={isActive ? 1.5 : 0}
              className="court-zone"
              onClick={(e) => handleZoneClick(e, zone.id)}
            />
            {/* Hover overlay - separate element */}
            <path
              d={zone.path}
              fill={zone.color}
              opacity={0}
              className="court-zone"
              style={{ '--hover-opacity': '0.15' } as React.CSSProperties}
              onClick={(e) => handleZoneClick(e, zone.id)}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as SVGPathElement).style.opacity = '0.12';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as SVGPathElement).style.opacity = '0';
              }}
            />
            {/* Zone label */}
            <text
              x={zone.labelX}
              y={zone.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="rgba(200,164,74,0.45)"
              fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
              fontWeight="600"
              letterSpacing="0.3"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {zone.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Active zone highlight glow */}
      {activeZone && (() => {
        const zone = zones.find((z) => z.id === activeZone);
        if (!zone) return null;
        return (
          <path
            d={zone.path}
            fill={zone.color}
            opacity="0.2"
            filter="url(#glow)"
            style={{ pointerEvents: 'none' }}
          />
        );
      })()}
    </svg>
  );
}

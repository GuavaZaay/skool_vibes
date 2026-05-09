import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Game, StatEvent } from '../types';
import { computeTeamStats, computeTeamScore, formatPct } from './stats';

export function exportPDF(game: Game): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const homeScore = computeTeamScore(game.events, game.homeTeamId);
  const awayScore = computeTeamScore(game.events, game.awayTeamId);

  // Header
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 297, 210, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('KEEPSCORE — BOX SCORE', 148, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text(`${game.date}${game.venue ? ' · ' + game.venue : ''}`, 148, 26, { align: 'center' });

  // Score banner
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(game.homeTeam.name, 80, 40, { align: 'center' });
  doc.text(game.awayTeam.name, 217, 40, { align: 'center' });

  doc.setFontSize(36);
  doc.setTextColor(10, 132, 255);
  doc.text(`${homeScore}`, 80, 54, { align: 'center' });
  doc.text(`${awayScore}`, 217, 54, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(180, 180, 180);
  doc.text('vs', 148, 48, { align: 'center' });

  const columns = [
    'Player', '#', 'PTS', 'REB', 'AST', 'TO', 'STL', 'BLK',
    'FG', '3PT', 'FT', 'PF'
  ];

  const makeRows = (teamId: string) => {
    const stats = computeTeamStats(game.events, teamId);
    return stats
      .sort((a, b) => b.pts - a.pts)
      .map((s) => [
        s.playerName,
        s.playerNumber,
        s.pts,
        s.reb,
        s.ast,
        s.to,
        s.stl,
        s.blk,
        `${s.fgm}-${s.fga} (${formatPct(s.fgm, s.fga)})`,
        `${s.threePm}-${s.threePa} (${formatPct(s.threePm, s.threePa)})`,
        `${s.ftm}-${s.fta} (${formatPct(s.ftm, s.fta)})`,
        s.pf,
      ]);
  };

  const tableStyle = {
    theme: 'grid' as const,
    styles: {
      fillColor: [28, 28, 30] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [44, 44, 46] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold' as const,
    },
    alternateRowStyles: {
      fillColor: [36, 36, 38] as [number, number, number],
    },
  };

  // Home team table
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`${game.homeTeam.name} (Home)`, 14, 64);

  autoTable(doc, {
    startY: 67,
    head: [columns],
    body: makeRows(game.homeTeamId),
    ...tableStyle,
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${game.awayTeam.name} (Away)`, 14, finalY + 10);

  autoTable(doc, {
    startY: finalY + 13,
    head: [columns],
    body: makeRows(game.awayTeamId),
    ...tableStyle,
    margin: { left: 14, right: 14 },
  });

  doc.save(`keepscore-${game.homeTeam.abbreviation}-vs-${game.awayTeam.abbreviation}-${game.date}.pdf`);
}

export function exportCSV(game: Game): void {
  const headers = [
    'Quarter', 'Clock', 'Team', 'Player', 'Number',
    'Stat', 'Zone', 'X', 'Y', 'Timestamp'
  ];

  const rows: string[][] = game.events.map((e: StatEvent) => [
    String(e.quarter),
    e.clockTime,
    e.teamId === game.homeTeamId ? game.homeTeam.name : game.awayTeam.name,
    e.playerName,
    e.playerNumber,
    e.type,
    e.courtZone ?? '',
    e.courtX !== undefined ? String(e.courtX) : '',
    e.courtY !== undefined ? String(e.courtY) : '',
    new Date(e.timestamp).toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `keepscore-${game.homeTeam.abbreviation}-vs-${game.awayTeam.abbreviation}-${game.date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

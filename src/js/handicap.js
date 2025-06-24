// handicap.js

export function calculateHandicap(rounds) {
  // Filtra solo round validi (con CR, slope, totalPar, totalDistance e almeno 9 buche)
  const validRounds = rounds.filter(r =>
    r.cr && r.slope && r.totalPar && r.totalDistance && r.holes?.length >= 9
  );

  // Dividi round da 18 buche e 9 buche
  const rounds18 = validRounds.filter(r => r.holes.length === 18);
  const rounds9 = validRounds.filter(r => r.holes.length === 9);

  // Accoppia round da 9 buche in ordine di punteggio crescente
  rounds9.sort((a, b) => a.holes.reduce((s, h) => s + h.score, 0) - b.holes.reduce((s, h) => s + h.score, 0));
  const paired9s = [];
  for (let i = 0; i < rounds9.length - 1; i += 2) {
    const first = rounds9[i];
    const second = rounds9[i + 1];
    paired9s.push({
      cr: (first.cr + second.cr) / 2,
      slope: (first.slope + second.slope) / 2,
      score: first.holes.reduce((s, h) => s + h.score, 0) + second.holes.reduce((s, h) => s + h.score, 0),
      totalPar: first.totalPar + second.totalPar
    });
  }

  // Concatena tutti i round da 18 buche e i round da 9 accoppiati
  const allCombined = [
    ...rounds18.map(r => ({
      cr: r.cr,
      slope: r.slope,
      score: r.holes.reduce((s, h) => s + h.score, 0),
      totalPar: r.totalPar
    })),
    ...paired9s
  ];

  // Calcola gli score differentials
  const differentials = allCombined.map(r => (((r.score - r.totalPar) * 113) / r.slope).toFixed(1)).map(Number);

  if (differentials.length === 0) return null;

  // Prendi i migliori 8 se >= 20 round, altrimenti segui WHS
  let count = 1;
  if (differentials.length >= 20) count = 8;
  else if (differentials.length >= 7) count = 2;

  const best = differentials.sort((a, b) => a - b).slice(0, count);
  const avg = best.reduce((s, d) => s + d, 0) / count;

  return parseFloat(avg.toFixed(1));
}

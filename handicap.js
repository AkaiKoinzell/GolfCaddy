export function calculateHandicapIndex(rounds) {
  const differentials = [];

  rounds.forEach(r => {
    if (!r.holes || r.holes.length === 0 || !r.totalPar || !r.totalDistance || !r.cr || !r.slope) return;

    let grossScore = r.holes.reduce((sum, h) => sum + (h.score || 0), 0);
    let par = r.totalPar;
    let cr = r.cr;
    let slope = r.slope;

    // Se 9 buche, raddoppia tutto
    if (r.holes.length === 9) {
      grossScore *= 2;
      par *= 2;
      cr *= 2;
    }

    const differential = ((113 / slope) * (grossScore - cr));
    differentials.push(parseFloat(differential.toFixed(1)));
  });

  if (differentials.length === 0) return null;

  // Ordina e seleziona i migliori
  differentials.sort((a, b) => a - b);
  const count = differentials.length >= 20 ? 8 :
                differentials.length >= 15 ? 6 :
                differentials.length >= 10 ? 4 :
                differentials.length >= 5 ? 2 : 1;

  const selected = differentials.slice(0, count);
  const average = selected.reduce((sum, d) => sum + d, 0) / selected.length;
  return parseFloat(average.toFixed(1));
}

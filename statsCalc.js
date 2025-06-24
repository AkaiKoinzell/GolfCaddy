export function expectedStrokes(distance){
  const d = Math.max(0, distance);
  return 2 + Math.sqrt(d/50);
}

export function computeStrokesGained(rounds){
  const clubStrokes = {};
  rounds.forEach(r => {
    r.holes.forEach(h => {
      let remaining = h.distance || 0;
      const shotList = (h.shots && h.shots.length)
        ? h.shots
        : (h.distanceShot ? [{club:h.club || 'Altro', distance:h.distanceShot}] : []);
      shotList.forEach(s => {
        if(!s || typeof s.distance !== 'number') return;
        const before = remaining;
        const after = Math.max(remaining - s.distance, 0);
        const sg = expectedStrokes(before) - (1 + expectedStrokes(after));
        const club = s.club || 'Altro';
        if(!clubStrokes[club]) clubStrokes[club] = {total:0,count:0};
        clubStrokes[club].total += sg;
        clubStrokes[club].count++;
        remaining = after;
      });
    });
  });
  return clubStrokes;
}

export function aggregateClubStats(rounds, shots){
  const clubAggregates = {};
  const clubDistances = {};
  shots.forEach(s => {
    const club = s.club || 'Altro';
    if(!clubAggregates[club]) {
      clubAggregates[club] = { count:0, distTotal:0, distMin:Infinity, distMax:0, manualCount:0 };
      clubDistances[club] = [];
    }
    clubAggregates[club].count++;
    clubAggregates[club].manualCount++;
    clubAggregates[club].distTotal += s.distance || 0;
    clubAggregates[club].distMin = Math.min(clubAggregates[club].distMin, s.distance || 0);
    clubAggregates[club].distMax = Math.max(clubAggregates[club].distMax, s.distance || 0);
    if(s.distance) clubDistances[club].push(s.distance);
  });
  rounds.forEach(r=>{
    r.holes.forEach(h=>{
      if(h.shots && h.shots.length){
        h.shots.forEach(s=>{
          const club = s.club || 'Altro';
          if(!clubAggregates[club]){
            clubAggregates[club] = { count:0, distTotal:0, distMin:Infinity, distMax:0, manualCount:0 };
            clubDistances[club] = [];
          }
          clubAggregates[club].count++;
          if(s.distance){
            clubAggregates[club].manualCount++;
            clubAggregates[club].distTotal += s.distance;
            clubAggregates[club].distMin = Math.min(clubAggregates[club].distMin, s.distance);
            clubAggregates[club].distMax = Math.max(clubAggregates[club].distMax, s.distance);
            clubDistances[club].push(s.distance);
          }
        });
      } else if(h.club){
        const club = h.club;
        if(!clubAggregates[club]){
          clubAggregates[club] = { count:0, distTotal:0, distMin:Infinity, distMax:0, manualCount:0 };
          clubDistances[club] = [];
        }
        clubAggregates[club].count++;
        if(h.distanceShot){
          clubAggregates[club].manualCount++;
          clubAggregates[club].distTotal += h.distanceShot;
          clubAggregates[club].distMin = Math.min(clubAggregates[club].distMin, h.distanceShot);
          clubAggregates[club].distMax = Math.max(clubAggregates[club].distMax, h.distanceShot);
          clubDistances[club].push(h.distanceShot);
        }
      }
    });
  });
  return { clubAggregates, clubDistances };
}

export function filterRounds(allRounds, filters){
  return allRounds
    .filter(r => (filters.format === 'all' || r.format === parseInt(filters.format)))
    .filter(r => (filters.course === 'all' || r.course === filters.course))
    .filter(r => {
      const s = filters.start ? new Date(filters.start) : null;
      const e = filters.end ? new Date(filters.end) : null;
      return (!s || r.date >= s) && (!e || r.date <= e);
    })
    .sort((a,b) => a.date - b.date);
}

export function validHandicapRounds(allRounds){
  return allRounds
    .filter(r => (r.format === 18 || r.combo) && r.courseRating && r.slopeRating)
    .map(r => ({
      cr: r.courseRating,
      slope: r.slopeRating,
      totalPar: r.par,
      totalDistance: r.totalDistance || 6000,
      holes: r.holes,
      date: r.date,
      score: r.score,
      par: r.par
    }));
}

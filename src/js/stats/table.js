function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

function formatDate(d){
  return d.toLocaleDateString('it-IT');
}

export function drawTable(rounds, viewingFriend, deleteRound, copyRoundLink){
  const tbody = document.querySelector('#rounds-table tbody');
  tbody.innerHTML = '';
  rounds.forEach(r => {
    const netto = (typeof r.par === 'number') ? (r.score - r.par) : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(r.date)}</td>
      <td>${escapeHTML(r.course)}</td>
      <td>${escapeHTML(r.format)} buche</td>
      <td>${r.score}</td>
      <td>${netto !== '' ? (netto >= 0 ? '+' + netto : netto) : ''}</td>
      <td><a href="round.html?id=${r.id}">Dettagli</a></td>
      <td><button class="copy-link" data-id="${r.id}">Copia link</button></td>
      ${viewingFriend ? '<td></td>' : `<td><button class="delete-round" data-id="${r.id}">Elimina</button></td>`}
    `;
    tbody.appendChild(tr);
  });
  if(!viewingFriend){
    tbody.querySelectorAll('.delete-round').forEach(btn => {
      btn.addEventListener('click', () => deleteRound(btn.dataset.id));
    });
  }
  tbody.querySelectorAll('.copy-link').forEach(btn => {
    btn.addEventListener('click', () => copyRoundLink(btn.dataset.id));
  });
}

export function drawParAverages(rounds){
  const totals = {3:{shots:0,putts:0,count:0},4:{shots:0,putts:0,count:0},5:{shots:0,putts:0,count:0}};
  rounds.forEach(r=>{
    r.holes.forEach(h=>{
      if(totals[h.par]){
        totals[h.par].shots += h.score;
        totals[h.par].putts += h.putts;
        totals[h.par].count++;
      }
    });
  });
  const tbody = document.querySelector('#par-average-table tbody');
  tbody.innerHTML = '';
  [3,4,5].forEach(p=>{
    const row = `<tr><td>Par ${p}</td><td>${(totals[p].shots / totals[p].count || 0).toFixed(2)}</td><td>${(totals[p].putts / totals[p].count || 0).toFixed(2)}</td></tr>`;
    tbody.innerHTML += row;
  });
}

export function updateClubStatsDisplay(clubAggregates, clubStrokes, filter){
  const tbody = document.querySelector('#club-shots-table tbody');
  tbody.innerHTML = '';
  Object.keys(clubAggregates).sort().forEach(club => {
    if(filter !== 'all' && club !== filter) return;
    const s = clubAggregates[club];
    const avg = s.manualCount ? (s.distTotal / s.manualCount).toFixed(1) : '-';
    const max = s.manualCount ? s.distMax : '-';
    const min = s.manualCount ? s.distMin : '-';
    const sg = clubStrokes[club] ? (clubStrokes[club].total / clubStrokes[club].count).toFixed(2) : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${club}</td><td>${s.count}</td><td>${avg}</td><td>${max}</td><td>${min}</td><td>${sg}</td>`;
    tbody.appendChild(tr);
  });
}

export function updateFwGirTable(rounds){
  const fwOpp = rounds.reduce((s,r)=>s + r.holes.filter(h=>h.fairway!=='na').length,0);
  const fwHit = rounds.reduce((s,r)=>s + r.holes.filter(h=>h.fairway==='yes').length,0);
  const girTot = rounds.reduce((s,r)=>s + r.holes.length,0);
  const girHit = rounds.reduce((s,r)=>s + r.holes.filter(h=>(h.score - h.putts)<=h.par-2).length,0);
  const tbody = document.querySelector('#fw-gir-table tbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  const fwPct = fwOpp?((fwHit/fwOpp)*100).toFixed(1):'0';
  const girPct = girTot?((girHit/girTot)*100).toFixed(1):'0';
  tbody.innerHTML = `<tr><td>Fairway hit</td><td>${fwPct}%</td></tr>`+
                    `<tr><td>GIR</td><td>${girPct}%</td></tr>`;
}

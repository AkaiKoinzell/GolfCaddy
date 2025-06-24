const styleVars = getComputedStyle(document.documentElement);
export const CHART_COLORS = {
  distance: styleVars.getPropertyValue('--accent-color').trim() || '#4682B4',
  putt: styleVars.getPropertyValue('--chart-putt-color').trim() || '#32CD32',
  bar18: styleVars.getPropertyValue('--chart-18-color').trim() || '#006400',
  bar9: styleVars.getPropertyValue('--chart-9-color').trim() || '#32CD32',
  hcp: styleVars.getPropertyValue('--chart-hcp-color').trim() || '#FFA500',
  fw: styleVars.getPropertyValue('--chart-fw-color').trim() || '#1E90FF',
  gir: styleVars.getPropertyValue('--chart-gir-color').trim() || '#FF4500'
};

let hcpChart, puttChart, clubDistanceChart, fwGirChart;

export function populateCourseFilter(allRounds, filters, updateCallback){
  const sel = document.getElementById('filter-course');
  const courses = [...new Set(allRounds.map(r=>r.course))];
  courses.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
  ['filter-format','filter-course','start-date','end-date'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('change', e => {
      if(id==='filter-format') filters.format = e.target.value;
      else if(id==='filter-course') filters.course = e.target.value;
      else if(id==='start-date') filters.start = e.target.value;
      else if(id==='end-date') filters.end = e.target.value;
      updateCallback();
    });
  });
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

export function drawClubDistanceChart(distances){
  if(clubDistanceChart){
    clubDistanceChart.destroy();
    clubDistanceChart = null;
  }
  if(!distances || !distances.length) return;
  const binSize = 10;
  const bins = {};
  distances.forEach(d=>{
    const b = Math.floor(d/binSize)*binSize;
    bins[b] = (bins[b]||0)+1;
  });
  const keys = Object.keys(bins).sort((a,b)=>a-b);
  const labels = keys.map(k=>`${k}-${Number(k)+binSize-1}`);
  const data = keys.map(k=>bins[k]);
  clubDistanceChart = new Chart(document.getElementById('club-distance-chart'),{
    type:'bar',
    data:{ labels, datasets:[{ label:'Distanza (m)', data, backgroundColor:CHART_COLORS.distance }]},
    options:{ scales:{ y:{ beginAtZero:true } } }
  });
}

export function renderClubDistanceChart(clubDistances, club){
  const distances = club === 'all'
    ? Object.values(clubDistances).flat()
    : (clubDistances[club] || []);
  drawClubDistanceChart(distances);
}

export function drawCharts(rounds, validRounds){
  const labels = rounds.map(r=>formatDate(r.date));
  const puttPct = rounds.map(r=>((r.putts / r.score)*100).toFixed(1));

  if(puttChart) puttChart.destroy();
  puttChart = new Chart(document.getElementById('puttChart'), {
    type:'bar',
    data:{ labels, datasets:[{ label:'% Putt', data: puttPct, backgroundColor:CHART_COLORS.putt }]},
    options:{ scales:{ y:{ beginAtZero:true, max:100 } } }
  });

  if(hcpChart) hcpChart.destroy();
  const allLabels = rounds.map(r=>formatDate(r.date));
  const data18 = rounds.map(r=>r.format===18? r.score - r.par : null);
  const data9 = rounds.map(r=>r.format===9? r.score - r.par : null);

  const hcpData = allLabels.map(label=>{
    const match = validRounds.find(r=>formatDate(r.date)===label);
    return match ? ((match.holes.reduce((s,h)=>s+h.score,0) - match.totalPar)) : null;
  });

  hcpChart = new Chart(document.getElementById('hcpChart'), {
    type:'bar',
    data:{
      labels: allLabels,
      datasets:[
        { label:'18 buche', data:data18, backgroundColor:CHART_COLORS.bar18 },
        { label:'9 buche', data:data9, backgroundColor:CHART_COLORS.bar9 },
        { label:'Valido per Handicap', type:'line', data:hcpData, borderColor:CHART_COLORS.hcp, borderWidth:2, fill:false, tension:0.3 }
      ]
    },
    options:{ responsive:true, plugins:{ legend:{ position:'top' } } }
  });
}

export function drawFwGirChart(rounds){
  if(fwGirChart){
    fwGirChart.destroy();
    fwGirChart = null;
  }
  const labels = rounds.map(r=>formatDate(r.date));
  const fwPct = rounds.map(r=>{
    const total = r.holes.filter(h=>h.fairway!=='na').length;
    const hit = r.holes.filter(h=>h.fairway==='yes').length;
    return total?((hit/total)*100).toFixed(1):0;
  });
  const girPct = rounds.map(r=>{
    const count = r.holes.filter(h=>(h.score - h.putts)<=h.par-2).length;
    return r.holes.length?((count/r.holes.length)*100).toFixed(1):0;
  });
  fwGirChart = new Chart(document.getElementById('fwGirChart'), {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'% Fairway', data:fwPct, borderColor:CHART_COLORS.fw, fill:false },
        { label:'% GIR', data:girPct, borderColor:CHART_COLORS.gir, fill:false }
      ]
    },
    options:{ scales:{ y:{ beginAtZero:true, max:100 } } }
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

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

function formatDate(d){
  return d.toLocaleDateString('it-IT');
}

if (!localStorage.getItem("uid")) {
  window.location.href = "home.html";
}

import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';
import { calculateHandicap } from './handicap.js';

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

const { db } = initFirebase();
const uid = localStorage.getItem("uid");

let allRounds = [], filters = { format: 'all', course: 'all', start: '', end: '' };
let hcpChart, puttChart, clubDistanceChart, fwGirChart;
let allShots = [];
let clubAggregates = {}, clubDistances = {};

const styleVars = getComputedStyle(document.documentElement);
const CHART_COLORS = {
  distance: styleVars.getPropertyValue('--accent-color').trim() || '#4682B4',
  putt: styleVars.getPropertyValue('--chart-putt-color').trim() || '#32CD32',
  bar18: styleVars.getPropertyValue('--chart-18-color').trim() || '#006400',
  bar9: styleVars.getPropertyValue('--chart-9-color').trim() || '#32CD32',
  hcp: styleVars.getPropertyValue('--chart-hcp-color').trim() || '#FFA500',
  fw: styleVars.getPropertyValue('--chart-fw-color').trim() || '#1E90FF',
  gir: styleVars.getPropertyValue('--chart-gir-color').trim() || '#FF4500'
};

async function loadStats() {
  const q = query(collection(db, "golf_rounds"), where("uid", "==", uid));
  const snap = await getDocs(q);
  allRounds = snap.docs.map(doc => {
    const d = doc.data();
    const date = new Date(d.timestamp || d.date || doc.id);
    const format = d.holes.length <= 9 ? 9 : 18;
    const score = d.holes.reduce((a,h)=>a+h.score,0);
    const par = d.holes.reduce((a,h)=>a+(h.par || 0),0);
    return {
      id: doc.id,
      course: d.course,
      date,
      format,
      score,
      par,
      holes: d.holes,
      putts: d.holes.reduce((a,h)=>a+(h.putts||0),0),
      courseRating: d.cr,
      slopeRating: d.slope,
      totalDistance: d.totalDistance,
      combo: d.combo || false
    };
  });

  await loadClubShots();
  populateCourseFilter();
  updateDisplay();
}

async function loadClubShots(){
  const qShots = query(collection(db, "club_shots"), where("uid", "==", uid));
  const snapShots = await getDocs(qShots);
  allShots = snapShots.docs.map(doc => {
    const data = doc.data();
    return {
      club: data.club,
      distance: data.distance,
      date: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
    };
  });
}

function populateCourseFilter(){
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
      updateDisplay();
    });
  });
}

function updateDisplay() {
  const rounds = allRounds
    .filter(r => (filters.format === 'all' || r.format === parseInt(filters.format)))
    .filter(r => (filters.course === 'all' || r.course === filters.course))
    .filter(r => {
      const s = filters.start ? new Date(filters.start) : null;
      const e = filters.end ? new Date(filters.end) : null;
      return (!s || r.date >= s) && (!e || r.date <= e);
    })
    .sort((a,b) => a.date - b.date);

  const validForHCP = allRounds
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

  const h = calculateHandicap(validForHCP);
  document.getElementById('hcp-value').textContent = (typeof h === 'number') ? h.toFixed(1) : '--';

  drawTable(rounds);
  drawCharts(rounds, validForHCP);
  drawParAverages(rounds);
  drawClubStats(rounds);
  drawFwGirChart(rounds);
  updateFwGirTable(rounds);
}

function formatDate(d){
  return d.toLocaleDateString('it-IT');
}

function drawTable(rounds){
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
      <td><button class="delete-round" data-id="${r.id}">Elimina</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.delete-round').forEach(btn => {
    btn.addEventListener('click', () => deleteRound(btn.dataset.id));
  });
  tbody.querySelectorAll('.copy-link').forEach(btn => {
    btn.addEventListener('click', () => copyRoundLink(btn.dataset.id));
  });
}

function drawParAverages(rounds){
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

function drawClubStats(rounds){
  clubAggregates = {};
  clubDistances = {};
  allShots.forEach(s => {
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

  const sel = document.getElementById('club-filter');
  sel.innerHTML = '<option value="all">Tutti i club</option>';
  Object.keys(clubAggregates).sort().forEach(club => {
    const opt = document.createElement('option');
    opt.value = club;
    opt.textContent = club;
    sel.appendChild(opt);
  });
  updateClubStatsDisplay();
  renderClubDistanceChart(sel.value);
}

function updateClubStatsDisplay(){
  const filter = document.getElementById('club-filter').value;
  const tbody = document.querySelector('#club-shots-table tbody');
  tbody.innerHTML = '';
  Object.keys(clubAggregates).sort().forEach(club => {
    if(filter !== 'all' && club !== filter) return;
    const s = clubAggregates[club];
    const avg = s.manualCount ? (s.distTotal / s.manualCount).toFixed(1) : '-';
    const max = s.manualCount ? s.distMax : '-';
    const min = s.manualCount ? s.distMin : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${club}</td><td>${s.count}</td><td>${avg}</td><td>${max}</td><td>${min}</td>`;
    tbody.appendChild(tr);
  });
}

function renderClubDistanceChart(club){
  const distances = club === 'all'
    ? Object.values(clubDistances).flat()
    : (clubDistances[club] || []);
  drawClubDistanceChart(distances);
}

function drawClubDistanceChart(distances){
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

async function deleteRound(id){
  if(!confirm('Eliminare il round?')) return;
  await deleteDoc(doc(db, 'golf_rounds', id));
  await loadStats();
}

function copyRoundLink(id){
  const url = `${window.location.origin}/round.html?id=${id}`;
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiato negli appunti');
    }).catch(() => {
      prompt('Copia il link:', url);
    });
  } else {
    prompt('Copia il link:', url);
  }
}

function drawCharts(rounds, validRounds){
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

function drawFwGirChart(rounds){
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

function updateFwGirTable(rounds){
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

function getWeek(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - yearStart)/86400000) + 1)/7);
}

loadStats();

document.getElementById('club-filter').addEventListener('change', e => {
  updateClubStatsDisplay();
  renderClubDistanceChart(e.target.value);
});

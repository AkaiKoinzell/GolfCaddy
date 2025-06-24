if (!localStorage.getItem("uid")) {
  window.location.href = "home.html";
}

import { collection, getDocs, query, where, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './src/firebase-config.js';
import { calculateHandicap } from './handicap.js';
import { computeStrokesGained, aggregateClubStats, filterRounds, validHandicapRounds, computeScoreTrend, computeRoundStrokesGained } from './statsCalc.js';
import { drawCharts, renderClubDistanceChart, drawFwGirChart, drawScoreTrendChart, drawSgChart } from './src/js/stats/charts.js';
import { drawTable, drawParAverages, updateClubStatsDisplay, updateFwGirTable } from './src/js/stats/table.js';
import { populateCourseFilter } from './src/js/stats/filters.js';

const { db } = initFirebase();
const params = new URLSearchParams(window.location.search);
const loggedUid = localStorage.getItem("uid");
const uid = params.get('uid') || loggedUid;
const viewingFriend = uid !== loggedUid;

let allRounds = [], filters = { format: 'all', course: 'all', start: '', end: '' };
let allShots = [];
let clubAggregates = {}, clubDistances = {}, clubStrokes = {};

async function loadStats() {
  if(viewingFriend){
    try {
      const s = await getDoc(doc(db, 'users', uid));
      const name = s.exists() ? (s.data().name || 'amico') : 'amico';
      document.getElementById('stats-title').textContent = `Statistiche di ${name}`;
    } catch(e){
      document.getElementById('stats-title').textContent = 'Statistiche Amico';
    }
  }
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
  populateCourseFilter(allRounds, filters, updateDisplay);
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

function populateClubFilterOptions(clubs){
  const sel = document.getElementById('club-filter');
  if(!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="all">Tutti i club</option>';
  Object.keys(clubs).sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
  if([...sel.options].some(o => o.value === current)) sel.value = current;
}


function updateDisplay() {
  const rounds = filterRounds(allRounds, filters);
  const validForHCP = validHandicapRounds(allRounds);

  const h = calculateHandicap(validForHCP);
  document.getElementById('hcp-value').textContent = (typeof h === 'number') ? h.toFixed(1) : '--';

  ({ clubAggregates, clubDistances } = aggregateClubStats(rounds, allShots));
  clubStrokes = computeStrokesGained(allRounds);
  const scoreTrend = computeScoreTrend(rounds);
  const sgTrend = computeRoundStrokesGained(rounds);
  populateClubFilterOptions(clubAggregates);

  drawTable(rounds, viewingFriend, deleteRound, copyRoundLink);
  drawCharts(rounds, validForHCP);
  drawScoreTrendChart(scoreTrend);
  drawSgChart(sgTrend);
  drawParAverages(rounds);
  updateClubStatsDisplay(clubAggregates, clubStrokes, document.getElementById('club-filter').value);
  renderClubDistanceChart(clubDistances, document.getElementById('club-filter').value);
  drawFwGirChart(rounds);
  updateFwGirTable(rounds);
}

async function deleteRound(id){
  if(viewingFriend) return;
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


loadStats();

document.getElementById('club-filter').addEventListener('change', e => {
  updateClubStatsDisplay(clubAggregates, clubStrokes, e.target.value);
  renderClubDistanceChart(clubDistances, e.target.value);
});

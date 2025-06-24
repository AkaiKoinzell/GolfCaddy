import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { initFirebase, firebaseConfig } from './src/firebase-config.js';
import { clubs as defaultClubs } from "./clubList.js";
import { loadClubs, getStoredClubs } from "./userSettings.js";
import {
  loadFriends as fetchFriends,
  populateFriendOptions,
  addPlayerName,
  addFriendPlayer,
  searchPlayers
} from './src/js/round/friends.js';
import {
  loadCourses as fetchCourses,
  populateCourseOptions,
  filterCourseOptions,
  updateLayoutOptions,
  updateComboOptions
} from './src/js/round/courses.js';
import {
  saveDraft as storeDraft,
  deleteDraft as removeDraft,
  fetchDraft,
  DRAFT_KEY
} from './src/js/round/draft.js';
let courses = {};



const { app, auth, db } = initFirebase();
const storageBucket = firebaseConfig.storageBucket;
let uid = null;
let userDisplayName = null;
let userEmail = null;
let currentHole = 1;
let totalHoles = 9;
let shotIndex = 0;
let selectedHoles = [];
const roundData = [];
let playersScores = [];
let clubs = getStoredClubs() || [...defaultClubs];
let friendList = [];
let currentPlayerIndex = 0;
let holeData = [];

// expose helper functions for inline handlers
window.addFriendPlayer = addFriendPlayer;
window.searchPlayers = async function(){
  const term = document.getElementById('player-search-input').value.trim();
  const list = document.getElementById('player-search-results');
  list.innerHTML = '';
  const results = await searchPlayers(term);
  results.forEach(r => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = r.label;
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-success';
    btn.textContent = 'Aggiungi';
    btn.onclick = () => addPlayerName(r.label);
    li.appendChild(btn);
    list.appendChild(li);
  });
};
window.populateCourseOptions = () => populateCourseOptions(courses);
window.filterCourseOptions = () => filterCourseOptions(courses);
window.updateLayoutOptions = () => updateLayoutOptions(courses);
window.updateComboOptions = () => updateComboOptions(courses);


onAuthStateChanged(auth, async (user) => {
  if (user) {
    uid = user.uid;
    userDisplayName = user.displayName;
    userEmail = user.email;

    clubs = await loadClubs(uid);
    document.querySelectorAll('.club-select').forEach(sel => populateClubSelect(sel));
    friendList = await fetchFriends(uid);
    populateFriendOptions(friendList);

    // Auto-riempi il campo giocatori se è vuoto
    const playersInput = document.getElementById("players");
    if (playersInput && !playersInput.value) {
      playersInput.value = userDisplayName || userEmail || "Giocatore";
    }
  }
});

function updateHoleNumber() {
  document.getElementById("hole-number").textContent = currentHole;
}

function autoFillHoleData() {
  const hole = selectedHoles[currentHole - 1];
  if (hole) {
    document.getElementById("par").value = hole.par;
    document.getElementById("distance").value = hole.distance;
  }
}

function buildDraft() {
  return {
    meta: window._roundMeta,
    roundData,
    playersScores,
    holeData,
    currentPlayerIndex,
    currentHole,
    totalHoles,
    selectedHoles,
    notesValue: document.getElementById('notes')?.value || '',
    uid,
    timestamp: new Date().toISOString()
  };
}


window.saveHole = async function () {
  const saveButton = document.querySelector("button[onclick='saveHole()']");
  saveButton.disabled = true; // blocca subito il doppio click

  const par = parseInt(document.getElementById("par").value);
  const distance = parseInt(document.getElementById("distance").value);
  saveCurrentPlayerData();
  let penalties = parseInt(document.getElementById("penalties").value);

  if ([par, distance].some(v => isNaN(v))) {
    alert("Compila tutti i campi numerici obbligatori con valori validi.");
    saveButton.disabled = false;
    return;
  }

  if (isNaN(penalties)) {
    penalties = 0;
  }

  holeData.forEach((data, idx) => {
    const shots = data.shots || [];
    const pen = parseInt(data.penalties);
    const penaltiesVal = isNaN(pen) ? 0 : pen;
    const puttsCount = shots.filter(s => s.club === 'Putter').length;
    const score = shots.length + penaltiesVal;
    const hole = {
      number: selectedHoles[currentHole - 1].number,
      par,
      distance,
      score,
      putts: puttsCount,
      fairway: data.fairway,
      penalties: penaltiesVal,
      shots,
      club: shots[0]?.club || '',
      distanceShot: shots[0] ? shots[0].distance : null
    };
    if(idx === 0) {
      roundData.push(hole);
    }
    playersScores[idx].holes.push({ score });
  });

  if (currentHole >= totalHoles) {
    // Evita salvataggi doppi
    if (localStorage.getItem("roundSaved") === "true") {
      alert("Round già salvato.");
      return;
    }

    try {
      const { course, layout, players, combo, cr, slope, totalPar, totalDistance } = window._roundMeta;
      await addDoc(collection(db, "golf_rounds"), {
        timestamp: new Date().toISOString(),
        course,
        layout,
        player: players[0],
        players: playersScores,
        combo,
        cr,
        slope,
        totalPar,
        totalDistance,
        notes: document.getElementById("notes").value,
        holes: roundData,
        uid: uid
      });

      localStorage.setItem("roundSaved", "true"); // flag per evitare duplicati

      await removeDraft(uid);

      alert("Round completato! I dati sono stati salvati online.");
      setTimeout(() => location.reload(), 1000); // delay per evitare race conditions
    } catch (error) {
      alert("Errore nel salvataggio su Firebase: " + error.message);
      saveButton.disabled = false; // riattiva in caso di errore
      await storeDraft(uid, buildDraft());
    }
  } else {
    currentHole++;
    updateHoleNumber();
    clearInputs();
    autoFillHoleData();
    resetHoleData();
    loadCurrentPlayerData();
    saveButton.disabled = false; // riattiva per buche successive
    await storeDraft(uid, buildDraft());
  }
};


function clearInputs() {
  ["par", "distance", "penalties"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("fairway").value = "na";
  const fairwayGroup = document.getElementById('fairway-group');
  if (fairwayGroup) fairwayGroup.classList.add('hidden');
  const container = document.getElementById('shots-container');
  container.innerHTML = '';
  shotIndex = 0;
  addShotRow();
}

function populateClubSelect(sel) {
  const select = sel || document.querySelector('#shots-container .club-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- Seleziona --</option>';
  clubs.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function addShotRow() {
  const container = document.getElementById('shots-container');
  const div = document.createElement('div');
  div.className = 'shot-row';
  const clubId = `club-select-${shotIndex}`;
  const distId = `distance-input-${shotIndex}`;
  div.innerHTML = `
    <label for="${clubId}">Bastone utilizzato:</label>
    <select id="${clubId}" class="club-select form-select"></select>
    <label for="${distId}">Distanza colpo (metri):</label>
    <input id="${distId}" type="number" class="distance-input form-control" />
  `;
  container.appendChild(div);
  populateClubSelect(div.querySelector('select'));
  const sel = div.querySelector('select');
  if (shotIndex === 0 && sel) {
    sel.addEventListener('change', maybeShowFairway);
  }
  shotIndex++;
}

function maybeShowFairway(){
  const grp = document.getElementById('fairway-group');
  if(grp) grp.classList.remove('hidden');
}

function saveCurrentPlayerData(){
  if(!holeData[currentPlayerIndex]) return;
  holeData[currentPlayerIndex].penalties = document.getElementById('penalties').value;
  holeData[currentPlayerIndex].fairway = document.getElementById('fairway').value;
  const shots = [];
  document.querySelectorAll('#shots-container .shot-row').forEach(row=>{
    const club = row.querySelector('.club-select').value;
    const distVal = parseInt(row.querySelector('.distance-input').value);
    if (club || !isNaN(distVal)) {
      shots.push({ club: club || null, distance: isNaN(distVal) ? null : distVal });
    }
  });
  holeData[currentPlayerIndex].shots = shots;
}

function loadCurrentPlayerData(){
  const data = holeData[currentPlayerIndex];
  document.getElementById('penalties').value = data.penalties;
  document.getElementById('fairway').value = data.fairway;
  const container = document.getElementById('shots-container');
  container.innerHTML = '';
  shotIndex = 0;
  if(data.shots && data.shots.length){
    const fairwayGroup = document.getElementById('fairway-group');
    if(fairwayGroup) fairwayGroup.classList.remove('hidden');
    data.shots.forEach(s=>{
      addShotRow();
      const row = container.lastElementChild;
      row.querySelector('.club-select').value = s.club || '';
      if(s.distance !== null && s.distance !== undefined)
        row.querySelector('.distance-input').value = s.distance;
    });
  } else {
    addShotRow();
    const fairwayGroup = document.getElementById('fairway-group');
    if(fairwayGroup) fairwayGroup.classList.add('hidden');
  }
}

function resetHoleData(){
  holeData = playersScores.map(() => ({ penalties: '', fairway: 'na', shots: [] }));
  currentPlayerIndex = 0;
  const sel = document.getElementById('player-select');
  if(sel) sel.value = '0';
}


async function checkForDraft() {
  const draft = await fetchDraft(uid);
  if (!draft || !draft.roundData || !draft.meta) return;

  if (confirm('Riprendere il round incompleto?')) {
    window._roundMeta = draft.meta;
    totalHoles = draft.totalHoles;
    currentHole = draft.currentHole;
    selectedHoles = draft.selectedHoles || [];
    roundData.length = 0;
    draft.roundData.forEach(h => roundData.push(h));

    document.getElementById('players').value = (draft.meta.players || []).join(', ');
    playersScores = draft.playersScores || (draft.meta.players || []).map(n => ({name: n, holes: []}));
    holeData = draft.holeData || (draft.meta.players || []).map(() => ({ penalties: '', fairway: 'na', shots: [] }));
    currentPlayerIndex = draft.currentPlayerIndex || 0;
    const sel = document.getElementById('player-select');
    if(sel){
      sel.innerHTML = playersScores.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('');
      sel.value = String(currentPlayerIndex);
    }
    document.getElementById('course').value = draft.meta.course || '';
    updateLayoutOptions(courses);
    document.getElementById('layout').value = draft.meta.layout || '';
    document.getElementById('holes').value = String(draft.totalHoles);
    if (draft.meta.combo) {
      updateComboOptions(courses);
      document.getElementById('combo9').value = draft.meta.combo;
    }
    document.getElementById('notes').value = draft.notesValue || '';

    document.getElementById('start-round').style.display = 'none';
    document.getElementById('hole-input').style.display = 'block';
    updateHoleNumber();
    autoFillHoleData();
    loadCurrentPlayerData();
  } else {
    await removeDraft(uid);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  courses = await fetchCourses();
  if (!uid) {
    const storedUid = localStorage.getItem('uid');
    if (storedUid) {
      uid = storedUid;
      clubs = await loadClubs(uid);
      friendList = await fetchFriends(uid);
      populateFriendOptions(friendList);
    }
  } else {
    clubs = await loadClubs(uid);
    friendList = await fetchFriends(uid);
    populateFriendOptions(friendList);
  }
  populateCourseOptions();
  shotIndex = document.querySelectorAll('#shots-container .shot-row').length;
  if (shotIndex === 0) {
    addShotRow();
  } else {
    document.querySelectorAll('#shots-container .shot-row').forEach(row => {
      populateClubSelect(row.querySelector('select'));
    });
  }
  const fairwayGroup = document.getElementById('fairway-group');
  if (fairwayGroup) fairwayGroup.classList.add('hidden');
  document.getElementById("course").addEventListener("input", () => {
    updateLayoutOptions(courses);
    updateComboOptions(courses);
  });
  document.getElementById("holes").addEventListener("change", () => updateComboOptions(courses));

  const addBtn = document.getElementById('add-shot-btn');
  if(addBtn){
    addBtn.addEventListener('click', addShotRow);
  }

  const prevBtn = document.getElementById('prev-player');
  const nextBtn = document.getElementById('next-player');
  if(prevBtn && nextBtn){
    prevBtn.addEventListener('click', () => {
      saveCurrentPlayerData();
      currentPlayerIndex = (currentPlayerIndex - 1 + playersScores.length) % playersScores.length;
      document.getElementById('player-select').value = String(currentPlayerIndex);
      loadCurrentPlayerData();
    });
    nextBtn.addEventListener('click', () => {
      saveCurrentPlayerData();
      currentPlayerIndex = (currentPlayerIndex + 1) % playersScores.length;
      document.getElementById('player-select').value = String(currentPlayerIndex);
      loadCurrentPlayerData();
    });
  }

  const playerSel = document.getElementById('player-select');
  if(playerSel){
    playerSel.addEventListener('change', e => {
      saveCurrentPlayerData();
      currentPlayerIndex = parseInt(e.target.value);
      loadCurrentPlayerData();
    });
  }

  localStorage.removeItem("roundSaved"); // reset all'avvio
  await checkForDraft();
});

window.startRound = function () {
  const holesSelect = document.getElementById("holes");
  const course = document.getElementById("course").value;
  const layout = document.getElementById("layout").value;
  const playersStr = document.getElementById("players").value;
  const names = playersStr.split(',').map(n => n.trim()).filter(n => n);
  if(names.length === 0){
    names.push(userDisplayName || userEmail || "Giocatore");
  }
  playersScores = names.map(n => ({ name: n, holes: [] }));
  const playerName = playersScores[0].name;
  holeData = names.map(() => ({ penalties: '', fairway: 'na', shots: [] }));
  currentPlayerIndex = 0;
  const sel = document.getElementById('player-select');
  if(sel){
    sel.innerHTML = names.map((n,i)=>`<option value="${i}">${n}</option>`).join('');
    sel.value = String(currentPlayerIndex);
  }
  const combo = document.getElementById("combo9")?.value;

  if (!course) {
  alert("Seleziona un campo per iniziare il round.");
  return;
}


  totalHoles = parseInt(holesSelect.value);
  currentHole = 1;
  roundData.length = 0;

  selectedHoles = [];
  let cr = 0;
  let slope = 0;
  let totalPar = 0;
  let totalDistance = 0;

  if (totalHoles === 9 && courses[course]?.combinations9?.[combo]) {
    const comboData = courses[course].combinations9[combo];
    if (!comboData || !Array.isArray(comboData.holes)) {
      alert("Combinazione 9 buche non valida o non trovata.");
      return;
    }

    const layoutKey = comboData.layout;
    const teeData = courses[course]?.tees?.[layoutKey];

    if (!teeData || !Array.isArray(teeData.holes)) {
      alert("Layout o dati tee non validi.");
      return;
    }

    selectedHoles = comboData.holes.map(n => {
      const hole = teeData.holes.find(h => h.number === n);
      if (!hole) {
        throw new Error(`Buca numero ${n} non trovata nel layout ${layoutKey}`);
      }
      return hole;
    });

    cr = teeData?.cr;
    slope = teeData?.slope;
    totalPar = selectedHoles.reduce((sum, h) => sum + h.par, 0);
    totalDistance = selectedHoles.reduce((sum, h) => sum + h.distance, 0);
  } else if (totalHoles === 18 && courses[course]?.combinations18?.[combo]) {
    const parts = courses[course].combinations18[combo];
    parts.forEach(({ layout, holes }) => {
      const teeData = courses[course]?.tees[layout];
      cr += teeData?.cr || 0;
      slope += teeData?.slope || 0;
      holes.forEach(n => {
        const hole = teeData.holes.find(h => h.number === n);
        if (hole) {
          selectedHoles.push(hole);
          totalPar += hole.par;
          totalDistance += hole.distance;
        }
      });
    });
    const count = parts.length;
    cr = parseFloat((cr / count).toFixed(1));
    slope = Math.round(slope / count);
  } else {
    const teeData = courses[course]?.tees[layout];
    if (!teeData || !Array.isArray(teeData.holes)) {
      alert("Dati tee non validi.");
      return;
    }
    selectedHoles = teeData.holes.slice(0, totalHoles);
    cr = teeData?.cr;
    slope = teeData?.slope;
    totalPar = selectedHoles.reduce((sum, h) => sum + h.par, 0);
    totalDistance = selectedHoles.reduce((sum, h) => sum + h.distance, 0);
  }

  window._roundMeta = { course, layout, players: names, combo, cr, slope, totalPar, totalDistance };

  document.getElementById("start-round").style.display = "none";
  document.getElementById("hole-input").style.display = "block";
  updateHoleNumber();
  autoFillHoleData();
  loadCurrentPlayerData();
  storeDraft(uid, buildDraft());
};

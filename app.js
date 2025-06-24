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
  state,
  setClubs,
  updateHoleNumber,
  autoFillHoleData,
  saveCurrentPlayerData,
  loadCurrentPlayerData,
  resetHoleData,
  buildDraft
} from './src/js/roundState.js';
import {
  addShotRow,
  populateClubSelect,
  clearInputs,
  maybeShowFairway
} from './src/js/ui.js';
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
let friendList = [];
setClubs(getStoredClubs() || [...defaultClubs]);

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

    const c = await loadClubs(uid);
    setClubs(c);
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

  state.holeData.forEach((data, idx) => {
    const shots = data.shots || [];
    const pen = parseInt(data.penalties);
    const penaltiesVal = isNaN(pen) ? 0 : pen;
    const puttsCount = shots.filter(s => s.club === 'Putter').length;
    const score = shots.length + penaltiesVal;
    const hole = {
      number: state.selectedHoles[state.currentHole - 1].number,
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
      state.roundData.push(hole);
    }
    state.playersScores[idx].holes.push({ score });
  });

  if (state.currentHole >= state.totalHoles) {
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
        players: state.playersScores,
        combo,
        cr,
        slope,
        totalPar,
        totalDistance,
        notes: document.getElementById("notes").value,
        holes: state.roundData,
        uid: uid
      });

      localStorage.setItem("roundSaved", "true"); // flag per evitare duplicati

      await removeDraft(uid);

      alert("Round completato! I dati sono stati salvati online.");
      setTimeout(() => location.reload(), 1000); // delay per evitare race conditions
    } catch (error) {
      alert("Errore nel salvataggio su Firebase: " + error.message);
      saveButton.disabled = false; // riattiva in caso di errore
      await storeDraft(uid, buildDraft(uid));
    }
  } else {
    state.currentHole++;
    updateHoleNumber();
    clearInputs();
    autoFillHoleData();
    resetHoleData();
    loadCurrentPlayerData();
    saveButton.disabled = false; // riattiva per buche successive
    await storeDraft(uid, buildDraft(uid));
  }
};




async function checkForDraft() {
  const draft = await fetchDraft(uid);
  if (!draft || !draft.roundData || !draft.meta) return;

  if (confirm('Riprendere il round incompleto?')) {
    window._roundMeta = draft.meta;
    state.totalHoles = draft.totalHoles;
    state.currentHole = draft.currentHole;
    state.selectedHoles = draft.selectedHoles || [];
    state.roundData.length = 0;
    draft.roundData.forEach(h => state.roundData.push(h));

    document.getElementById('players').value = (draft.meta.players || []).join(', ');
    state.playersScores = draft.playersScores || (draft.meta.players || []).map(n => ({name: n, holes: []}));
    state.holeData = draft.holeData || (draft.meta.players || []).map(() => ({ penalties: '', fairway: 'na', shots: [] }));
    state.currentPlayerIndex = draft.currentPlayerIndex || 0;
    const sel = document.getElementById('player-select');
    if(sel){
      sel.innerHTML = state.playersScores.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('');
      sel.value = String(state.currentPlayerIndex);
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
      setClubs(await loadClubs(uid));
      friendList = await fetchFriends(uid);
      populateFriendOptions(friendList);
    }
  } else {
    setClubs(await loadClubs(uid));
    friendList = await fetchFriends(uid);
    populateFriendOptions(friendList);
  }
  populateCourseOptions(courses);
  state.shotIndex = document.querySelectorAll('#shots-container .shot-row').length;
  if (state.shotIndex === 0) {
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
      state.currentPlayerIndex = (state.currentPlayerIndex - 1 + state.playersScores.length) % state.playersScores.length;
      document.getElementById('player-select').value = String(state.currentPlayerIndex);
      loadCurrentPlayerData();
    });
    nextBtn.addEventListener('click', () => {
      saveCurrentPlayerData();
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playersScores.length;
      document.getElementById('player-select').value = String(state.currentPlayerIndex);
      loadCurrentPlayerData();
    });
  }

  const playerSel = document.getElementById('player-select');
  if(playerSel){
    playerSel.addEventListener('change', e => {
      saveCurrentPlayerData();
      state.currentPlayerIndex = parseInt(e.target.value);
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
  state.playersScores = names.map(n => ({ name: n, holes: [] }));
  state.holeData = names.map(() => ({ penalties: '', fairway: 'na', shots: [] }));
  state.currentPlayerIndex = 0;
  const sel = document.getElementById('player-select');
  if(sel){
    sel.innerHTML = names.map((n,i)=>`<option value="${i}">${n}</option>`).join('');
    sel.value = String(state.currentPlayerIndex);
  }
  const combo = document.getElementById("combo9")?.value;

  if (!course) {
  alert("Seleziona un campo per iniziare il round.");
  return;
}


  state.totalHoles = parseInt(holesSelect.value);
  state.currentHole = 1;
  state.roundData.length = 0;

  state.selectedHoles = [];
  let cr = 0;
  let slope = 0;
  let totalPar = 0;
  let totalDistance = 0;

  if (state.totalHoles === 9 && courses[course]?.combinations9?.[combo]) {
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

    state.selectedHoles = comboData.holes.map(n => {
      const hole = teeData.holes.find(h => h.number === n);
      if (!hole) {
        throw new Error(`Buca numero ${n} non trovata nel layout ${layoutKey}`);
      }
      return hole;
    });

    cr = teeData?.cr;
    slope = teeData?.slope;
    totalPar = state.selectedHoles.reduce((sum, h) => sum + h.par, 0);
    totalDistance = state.selectedHoles.reduce((sum, h) => sum + h.distance, 0);
  } else if (state.totalHoles === 18 && courses[course]?.combinations18?.[combo]) {
    const parts = courses[course].combinations18[combo];
    parts.forEach(({ layout, holes }) => {
      const teeData = courses[course]?.tees[layout];
      cr += teeData?.cr || 0;
      slope += teeData?.slope || 0;
      holes.forEach(n => {
        const hole = teeData.holes.find(h => h.number === n);
        if (hole) {
          state.selectedHoles.push(hole);
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
    state.selectedHoles = teeData.holes.slice(0, state.totalHoles);
    cr = teeData?.cr;
    slope = teeData?.slope;
    totalPar = state.selectedHoles.reduce((sum, h) => sum + h.par, 0);
    totalDistance = state.selectedHoles.reduce((sum, h) => sum + h.distance, 0);
  }

  window._roundMeta = { course, layout, players: names, combo, cr, slope, totalPar, totalDistance };

  document.getElementById("start-round").style.display = "none";
  document.getElementById("hole-input").style.display = "block";
  updateHoleNumber();
  autoFillHoleData();
  loadCurrentPlayerData();
  storeDraft(uid, buildDraft(uid));
};

import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { initFirebase, firebaseConfig } from './firebase-config.js';
let courses = {};
import { clubs as defaultClubs } from "./clubList.js";
import { loadClubs } from "./userSettings.js";



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
const DRAFT_KEY = 'roundDraft';
let clubs = [...defaultClubs];

async function loadCourses() {
  const snap = await getDocs(collection(db, 'courses'));
  courses = {};
  snap.forEach(docSnap => {
    courses[docSnap.id] = docSnap.data();
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    uid = user.uid;
    userDisplayName = user.displayName;
    userEmail = user.email;

    clubs = await loadClubs(uid);
    document.querySelectorAll('.club-select').forEach(sel => populateClubSelect(sel));

    // Auto-riempi il campo player se è vuoto
    const playerInput = document.getElementById("player");
    if (playerInput && !playerInput.value) {
      playerInput.value = userDisplayName || userEmail || "Giocatore";
    }
  }
});

window.populateCourseOptions = function () {
  const courseInput = document.getElementById("course");
  const datalist = document.getElementById("course-options");
  datalist.innerHTML = "";

  Object.keys(courses).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });

  courseInput.addEventListener("change", () => {
    updateLayoutOptions();
    updateComboOptions();
  });
};

// Filter datalist options based on the current course input
window.filterCourseOptions = function () {
  const courseInput = document.getElementById("course");
  const datalist = document.getElementById("course-options");
  const filter = courseInput.value.toLowerCase();
  datalist.innerHTML = "";

  Object.keys(courses)
    .filter(name => name.toLowerCase().includes(filter))
    .forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });
};
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

async function saveDraft() {
  const draft = {
    meta: window._roundMeta,
    roundData,
    currentHole,
    totalHoles,
    selectedHoles,
    notesValue: document.getElementById('notes')?.value || '',
    uid,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  if (uid) {
    try {
      await setDoc(doc(db, 'round_drafts', uid), draft);
    } catch (e) {
      console.warn('Unable to sync draft', e);
    }
  }
}

async function deleteDraft() {
  localStorage.removeItem(DRAFT_KEY);
  if (uid) {
    try {
      await deleteDoc(doc(db, 'round_drafts', uid));
    } catch (e) {
      console.warn('Unable to delete remote draft', e);
    }
  }
}

window.saveHole = async function () {
  const saveButton = document.querySelector("button[onclick='saveHole()']");
  saveButton.disabled = true; // blocca subito il doppio click

  const par = parseInt(document.getElementById("par").value);
  const distance = parseInt(document.getElementById("distance").value);
  const score = parseInt(document.getElementById("score").value);
  const putts = parseInt(document.getElementById("putts").value);
  let penalties = parseInt(document.getElementById("penalties").value);
  const shotRows = document.querySelectorAll('#shots-container .shot-row');
  const shots = [];
  shotRows.forEach(row => {
    const club = row.querySelector('.club-select').value;
    const distVal = parseInt(row.querySelector('.distance-input').value);
    if (club || !isNaN(distVal)) {
      shots.push({
        club: club || null,
        distance: isNaN(distVal) ? null : distVal
      });
    }
  });

  if ([par, distance, score, putts].some(v => isNaN(v))) {
    alert("Compila tutti i campi numerici obbligatori con valori validi.");
    saveButton.disabled = false;
    return;
  }

  if (isNaN(penalties)) {
    penalties = 0;
  }

  const hole = {
    number: selectedHoles[currentHole - 1].number,
    par,
    distance,
    score,
    putts,
    fairway: document.getElementById("fairway").value,
    penalties,
    shots,
    club: shots[0]?.club || '',
    distanceShot: shots[0] ? shots[0].distance : null
  };

  roundData.push(hole);

  if (currentHole >= totalHoles) {
    // Evita salvataggi doppi
    if (localStorage.getItem("roundSaved") === "true") {
      alert("Round già salvato.");
      return;
    }

    try {
      const { course, layout, player, combo, cr, slope, totalPar, totalDistance } = window._roundMeta;
      await addDoc(collection(db, "golf_rounds"), {
        timestamp: new Date().toISOString(),
        course,
        layout,
        player,
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

      await deleteDraft();

      alert("Round completato! I dati sono stati salvati online.");
      setTimeout(() => location.reload(), 1000); // delay per evitare race conditions
    } catch (error) {
      alert("Errore nel salvataggio su Firebase: " + error.message);
      saveButton.disabled = false; // riattiva in caso di errore
      await saveDraft();
    }
  } else {
    currentHole++;
    updateHoleNumber();
    clearInputs();
    autoFillHoleData();
    saveButton.disabled = false; // riattiva per buche successive
    await saveDraft();
  }
};


function clearInputs() {
  ["par", "distance", "score", "putts", "penalties"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("fairway").value = "na";
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
  shotIndex++;
}

async function checkForDraft() {
  let draftStr = localStorage.getItem(DRAFT_KEY);
  if (!draftStr && uid) {
    try {
      const snap = await getDoc(doc(db, 'round_drafts', uid));
      if (snap.exists()) {
        draftStr = JSON.stringify(snap.data());
      }
    } catch (e) {
      console.warn('Unable to fetch remote draft', e);
    }
  }
  if (!draftStr) return;
  const draft = JSON.parse(draftStr);
  if (!draft.roundData || !draft.meta) return;

  if (confirm('Riprendere il round incompleto?')) {
    window._roundMeta = draft.meta;
    totalHoles = draft.totalHoles;
    currentHole = draft.currentHole;
    selectedHoles = draft.selectedHoles || [];
    roundData.length = 0;
    draft.roundData.forEach(h => roundData.push(h));

    document.getElementById('player').value = draft.meta.player || '';
    document.getElementById('course').value = draft.meta.course || '';
    updateLayoutOptions();
    document.getElementById('layout').value = draft.meta.layout || '';
    document.getElementById('holes').value = String(draft.totalHoles);
    if (draft.meta.combo) {
      updateComboOptions();
      document.getElementById('combo9').value = draft.meta.combo;
    }
    document.getElementById('notes').value = draft.notesValue || '';

    document.getElementById('start-round').style.display = 'none';
    document.getElementById('hole-input').style.display = 'block';
    updateHoleNumber();
    autoFillHoleData();
  } else {
    await deleteDraft();
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadCourses();
  if (uid) {
    clubs = await loadClubs(uid);
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
  document.getElementById("course").addEventListener("input", () => {
    updateLayoutOptions();
    updateComboOptions();
  });
  document.getElementById("holes").addEventListener("change", updateComboOptions);

  const addBtn = document.getElementById('add-shot-btn');
  if(addBtn){
    addBtn.addEventListener('click', addShotRow);
  }

  localStorage.removeItem("roundSaved"); // reset all'avvio
  await checkForDraft();
});
window.updateLayoutOptions = function () {
  const course = document.getElementById("course").value;
  const layoutSelect = document.getElementById("layout");
  layoutSelect.innerHTML = "";

  if (courses[course]) {
    const teeNames = Object.keys(courses[course].tees);
    teeNames.forEach(tee => {
      const option = document.createElement("option");
      option.value = tee;
      option.textContent = tee;
      layoutSelect.appendChild(option);
    });
  }
};

window.updateComboOptions = function () {
  const course = document.getElementById("course").value;
  const holes = document.getElementById("holes").value;
  const comboContainer = document.getElementById("combo-9-select");
  const comboSelect = document.getElementById("combo9");
  comboSelect.innerHTML = "";

  if (holes === "9" && courses[course]?.combinations9) {
    comboContainer.style.display = "block";
    Object.entries(courses[course].combinations9).forEach(([label]) => {
      const option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      comboSelect.appendChild(option);
    });
  } else if (holes === "18" && courses[course]?.combinations18) {
    comboContainer.style.display = "block";
    Object.entries(courses[course].combinations18).forEach(([label]) => {
      const option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      comboSelect.appendChild(option);
    });
  } else {
    comboContainer.style.display = "none";
  }
};

window.startRound = function () {
  const holesSelect = document.getElementById("holes");
  const course = document.getElementById("course").value;
  const layout = document.getElementById("layout").value;
  const player = document.getElementById("player").value;
  const combo = document.getElementById("combo9")?.value;

  if (!course) {
  alert("Seleziona un campo per iniziare il round.");
  return;
}

const playerName = player || userDisplayName || userEmail || "Giocatore";

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

  window._roundMeta = { course, layout, player: playerName, combo, cr, slope, totalPar, totalDistance };

  document.getElementById("start-round").style.display = "none";
  document.getElementById("hole-input").style.display = "block";
  updateHoleNumber();
  autoFillHoleData();
  saveDraft();
};

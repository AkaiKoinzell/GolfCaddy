import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { initFirebase } from './firebase-config.js';
import { courses } from "./courses.js";



const { app, auth, db } = initFirebase();
let uid = null;
let userDisplayName = null;
let userEmail = null;
let currentHole = 1;
let totalHoles = 9;
let selectedHoles = [];
const roundData = [];

onAuthStateChanged(auth, (user) => {
  if (user) {
    uid = user.uid;
    userDisplayName = user.displayName;
    userEmail = user.email;

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

window.saveHole = async function () {
  const saveButton = document.querySelector("button[onclick='saveHole()']");
  saveButton.disabled = true; // blocca subito il doppio click

  const hole = {
    number: selectedHoles[currentHole - 1].number,
    par: parseInt(document.getElementById("par").value),
    distance: parseInt(document.getElementById("distance").value),
    score: parseInt(document.getElementById("score").value),
    putts: parseInt(document.getElementById("putts").value),
    fairway: document.getElementById("fairway").value,
    penalties: parseInt(document.getElementById("penalties").value)
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

      alert("Round completato! I dati sono stati salvati online.");
      setTimeout(() => location.reload(), 1000); // delay per evitare race conditions
    } catch (error) {
      alert("Errore nel salvataggio su Firebase: " + error.message);
      saveButton.disabled = false; // riattiva in caso di errore
    }
  } else {
    currentHole++;
    updateHoleNumber();
    clearInputs();
    autoFillHoleData();
    saveButton.disabled = false; // riattiva per buche successive
  }
};


function clearInputs() {
  ["par", "distance", "score", "putts", "penalties"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("fairway").value = "na";
}

window.addEventListener("DOMContentLoaded", () => {
  populateCourseOptions();
  document.getElementById("course").addEventListener("input", () => {
    updateLayoutOptions();
    updateComboOptions();
  });
  document.getElementById("holes").addEventListener("change", updateComboOptions);

  localStorage.removeItem("roundSaved"); // reset all'avvio
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
};

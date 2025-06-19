import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { courses } from "./courses.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2SWQzBCq2M18idSSXS-gR75I7fSV2NXk",
  authDomain: "golfcaddy-ec421.firebaseapp.com",
  projectId: "golfcaddy-ec421",
  storageBucket: "golfcaddy-ec421.firebasestorage.app",
  messagingSenderId: "497160592489",
  appId: "1:497160592489:web:548701ab6d395e579456f8",
  measurementId: "G-XGBVHR0BD5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentHole = 1;
let totalHoles = 9;
let selectedHoles = [];
const roundData = [];

window.populateCourseOptions = function () {
  const courseInput = document.getElementById("course");
  const datalist = document.getElementById("course-options");
  datalist.innerHTML = "";

  Object.keys(courses).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });

  // Quando cambia il campo "course", aggiorna il layout e le combinazioni
  courseInput.addEventListener("change", () => {
    updateLayoutOptions();
    updateComboOptions();
  });
};

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

  if (!course || !player) {
    alert("Inserisci il tuo nome, seleziona un campo per iniziare il round.");
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
    const layoutKey = layout;
    const comboHoles = courses[course].combinations9[combo];
    const teeData = courses[course]?.tees[layoutKey];
    if (!teeData) {
      alert("Errore nel recuperare il layout selezionato per il percorso a 9 buche.");
      return;
    }
    selectedHoles = comboHoles.map(n => teeData.holes.find(h => h.number === n));
    cr = teeData?.cr;
    slope = teeData?.slope;
    totalPar = selectedHoles.reduce((sum, h) => sum + h.par, 0);
    totalDistance = selectedHoles.reduce((sum, h) => sum + h.distance, 0);
  } else if (totalHoles === 18 && courses[course]?.combinations18?.[combo]) {
    courses[course].combinations18[combo].forEach(({ layout, holes }) => {
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
    const parts = courses[course].combinations18[combo];
    const count = parts.length;
    cr = parseFloat((cr / count).toFixed(1));
    slope = Math.round(slope / count);
  } else {
    const teeData = courses[course]?.tees[layout];
    selectedHoles = teeData?.holes.slice(0, totalHoles);
    cr = teeData?.cr;
    slope = teeData?.slope;
    totalPar = selectedHoles.reduce((sum, h) => sum + h.par, 0);
    totalDistance = selectedHoles.reduce((sum, h) => sum + h.distance, 0);
  }

  window._roundMeta = { course, layout, player, combo, cr, slope, totalPar, totalDistance };

  document.getElementById("start-round").style.display = "none";
  document.getElementById("hole-input").style.display = "block";
  updateHoleNumber();
  autoFillHoleData();
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
        holes: roundData
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
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
let selectedHoleNumbers = [];
const roundData = [];

window.populateCourseOptions = function () {
  const courseInput = document.getElementById("course");
  const datalist = document.getElementById("course-options");
  datalist.innerHTML = "";
  Object.keys(courses).forEach(courseName => {
    const option = document.createElement("option");
    option.value = courseName;
    datalist.appendChild(option);
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
  const comboDiv = document.getElementById("combo-9-select");
  const comboSelect = document.getElementById("combo9");
  comboSelect.innerHTML = "";

  if (courses[course]?.combinations9) {
    comboDiv.style.display = "block";
    Object.keys(courses[course].combinations9).forEach(combo => {
      const option = document.createElement("option");
      option.value = combo;
      option.textContent = combo;
      comboSelect.appendChild(option);
    });
  } else {
    comboDiv.style.display = "none";
  }
};

window.startRound = function () {
  const holesSelect = document.getElementById("holes");
  const course = document.getElementById("course").value;
  const layout = document.getElementById("layout").value;
  const player = document.getElementById("player").value;
  const notes = document.getElementById("notes").value;
  const is9 = holesSelect.value === "9";

  if (!course || !player || !layout) {
    alert("Inserisci il tuo nome, seleziona un campo e un layout per iniziare il round.");
    return;
  }

  totalHoles = parseInt(holesSelect.value);
  currentHole = 1;
  roundData.length = 0;

  if (is9 && courses[course]?.combinations9) {
    const comboName = document.getElementById("combo9").value;
    selectedHoleNumbers = courses[course].combinations9[comboName];
  } else {
    selectedHoleNumbers = Array.from({ length: totalHoles }, (_, i) => i + 1);
  }

  document.getElementById("start-round").style.display = "none";
  document.getElementById("hole-input").style.display = "block";
  updateHoleNumber();
  autoFillHoleData();
};

function updateHoleNumber() {
  document.getElementById("hole-number").textContent = selectedHoleNumbers[currentHole - 1];
}

function autoFillHoleData() {
  const course = document.getElementById("course").value;
  const tee = document.getElementById("layout").value;
  const courseData = courses[course]?.tees[tee];
  const holeIndex = selectedHoleNumbers[currentHole - 1] - 1;

  if (courseData && courseData.holes.length > holeIndex) {
    const hole = courseData.holes[holeIndex];
    document.getElementById("par").value = hole.par;
    document.getElementById("distance").value = hole.distance;
  }
}

window.saveHole = async function () {
  const hole = {
    number: selectedHoleNumbers[currentHole - 1],
    par: parseInt(document.getElementById("par").value),
    distance: parseInt(document.getElementById("distance").value),
    score: parseInt(document.getElementById("score").value),
    putts: parseInt(document.getElementById("putts").value),
    fairway: document.getElementById("fairway").value,
    penalties: parseInt(document.getElementById("penalties").value)
  };
  roundData.push(hole);

  if (currentHole >= totalHoles) {
    try {
      await addDoc(collection(db, "golf_rounds"), {
        timestamp: new Date().toISOString(),
        course: document.getElementById("course").value,
        layout: document.getElementById("layout")?.value || "",
        player: document.getElementById("player").value,
        notes: document.getElementById("notes").value,
        holes: roundData
      });
      alert("Round completato! I dati sono stati salvati online.");
    } catch (error) {
      alert("Errore nel salvataggio su Firebase: " + error.message);
    }
    location.reload();
  } else {
    currentHole++;
    updateHoleNumber();
    clearInputs();
    autoFillHoleData();
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
});

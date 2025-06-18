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
const roundData = [];

window.populateCourseOptions = function () {
  const courseSelect = document.getElementById("course");
  courseSelect.innerHTML = "";
  Object.keys(courses).forEach(courseName => {
    const option = document.createElement("option");
    option.value = courseName;
    option.textContent = courseName;
    courseSelect.appendChild(option);
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

window.startRound = function () {
  const holesSelect = document.getElementById("holes");
  const course = document.getElementById("course").value;
  const layout = document.getElementById("layout").value;
  const player = document.getElementById("player").value;

  if (!course || !player || !layout) {
    alert("Inserisci il tuo nome, seleziona un campo e un layout per iniziare il round.");
    return;
  }

  totalHoles = parseInt(holesSelect.value);
  currentHole = 1;
  roundData.length = 0;

  document.getElementById("start-round").style.display = "none";
  document.getElementById("hole-input").style.display = "block";
  updateHoleNumber();
  autoFillHoleData();
};

function updateHoleNumber() {
  document.getElementById("hole-number").textContent = currentHole;
}

function autoFillHoleData() {
  const course = document.getElementById("course").value;
  const tee = document.getElementById("layout").value;
  const courseData = courses[course]?.tees[tee];

  if (courseData && courseData.holes.length >= currentHole) {
    const hole = courseData.holes[currentHole - 1];
    document.getElementById("par").value = hole.par;
    document.getElementById("distance").value = hole.distance;
  }
}

window.saveHole = async function () {
  const hole = {
    number: currentHole,
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
  document.getElementById("course").addEventListener("input", updateLayoutOptions);
});

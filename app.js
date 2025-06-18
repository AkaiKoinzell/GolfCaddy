import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

window.startRound = function () {
  const holesSelect = document.getElementById("holes");
  const course = document.getElementById("course").value;
  const player = document.getElementById("player").value;
  if (!course || !player) {
    alert("Inserisci il tuo nome e seleziona un campo per iniziare il round.");
    return;
  }
  totalHoles = parseInt(holesSelect.value);
  currentHole = 1;
  roundData.length = 0;
  document.getElementById("start-round").style.display = "none";
  document.getElementById("hole-input").style.display = "block";
  updateHoleNumber();
};

function updateHoleNumber() {
  document.getElementById("hole-number").textContent = currentHole;
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
  }
};

function clearInputs() {
  ["par", "distance", "score", "putts", "penalties"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("fairway").value = "na";
}

// Carica i round esistenti nella tabella
window.addEventListener("DOMContentLoaded", async () => {
  const snapshot = await getDocs(collection(db, "golf_rounds"));
  const tbody = document.querySelector("#rounds-table tbody");
  tbody.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const totalScore = data.holes.reduce((sum, h) => sum + h.score, 0);
    const row = document.createElement("tr");

    row.innerHTML = `
  <td>${new Date(data.timestamp).toLocaleDateString()}</td>
  <td>${data.course}</td>
  <td>${data.player}</td>
  <td>${totalScore}</td>
  <td><a href="round.html?id=${doc.id}">Dettagli</a></td>
`;
    tbody.appendChild(row);
  });
});

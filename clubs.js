// clubs.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2SWQzBCq2M18idSSXS-gR75I7fSV2NXk",
  authDomain: "golfcaddy-ec421.firebaseapp.com",
  projectId: "golfcaddy-ec421",
  storageBucket: "golfcaddy-ec421.appspot.com",
  messagingSenderId: "497160592489",
  appId: "1:497160592489:web:548701ab6d395e579456f8",
  measurementId: "G-XGBVHR0BD5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
let uid = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    uid = user.uid;
    await loadClubData();
  } else {
    window.location.href = "home.html";
  }
});

async function loadClubData() {
  const clubContainer = document.getElementById("club-stats");
  clubContainer.innerHTML = "";

  const q = query(collection(db, "club_shots"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  const clubStats = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const { club, distance } = data;
    if (!clubStats[club]) {
      clubStats[club] = { total: 0, count: 0 };
    }
    clubStats[club].total += distance;
    clubStats[club].count++;
  });

  for (const club in clubStats) {
    const avg = Math.round(clubStats[club].total / clubStats[club].count);
    const div = document.createElement("div");
    div.className = "club-card";
    div.innerHTML = `
      <h3>${club}</h3>
      <p>Colpi registrati: ${clubStats[club].count}</p>
      <p>Distanza media: ${avg} m</p>
    `;
    clubContainer.appendChild(div);
  }
}

function saveClubShot() {
  const club = document.getElementById("club-select").value;
  const distance = parseFloat(document.getElementById("distance-input").value);
  const notes = document.getElementById("notes-input").value;

  if (!club || isNaN(distance)) {
    alert("Inserisci un bastone e una distanza valida.");
    return;
  }

  const existing = JSON.parse(localStorage.getItem("clubStats") || "{}");

  if (!existing[club]) {
    existing[club] = { count: 0, totalDistance: 0, min: distance, max: distance, notes: [] };
  }

  const stat = existing[club];
  stat.count++;
  stat.totalDistance += distance;
  stat.min = Math.min(stat.min, distance);
  stat.max = Math.max(stat.max, distance);
  if (notes) stat.notes.push(notes);

  localStorage.setItem("clubStats", JSON.stringify(existing));
  alert("Colpo salvato!");

  renderClubStats(); // aggiorna la UI
}

function renderClubStats() {
  const stats = JSON.parse(localStorage.getItem("clubStats") || "{}");
  const container = document.getElementById("club-stats");
  container.innerHTML = "";

  const keys = Object.keys(stats);
  if (keys.length === 0) {
    container.innerHTML = "<p>Nessun dato disponibile.</p>";
    return;
  }

  keys.forEach(club => {
    const stat = stats[club];
    const avg = stat.totalDistance / stat.count;
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${club}</h3>
      <p>Colpi registrati: ${stat.count}</p>
      <p>Distanza media: ${avg.toFixed(1)} m</p>
      <p>Distanza minima: ${stat.min} m</p>
      <p>Distanza massima: ${stat.max} m</p>
    `;
    container.appendChild(div);
  });
}

renderClubStats();
window.saveClubShot = async function () {
  const club = document.getElementById("club-select").value;
  const distance = parseInt(document.getElementById("distance-input").value);

  if (!club || isNaN(distance)) {
    alert("Inserisci un bastone e una distanza valida.");
    return;
  }

  try {
    await addDoc(collection(db, "club_shots"), {
      uid,
      club,
      distance,
      timestamp: serverTimestamp()
    });
    document.getElementById("distance-input").value = "";
    await loadClubData();
  } catch (error) {
    alert("Errore nel salvataggio: " + error.message);
  }
}

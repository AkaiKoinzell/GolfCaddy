import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';
import { loadClubs, saveClubs } from './userSettings.js';
import { clubs as defaultClubs } from './clubList.js';

const { auth, db } = initFirebase();
let currentUid = null;
let clubList = [...defaultClubs];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "home.html";
    return;
  }

  currentUid = user.uid;

  const userRef = doc(db, "users", currentUid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("name").value = data.name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("hcp").value = data.officialHandicap ?? "";
  }

  clubList = await loadClubs(currentUid);
  renderClubList();
});

window.saveProfile = async function () {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const hcp = document.getElementById("hcp").value;

  if (!currentUid) {
    alert("Utente non autenticato.");
    return;
  }

  const userRef = doc(db, "users", currentUid);
  await setDoc(userRef, {
    name,
    email,
    officialHandicap: hcp === "" ? null : parseFloat(hcp)
  }, { merge: true });

  alert("Profilo aggiornato con successo!");
}

function renderClubList() {
  const ul = document.getElementById('clubs-list');
  if (!ul) return;
  ul.innerHTML = '';
  clubList.forEach((c, idx) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = c;
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-danger';
    btn.textContent = 'Rimuovi';
    btn.onclick = () => {
      clubList.splice(idx, 1);
      renderClubList();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

window.addClub = function() {
  const input = document.getElementById('new-club');
  const val = input.value.trim();
  if (val && !clubList.includes(val)) {
    clubList.push(val);
    input.value = '';
    renderClubList();
  }
}

window.saveClubSettings = async function() {
  if (!currentUid) return;
  await saveClubs(currentUid, clubList);
  alert('Lista bastoni salvata!');
}

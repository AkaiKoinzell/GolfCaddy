import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';
import { loadClubs, saveClubs } from './userSettings.js';
import { clubs as defaultClubs } from './clubList.js';

const { auth, db } = initFirebase();
let currentUid = null;
let clubList = [...defaultClubs];
let friendList = [];

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
  await loadFriends();
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

async function loadFriends(){
  if(!currentUid) return;
  const q = collection(db, 'users', currentUid, 'friends');
  const snap = await getDocs(q);
  friendList = await Promise.all(snap.docs.map(async d => {
    let name = d.id;
    try {
      const s = await getDoc(doc(db, 'users', d.id));
      if(s.exists()) name = s.data().name || d.id;
    } catch (e) {
      console.error('Failed fetching friend name', e);
    }
    return { id: d.id, name, ...d.data() };
  }));
  renderFriendList();
}

function renderFriendList(filter = ''){
  const ul = document.getElementById('friends-list');
  if(!ul) return;
  ul.innerHTML = '';
  friendList
    .filter(f =>
      f.name.toLowerCase().includes(filter) ||
      f.id.toLowerCase().includes(filter)
    )
    .forEach(f => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.textContent = f.name || f.id;
      const actions = document.createElement('div');
      const view = document.createElement('a');
    view.className = 'btn btn-sm btn-primary me-2';
    view.textContent = 'Vedi';
    view.href = `stats.html?uid=${f.id}`;
    const del = document.createElement('button');
    del.className = 'btn btn-sm btn-danger';
    del.textContent = 'Rimuovi';
    del.onclick = () => removeFriend(f.id);
    actions.appendChild(view);
    actions.appendChild(del);
      li.appendChild(actions);
      ul.appendChild(li);
    });
}


window.filterFriends = function(){
  const term = document.getElementById('friend-filter').value.trim().toLowerCase();
  renderFriendList(term);
}

window.removeFriend = async function(uid){
  await deleteDoc(doc(db, 'users', currentUid, 'friends', uid));
  friendList = friendList.filter(f => f.id !== uid);
  renderFriendList();
}

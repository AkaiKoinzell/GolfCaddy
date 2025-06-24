import { collection, getDocs, query, where, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { initFirebase } from './src/firebase-config.js';

const { auth, db } = initFirebase();
let currentUid = null;
let courses = [];

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'home.html';
  } else {
    currentUid = user.uid;
    loadCourses();
  }
});

async function loadCourses() {
  const snap = await getDocs(collection(db, 'courses'));
  courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

window.searchCourses = function () {
  const term = document.getElementById('search-course-input').value.trim().toLowerCase();
  const list = document.getElementById('course-results');
  list.innerHTML = '';
  courses
    .filter(c => c.id.toLowerCase().includes(term))
    .forEach(c => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = c.id;
      list.appendChild(li);
    });
};

window.searchUsers = async function () {
  const term = document.getElementById('search-user-input').value.trim();
  const list = document.getElementById('user-results');
  list.innerHTML = '';
  if (!term) return;
  let q;
  if (term.includes('@')) {
    q = query(collection(db, 'users'), where('email', '==', term));
  } else {
    q = query(collection(db, 'users'), where('name', '>=', term), where('name', '<=', term + '\uf8ff'));
  }
  const snap = await getDocs(q);
  snap.forEach(d => {
    const data = d.data();
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = `${data.name || ''} ${data.email ? '(' + data.email + ')' : ''}`.trim();
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-success';
    btn.textContent = 'Aggiungi';
    btn.onclick = () => addFriend(d.id);
    li.appendChild(btn);
    list.appendChild(li);
  });
};

async function addFriend(uid) {
  if (!currentUid || !uid || currentUid === uid) return;
  await setDoc(doc(db, 'users', currentUid, 'friends', uid), { since: new Date().toISOString() });
  alert('Amico aggiunto!');
}

import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { initFirebase } from './firebase-config.js';
import { isAdmin } from './roles.js';

const { auth, db } = initFirebase();
let editingId = null;

async function loadCourses() {
  const snap = await getDocs(collection(db, 'courses'));
  const list = document.getElementById('course-list');
  list.innerHTML = '';
  snap.forEach(docSnap => {
    const li = document.createElement('li');
    li.textContent = docSnap.id;
    const edit = document.createElement('button');
    edit.textContent = 'Modifica';
    edit.onclick = () => editCourse(docSnap.id, docSnap.data());
    const del = document.createElement('button');
    del.textContent = 'Elimina';
    del.onclick = () => deleteCourse(docSnap.id);
    li.appendChild(edit);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function editCourse(id, data) {
  editingId = id;
  document.getElementById('course-name').value = id;
  document.getElementById('course-data').value = JSON.stringify(data, null, 2);
}

async function deleteCourse(id) {
  if (confirm('Eliminare il campo?')) {
    await deleteDoc(doc(db, 'courses', id));
    await loadCourses();
  }
}

window.saveCourse = async function () {
  const name = document.getElementById('course-name').value.trim();
  if (!name) {
    alert('Nome campo obbligatorio');
    return;
  }
  let data = {};
  const text = document.getElementById('course-data').value.trim();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      alert('JSON non valido');
      return;
    }
  }
  await setDoc(doc(db, 'courses', name), { ...data, name });
  editingId = null;
  document.getElementById('course-form').reset();
  await loadCourses();
};

onAuthStateChanged(auth, async user => {
  if (!(await isAdmin(user))) {
    window.location.href = 'home.html';
  } else {
    loadCourses();
  }
});

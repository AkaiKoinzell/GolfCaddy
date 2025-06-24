import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { initFirebase } from '../../firebase-config.js';

const { db } = initFirebase();

export async function loadCourses() {
  const snap = await getDocs(collection(db, 'courses'));
  const courses = {};
  snap.forEach(docSnap => {
    courses[docSnap.id] = docSnap.data();
  });
  return courses;
}

export async function loadFriends(uid) {
  if (!uid) return [];
  const q = collection(db, 'users', uid, 'friends');
  const snap = await getDocs(q);
  const list = [];
  for (const d of snap.docs) {
    let name = d.id;
    try {
      const s = await getDoc(doc(db, 'users', d.id));
      if (s.exists()) name = s.data().name || d.id;
    } catch (e) {
      console.warn('Failed fetching friend name', e);
    }
    list.push({ id: d.id, name });
  }
  return list;
}

export async function searchPlayers(term) {
  if (!term) return [];
  let q;
  if (term.includes('@')) {
    q = query(collection(db, 'users'), where('email', '==', term));
  } else {
    q = query(collection(db, 'users'), where('name', '>=', term), where('name', '<=', term + '\uf8ff'));
  }
  const snap = await getDocs(q);
  const res = [];
  snap.forEach(d => {
    const data = d.data();
    res.push({ label: data.name || data.email || d.id });
  });
  return res;
}

export async function saveDraft(uid, draft) {
  if (!uid) return;
  await setDoc(doc(db, 'round_drafts', uid), draft);
}

export async function deleteDraft(uid) {
  if (!uid) return;
  await deleteDoc(doc(db, 'round_drafts', uid));
}

export async function fetchDraft(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'round_drafts', uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveRound(round) {
  await addDoc(collection(db, 'golf_rounds'), round);
}

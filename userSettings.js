import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './src/firebase-config.js';
import { clubs as defaultClubs } from './clubList.js';

const REQUIRED_CLUBS = ['Putter'];

function ensureRequired(clubs) {
  const list = Array.from(clubs);
  REQUIRED_CLUBS.forEach(c => {
    if (!list.includes(c)) list.push(c);
  });
  return list;
}

const LS_KEY = 'userClubs';

export function getStoredClubs() {
  try {
    const str = localStorage.getItem(LS_KEY);
    if (str) {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {
    console.warn('Failed to parse stored clubs', e);
  }
  return null;
}

function setStoredClubs(clubs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(clubs));
  } catch (e) {
    console.warn('Failed to store clubs', e);
  }
}

const { db } = initFirebase();

export async function loadClubs(uid) {
  const stored = getStoredClubs();
  if (stored) return ensureRequired(stored);
  if (!uid) return ensureRequired(defaultClubs);
  try {
    const ref = doc(db, 'users', uid, 'settings', 'clubs');
    const snap = await getDoc(ref);
    if (snap.exists() && Array.isArray(snap.data().clubs)) {
      const clubs = ensureRequired(snap.data().clubs);
      setStoredClubs(clubs);
      return clubs;
    }
  } catch (e) {
    console.warn('Failed to load clubs', e);
  }
  return ensureRequired(defaultClubs);
}

export async function saveClubs(uid, clubs) {
  if (!uid) return;
  try {
    const ref = doc(db, 'users', uid, 'settings', 'clubs');
    const list = ensureRequired(clubs);
    await setDoc(ref, { clubs: list }, { merge: true });
    setStoredClubs(list);
  } catch (e) {
    console.warn('Failed to save clubs', e);
  }
}

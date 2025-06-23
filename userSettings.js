import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';
import { clubs as defaultClubs } from './clubList.js';

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
  if (stored) return stored;
  if (!uid) return defaultClubs;
  try {
    const ref = doc(db, 'users', uid, 'settings', 'clubs');
    const snap = await getDoc(ref);
    if (snap.exists() && Array.isArray(snap.data().clubs)) {
      const clubs = snap.data().clubs;
      setStoredClubs(clubs);
      return clubs;
    }
  } catch (e) {
    console.warn('Failed to load clubs', e);
  }
  return defaultClubs;
}

export async function saveClubs(uid, clubs) {
  if (!uid) return;
  try {
    const ref = doc(db, 'users', uid, 'settings', 'clubs');
    await setDoc(ref, { clubs }, { merge: true });
    setStoredClubs(clubs);
  } catch (e) {
    console.warn('Failed to save clubs', e);
  }
}

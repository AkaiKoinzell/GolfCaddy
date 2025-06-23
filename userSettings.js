import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';
import { clubs as defaultClubs } from './clubList.js';

const { db } = initFirebase();

export async function loadClubs(uid) {
  if (!uid) return defaultClubs;
  try {
    const ref = doc(db, 'users', uid, 'settings', 'clubs');
    const snap = await getDoc(ref);
    if (snap.exists() && Array.isArray(snap.data().clubs)) {
      return snap.data().clubs;
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
  } catch (e) {
    console.warn('Failed to save clubs', e);
  }
}

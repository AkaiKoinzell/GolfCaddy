// roles.js - determine if a user is allowed to access admin features
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { initFirebase } from './firebase-config.js';

// Fallback list of admin emails in case the Firestore collection is missing
export const ADMIN_EMAILS = ['l.m.devirgilio@gmail.com'];

const { db } = initFirebase();

// Returns a Promise that resolves to true if the user is an admin.
// It first checks the `adminUsers` Firestore collection. If the collection or
// document doesn't exist, it falls back to the ADMIN_EMAILS list.
export async function isAdmin(user) {
  if (!user) return false;
  try {
    const snap = await getDoc(doc(db, 'adminUsers', user.email));
    if (snap.exists()) {
      return true;
    }
  } catch (err) {
    console.error('Error checking admin status:', err);
  }
  return ADMIN_EMAILS.includes(user.email);
}

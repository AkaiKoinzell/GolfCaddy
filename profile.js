import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';

const { auth, db } = initFirebase();
let currentUid = null;

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

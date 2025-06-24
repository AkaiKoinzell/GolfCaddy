import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';

const { auth, db } = initFirebase();
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");

loginBtn.addEventListener("click", () => signInWithPopup(auth, provider));
logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (user) {
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("userName", user.displayName || "");
    userInfo.textContent = `Ciao, ${user.displayName || "utente"}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    userInfo.style.display = "inline";

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        registeredAt: new Date().toISOString(),
        officialHandicap: null
      });
    }
  } else {
    localStorage.removeItem("uid");
    localStorage.removeItem("userName");
    userInfo.textContent = "";
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    userInfo.style.display = "none";
  }
});

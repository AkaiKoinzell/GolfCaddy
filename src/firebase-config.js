import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
export const firebaseConfig = {
  apiKey: "AIzaSyC2SWQzBCq2M18idSSXS-gR75I7fSV2NXk",
  authDomain: "golfcaddy-ec421.firebaseapp.com",
  projectId: "golfcaddy-ec421",
  storageBucket: "golfcaddy-ec421.appspot.com",
  messagingSenderId: "497160592489",
  appId: "1:497160592489:web:548701ab6d395e579456f8",
  measurementId: "G-XGBVHR0BD5"
};

export function initFirebase() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

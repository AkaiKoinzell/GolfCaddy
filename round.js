if (!localStorage.getItem("uid")) window.location.href = "home.html";

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';

const { db } = initFirebase();

const params = new URLSearchParams(window.location.search);
const roundId = params.get("id");

async function loadRound() {
  const ref = doc(db, "golf_rounds", roundId);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();

  const info = document.getElementById("round-info");
  info.innerHTML = `
    <p><strong>Campo:</strong> ${data.course}</p>
    <p><strong>Giocatore:</strong> ${data.player}</p>
    <p><strong>Note:</strong> ${data.notes || "—"}</p>
    <h2>Buche</h2>
  `;

  data.holes.forEach(hole => {
    const div = document.createElement("div");
    div.className = "hole";
    div.innerHTML = `
      <div class="hole-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
        <span>Buca ${hole.number} – ${hole.score} colpi</span>
        <span>▼</span>
      </div>
      <div class="hole-details">
        <p><strong>Par:</strong> ${hole.par}</p>
        <p><strong>Distanza:</strong> ${hole.distance} m</p>
        <p><strong>Putt:</strong> ${hole.putts}</p>
        <p><strong>Fairway:</strong> ${hole.fairway}</p>
        <p><strong>Penalità:</strong> ${hole.penalties}</p>
        <p><strong>Club:</strong> ${hole.club || '—'}</p>
        <p><strong>Distanza colpo:</strong> ${hole.distanceShot ? hole.distanceShot + ' m' : '—'}</p>
      </div>`;
    info.appendChild(div);
  });
}

loadRound();

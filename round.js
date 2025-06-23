if (!localStorage.getItem("uid")) window.location.href = "home.html";

import { doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initFirebase } from './firebase-config.js';

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

const { auth, db } = initFirebase();
const uid = localStorage.getItem("uid");
let roundData = null;

const params = new URLSearchParams(window.location.search);
const roundId = params.get("id");

async function loadRound() {
  const ref = doc(db, "golf_rounds", roundId);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();
  roundData = data;

  const info = document.getElementById("round-info");
  info.innerHTML = `
    <p><strong>Campo:</strong> ${escapeHTML(data.course)}</p>
    ${data.players ? '' : `<p><strong>Giocatore:</strong> ${escapeHTML(data.player)}</p>`}
    <p id="round-notes"><strong>Note:</strong> ${escapeHTML(data.notes || "—")}</p>
    <h2>Buche</h2>
  `;

  if(data.players){
    const leaderboard = document.createElement('div');
    leaderboard.innerHTML = '<h3>Leaderboard</h3>';
    const ul = document.createElement('ul');
    data.players.forEach(p => {
      const total = (p.holes || []).reduce((a,h)=>a+(h.score||0),0);
      const li = document.createElement('li');
      li.textContent = `${p.name}: ${total}`;
      ul.appendChild(li);
    });
    leaderboard.appendChild(ul);
    info.appendChild(leaderboard);
  }

  const holes = data.holes || (data.players && data.players[0]?.holes) || [];
  holes.forEach(hole => {
    const div = document.createElement("div");
    div.className = "hole";
    const shots = (hole.shots && hole.shots.length)
      ? hole.shots.map((s,i)=>`<p><strong>Colpo ${i+1}:</strong> ${s.club || '—'}${s.distance ? ' - ' + s.distance + ' m' : ''}</p>`).join('')
      : `<p><strong>Club:</strong> ${hole.club || '—'}</p><p><strong>Distanza colpo:</strong> ${hole.distanceShot ? hole.distanceShot + ' m' : '—'}</p>`;

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
        ${shots}
        <p><strong>Club:</strong> ${escapeHTML(hole.club || '—')}</p>
        <p><strong>Distanza colpo:</strong> ${hole.distanceShot ? hole.distanceShot + ' m' : '—'}</p>
      </div>`;
    info.appendChild(div);
  });

  if(uid && uid === data.uid){
    const actions = document.getElementById('round-actions');
    actions.innerHTML = '<button id="edit-notes-btn">Modifica note</button><button id="delete-round-btn">Elimina round</button>';
    document.getElementById('edit-notes-btn').addEventListener('click', updateNotes);
    document.getElementById('delete-round-btn').addEventListener('click', deleteCurrentRound);
  }
}

async function updateNotes(){
  const newNotes = prompt('Modifica note', roundData.notes || '');
  if(newNotes === null) return;
  await updateDoc(doc(db, 'golf_rounds', roundId), { notes: newNotes });
  roundData.notes = newNotes;
  document.getElementById('round-notes').innerHTML = `<strong>Note:</strong> ${escapeHTML(newNotes || '—')}`;
  alert('Note aggiornate');
}

async function deleteCurrentRound(){
  if(!confirm('Eliminare questo round?')) return;
  await deleteDoc(doc(db, 'golf_rounds', roundId));
  alert('Round eliminato');
  window.location.href = 'stats.html';
}

loadRound();

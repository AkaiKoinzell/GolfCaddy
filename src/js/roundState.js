export const state = {
  currentHole: 1,
  totalHoles: 9,
  shotIndex: 0,
  selectedHoles: [],
  roundData: [],
  playersScores: [],
  currentPlayerIndex: 0,
  holeData: [],
  clubs: []
};

export function setClubs(list){
  state.clubs = Array.isArray(list) ? list : [];
}

export function updateHoleNumber(){
  const el = document.getElementById('hole-number');
  if(el) el.textContent = state.currentHole;
}

export function autoFillHoleData(){
  const hole = state.selectedHoles[state.currentHole - 1];
  if(hole){
    const par = document.getElementById('par');
    const dist = document.getElementById('distance');
    if(par) par.value = hole.par;
    if(dist) dist.value = hole.distance;
  }
}

export function populateClubSelect(sel){
  const select = sel || document.querySelector('#shots-container .club-select');
  if(!select) return;
  select.innerHTML = '<option value="">-- Seleziona --</option>';
  state.clubs.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

export function addShotRow(){
  const container = document.getElementById('shots-container');
  if(!container) return;
  const div = document.createElement('div');
  div.className = 'shot-row';
  const clubId = `club-select-${state.shotIndex}`;
  const distId = `distance-input-${state.shotIndex}`;
  div.innerHTML = `
    <label for="${clubId}">Bastone utilizzato:</label>
    <select id="${clubId}" class="club-select form-select"></select>
    <label for="${distId}">Distanza colpo (metri):</label>
    <input id="${distId}" type="number" class="distance-input form-control" />
  `;
  container.appendChild(div);
  populateClubSelect(div.querySelector('select'));
  const selEl = div.querySelector('select');
  if(state.shotIndex === 0 && selEl){
    selEl.addEventListener('change', maybeShowFairway);
  }
  state.shotIndex++;
}

export function maybeShowFairway(){
  const grp = document.getElementById('fairway-group');
  if(grp) grp.classList.remove('hidden');
}

export function saveCurrentPlayerData(){
  if(!state.holeData[state.currentPlayerIndex]) return;
  const pen = document.getElementById('penalties');
  const fw = document.getElementById('fairway');
  state.holeData[state.currentPlayerIndex].penalties = pen ? pen.value : '';
  state.holeData[state.currentPlayerIndex].fairway = fw ? fw.value : 'na';
  const shots = [];
  document.querySelectorAll('#shots-container .shot-row').forEach(row=>{
    const club = row.querySelector('.club-select').value;
    const distVal = parseInt(row.querySelector('.distance-input').value);
    if (club || !isNaN(distVal)) {
      shots.push({ club: club || null, distance: isNaN(distVal) ? null : distVal });
    }
  });
  state.holeData[state.currentPlayerIndex].shots = shots;
}

export function loadCurrentPlayerData(){
  const data = state.holeData[state.currentPlayerIndex];
  const pen = document.getElementById('penalties');
  const fw = document.getElementById('fairway');
  if(pen) pen.value = data.penalties;
  if(fw) fw.value = data.fairway;
  const container = document.getElementById('shots-container');
  if(!container) return;
  container.innerHTML = '';
  state.shotIndex = 0;
  if(data.shots && data.shots.length){
    const fairwayGroup = document.getElementById('fairway-group');
    if(fairwayGroup) fairwayGroup.classList.remove('hidden');
    data.shots.forEach(s=>{
      addShotRow();
      const row = container.lastElementChild;
      row.querySelector('.club-select').value = s.club || '';
      if(s.distance !== null && s.distance !== undefined)
        row.querySelector('.distance-input').value = s.distance;
    });
  } else {
    addShotRow();
    const fairwayGroup = document.getElementById('fairway-group');
    if(fairwayGroup) fairwayGroup.classList.add('hidden');
  }
}

export function resetHoleData(){
  state.holeData = state.playersScores.map(() => ({ penalties: '', fairway: 'na', shots: [] }));
  state.currentPlayerIndex = 0;
  const sel = document.getElementById('player-select');
  if(sel) sel.value = '0';
}

import { state } from "./roundState.js";
export function populateFriendOptions(list){
  const container = document.getElementById('friend-options');
  if(!container) return;
  container.innerHTML = '';
  list.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.name;
    container.appendChild(opt);
  });
}

export function addPlayerName(name){
  const input = document.getElementById('players');
  if(!input) return;
  const current = input.value.split(',').map(n => n.trim()).filter(n => n);
  if(!current.includes(name)){
    current.push(name);
    input.value = current.join(', ');
  }
}

export function populateCourseOptions(courses){
  const courseInput = document.getElementById('course');
  const datalist = document.getElementById('course-options');
  if(!datalist) return;
  datalist.innerHTML = '';
  Object.keys(courses).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });
  if(courseInput){
    courseInput.addEventListener('change', () => {
      updateLayoutOptions(courses);
      updateComboOptions(courses);
    });
  }
}

export function filterCourseOptions(courses){
  const courseInput = document.getElementById('course');
  const datalist = document.getElementById('course-options');
  if(!courseInput || !datalist) return;
  const filter = courseInput.value.toLowerCase();
  datalist.innerHTML = '';
  Object.keys(courses)
    .filter(name => name.toLowerCase().includes(filter))
    .forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });
}

export function updateLayoutOptions(courses){
  const course = document.getElementById('course').value;
  const layoutSelect = document.getElementById('layout');
  if(!layoutSelect) return;
  layoutSelect.innerHTML = '';
  if(courses[course]){
    const teeNames = Object.keys(courses[course].tees);
    teeNames.forEach(tee => {
      const option = document.createElement('option');
      option.value = tee;
      option.textContent = tee;
      layoutSelect.appendChild(option);
    });
  }
}

export function updateComboOptions(courses){
  const course = document.getElementById('course').value;
  const holes = document.getElementById('holes').value;
  const comboContainer = document.getElementById('combo-9-select');
  const comboSelect = document.getElementById('combo9');
  if(!comboSelect || !comboContainer) return;
  comboSelect.innerHTML = '';
  if(holes === '9' && courses[course]?.combinations9){
    comboContainer.style.display = 'block';
    Object.entries(courses[course].combinations9).forEach(([label]) => {
      const option = document.createElement('option');
      option.value = label;
      option.textContent = label;
      comboSelect.appendChild(option);
    });
  } else if(holes === '18' && courses[course]?.combinations18){
    comboContainer.style.display = 'block';
    Object.entries(courses[course].combinations18).forEach(([label]) => {
      const option = document.createElement('option');
      option.value = label;
      option.textContent = label;
      comboSelect.appendChild(option);
    });
  } else {
    comboContainer.style.display = 'none';
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

export function maybeShowFairway(){
  const grp = document.getElementById('fairway-group');
  if(grp) grp.classList.remove('hidden');
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

export function clearInputs(){
  ['par','distance','penalties'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const fw = document.getElementById('fairway');
  if(fw) fw.value = 'na';
  const fairwayGroup = document.getElementById('fairway-group');
  if (fairwayGroup) fairwayGroup.classList.add('hidden');
  const container = document.getElementById('shots-container');
  if(container) container.innerHTML = '';
  state.shotIndex = 0;
  addShotRow();
}

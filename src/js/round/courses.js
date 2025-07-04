import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { initFirebase } from '../../firebase-config.js';

const { db } = initFirebase();

export async function loadCourses(){
  const snap = await getDocs(collection(db,'courses'));
  const courses = {};
  snap.forEach(docSnap => {
    courses[docSnap.id] = docSnap.data();
  });
  return courses;
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

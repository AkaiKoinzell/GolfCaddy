export function populateCourseFilter(allRounds, filters, updateCallback){
  const sel = document.getElementById('filter-course');
  const courses = [...new Set(allRounds.map(r=>r.course))];
  courses.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
  ['filter-format','filter-course','start-date','end-date'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('change', e => {
      if(id==='filter-format') filters.format = e.target.value;
      else if(id==='filter-course') filters.course = e.target.value;
      else if(id==='start-date') filters.start = e.target.value;
      else if(id==='end-date') filters.end = e.target.value;
      updateCallback();
    });
  });
}

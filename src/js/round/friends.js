import { collection, getDocs, doc, getDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { initFirebase } from '../../firebase-config.js';

const { db } = initFirebase();

export async function loadFriends(uid){
  if(!uid) return [];
  try{
    const q = collection(db, 'users', uid, 'friends');
    const snap = await getDocs(q);
    const list = await Promise.all(snap.docs.map(async d => {
      let name = d.id;
      try {
        const s = await getDoc(doc(db, 'users', d.id));
        if (s.exists()) name = s.data().name || d.id;
      } catch(e){
        console.warn('Failed fetching friend name', e);
      }
      return { id: d.id, name };
    }));
    return list;
  } catch(e){
    console.warn('Failed to load friends', e);
    return [];
  }
}

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

export function addFriendPlayer(){
  const input = document.getElementById('friend-select');
  const name = input.value.trim();
  if(name){
    addPlayerName(name);
    input.value = '';
  }
}

export async function searchPlayers(term){
  if(!term) return [];
  let q;
  if(term.includes('@')){
    q = query(collection(db,'users'), where('email','==',term));
  } else {
    q = query(collection(db,'users'), where('name','>=',term), where('name','<=', term + '\uf8ff'));
  }
  const snap = await getDocs(q);
  const results = [];
  snap.forEach(d => {
    const data = d.data();
    results.push({ id: d.id, label: data.name || data.email || d.id });
  });
  return results;
}

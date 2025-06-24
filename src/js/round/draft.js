import { setDoc, deleteDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { initFirebase } from '../../firebase-config.js';

const { db } = initFirebase();

export const DRAFT_KEY = 'roundDraft';

export async function saveDraft(uid, draft){
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  if(uid){
    try{
      await setDoc(doc(db,'round_drafts', uid), draft);
    }catch(e){
      console.warn('Unable to sync draft', e);
    }
  }
}

export async function deleteDraft(uid){
  localStorage.removeItem(DRAFT_KEY);
  if(uid){
    try{
      await deleteDoc(doc(db,'round_drafts', uid));
    }catch(e){
      console.warn('Unable to delete remote draft', e);
    }
  }
}

export async function fetchDraft(uid){
  let draftStr = localStorage.getItem(DRAFT_KEY);
  if(!draftStr && uid){
    try{
      const snap = await getDoc(doc(db,'round_drafts', uid));
      if(snap.exists()){
        draftStr = JSON.stringify(snap.data());
      }
    }catch(e){
      console.warn('Unable to fetch remote draft', e);
    }
  }
  return draftStr ? JSON.parse(draftStr) : null;
}

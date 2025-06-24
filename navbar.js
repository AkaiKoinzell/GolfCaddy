// navbar.js - injects navigation bar into each page
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { initFirebase } from './firebase-config.js';
import { isAdmin } from './roles.js';

const { auth } = initFirebase();

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.createElement('nav');
  nav.className = 'navbar navbar-expand-lg bg-light mb-3 site-navbar';
  nav.innerHTML = `
    <div class="container-fluid">
      <a class="navbar-brand" href="home.html">Pro Putt</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="navbar-nav">
          <a class="nav-link" href="home.html">🏠 Home</a>
          <a class="nav-link" href="index.html">➕ Round</a>
          <a class="nav-link" href="stats.html">📊 Statistiche</a>
          <a class="nav-link" href="search.html">🔍 Cerca</a>
          <a class="nav-link" href="clubs.html">🏌️ Bastoni</a>
          <a class="nav-link" href="profile1.html">👤 Profilo</a>
        </div>
      </div>
    </div>
  `;
  const header = document.querySelector('header.page-header');
  if (header) {
    header.before(nav);
  } else {
    document.body.prepend(nav);
  }

  const linksContainer = nav.querySelector('.navbar-nav');
  const adminLink = document.createElement('a');
  adminLink.className = 'nav-link';
  adminLink.href = 'admin.html';
  adminLink.textContent = '🛠️ Admin';
  onAuthStateChanged(auth, async user => {
    if (await isAdmin(user)) {
      linksContainer.appendChild(adminLink);
    }
  });
});

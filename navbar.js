// navbar.js - injects navigation bar into each page

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.createElement('nav');
  nav.className = 'navbar navbar-expand-lg bg-light mb-3 site-navbar';
  nav.innerHTML = `
    <div class="container-fluid">
      <a class="navbar-brand" href="home.html">Golf Tracker</a>
      <div class="navbar-nav">
        <a class="nav-link" href="home.html">🏠 Home</a>
        <a class="nav-link" href="index.html">➕ Round</a>
        <a class="nav-link" href="stats.html">📊 Statistiche</a>
        <a class="nav-link" href="clubs.html">🏌️ Bastoni</a>
        <a class="nav-link" href="profile1.html">👤 Profilo</a>
      </div>
    </div>
  `;
  const header = document.querySelector('header');
  if (header && header.nextSibling) {
    header.parentNode.insertBefore(nav, header.nextSibling);
  } else if (header) {
    header.after(nav);
  } else {
    document.body.prepend(nav);
  }
});

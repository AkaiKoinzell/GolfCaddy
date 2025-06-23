// navbar.js - injects navigation bar into each page

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <a href="home.html">🏠 Home</a>
    <a href="index.html">➕ Round</a>
    <a href="stats.html">📊 Statistiche</a>
    <a href="clubs.html">🏌️ Bastoni</a>
    <a href="profile1.html">👤 Profilo</a>
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

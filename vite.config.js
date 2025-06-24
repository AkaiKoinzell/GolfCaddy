import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    open: '/home.html'
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        clubs: resolve(__dirname, 'clubs.html'),
        search: resolve(__dirname, 'search.html'),
        round: resolve(__dirname, 'round.html'),
        profile: resolve(__dirname, 'profile1.html'),
        stats: resolve(__dirname, 'stats.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
});

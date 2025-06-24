// env.js - simple helper to load variables from a .env file synchronously
export function loadEnv(path = '.env') {
  // First check for variables injected at build time by Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteEnv = import.meta.env;
    if (viteEnv.VITE_FIREBASE_API_KEY) {
      return {
        FIREBASE_API_KEY: viteEnv.VITE_FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: viteEnv.VITE_FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: viteEnv.VITE_FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: viteEnv.VITE_FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: viteEnv.VITE_FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID: viteEnv.VITE_FIREBASE_MEASUREMENT_ID
      };
    }
  }

  // Fall back to loading the .env file synchronously during development
  const env = {};
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path, false); // synchronous request
    xhr.send(null);
    if (xhr.status === 200) {
      const lines = xhr.responseText.split(/\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        env[key] = value;
      }
    }
  } catch (e) {
    console.warn('Failed to load', path, e);
  }
  return env;
}

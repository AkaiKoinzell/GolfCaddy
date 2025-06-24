// env.js - simple helper to load variables from a .env file synchronously
export function loadEnv(path = '.env') {
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

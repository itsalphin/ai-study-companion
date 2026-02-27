const SESSION_KEY = "asc-session-v1";
const DATA_KEY = "asc-data-v1";
const THEME_KEY = "asc-theme-v1";

export const defaultData = {
  examMode: "JEE",
  sessions: [],
  testLogs: [],
  dailyLogs: {},
  notes: {},
  activeTimer: null,
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadSession() {
  return readJson(SESSION_KEY, null);
}

export function saveSession(session) {
  writeJson(SESSION_KEY, session);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function loadData() {
  const saved = readJson(DATA_KEY, null);
  if (!saved) {
    return defaultData;
  }

  return {
    ...defaultData,
    ...saved,
    sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
    testLogs: Array.isArray(saved.testLogs) ? saved.testLogs : [],
    dailyLogs: saved.dailyLogs && typeof saved.dailyLogs === "object" ? saved.dailyLogs : {},
    notes: saved.notes && typeof saved.notes === "object" ? saved.notes : {},
    activeTimer: saved.activeTimer && typeof saved.activeTimer === "object" ? saved.activeTimer : null,
  };
}

export function saveData(data) {
  writeJson(DATA_KEY, data);
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme === "dark" ? "dark" : "light");
}

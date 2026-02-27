import { DEMO_USERS, normalizeUsername } from "./demoProfiles";

const LOCAL_USERS_KEY = "asc-local-users-v1";

function loadLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function getLocalUser(username) {
  const normalized = normalizeUsername(username || "");
  if (!normalized) {
    return null;
  }

  const users = loadLocalUsers();
  return users[normalized] || null;
}

export function createLocalUser({ email, examMode, fullName, password, username }) {
  const normalized = normalizeUsername(username || "");
  const trimmedName = (fullName || "").trim();
  const normalizedEmail = (email || "").trim().toLowerCase();
  const pwd = password || "";

  if (!trimmedName || !normalizedEmail || !normalized || !pwd) {
    return { ok: false, error: "All fields are required." };
  }

  if (pwd.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }

  if (DEMO_USERS[normalized]) {
    return { ok: false, error: "This username is reserved. Pick another username." };
  }

  const users = loadLocalUsers();
  if (users[normalized]) {
    return { ok: false, error: "Username already exists. Try a different one." };
  }

  const emailExists = Object.values(users).some((user) => user.email === normalizedEmail);
  if (emailExists) {
    return { ok: false, error: "Email already registered. Please login instead." };
  }

  const record = {
    username: normalized,
    fullName: trimmedName,
    email: normalizedEmail,
    password: pwd,
    examMode: examMode || "JEE",
    createdAt: new Date().toISOString(),
  };
  users[normalized] = record;
  saveLocalUsers(users);
  return { ok: true, user: record };
}

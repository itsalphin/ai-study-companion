import { defaultData } from "./storage";
import { dateKey } from "./time";
import { hasSupabaseConfig, supabase } from "./supabaseClient";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDENTITY_MAP_KEY = "asc-identity-map-v1";

function requireSupabase() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

function isUuid(value) {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function usernameBaseFrom(value = "") {
  const fallback = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return fallback || "aspirant";
}

function toDisplayName(raw = "") {
  const value = String(raw || "").trim();
  if (!value) {
    return "User";
  }
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function normalizeUsername(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function loadIdentityMap() {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = localStorage.getItem(IDENTITY_MAP_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveIdentityMap(map) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(IDENTITY_MAP_KEY, JSON.stringify(map));
}

function rememberIdentity({ email = "", username = "" } = {}) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedEmail || !normalizedUsername) {
    return;
  }
  const map = loadIdentityMap();
  map[normalizedUsername] = normalizedEmail;
  saveIdentityMap(map);
}

async function resolveEmailFromIdentifier(client, identifier = "") {
  const value = String(identifier || "").trim();
  if (!value) {
    throw new Error("Email or username is required.");
  }
  if (value.includes("@")) {
    return normalizeEmail(value);
  }

  const username = normalizeUsername(value);
  const map = loadIdentityMap();
  const mapped = map[username];
  if (!mapped) {
    const { data, error } = await client.rpc("lookup_login_email", {
      p_username: username,
    });
    if (error) {
      throw new Error("Invalid credentials. Check username/email and password.");
    }

    const resolvedEmail = typeof data === "string" ? data : "";
    if (!resolvedEmail) {
      throw new Error("Invalid credentials. Check username/email and password.");
    }

    rememberIdentity({
      email: resolvedEmail,
      username,
    });
    return normalizeEmail(resolvedEmail);
  }
  return normalizeEmail(mapped);
}

function mapWorkspaceFromRows({ notesRows, profile, sessionRows, testRows, dailyLogRows }) {
  const notes = {};
  notesRows.forEach((row) => {
    notes[row.note_date] = {
      learned: row.learned || "",
      mistakes: row.mistakes || "",
      tomorrowGoal: row.tomorrow_goal || "",
    };
  });

  const dailyLogs = {};
  dailyLogRows.forEach((row) => {
    dailyLogs[row.log_date] = {
      wakeUp: row.wake_up || "",
      sleepTime: row.sleep_time || "",
      mood: row.mood || "😊 Focused",
      studyIntervals: Array.isArray(row.study_intervals) ? row.study_intervals : [],
      breakIntervals: Array.isArray(row.break_intervals) ? row.break_intervals : [],
    };
  });

  const sessions = sessionRows.map((row) => ({
    id: row.id,
    date: row.session_date,
    createdAt: row.created_at,
    subject: row.subject || "General",
    durationSeconds: Number(row.duration_seconds || 0),
    source: row.source || "manual",
  }));

  const testLogs = testRows.map((row) => ({
    id: row.id,
    date: row.test_date,
    createdAt: row.created_at,
    subject: row.subject || "General",
    marksScored: Number(row.marks_scored || 0),
    marksTotal: Number(row.marks_total || 0),
    durationMinutes: Number(row.duration_minutes || 0),
  }));

  return {
    ...defaultData,
    examMode: profile?.exam_mode || defaultData.examMode,
    sessions,
    testLogs,
    dailyLogs,
    notes,
    activeTimer:
      profile?.active_timer && typeof profile.active_timer === "object" ? profile.active_timer : null,
  };
}

async function ensureProfile(user, { examMode = "", theme = "light", username = "" } = {}) {
  const client = requireSupabase();
  const userId = user?.id;
  if (!userId) {
    throw new Error("Missing authenticated user.");
  }

  const { data: existing, error: existingError } = await client
    .from("profiles")
    .select("user_id, username, exam_mode, theme, active_timer")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError) {
    throw new Error(existingError.message);
  }
  if (existing) {
    return existing;
  }

  const emailPrefix = user.email ? user.email.split("@")[0] : "";
  const metadataUsername = user.user_metadata?.username || "";
  const metadataExamMode = String(user.user_metadata?.exam_mode || "")
    .trim()
    .toUpperCase();
  const base = usernameBaseFrom(username || metadataUsername || emailPrefix);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${Math.floor(Math.random() * 900 + 100)}`;
    const payload = {
      user_id: userId,
      username: candidate,
      exam_mode: examMode || metadataExamMode || "JEE",
      theme: theme || "light",
      active_timer: null,
    };

    const { data: created, error: createError } = await client
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("user_id, username, exam_mode, theme, active_timer")
      .single();

    if (!createError && created) {
      return created;
    }
    if (createError && createError.code === "23505") {
      continue;
    }
    if (createError) {
      throw new Error(createError.message);
    }
  }

  throw new Error("Could not create profile. Try a different username.");
}

async function replaceUserRows(table, userId, rows) {
  const client = requireSupabase();
  const { error: deleteError } = await client.from(table).delete().eq("user_id", userId);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!rows.length) {
    return;
  }

  const chunkSize = 250;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { error: insertError } = await client.from(table).insert(chunk);
    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

export function buildAppSession(user, profile, loggedAt = new Date().toISOString(), quoteNonce = "") {
  const profileUsername = profile?.username || "";
  const metadataName = user?.user_metadata?.full_name || "";
  const emailPrefix = user?.email ? user.email.split("@")[0] : "";
  const base = metadataName || profileUsername || emailPrefix || "User";

  return {
    userId: user?.id || "",
    email: user?.email || "",
    username: toDisplayName(base),
    profileUsername: profileUsername || normalizeUsername(base),
    loggedAt,
    quoteNonce,
  };
}

export async function getAuthUserFromSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return data?.session?.user || null;
}

export async function signInWithIdentifier({ identifier, password }) {
  const client = requireSupabase();
  const loginEmail = await resolveEmailFromIdentifier(client, identifier);
  const payload = {
    email: loginEmail,
    password: String(password || ""),
  };

  const { data, error } = await client.auth.signInWithPassword(payload);
  if (error) {
    throw new Error(error.message);
  }
  if (!data?.user) {
    throw new Error("Login failed. Please try again.");
  }

  const profile = await ensureProfile(data.user);
  const metadataUsername = normalizeUsername(data.user?.user_metadata?.username || "");
  const emailPrefixAlias = normalizeUsername(String(loginEmail).split("@")[0] || "");
  rememberIdentity({
    email: data.user?.email || loginEmail,
    username: profile?.username || identifier,
  });
  rememberIdentity({
    email: data.user?.email || loginEmail,
    username: metadataUsername,
  });
  rememberIdentity({
    email: data.user?.email || loginEmail,
    username: emailPrefixAlias,
  });
  return {
    user: data.user,
    profile,
  };
}

export async function signUpWithEmail({ email, examMode, fullName, password, username }) {
  const client = requireSupabase();
  const cleanUsername = normalizeUsername(username || "");
  const cleanFullName = String(fullName || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const emailRedirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

  if (!cleanUsername) {
    throw new Error("Username is required.");
  }

  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password: String(password || ""),
    options: {
      emailRedirectTo,
      data: {
        exam_mode: examMode || "JEE",
        full_name: cleanFullName,
        username: cleanUsername,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  rememberIdentity({
    email: cleanEmail,
    username: cleanUsername,
  });

  if (!data?.user) {
    throw new Error("Could not create account right now.");
  }

  if (!data.session) {
    return {
      requiresEmailVerification: true,
    };
  }

  const profile = await ensureProfile(data.user, {
    examMode: examMode || "JEE",
    username: cleanUsername,
  });

  return {
    requiresEmailVerification: false,
    user: data.user,
    profile,
  };
}

export async function signOutFromSupabase() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchUserWorkspace(user) {
  const client = requireSupabase();
  const profile = await ensureProfile(user);
  const metadataUsername = normalizeUsername(user?.user_metadata?.username || "");
  const emailPrefixAlias = normalizeUsername(String(user?.email || "").split("@")[0] || "");
  rememberIdentity({
    email: user?.email || "",
    username: profile?.username || user?.user_metadata?.username || "",
  });
  rememberIdentity({
    email: user?.email || "",
    username: metadataUsername,
  });
  rememberIdentity({
    email: user?.email || "",
    username: emailPrefixAlias,
  });

  const [sessionsRes, testRes, dailyRes, notesRes] = await Promise.all([
    client
      .from("sessions")
      .select("id, session_date, created_at, subject, duration_seconds, source")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    client
      .from("test_logs")
      .select("id, test_date, created_at, subject, marks_scored, marks_total, duration_minutes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    client
      .from("daily_logs")
      .select("log_date, wake_up, sleep_time, mood, study_intervals, break_intervals")
      .eq("user_id", user.id)
      .order("log_date", { ascending: true }),
    client
      .from("notes")
      .select("note_date, learned, mistakes, tomorrow_goal")
      .eq("user_id", user.id)
      .order("note_date", { ascending: true }),
  ]);

  if (sessionsRes.error) {
    throw new Error(sessionsRes.error.message);
  }
  if (testRes.error) {
    throw new Error(testRes.error.message);
  }
  if (dailyRes.error) {
    throw new Error(dailyRes.error.message);
  }
  if (notesRes.error) {
    throw new Error(notesRes.error.message);
  }

  return {
    profile,
    data: mapWorkspaceFromRows({
      profile,
      sessionRows: sessionsRes.data || [],
      testRows: testRes.data || [],
      dailyLogRows: dailyRes.data || [],
      notesRows: notesRes.data || [],
    }),
  };
}

export async function syncUserWorkspace(userId, { data, profileUsername, theme }) {
  const client = requireSupabase();
  const safeData = data || defaultData;

  const profilePatch = {
    exam_mode: safeData.examMode || "JEE",
    theme: theme || "light",
    active_timer:
      safeData.activeTimer && typeof safeData.activeTimer === "object" ? safeData.activeTimer : null,
  };
  if (profileUsername) {
    profilePatch.username = normalizeUsername(profileUsername);
  }

  const { error: profileError } = await client
    .from("profiles")
    .update(profilePatch)
    .eq("user_id", userId);
  if (profileError) {
    throw new Error(profileError.message);
  }

  const sessionsRows = (safeData.sessions || [])
    .map((session) => {
      const durationSeconds = Number(session.durationSeconds || 0);
      if (durationSeconds <= 0) {
        return null;
      }
      const createdAt = session.createdAt || new Date().toISOString();
      const row = {
        user_id: userId,
        session_date: session.date || dateKey(new Date(createdAt)),
        created_at: createdAt,
        subject: session.subject || "General",
        duration_seconds: Math.round(durationSeconds),
        source: session.source || "manual",
      };
      if (isUuid(session.id)) {
        row.id = session.id;
      }
      return row;
    })
    .filter(Boolean);

  const testRows = (safeData.testLogs || [])
    .map((log) => {
      const marksScored = Number(log.marksScored || 0);
      const marksTotal = Number(log.marksTotal || 0);
      const durationMinutes = Number(log.durationMinutes || 0);
      if (marksTotal <= 0 || durationMinutes <= 0 || marksScored < 0 || marksScored > marksTotal) {
        return null;
      }
      const createdAt = log.createdAt || new Date().toISOString();
      const row = {
        user_id: userId,
        test_date: log.date || dateKey(new Date(createdAt)),
        created_at: createdAt,
        subject: log.subject || "General",
        marks_scored: Math.round(marksScored),
        marks_total: Math.round(marksTotal),
        duration_minutes: Math.round(durationMinutes),
      };
      if (isUuid(log.id)) {
        row.id = log.id;
      }
      return row;
    })
    .filter(Boolean);

  const dailyRows = Object.entries(safeData.dailyLogs || {}).map(([logDate, log]) => ({
    user_id: userId,
    log_date: logDate,
    wake_up: log?.wakeUp || null,
    sleep_time: log?.sleepTime || null,
    mood: log?.mood || null,
    study_intervals: Array.isArray(log?.studyIntervals) ? log.studyIntervals : [],
    break_intervals: Array.isArray(log?.breakIntervals) ? log.breakIntervals : [],
  }));

  const noteRows = Object.entries(safeData.notes || {}).map(([noteDate, note]) => ({
    user_id: userId,
    note_date: noteDate,
    learned: note?.learned || "",
    mistakes: note?.mistakes || "",
    tomorrow_goal: note?.tomorrowGoal || "",
  }));

  await replaceUserRows("sessions", userId, sessionsRows);
  await replaceUserRows("test_logs", userId, testRows);
  await replaceUserRows("daily_logs", userId, dailyRows);
  await replaceUserRows("notes", userId, noteRows);
}

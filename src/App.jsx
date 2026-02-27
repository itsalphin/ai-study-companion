import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotesPage from "./pages/NotesPage";
import NotFoundPage from "./pages/NotFoundPage";
import { downloadBackup } from "./utils/backup";
import {
  clearSession,
  defaultData,
  loadData,
  loadSession,
  loadTheme,
  saveData,
  saveSession,
  saveTheme,
} from "./utils/storage";
import {
  fetchUserWorkspace,
  getAuthUserFromSession,
  signInWithEmail,
  signOutFromSupabase,
  signUpWithEmail,
  syncUserWorkspace,
  buildAppSession,
} from "./utils/supabaseData";
import { hasSupabaseConfig, supabase } from "./utils/supabaseClient";
import { applyThemeClass } from "./script";

const LOGIN_COUNT_KEY = "asc-login-count-v1";

function nextLoginNonce() {
  const rawCount = Number(localStorage.getItem(LOGIN_COUNT_KEY));
  const loginCount = Number.isFinite(rawCount) ? rawCount + 1 : 1;
  localStorage.setItem(LOGIN_COUNT_KEY, String(loginCount));
  return `${Date.now()}-${loginCount}-${Math.floor(Math.random() * 1000000)}`;
}

function FullPageLoader({ message = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <p className="glass-card rounded-2xl px-6 py-4 text-sm font-semibold">{message}</p>
    </div>
  );
}

function ProtectedRoute({ loading, session, children }) {
  if (loading) {
    return <FullPageLoader message="Loading your workspace..." />;
  }

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [data, setData] = useState(loadData);
  const [theme, setTheme] = useState(loadTheme);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (session) {
      saveSession(session);
    } else {
      clearSession();
    }
  }, [session]);

  useEffect(() => {
    saveTheme(theme);
    applyThemeClass(theme);
  }, [theme]);

  const hydrateWorkspace = useCallback(async (user, { freshLogin = false } = {}) => {
    const { profile, data: workspace } = await fetchUserWorkspace(user);
    setData(workspace);
    setTheme((previous) => profile?.theme || previous || "light");
    setSession((previous) => {
      const nowIso = new Date().toISOString();
      const sameUser = previous?.userId && previous.userId === user.id;
      const loggedAt = !freshLogin && sameUser && previous.loggedAt ? previous.loggedAt : nowIso;
      const quoteNonce = !freshLogin && sameUser && previous.quoteNonce ? previous.quoteNonce : nextLoginNonce();
      return buildAppSession(user, profile, loggedAt, quoteNonce);
    });
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (!hasSupabaseConfig) {
        if (active) {
          setAuthError("Supabase env is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
          setAuthLoading(false);
        }
        return;
      }

      try {
        const user = await getAuthUserFromSession();
        if (!active) {
          return;
        }
        if (!user) {
          setSession(null);
          setData(defaultData);
          return;
        }
        await hydrateWorkspace(user, { freshLogin: false });
      } catch (error) {
        if (!active) {
          return;
        }
        const message = error instanceof Error ? error.message : "Could not load your workspace.";
        setAuthError(message);
        setSession(null);
        setData(defaultData);
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    void bootstrap();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!active) {
        return;
      }
      if (event === "SIGNED_OUT") {
        setSession(null);
        setData(defaultData);
        setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [hydrateWorkspace]);

  useEffect(() => {
    if (!session?.userId || authLoading || !hasSupabaseConfig) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      void syncUserWorkspace(session.userId, {
        data,
        profileUsername: session.profileUsername,
        theme,
      }).catch((error) => {
        const message = error instanceof Error ? error.message : "Unable to sync with Supabase.";
        setAuthError(message);
      });
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [authLoading, data, session?.profileUsername, session?.userId, theme]);

  const onLogin = async ({ email, password }) => {
    setAuthError("");
    const { user } = await signInWithEmail({ email, password });
    await hydrateWorkspace(user, { freshLogin: true });
    setAuthError("");
  };

  const onRegister = async ({ email, examMode, fullName, password, username }) => {
    setAuthError("");
    const result = await signUpWithEmail({ email, examMode, fullName, password, username });
    if (result.requiresEmailVerification) {
      return result;
    }

    await hydrateWorkspace(result.user, { freshLogin: true });
    setAuthError("");
    return result;
  };

  const onLogout = async () => {
    setAuthError("");
    try {
      await signOutFromSupabase();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sign out from Supabase.";
      setAuthError(message);
    } finally {
      setSession(null);
      setData(defaultData);
    }
  };

  const onSelectMode = (examMode) => {
    setData((previous) => ({
      ...previous,
      examMode,
    }));
  };

  const onDownloadData = () => {
    downloadBackup({ data, session, theme });
  };

  return (
    <Routes>
      <Route
        element={<LandingPage examMode={data.examMode} onSelectMode={onSelectMode} session={session} />}
        path="/"
      />
      <Route
        element={
          authLoading ? (
            <FullPageLoader message="Checking your session..." />
          ) : session ? (
            <Navigate replace to="/dashboard" />
          ) : (
            <LoginPage globalError={authError} onLogin={onLogin} />
          )
        }
        path="/login"
      />
      <Route
        element={
          authLoading ? (
            <FullPageLoader message="Checking your session..." />
          ) : session ? (
            <Navigate replace to="/dashboard" />
          ) : (
            <RegisterPage
              defaultExamMode={data.examMode}
              globalError={authError}
              onRegister={onRegister}
              onSelectMode={onSelectMode}
            />
          )
        }
        path="/register"
      />
      <Route
        element={
          <ProtectedRoute loading={authLoading} session={session}>
            <DashboardPage
              data={data}
              onLogout={onLogout}
              session={session}
              setData={setData}
              setTheme={setTheme}
              theme={theme}
            />
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route
        element={
          <ProtectedRoute loading={authLoading} session={session}>
            <AnalyticsPage
              data={data}
              onDownloadData={onDownloadData}
              onLogout={onLogout}
              session={session}
              setTheme={setTheme}
              theme={theme}
            />
          </ProtectedRoute>
        }
        path="/analytics"
      />
      <Route
        element={
          <ProtectedRoute loading={authLoading} session={session}>
            <NotesPage
              data={data}
              onLogout={onLogout}
              session={session}
              setData={setData}
              setTheme={setTheme}
              theme={theme}
            />
          </ProtectedRoute>
        }
        path="/notes"
      />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}

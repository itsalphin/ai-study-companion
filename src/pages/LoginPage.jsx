import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGIN_TIMEOUT_MS = 20000;

export default function LoginPage({ globalError, onLogin }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Username/email and password are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    let timeoutId;

    try {
      await Promise.race([
        onLogin({ identifier, password }),
        new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Login timed out. Check internet and try again.")),
            LOGIN_TIMEOUT_MS,
          );
        }),
      ]);
      navigate("/dashboard");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Invalid credentials.";
      setError(message);
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold">Login</h1>
        <p className="mt-2 muted">Continue your competitive exam preparation flow.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block" htmlFor="identifier">
            <span className="mb-1 block text-sm font-semibold">Username or Email</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="identifier"
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Enter username or email"
              value={identifier}
            />
          </label>

          <label className="block" htmlFor="password">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 pr-12 dark:border-slate-500/60 dark:bg-slate-800/90"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-100"
                onClick={() => setShowPassword((previous) => !previous)}
                type="button"
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                    <path d="M9.88 4.24A10.7 10.7 0 0112 4c5.15 0 9.27 3.39 10.5 8-1.15 4.28-4.86 7.49-9.5 7.95" />
                    <path d="M6.12 6.12C4.35 7.38 3.02 9.22 2 12c.5 1.84 1.5 3.45 2.87 4.69" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {globalError ? <p className="text-sm font-semibold text-rose-600">{globalError}</p> : null}
          {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm muted">
          New user?{" "}
          <Link className="font-semibold text-sky-600 hover:text-sky-700" to="/register">
            Create an account
          </Link>
        </p>

        <p className="mt-2 text-sm muted">
          Need to review first?{" "}
          <Link className="font-semibold text-sky-600 hover:text-sky-700" to="/">
            Go back to landing page
          </Link>
        </p>
      </div>
    </div>
  );
}

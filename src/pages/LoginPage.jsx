import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage({ globalError, onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onLogin({ email, password });
      navigate("/dashboard");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Invalid credentials.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold">Login</h1>
        <p className="mt-2 muted">Continue your competitive exam preparation flow.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block" htmlFor="email">
            <span className="mb-1 block text-sm font-semibold">Email</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email"
              type="email"
              value={email}
            />
          </label>

          <label className="block" htmlFor="password">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              type="password"
              value={password}
            />
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

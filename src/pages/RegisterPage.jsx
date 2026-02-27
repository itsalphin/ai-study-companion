import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EXAM_MODES } from "../utils/examModes";

export default function RegisterPage({ defaultExamMode, globalError, onRegister, onSelectMode }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState(defaultExamMode || "JEE");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    onSelectMode(mode);

    try {
      const result = await onRegister({
        email,
        examMode: mode,
        fullName,
        password,
        username,
      });
      if (result?.requiresEmailVerification) {
        setSuccess("Account created. Check your inbox, verify email, then login.");
        return;
      }
      navigate("/dashboard");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Could not create account.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold">Create Account</h1>
        <p className="mt-2 muted">Register once and start tracking your preparation daily.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block" htmlFor="fullName">
            <span className="mb-1 block text-sm font-semibold">Full Name</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="fullName"
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter full name"
              value={fullName}
            />
          </label>

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

          <label className="block" htmlFor="username">
            <span className="mb-1 block text-sm font-semibold">Username</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Create username"
              value={username}
            />
          </label>

          <label className="block" htmlFor="password">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create password"
              type="password"
              value={password}
            />
          </label>

          <label className="block" htmlFor="confirmPassword">
            <span className="mb-1 block text-sm font-semibold">Confirm Password</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter password"
              type="password"
              value={confirmPassword}
            />
          </label>

          <label className="block" htmlFor="examMode">
            <span className="mb-1 block text-sm font-semibold">Exam Mode</span>
            <select
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="examMode"
              onChange={(event) => setMode(event.target.value)}
              value={mode}
            >
              {EXAM_MODES.map((exam) => (
                <option key={exam.value} value={exam.value}>
                  {exam.value}
                </option>
              ))}
            </select>
          </label>

          {globalError ? <p className="text-sm font-semibold text-rose-600">{globalError}</p> : null}
          {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm font-semibold text-emerald-600">{success}</p> : null}

          <button
            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm muted">
          Already have an account?{" "}
          <Link className="font-semibold text-sky-600 hover:text-sky-700" to="/login">
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}

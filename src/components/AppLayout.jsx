import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analytics", label: "Analytics" },
  { to: "/notes", label: "Notes" },
];

export default function AppLayout({
  children,
  examMode,
  onLogout,
  session,
  setTheme,
  theme,
}) {
  return (
    <div className="min-h-screen overflow-x-hidden px-3 py-3 md:px-6">
      <header className="glass-card sticky top-3 z-30 mx-auto mb-6 w-full max-w-6xl rounded-2xl p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-semibold md:text-xl">AI Study Companion</p>
            <p className="text-sm muted break-words">
              Mode: <span className="font-semibold">{examMode}</span> | User:{" "}
              <span className="font-semibold break-all">{session?.username || "User"}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => (
                <NavLink
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-sky-500 text-white"
                        : "bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
                    }`
                  }
                  key={link.to}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggle
              onToggle={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              theme={theme}
            />
            <button
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl min-w-0">{children}</main>
    </div>
  );
}

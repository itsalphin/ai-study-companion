export default function ThemeToggle({ theme, onToggle }) {
  const label = theme === "dark" ? "Light Mode" : "Dark Mode";
  return (
    <button
      className="rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-500/60 dark:bg-slate-800/80 dark:text-slate-100"
      onClick={onToggle}
      type="button"
    >
      {label}
    </button>
  );
}

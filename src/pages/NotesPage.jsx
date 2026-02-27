import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { dateKey } from "../utils/time";

const empty = {
  learned: "",
  mistakes: "",
  tomorrowGoal: "",
};

export default function NotesPage({ data, onLogout, session, setData, setTheme, theme }) {
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(data.notes[selectedDate] || empty);
    setSaved(false);
  }, [data.notes, selectedDate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setSaved(false);
  };

  const save = (event) => {
    event.preventDefault();
    setData((previous) => ({
      ...previous,
      notes: {
        ...previous.notes,
        [selectedDate]: form,
      },
    }));
    setSaved(true);
  };

  const recent = useMemo(
    () =>
      Object.entries(data.notes)
        .sort(([a], [b]) => (a < b ? 1 : -1)),
    [data.notes],
  );

  return (
    <AppLayout
      examMode={data.examMode}
      onLogout={onLogout}
      session={session}
      setTheme={setTheme}
      theme={theme}
    >
      <section className="mb-6">
        <h1 className="section-title">Daily Notes</h1>
        <p className="mt-2 muted">Write what you learned, mistakes, and tomorrow's target.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="glass-card rounded-2xl p-5">
          <form className="space-y-4" onSubmit={save}>
            <label className="block" htmlFor="date">
              <span className="mb-1 block text-sm font-semibold">Date</span>
              <input
                className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
                id="date"
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
              />
            </label>

            <label className="block" htmlFor="learned">
              <span className="mb-1 block text-sm font-semibold">What I learned</span>
              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
                id="learned"
                name="learned"
                onChange={onChange}
                placeholder="Key topics and concepts covered today..."
                value={form.learned}
              />
            </label>

            <label className="block" htmlFor="mistakes">
              <span className="mb-1 block text-sm font-semibold">Mistakes today</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
                id="mistakes"
                name="mistakes"
                onChange={onChange}
                placeholder="Conceptual errors, distractions, or timing issues..."
                value={form.mistakes}
              />
            </label>

            <label className="block" htmlFor="tomorrowGoal">
              <span className="mb-1 block text-sm font-semibold">Tomorrow's goal</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
                id="tomorrowGoal"
                name="tomorrowGoal"
                onChange={onChange}
                placeholder="Define one clear target for tomorrow..."
                value={form.tomorrowGoal}
              />
            </label>

            <button
              className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600"
              type="submit"
            >
              Save Notes
            </button>
          </form>
          {saved ? <p className="mt-3 text-sm font-semibold text-emerald-600">Saved for {selectedDate}.</p> : null}
        </article>

        <article className="glass-card rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Recent Entries</h2>
          <div className="mt-4 max-h-[22rem] space-y-3 overflow-y-auto pr-1">
            {recent.length ? (
              recent.map(([day, note]) => (
                <div
                  className="rounded-xl border border-slate-200/80 bg-white/75 p-3 dark:border-slate-600/60 dark:bg-slate-800/80"
                  key={day}
                >
                  <p className="text-sm font-semibold">{day}</p>
                  <p className="mt-1 text-sm muted">{note.learned || "No note entered."}</p>
                </div>
              ))
            ) : (
              <p className="text-sm muted">No notes yet. Add your first reflection now.</p>
            )}
          </div>
        </article>
      </section>
    </AppLayout>
  );
}

import { useEffect, useState } from "react";

const emptyInterval = {
  start: "",
  end: "",
};

const emptyLog = {
  wakeUp: "",
  sleepTime: "",
  mood: "😊 Focused",
  studyIntervals: [{ ...emptyInterval }],
  breakIntervals: [{ ...emptyInterval }],
};

const moods = ["😊 Focused", "😌 Calm", "💪 Motivated", "😕 Distracted", "😴 Tired"];

function normalizeLog(value = {}) {
  const fromStudyIntervals = Array.isArray(value.studyIntervals)
    ? value.studyIntervals.filter((interval) => interval && typeof interval === "object")
    : [];
  const fromBreakIntervals = Array.isArray(value.breakIntervals)
    ? value.breakIntervals.filter((interval) => interval && typeof interval === "object")
    : [];

  const legacyStudy =
    value.studyStart || value.studyEnd
      ? [{ start: value.studyStart || "", end: value.studyEnd || "" }]
      : [];
  const legacyBreak =
    value.breakStart || value.breakEnd
      ? [{ start: value.breakStart || "", end: value.breakEnd || "" }]
      : [];

  const normalizedStudy = (fromStudyIntervals.length ? fromStudyIntervals : legacyStudy).map((interval) => ({
    start: interval.start || "",
    end: interval.end || "",
  }));
  const normalizedBreak = (fromBreakIntervals.length ? fromBreakIntervals : legacyBreak).map((interval) => ({
    start: interval.start || "",
    end: interval.end || "",
  }));

  return {
    ...emptyLog,
    ...value,
    studyIntervals: normalizedStudy.length ? normalizedStudy : [{ ...emptyInterval }],
    breakIntervals: normalizedBreak.length ? normalizedBreak : [{ ...emptyInterval }],
  };
}

export default function DailyLogForm({ value, onSave }) {
  const [form, setForm] = useState(normalizeLog(value));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(normalizeLog(value));
  }, [value]);

  const onChange = (event) => {
    const { name, value: nextValue } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));
    setSaved(false);
  };

  const onIntervalChange = (type, index, field, nextValue) => {
    setForm((previous) => ({
      ...previous,
      [type]: previous[type].map((interval, itemIndex) =>
        itemIndex === index
          ? {
              ...interval,
              [field]: nextValue,
            }
          : interval,
      ),
    }));
    setSaved(false);
  };

  const addInterval = (type) => {
    setForm((previous) => ({
      ...previous,
      [type]: [...previous[type], { ...emptyInterval }],
    }));
    setSaved(false);
  };

  const removeInterval = (type, index) => {
    setForm((previous) => {
      if (previous[type].length <= 1) {
        return previous;
      }

      return {
        ...previous,
        [type]: previous[type].filter((_, itemIndex) => itemIndex !== index),
      };
    });
    setSaved(false);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    onSave(form);
    setSaved(true);
  };

  return (
    <section className="glass-card min-w-0 overflow-x-hidden rounded-2xl p-5">
      <h3 className="font-display text-xl font-semibold">Daily Log</h3>
      <p className="mt-1 text-sm muted">Track multiple study and break intervals across the day.</p>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block" htmlFor="wakeUp">
          <span className="mb-1 block text-sm font-semibold">Wake-up Time</span>
          <input
            className="w-full max-w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="wakeUp"
            name="wakeUp"
            onChange={onChange}
            type="time"
            value={form.wakeUp}
          />
        </label>

        <div className="rounded-xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-600/50 dark:bg-slate-900/30">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Study Intervals</p>
            <button
              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
              onClick={() => addInterval("studyIntervals")}
              type="button"
            >
              + Add Study Block
            </button>
          </div>
          <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {form.studyIntervals.map((interval, index) => (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]" key={`study-${index}`}>
                <label className="block" htmlFor={`study-start-${index}`}>
                  <span className="mb-1 block text-xs font-semibold">Start</span>
                  <input
                    className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 dark:border-slate-500/60 dark:bg-slate-800/90"
                    id={`study-start-${index}`}
                    onChange={(event) =>
                      onIntervalChange("studyIntervals", index, "start", event.target.value)
                    }
                    type="time"
                    value={interval.start}
                  />
                </label>
                <label className="block" htmlFor={`study-end-${index}`}>
                  <span className="mb-1 block text-xs font-semibold">End</span>
                  <input
                    className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 dark:border-slate-500/60 dark:bg-slate-800/90"
                    id={`study-end-${index}`}
                    onChange={(event) =>
                      onIntervalChange("studyIntervals", index, "end", event.target.value)
                    }
                    type="time"
                    value={interval.end}
                  />
                </label>
                <button
                  className="mt-5 rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300"
                  disabled={form.studyIntervals.length <= 1}
                  onClick={() => removeInterval("studyIntervals", index)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-600/50 dark:bg-slate-900/30">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Break Intervals</p>
            <button
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              onClick={() => addInterval("breakIntervals")}
              type="button"
            >
              + Add Break Block
            </button>
          </div>
          <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {form.breakIntervals.map((interval, index) => (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]" key={`break-${index}`}>
                <label className="block" htmlFor={`break-start-${index}`}>
                  <span className="mb-1 block text-xs font-semibold">Start</span>
                  <input
                    className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 dark:border-slate-500/60 dark:bg-slate-800/90"
                    id={`break-start-${index}`}
                    onChange={(event) =>
                      onIntervalChange("breakIntervals", index, "start", event.target.value)
                    }
                    type="time"
                    value={interval.start}
                  />
                </label>
                <label className="block" htmlFor={`break-end-${index}`}>
                  <span className="mb-1 block text-xs font-semibold">End</span>
                  <input
                    className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 dark:border-slate-500/60 dark:bg-slate-800/90"
                    id={`break-end-${index}`}
                    onChange={(event) =>
                      onIntervalChange("breakIntervals", index, "end", event.target.value)
                    }
                    type="time"
                    value={interval.end}
                  />
                </label>
                <button
                  className="mt-5 rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300"
                  disabled={form.breakIntervals.length <= 1}
                  onClick={() => removeInterval("breakIntervals", index)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="block" htmlFor="sleepTime">
          <span className="mb-1 block text-sm font-semibold">Sleep Time</span>
          <input
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="sleepTime"
            name="sleepTime"
            onChange={onChange}
            type="time"
            value={form.sleepTime}
          />
        </label>

        <label className="block" htmlFor="mood">
          <span className="mb-1 block text-sm font-semibold">Mood</span>
          <select
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="mood"
            name="mood"
            onChange={onChange}
            value={form.mood}
          >
            {moods.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </label>

        <button
          className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600"
          type="submit"
        >
          Save Daily Log
        </button>
      </form>

      {saved ? <p className="mt-3 text-sm font-semibold text-emerald-600">Saved for today.</p> : null}
    </section>
  );
}

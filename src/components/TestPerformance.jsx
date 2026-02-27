import { useEffect, useMemo, useState } from "react";
import { getSubjectsForMode } from "../utils/examModes";
import { dateKey } from "../utils/time";

function percent(scored, total) {
  if (!total) {
    return 0;
  }
  return Number(((scored / total) * 100).toFixed(1));
}

export default function TestPerformance({
  examMode,
  onAddTestLog,
  onDeleteTestLog,
  onUpdateTestLog,
  testLogs,
}) {
  const subjects = getSubjectsForMode(examMode);
  const [form, setForm] = useState({
    subject: subjects[0],
    date: dateKey(),
    marksScored: "",
    marksTotal: "180",
    durationMinutes: "",
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    subject: subjects[0],
    date: dateKey(),
    marksScored: "",
    marksTotal: "180",
    durationMinutes: "",
  });
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!subjects.includes(form.subject)) {
      setForm((previous) => ({
        ...previous,
        subject: subjects[0],
      }));
    }
    if (!subjects.includes(editForm.subject)) {
      setEditForm((previous) => ({
        ...previous,
        subject: subjects[0],
      }));
    }
  }, [editForm.subject, form.subject, subjects]);

  const sortedLogs = useMemo(
    () =>
      [...testLogs].sort((left, right) => {
        const leftTime = new Date(left.createdAt || `${left.date}T00:00:00`).getTime();
        const rightTime = new Date(right.createdAt || `${right.date}T00:00:00`).getTime();
        return rightTime - leftTime;
      }),
    [testLogs],
  );

  const validate = (values) => {
    const marksScored = Number(values.marksScored);
    const marksTotal = Number(values.marksTotal);
    const durationMinutes = Number(values.durationMinutes);

    if (
      Number.isNaN(marksScored) ||
      Number.isNaN(marksTotal) ||
      Number.isNaN(durationMinutes) ||
      marksTotal <= 0 ||
      durationMinutes <= 0
    ) {
      return "Enter valid marks and test time.";
    }
    if (marksScored < 0 || marksScored > marksTotal) {
      return "Marks scored must be between 0 and total marks.";
    }
    if (!values.date) {
      return "Select the test date.";
    }

    return "";
  };

  const submit = (event) => {
    event.preventDefault();
    const validation = validate(form);
    if (validation) {
      setError(validation);
      return;
    }

    onAddTestLog({
      subject: form.subject,
      date: form.date,
      marksScored: Number(form.marksScored),
      marksTotal: Number(form.marksTotal),
      durationMinutes: Number(form.durationMinutes),
    });

    setForm((previous) => ({
      ...previous,
      marksScored: "",
      durationMinutes: "",
    }));
    setError("");
    setSaved(true);
  };

  const beginEdit = (log) => {
    setEditingId(log.id);
    setEditForm({
      subject: log.subject || subjects[0],
      date: log.date || dateKey(),
      marksScored: String(log.marksScored ?? ""),
      marksTotal: String(log.marksTotal ?? ""),
      durationMinutes: String(log.durationMinutes ?? ""),
    });
    setEditError("");
  };

  const saveEdit = () => {
    const validation = validate(editForm);
    if (validation) {
      setEditError(validation);
      return;
    }

    onUpdateTestLog(editingId, {
      subject: editForm.subject,
      date: editForm.date,
      marksScored: Number(editForm.marksScored),
      marksTotal: Number(editForm.marksTotal),
      durationMinutes: Number(editForm.durationMinutes),
    });
    setEditingId(null);
    setEditError("");
  };

  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-xl font-semibold">Test Performance</h3>
      <p className="mt-1 text-sm muted">Log subject test marks and test duration whenever you attend tests.</p>

      <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={submit}>
        <label className="block" htmlFor="testSubject">
          <span className="mb-1 block text-sm font-semibold">Subject</span>
          <select
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="testSubject"
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                subject: event.target.value,
              }));
              setError("");
              setSaved(false);
            }}
            value={form.subject}
          >
            {subjects.map((subject) => (
              <option key={`test-${subject}`} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <label className="block" htmlFor="testDate">
          <span className="mb-1 block text-sm font-semibold">Test Date</span>
          <input
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="testDate"
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                date: event.target.value,
              }));
              setError("");
              setSaved(false);
            }}
            type="date"
            value={form.date}
          />
        </label>

        <label className="block" htmlFor="marksScored">
          <span className="mb-1 block text-sm font-semibold">Marks Scored</span>
          <input
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="marksScored"
            min="0"
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                marksScored: event.target.value,
              }));
              setError("");
              setSaved(false);
            }}
            placeholder="e.g. 128"
            type="number"
            value={form.marksScored}
          />
        </label>

        <label className="block" htmlFor="marksTotal">
          <span className="mb-1 block text-sm font-semibold">Total Marks</span>
          <input
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="marksTotal"
            min="1"
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                marksTotal: event.target.value,
              }));
              setError("");
              setSaved(false);
            }}
            type="number"
            value={form.marksTotal}
          />
        </label>

        <label className="block md:col-span-2" htmlFor="testDuration">
          <span className="mb-1 block text-sm font-semibold">Test Duration (minutes)</span>
          <input
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-2.5 dark:border-slate-500/60 dark:bg-slate-800/90"
            id="testDuration"
            min="1"
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                durationMinutes: event.target.value,
              }));
              setError("");
              setSaved(false);
            }}
            placeholder="e.g. 90"
            type="number"
            value={form.durationMinutes}
          />
        </label>

        <button
          className="rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 md:col-span-2"
          type="submit"
        >
          Add Test Log
        </button>
      </form>

      {error ? <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p> : null}
      {saved ? <p className="mt-2 text-sm font-semibold text-emerald-600">Test entry saved.</p> : null}

      <div className="mt-6 rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-600/50 dark:bg-slate-900/30">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Recent Test Logs</p>
          <p className="text-xs muted">{sortedLogs.length} entries</p>
        </div>
        <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {sortedLogs.length ? (
            sortedLogs.map((log) => {
              const isEditing = editingId === log.id;
              return (
                <div
                  className="rounded-xl border border-slate-200/70 bg-white/85 p-3 dark:border-slate-600/60 dark:bg-slate-800/70"
                  key={log.id}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <label className="block" htmlFor={`edit-test-subject-${log.id}`}>
                          <span className="mb-1 block text-xs font-semibold">Subject</span>
                          <select
                            className="w-full rounded-lg border border-slate-300/70 bg-white/90 px-3 py-2 text-sm dark:border-slate-500/60 dark:bg-slate-800/90"
                            id={`edit-test-subject-${log.id}`}
                            onChange={(event) =>
                              setEditForm((previous) => ({ ...previous, subject: event.target.value }))
                            }
                            value={editForm.subject}
                          >
                            {subjects.map((subject) => (
                              <option key={`edit-test-${subject}`} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block" htmlFor={`edit-test-date-${log.id}`}>
                          <span className="mb-1 block text-xs font-semibold">Date</span>
                          <input
                            className="w-full rounded-lg border border-slate-300/70 bg-white/90 px-3 py-2 text-sm dark:border-slate-500/60 dark:bg-slate-800/90"
                            id={`edit-test-date-${log.id}`}
                            onChange={(event) =>
                              setEditForm((previous) => ({ ...previous, date: event.target.value }))
                            }
                            type="date"
                            value={editForm.date}
                          />
                        </label>
                        <label className="block" htmlFor={`edit-test-scored-${log.id}`}>
                          <span className="mb-1 block text-xs font-semibold">Marks Scored</span>
                          <input
                            className="w-full rounded-lg border border-slate-300/70 bg-white/90 px-3 py-2 text-sm dark:border-slate-500/60 dark:bg-slate-800/90"
                            id={`edit-test-scored-${log.id}`}
                            min="0"
                            onChange={(event) =>
                              setEditForm((previous) => ({ ...previous, marksScored: event.target.value }))
                            }
                            type="number"
                            value={editForm.marksScored}
                          />
                        </label>
                        <label className="block" htmlFor={`edit-test-total-${log.id}`}>
                          <span className="mb-1 block text-xs font-semibold">Total Marks</span>
                          <input
                            className="w-full rounded-lg border border-slate-300/70 bg-white/90 px-3 py-2 text-sm dark:border-slate-500/60 dark:bg-slate-800/90"
                            id={`edit-test-total-${log.id}`}
                            min="1"
                            onChange={(event) =>
                              setEditForm((previous) => ({ ...previous, marksTotal: event.target.value }))
                            }
                            type="number"
                            value={editForm.marksTotal}
                          />
                        </label>
                        <label className="block md:col-span-2" htmlFor={`edit-test-duration-${log.id}`}>
                          <span className="mb-1 block text-xs font-semibold">Duration (minutes)</span>
                          <input
                            className="w-full rounded-lg border border-slate-300/70 bg-white/90 px-3 py-2 text-sm dark:border-slate-500/60 dark:bg-slate-800/90"
                            id={`edit-test-duration-${log.id}`}
                            min="1"
                            onChange={(event) =>
                              setEditForm((previous) => ({ ...previous, durationMinutes: event.target.value }))
                            }
                            type="number"
                            value={editForm.durationMinutes}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          onClick={saveEdit}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="rounded-full bg-slate-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600"
                          onClick={() => setEditingId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                      {editError ? <p className="text-xs font-semibold text-rose-600">{editError}</p> : null}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {log.date} - {log.subject}: {log.marksScored}/{log.marksTotal} (
                        {percent(Number(log.marksScored), Number(log.marksTotal))}%) - {log.durationMinutes} min
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300"
                          onClick={() => beginEdit(log)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300"
                          onClick={() => onDeleteTestLog(log.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs muted">No test logs yet. Add your first test entry above.</p>
          )}
        </div>
      </div>
    </section>
  );
}

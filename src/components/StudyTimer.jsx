import { useEffect, useState } from "react";
import { formatDuration } from "../utils/time";
import { getSubjectsForMode } from "../utils/examModes";

function elapsedFromActiveTimer(activeTimer, nowMs = Date.now()) {
  if (!activeTimer) {
    return 0;
  }

  const accumulated = Number(activeTimer.accumulatedSeconds || 0);
  if (!activeTimer.isRunning || !activeTimer.startedAt) {
    return accumulated;
  }

  const startedMs = new Date(activeTimer.startedAt).getTime();
  if (Number.isNaN(startedMs)) {
    return accumulated;
  }

  return Math.max(0, accumulated + Math.floor((nowMs - startedMs) / 1000));
}

export default function StudyTimer({
  activeTimer,
  examMode,
  onDeleteSession,
  onSessionSave,
  onUpdateSession,
  sessionsToday,
  setActiveTimer,
}) {
  const subjects = getSubjectsForMode(examMode);
  const [subject, setSubject] = useState(subjects[0]);
  const [manualSubject, setManualSubject] = useState(subjects[0]);
  const [now, setNow] = useState(Date.now());
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualError, setManualError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingSubject, setEditingSubject] = useState(subjects[0]);
  const [editingMinutes, setEditingMinutes] = useState("");
  const [editingError, setEditingError] = useState("");

  useEffect(() => {
    if (!subjects.includes(subject)) {
      setSubject(subjects[0]);
    }
    if (!subjects.includes(manualSubject)) {
      setManualSubject(subjects[0]);
    }
    if (!subjects.includes(editingSubject)) {
      setEditingSubject(subjects[0]);
    }
    if (activeTimer?.subject && activeTimer.subject !== subject) {
      setSubject(activeTimer.subject);
    }
  }, [activeTimer, editingSubject, manualSubject, subject, subjects]);

  useEffect(() => {
    if (!activeTimer?.isRunning) {
      return undefined;
    }

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimer?.isRunning]);

  const elapsedSeconds = elapsedFromActiveTimer(activeTimer, now);
  const hasRunningProgress = elapsedSeconds > 0;
  const timerLocked = Boolean(activeTimer);

  const startSession = () => {
    if (activeTimer?.isRunning) {
      return;
    }

    if (activeTimer && !activeTimer.isRunning) {
      setActiveTimer((previous) => ({
        ...previous,
        isRunning: true,
        startedAt: new Date().toISOString(),
      }));
      return;
    }

    setActiveTimer({
      subject,
      isRunning: true,
      startedAt: new Date().toISOString(),
      accumulatedSeconds: 0,
    });
  };

  const pauseSession = () => {
    if (!activeTimer?.isRunning) {
      return;
    }

    const total = elapsedFromActiveTimer(activeTimer);
    setActiveTimer((previous) => ({
      ...previous,
      isRunning: false,
      startedAt: null,
      accumulatedSeconds: total,
    }));
  };

  const endSession = () => {
    if (hasRunningProgress) {
      onSessionSave({
        subject: activeTimer?.subject || subject,
        durationSeconds: elapsedSeconds,
        source: "timer",
      });
    }

    setActiveTimer(null);
    setNow(Date.now());
  };

  const addManualSession = () => {
    const minutes = Number(manualMinutes);
    if (Number.isNaN(minutes) || minutes <= 0) {
      setManualError("Enter valid minutes greater than 0.");
      return;
    }

    onSessionSave({
      subject: manualSubject,
      durationSeconds: Math.round(minutes * 60),
      source: "manual",
    });
    setManualMinutes("");
    setManualError("");
  };

  const sortedSessions = [...sessionsToday].sort((left, right) => {
    const leftTime = new Date(left.createdAt || "").getTime();
    const rightTime = new Date(right.createdAt || "").getTime();
    return rightTime - leftTime;
  });

  const beginEdit = (session) => {
    setEditingId(session.id);
    setEditingSubject(session.subject || subjects[0]);
    setEditingMinutes((session.durationSeconds / 60).toFixed(1).replace(/\.0$/, ""));
    setEditingError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingError("");
  };

  const saveEdit = () => {
    const minutes = Number(editingMinutes);
    if (Number.isNaN(minutes) || minutes <= 0) {
      setEditingError("Enter valid minutes greater than 0.");
      return;
    }

    onUpdateSession(editingId, {
      subject: editingSubject,
      durationSeconds: Math.round(minutes * 60),
    });
    setEditingId(null);
    setEditingError("");
  };

  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-xl font-semibold">Study Timer</h3>
      <p className="mt-1 text-sm muted">Start a timer or directly log subject-wise study minutes.</p>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold" htmlFor="subject">
          Subject
        </label>
        <select
          className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 dark:border-slate-500/60 dark:bg-slate-800/90"
          id="subject"
          disabled={timerLocked}
          onChange={(event) => setSubject(event.target.value)}
          value={subject}
        >
          {subjects.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-sky-100 to-pink-100 p-4 text-center dark:from-sky-900/40 dark:to-pink-900/30">
        <p className="font-display text-4xl font-bold tracking-wider">{formatDuration(elapsedSeconds)}</p>
      </div>
      {timerLocked ? (
        <p className="mt-2 text-xs muted">
          Timer is locked to <span className="font-semibold">{activeTimer?.subject}</span> until ended.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          onClick={startSession}
          type="button"
        >
          {activeTimer?.isRunning ? "Running" : activeTimer ? "Resume" : "Start Session"}
        </button>
        <button
          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          onClick={pauseSession}
          type="button"
        >
          Pause
        </button>
        <button
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasRunningProgress}
          onClick={endSession}
          type="button"
        >
          End Session
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-600/50 dark:bg-slate-900/30">
        <p className="text-sm font-semibold">Manual Subject Entry</p>
        <p className="mt-1 text-xs muted">Use this when you already studied and want to log subject + duration.</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 sm:min-w-[140px]" htmlFor="manualSubject">
            <span className="mb-1 block text-xs font-semibold">Subject</span>
            <select
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="manualSubject"
              onChange={(event) => {
                setManualSubject(event.target.value);
                setManualError("");
              }}
              value={manualSubject}
            >
              {subjects.map((item) => (
                <option key={`manual-${item}`} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 flex-1 sm:min-w-[140px]" htmlFor="manualMinutes">
            <span className="mb-1 block text-xs font-semibold">Duration (minutes)</span>
            <input
              className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 dark:border-slate-500/60 dark:bg-slate-800/90"
              id="manualMinutes"
              min="1"
              onChange={(event) => {
                setManualMinutes(event.target.value);
                setManualError("");
              }}
              placeholder="e.g. 90"
              type="number"
              value={manualMinutes}
            />
          </label>
          <button
            className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            onClick={addManualSession}
            type="button"
          >
            Add Manual Session
          </button>
        </div>
        {manualError ? <p className="mt-2 text-xs font-semibold text-rose-600">{manualError}</p> : null}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-600/50 dark:bg-slate-900/30">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Today's Subject Logs</p>
          <p className="text-xs muted">{sortedSessions.length} entries</p>
        </div>
        <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {sortedSessions.length ? (
            sortedSessions.map((session) => {
              const minutes = (session.durationSeconds / 60).toFixed(1).replace(/\.0$/, "");
              const isEditing = editingId === session.id;
              return (
                <div
                  className="rounded-xl border border-slate-200/70 bg-white/85 p-3 dark:border-slate-600/60 dark:bg-slate-800/70"
                  key={session.id}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="block" htmlFor={`edit-subject-${session.id}`}>
                          <span className="mb-1 block text-xs font-semibold">Subject</span>
                          <select
                            className="w-full rounded-lg border border-slate-300/70 bg-white/90 px-3 py-2 text-sm dark:border-slate-500/60 dark:bg-slate-800/90"
                            id={`edit-subject-${session.id}`}
                            onChange={(event) => setEditingSubject(event.target.value)}
                            value={editingSubject}
                          >
                            {subjects.map((item) => (
                              <option key={`edit-${item}`} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block" htmlFor={`edit-minutes-${session.id}`}>
                          <span className="mb-1 block text-xs font-semibold">Minutes</span>
                          <input
                            className="w-full rounded-lg border border-slate-300/70 bg-white/90 px-3 py-2 text-sm dark:border-slate-500/60 dark:bg-slate-800/90"
                            id={`edit-minutes-${session.id}`}
                            min="1"
                            onChange={(event) => setEditingMinutes(event.target.value)}
                            type="number"
                            value={editingMinutes}
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
                          onClick={cancelEdit}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                      {editingError ? <p className="text-xs font-semibold text-rose-600">{editingError}</p> : null}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {session.subject} - {minutes} min
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300"
                          onClick={() => beginEdit(session)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300"
                          onClick={() => onDeleteSession(session.id)}
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
            <p className="text-xs muted">
              No subject logs yet. Start timer or add a manual session to create entries.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

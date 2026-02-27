import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfettiBurst from "../components/ConfettiBurst";
import DailyLogForm from "../components/DailyLogForm";
import InsightsPanel from "../components/InsightsPanel";
import QuoteCard from "../components/QuoteCard";
import StatsCard from "../components/StatsCard";
import StudyTimer from "../components/StudyTimer";
import TestPerformance from "../components/TestPerformance";
import AiCoachPanel from "../components/AiCoachPanel";
import {
  productivityScore,
  streakCount,
  subjectTotals,
  summarizeTests,
  weeklySeries,
} from "../utils/analytics";
import { generateDashboardGreeting } from "../utils/aiCoach";
import {
  breakHoursFromLog,
  dateKey,
  longDate,
  sleepHoursFromLog,
  studyHoursFromLog,
  toHours,
} from "../utils/time";

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};

const subjectColors = [
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#a78bfa",
  "#fb7185",
  "#14b8a6",
  "#818cf8",
  "#f97316",
];

export default function DashboardPage({ data, onLogout, session, setData, setTheme, theme }) {
  const today = dateKey();
  const [showConfetti, setShowConfetti] = useState(false);
  const [headerGreeting, setHeaderGreeting] = useState("");
  const activeTimer = data.activeTimer || null;
  const testLogs = data.testLogs || [];

  const sessionsToday = useMemo(
    () => data.sessions.filter((session) => session.date === today),
    [data.sessions, today],
  );
  const testsToday = useMemo(
    () => testLogs.filter((log) => log.date === today),
    [testLogs, today],
  );
  const todayLog = data.dailyLogs[today] || {};
  const subjectSeries = useMemo(() => {
    const map = {};
    sessionsToday.forEach((session) => {
      const subject = session.subject || "General";
      map[subject] = (map[subject] || 0) + Number(session.durationSeconds || 0);
    });

    return Object.entries(map)
      .map(([subject, seconds]) => ({
        subject,
        hours: toHours(seconds),
      }))
      .filter((item) => item.hours > 0)
      .sort((left, right) => right.hours - left.hours);
  }, [sessionsToday]);

  const sessionStudyHours = toHours(
    sessionsToday.reduce((accumulator, session) => accumulator + Number(session.durationSeconds || 0), 0),
  );
  const loggedStudyHours = studyHoursFromLog(todayLog);
  const studyHours = sessionStudyHours > 0 ? sessionStudyHours : loggedStudyHours;
  const breakHours = breakHoursFromLog(todayLog);
  const sleepHours = sleepHoursFromLog(todayLog);

  const week = useMemo(() => weeklySeries(data.sessions, 7), [data.sessions]);
  const weekSubjects = useMemo(() => subjectTotals(data.sessions, week[0]?.date), [data.sessions, week]);
  const weekTestSummary = useMemo(() => summarizeTests(testLogs, week[0]?.date), [testLogs, week]);
  const activeSubjects = Object.values(weekSubjects).filter((value) => value > 0).length;
  const score = productivityScore({
    studyHours,
    sleepHours,
    breakHours,
    subjects: activeSubjects,
  });
  const streak = useMemo(() => streakCount(data.sessions), [data.sessions]);
  const testsTodayCount = testsToday.length;
  const testsTodayAverage = testsTodayCount
    ? Number(
        (
          testsToday.reduce(
            (sum, log) => sum + (Number(log.marksScored || 0) / Math.max(1, Number(log.marksTotal || 0))) * 100,
            0,
          ) / testsTodayCount
        ).toFixed(1),
      )
    : 0;

  useEffect(() => {
    const key = "asc-last-streak-celebrated";
    const seen = Number(localStorage.getItem(key) || 0);
    if (streak < 3 || streak <= seen) {
      return undefined;
    }

    setShowConfetti(true);
    localStorage.setItem(key, String(streak));
    const id = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(id);
  }, [streak]);

  const addSession = ({ subject, durationSeconds }) => {
    const now = new Date();
    const record = {
      id: globalThis.crypto?.randomUUID?.() || `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      date: dateKey(now),
      createdAt: now.toISOString(),
      subject,
      durationSeconds,
    };

    setData((previous) => ({
      ...previous,
      sessions: [...previous.sessions, record],
    }));
  };

  const setActiveTimer = (nextValue) => {
    setData((previous) => ({
      ...previous,
      activeTimer: typeof nextValue === "function" ? nextValue(previous.activeTimer || null) : nextValue,
    }));
  };

  const updateSession = (sessionId, updates) => {
    setData((previous) => ({
      ...previous,
      sessions: previous.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              ...updates,
            }
          : session,
      ),
    }));
  };

  const deleteSession = (sessionId) => {
    setData((previous) => ({
      ...previous,
      sessions: previous.sessions.filter((session) => session.id !== sessionId),
    }));
  };

  const saveLog = (log) => {
    setData((previous) => ({
      ...previous,
      dailyLogs: {
        ...previous.dailyLogs,
        [today]: log,
      },
    }));
  };

  const addTestLog = ({ date, durationMinutes, marksScored, marksTotal, subject }) => {
    const now = new Date();
    const record = {
      id: globalThis.crypto?.randomUUID?.() || `test-${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      date,
      createdAt: now.toISOString(),
      subject,
      marksScored,
      marksTotal,
      durationMinutes,
    };

    setData((previous) => ({
      ...previous,
      testLogs: [...(previous.testLogs || []), record],
    }));
  };

  const updateTestLog = (logId, updates) => {
    setData((previous) => ({
      ...previous,
      testLogs: (previous.testLogs || []).map((log) =>
        log.id === logId
          ? {
              ...log,
              ...updates,
            }
          : log,
      ),
    }));
  };

  const deleteTestLog = (logId) => {
    setData((previous) => ({
      ...previous,
      testLogs: (previous.testLogs || []).filter((log) => log.id !== logId),
    }));
  };

  const barData = {
    labels: subjectSeries.length ? subjectSeries.map((item) => item.subject) : ["No Subject Data"],
    datasets: [
      {
        data: subjectSeries.length ? subjectSeries.map((item) => item.hours) : [0],
        backgroundColor: subjectSeries.length
          ? subjectSeries.map((_, index) => subjectColors[index % subjectColors.length])
          : ["#94a3b8"],
        borderRadius: 12,
      },
    ],
  };

  const pomodoro =
    studyHours < 2
      ? "Use 25/5 Pomodoro blocks for your next two sessions."
      : breakHours > studyHours * 0.5
        ? "Try 45/10 blocks to keep breaks intentional."
        : "Your focus rhythm is strong. Keep using 50/10 cycles.";

  const cards = [
    { label: "Study Hours Today", value: `${studyHours}h`, icon: "📚", tone: "bg-sky-100" },
    { label: "Break Time", value: `${breakHours}h`, icon: "☕", tone: "bg-amber-100" },
    { label: "Sleep Hours", value: `${sleepHours}h`, icon: "😴", tone: "bg-indigo-100" },
    { label: "Productivity Score", value: `${score}/100`, icon: "⚡", tone: "bg-emerald-100" },
  ];

  useEffect(() => {
    const storageKey = "asc-last-header-greeting-index";
    const lastRaw = localStorage.getItem(storageKey);
    const lastIndex = lastRaw === null ? null : Number(lastRaw);
    const result = generateDashboardGreeting({
      examMode: data.examMode,
      streak,
      username: session?.username || "User",
      sessionToken: session?.loggedAt || new Date().toISOString(),
      lastIndex: Number.isFinite(lastIndex) ? lastIndex : null,
    });
    setHeaderGreeting(result.text);
    if (Number.isFinite(result.index)) {
      localStorage.setItem(storageKey, String(result.index));
    }
  }, [data.examMode, session?.loggedAt, session?.username, streak]);

  return (
    <AppLayout
      examMode={data.examMode}
      onLogout={onLogout}
      session={session}
      setTheme={setTheme}
      theme={theme}
    >
      <section className="glass-card relative mb-6 rounded-2xl p-5">
        <ConfettiBurst show={showConfetti} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold md:text-3xl">{headerGreeting}</h1>
            <p className="mt-1 muted">{longDate(new Date())}</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Streak: {streak} day{streak === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatsCard icon={card.icon} key={card.label} label={card.label} tone={card.tone} value={card.value} />
        ))}
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <StudyTimer
          activeTimer={activeTimer}
          examMode={data.examMode}
          onDeleteSession={deleteSession}
          onSessionSave={addSession}
          onUpdateSession={updateSession}
          sessionsToday={sessionsToday}
          setActiveTimer={setActiveTimer}
        />
        <DailyLogForm onSave={saveLog} value={todayLog} />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <h3 className="font-display text-xl font-semibold">Today's Graph</h3>
          <p className="mt-1 text-sm muted">Subject-wise study hours for today's sessions.</p>
          <div className="mt-4 h-64 sm:h-72">
            <Bar data={barData} options={barOptions} />
          </div>
          {!subjectSeries.length ? (
            <p className="mt-3 text-xs muted">
              No subject sessions yet. Use timer or manual subject entry to see this chart.
            </p>
          ) : null}
        </article>
        <InsightsPanel
          breakHours={breakHours}
          examMode={data.examMode}
          sleepHours={sleepHours}
          studyHours={studyHours}
          subjectTotals={weekSubjects}
        />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <TestPerformance
          examMode={data.examMode}
          onAddTestLog={addTestLog}
          onDeleteTestLog={deleteTestLog}
          onUpdateTestLog={updateTestLog}
          testLogs={testLogs}
        />
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <h3 className="font-display text-xl font-semibold">Today's Test Snapshot</h3>
          <p className="mt-1 text-sm muted">Quick performance summary from today’s tests.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-violet-100/80 p-3 dark:bg-violet-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                Tests Attended
              </p>
              <p className="mt-1 font-display text-3xl font-semibold">{testsTodayCount}</p>
            </div>
            <div className="rounded-xl bg-cyan-100/80 p-3 dark:bg-cyan-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                Avg Score Today
              </p>
              <p className="mt-1 font-display text-3xl font-semibold">{testsTodayAverage}%</p>
            </div>
          </div>
          <div className="mt-4 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {testsToday.length ? (
              testsToday.map((log) => (
                <p className="rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-slate-800/70" key={log.id}>
                  {log.subject}: {log.marksScored}/{log.marksTotal} ({log.durationMinutes} min)
                </p>
              ))
            ) : (
              <p className="text-sm muted">No tests logged today yet.</p>
            )}
          </div>
        </article>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <AiCoachPanel
          breakHours={breakHours}
          examMode={data.examMode}
          mood={todayLog.mood}
          session={session}
          sleepHours={sleepHours}
          streak={streak}
          studyHours={studyHours}
          subjectTotals={weekSubjects}
          testSummary={weekTestSummary}
        />
        <div className="grid gap-4">
          <QuoteCard examMode={data.examMode} session={session} streak={streak} />
          <article className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-xl font-semibold">Pomodoro Suggestion</h3>
            <p className="mt-3 font-semibold">{pomodoro}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
                to="/analytics"
              >
                Open Analytics
              </Link>
              <Link
                className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
                to="/notes"
              >
                Open Notes
              </Link>
            </div>
          </article>
        </div>
      </section>
    </AppLayout>
  );
}

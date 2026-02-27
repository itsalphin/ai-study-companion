import { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import AppLayout from "../components/AppLayout";
import {
  consistencySummary,
  focusWindowSummary,
  heatmapData,
  monthlySeries,
  mostProductive,
  sleepAlignmentSummary,
  streakCount,
  studyTrendDelta,
  subjectTotals,
  subjectBalanceSummary,
  summarizeTests,
  testEfficiencySummary,
  weeklySeries,
  weeklyTestSeries,
} from "../utils/analytics";
import { sleepHoursFromLog } from "../utils/time";

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const lineOptionsWithLegend = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

function boxColor(level) {
  if (level === 4) {
    return "bg-cyan-400 shadow-[0_0_0_1px_rgba(34,211,238,0.65)] dark:bg-cyan-400/75 dark:shadow-[0_0_0_1px_rgba(103,232,249,0.85)]";
  }
  if (level === 3) {
    return "bg-blue-700 shadow-[0_0_0_1px_rgba(29,78,216,0.65)] dark:bg-blue-500/75 dark:shadow-[0_0_0_1px_rgba(96,165,250,0.85)]";
  }
  if (level === 2) {
    return "bg-indigo-400 shadow-[0_0_0_1px_rgba(99,102,241,0.65)] dark:bg-indigo-400/75 dark:shadow-[0_0_0_1px_rgba(129,140,248,0.85)]";
  }
  if (level === 1) {
    return "bg-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.65)] dark:bg-sky-400/75 dark:shadow-[0_0_0_1px_rgba(125,211,252,0.85)]";
  }
  return "bg-slate-200/90 shadow-[0_0_0_1px_rgba(148,163,184,0.45)] dark:bg-slate-600/85 dark:shadow-[0_0_0_1px_rgba(148,163,184,0.65)]";
}

export default function AnalyticsPage({ data, onDownloadData, onLogout, session, setTheme, theme }) {
  const [studyRange, setStudyRange] = useState("weekly");
  const [testSubjectRange, setTestSubjectRange] = useState("weekly");
  const weekly = weeklySeries(data.sessions, 7);
  const startDate = weekly[0]?.date;
  const totals = subjectTotals(data.sessions, startDate);
  const streak = streakCount(data.sessions);
  const monthly = monthlySeries(data.sessions, 3);
  const currentMonth = monthly[monthly.length - 1] || {
    month: "",
    label: "Current",
    hours: 0,
    activeDays: 0,
    avgPerActiveDay: 0,
  };
  const previousMonth = monthly.length > 1 ? monthly[monthly.length - 2] : null;
  const monthStartDate = currentMonth.month ? `${currentMonth.month}-01` : null;
  const consistency = consistencySummary(data.sessions, 30, 2);
  const subjectBalance = subjectBalanceSummary(data.sessions, monthStartDate);
  const focusWindow = focusWindowSummary(data.sessions, monthStartDate);
  const testEfficiency = testEfficiencySummary(data.testLogs || [], monthStartDate);
  const trend = studyTrendDelta(data.sessions, 30);
  const sleepAlignment = sleepAlignmentSummary(data.sessions, data.dailyLogs || {}, 30);
  const heatmap = heatmapData(data.sessions, 35);
  const weeklyTests = weeklyTestSeries(data.testLogs || [], 7);
  const testSummary = summarizeTests(data.testLogs || [], startDate);
  const monthlyTestSummary = summarizeTests(data.testLogs || [], monthStartDate);
  const monthDeltaHours = previousMonth ? Number((currentMonth.hours - previousMonth.hours).toFixed(1)) : 0;
  const monthDeltaPct =
    previousMonth && previousMonth.hours > 0
      ? Number((((currentMonth.hours - previousMonth.hours) / previousMonth.hours) * 100).toFixed(1))
      : null;

  const totalStudy = weekly.reduce((sum, day) => sum + day.hours, 0);
  const sleepArray = weekly
    .map((day) => sleepHoursFromLog(data.dailyLogs[day.date] || {}))
    .filter((value) => value > 0);
  const averageSleep =
    sleepArray.length > 0
      ? Number((sleepArray.reduce((sum, value) => sum + value, 0) / sleepArray.length).toFixed(1))
      : 0;

  const lineData = {
    labels: weekly.map((day) => day.label),
    datasets: [
      {
        label: "Study Hours",
        data: weekly.map((day) => day.hours),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.25)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const monthlyStudyLineData = {
    labels: monthly.map((item) => item.label),
    datasets: [
      {
        label: "Study Hours",
        data: monthly.map((item) => item.hours),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Active Days",
        data: monthly.map((item) => item.activeDays),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        fill: false,
        tension: 0.35,
      },
    ],
  };

  const monthlyAvgBarData = {
    labels: monthly.map((item) => item.label),
    datasets: [
      {
        label: "Avg Hours / Active Day",
        data: monthly.map((item) => item.avgPerActiveDay),
        backgroundColor: "#a78bfa",
        borderRadius: 10,
      },
    ],
  };

  const subjectEntries = Object.entries(totals);
  const pieData = {
    labels: subjectEntries.length ? subjectEntries.map(([subject]) => subject) : ["No Subject Data"],
    datasets: [
      {
        data: subjectEntries.length ? subjectEntries.map(([, hours]) => hours) : [1],
        backgroundColor: subjectEntries.length
          ? ["#38bdf8", "#818cf8", "#fbbf24", "#fb7185", "#34d399", "#a78bfa"]
          : ["#cbd5e1"],
      },
    ],
  };
  const weeklyTestSubjectEntries = testSummary.subjectStats;
  const monthlyTestSubjectEntries = monthlyTestSummary.subjectStats;
  const activeTestSubjectEntries =
    testSubjectRange === "monthly" ? monthlyTestSubjectEntries : weeklyTestSubjectEntries;
  const testScoreData = {
    labels: activeTestSubjectEntries.length
      ? activeTestSubjectEntries.map((entry) => entry.subject)
      : ["No Test Data"],
    datasets: [
      {
        data: activeTestSubjectEntries.length ? activeTestSubjectEntries.map((entry) => entry.averageScore) : [0],
        backgroundColor: activeTestSubjectEntries.length
          ? ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#fb7185", "#3b82f6"]
          : ["#cbd5e1"],
        borderRadius: 10,
      },
    ],
  };

  const testTimeData = {
    labels: weeklyTestSubjectEntries.length ? weeklyTestSubjectEntries.map((entry) => entry.subject) : ["No Test Data"],
    datasets: [
      {
        data: weeklyTestSubjectEntries.length ? weeklyTestSubjectEntries.map((entry) => entry.hours) : [0],
        backgroundColor: weeklyTestSubjectEntries.length
          ? ["#06b6d4", "#22c55e", "#f59e0b", "#8b5cf6", "#fb7185", "#3b82f6"]
          : ["#cbd5e1"],
        borderRadius: 10,
      },
    ],
  };

  const weeklyTestLineData = {
    labels: weeklyTests.map((day) => day.label),
    datasets: [
      {
        label: "Average Test Score",
        data: weeklyTests.map((day) => day.averageScore),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const isStudyMonthly = studyRange === "monthly";
  const studyTrendData = isStudyMonthly ? monthlyStudyLineData : lineData;
  const studyTrendOptions = isStudyMonthly ? lineOptionsWithLegend : lineOptions;

  const bestTestSubject =
    weeklyTestSubjectEntries.length > 0
      ? [...weeklyTestSubjectEntries].sort((left, right) => right.averageScore - left.averageScore)[0]
      : null;

  const trendLine =
    trend.direction === "up"
      ? `Study momentum improved by ${trend.delta}h/day in the last 15 days.`
      : trend.direction === "down"
        ? `Study momentum dipped by ${Math.abs(trend.delta)}h/day. Schedule one extra focused block daily.`
        : "Study momentum stayed stable across the last 30 days.";
  const balanceLine =
    subjectBalance.subjectCount > 0
      ? `${subjectBalance.dominantSubject} leads with ${subjectBalance.dominantShare}% of month study time.`
      : "Start logging subject sessions to see subject-distribution analysis.";
  const sleepLine =
    sleepAlignment.trackedDays > 0
      ? `${sleepAlignment.alignmentPct}% of tracked days had healthy sleep + productive study alignment.`
      : "Add daily logs consistently to unlock sleep-alignment analysis.";
  const testEfficiencyLine =
    testEfficiency.totalTests > 0
      ? `Test efficiency this month: ${testEfficiency.scorePerHour} score-points per hour (avg ${testEfficiency.avgDurationMinutes} min/test).`
      : "No monthly tests logged yet. Add test entries for efficiency diagnostics.";

  return (
    <AppLayout
      examMode={data.examMode}
      onLogout={onLogout}
      session={session}
      setTheme={setTheme}
      theme={theme}
    >
      <section className="mb-6">
        <h1 className="section-title">Weekly Overview</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Total Study Hours</p>
            <p className="mt-1 font-display text-3xl font-semibold">{totalStudy.toFixed(1)}h</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Average Sleep</p>
            <p className="mt-1 font-display text-3xl font-semibold">{averageSleep}h</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Most Productive Day</p>
            <p className="mt-1 text-lg font-semibold">{mostProductive(weekly)}</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Study Streak</p>
            <p className="mt-1 font-display text-3xl font-semibold">{streak} days</p>
          </article>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Monthly Progress</h2>
        <p className="mt-1 text-sm muted">3-month performance snapshot with month-over-month signals.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">This Month Study</p>
            <p className="mt-1 font-display text-3xl font-semibold">{currentMonth.hours}h</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Active Study Days</p>
            <p className="mt-1 font-display text-3xl font-semibold">{currentMonth.activeDays}</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Avg / Active Day</p>
            <p className="mt-1 font-display text-3xl font-semibold">{currentMonth.avgPerActiveDay}h</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Month-over-Month</p>
            <p
              className={`mt-1 font-display text-3xl font-semibold ${
                monthDeltaHours > 0 ? "text-emerald-500" : monthDeltaHours < 0 ? "text-rose-500" : ""
              }`}
            >
              {monthDeltaHours > 0 ? "+" : ""}
              {monthDeltaHours}h
            </p>
            <p className="text-xs muted">
              {monthDeltaPct === null ? "Baseline month" : `${monthDeltaPct > 0 ? "+" : ""}${monthDeltaPct}%`}
            </p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Monthly Tests</p>
            <p className="mt-1 font-display text-3xl font-semibold">{monthlyTestSummary.totalTests}</p>
            <p className="text-xs muted">Avg score: {monthlyTestSummary.averageScore}%</p>
          </article>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Study Trend</h2>
            <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
              <button
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  studyRange === "weekly"
                    ? "bg-sky-500 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
                onClick={() => setStudyRange("weekly")}
                type="button"
              >
                Weekly
              </button>
              <button
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  studyRange === "monthly"
                    ? "bg-sky-500 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
                onClick={() => setStudyRange("monthly")}
                type="button"
              >
                Monthly
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm muted">
            {isStudyMonthly
              ? "Study hours and active study days across the last 3 months."
              : "Study hours trend for the last 7 days."}
          </p>
          <div className="mt-4 h-64 sm:h-72">
            <Line data={studyTrendData} options={studyTrendOptions} />
          </div>
        </article>
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Monthly Intensity</h2>
          <p className="mt-1 text-sm muted">Average hours per active study day.</p>
          <div className="mt-4 h-64 sm:h-72">
            <Bar data={monthlyAvgBarData} options={barOptions} />
          </div>
        </article>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Deep Analysis</h2>
        <p className="mt-1 text-sm muted">30-day behavior diagnostics for deeper performance tuning.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Consistency (2h+ days)</p>
            <p className="mt-1 font-display text-3xl font-semibold">{consistency.consistencyPct}%</p>
            <p className="text-xs muted">
              {consistency.consistentDays}/{consistency.days} days
            </p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Subject Balance Score</p>
            <p className="mt-1 font-display text-3xl font-semibold">{subjectBalance.score}/100</p>
            <p className="text-xs muted">{subjectBalance.subjectCount} active subjects</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Best Focus Window</p>
            <p className="mt-1 text-xl font-semibold">{focusWindow.bestWindow}</p>
            <p className="text-xs muted">{focusWindow.bestHours}h this month</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Sleep-Study Alignment</p>
            <p className="mt-1 font-display text-3xl font-semibold">{sleepAlignment.alignmentPct}%</p>
            <p className="text-xs muted">{sleepAlignment.riskDays} high-strain days</p>
          </article>
        </div>
        <article className="glass-card mt-4 rounded-2xl p-5">
          <h3 className="font-display text-lg font-semibold">Actionable Signals</h3>
          <div className="mt-3 max-h-[18rem] space-y-2 overflow-y-auto pr-1 text-sm">
            <p className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-800/70">{trendLine}</p>
            <p className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-800/70">{balanceLine}</p>
            <p className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-800/70">{sleepLine}</p>
            <p className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-800/70">{testEfficiencyLine}</p>
          </div>
        </article>
      </section>

      <section className="mb-6">
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Subject Pie Chart</h2>
          <p className="mt-1 text-sm muted">Time spent per subject this week.</p>
          <div className="mx-auto mt-4 h-72 w-full max-w-sm">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </article>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Test Analytics</h2>
        <p className="mt-1 text-sm muted">Track marks and test-time trends by subject.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Tests This Week</p>
            <p className="mt-1 font-display text-3xl font-semibold">{testSummary.totalTests}</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Avg Test Score</p>
            <p className="mt-1 font-display text-3xl font-semibold">{testSummary.averageScore}%</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Test Hours This Week</p>
            <p className="mt-1 font-display text-3xl font-semibold">{testSummary.totalHours}h</p>
          </article>
          <article className="glass-card rounded-2xl p-4">
            <p className="text-sm muted">Best Test Subject</p>
            <p className="mt-1 text-lg font-semibold">
              {bestTestSubject ? `${bestTestSubject.subject} (${bestTestSubject.averageScore}%)` : "No data"}
            </p>
          </article>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Weekly Test Score Trend</h2>
          <p className="mt-1 text-sm muted">Average test score percentage over the last 7 days.</p>
          <div className="mt-4 h-64 sm:h-72">
            <Line data={weeklyTestLineData} options={lineOptions} />
          </div>
        </article>
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Subject Score Averages</h2>
            <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
              <button
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  testSubjectRange === "weekly"
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
                onClick={() => setTestSubjectRange("weekly")}
                type="button"
              >
                Weekly
              </button>
              <button
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  testSubjectRange === "monthly"
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
                onClick={() => setTestSubjectRange("monthly")}
                type="button"
              >
                Monthly
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm muted">
            {testSubjectRange === "monthly"
              ? "Average marks percentage per subject this month."
              : "Average marks percentage per subject this week."}
          </p>
          <div className="mt-4 h-64 sm:h-72">
            <Bar data={testScoreData} options={barOptions} />
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Test Time by Subject</h2>
          <p className="mt-1 text-sm muted">Total test time (hours) spent per subject this week.</p>
          <div className="mt-4 h-64 sm:h-72">
            <Bar data={testTimeData} options={barOptions} />
          </div>
        </article>
        <article className="glass-card min-w-0 rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Subject Test Breakdown</h2>
          <p className="mt-1 text-sm muted">Recent subject-level test performance summary.</p>
          <div className="mt-4 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {weeklyTestSubjectEntries.length ? (
              weeklyTestSubjectEntries.map((entry) => (
                <p className="rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-slate-800/70" key={entry.subject}>
                  {entry.subject}: {entry.tests} tests • Avg {entry.averageScore}% • {entry.hours}h
                </p>
              ))
            ) : (
              <p className="text-sm muted">No test logs found. Add entries from Dashboard.</p>
            )}
          </div>
        </article>
      </section>

      <section className="mb-8 glass-card rounded-2xl p-5">
        <h2 className="font-display text-xl font-semibold">Heatmap Placeholder</h2>
        <p className="mt-1 text-sm muted">
          35-day activity intensity grid. Colors move from neutral to high-intensity focus.
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2">
          {heatmap.map((item) => (
            <div
              className={`aspect-square w-full rounded-md sm:rounded-lg ${boxColor(item.level)}`}
              key={item.date}
              title={`${item.date}: ${item.hours}h`}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span>Low</span>
          <span className={`h-3 w-3 rounded ${boxColor(0)}`} />
          <span className={`h-3 w-3 rounded ${boxColor(1)}`} />
          <span className={`h-3 w-3 rounded ${boxColor(2)}`} />
          <span className={`h-3 w-3 rounded ${boxColor(3)}`} />
          <span className={`h-3 w-3 rounded ${boxColor(4)}`} />
          <span>High</span>
        </div>
      </section>

      <section className="mb-4 flex justify-end">
        <button
          aria-label="Download data"
          className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
          onClick={onDownloadData}
          title="Download data"
          type="button"
        >
          <span aria-hidden>⬇</span>
          <span className="ml-1">Download Data</span>
        </button>
      </section>
    </AppLayout>
  );
}

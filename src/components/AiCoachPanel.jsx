import { useEffect, useMemo, useState } from "react";
import {
  generateAdaptiveCoachPlan,
  generateGreetingMessage,
  generateMotivationalLine,
} from "../utils/aiCoach";

export default function AiCoachPanel({
  breakHours,
  examMode,
  mood,
  session,
  sleepHours,
  streak,
  studyHours,
  subjectTotals,
  testSummary,
}) {
  const [status, setStatus] = useState("loading");
  const [plan, setPlan] = useState(null);
  const [motivation, setMotivation] = useState("");

  const context = useMemo(
    () => ({
      username: session?.username || "Aspirant",
      examMode,
      streak,
      studyHours,
      breakHours,
      sleepHours,
      mood,
      subjectTotals: subjectTotals || {},
      testCount: Number(testSummary?.totalTests || 0),
      testAverage: Number(testSummary?.averageScore || 0),
      testHours: Number(testSummary?.totalHours || 0),
    }),
    [breakHours, examMode, mood, session?.username, sleepHours, streak, studyHours, subjectTotals, testSummary],
  );
  const contextHash = useMemo(
    () =>
      JSON.stringify({
        username: context.username,
        examMode: context.examMode,
        streak: context.streak,
        studyHours: context.studyHours,
        breakHours: context.breakHours,
        sleepHours: context.sleepHours,
        mood: context.mood,
        subjectTotals: context.subjectTotals,
        testCount: context.testCount,
        testAverage: context.testAverage,
        testHours: context.testHours,
      }),
    [context],
  );

  const greeting = useMemo(() => generateGreetingMessage(context), [context]);

  useEffect(() => {
    const key = "asc-last-motivation-index";
    const lastRaw = localStorage.getItem(key);
    const lastIndex = lastRaw === null ? null : Number(lastRaw);
    const result = generateMotivationalLine({
      examMode,
      username: session?.username || "Aspirant",
      streak,
      sessionToken: session?.loggedAt || new Date().toISOString(),
      lastIndex: Number.isFinite(lastIndex) ? lastIndex : null,
    });
    setMotivation(result.text);
    if (Number.isFinite(result.index)) {
      localStorage.setItem(key, String(result.index));
    }
  }, [examMode, session?.loggedAt, session?.username, streak]);

  const generatePlan = async (silent = false) => {
    if (!silent) {
      setStatus("loading");
    }

    const response = await generateAdaptiveCoachPlan({
      context,
      model: "llama3.2:3b",
      useOllama: true,
      userInput: "",
    });

    setPlan(response.plan);
    setStatus("done");
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus("loading");
      const response = await generateAdaptiveCoachPlan({
        context,
        model: "llama3.2:3b",
        useOllama: true,
        userInput: "",
      });

      if (cancelled) {
        return;
      }

      setPlan(response.plan);
      setStatus("done");
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [contextHash]);

  const refresh = async () => {
    setStatus("loading");
    await generatePlan(true);
  };

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-semibold">Daily Smart Coach</h3>
        <button
          className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
          onClick={refresh}
          type="button"
        >
          {status === "loading" ? "Refreshing..." : "Refresh Plan"}
        </button>
      </div>

      <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold dark:bg-slate-800/70">
        {greeting}
      </p>
      <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold dark:bg-slate-800/70">
        {motivation}
      </p>

      {plan ? (
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-600/50 dark:bg-slate-900/30">
          <p className="font-semibold">{plan.plan_title}</p>
          <p className="text-sm muted">{plan.summary}</p>

          <div className="mt-3 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {plan.blocks.map((block, index) => (
              <div
                className="rounded-xl border border-slate-200/80 bg-white/80 p-3 text-sm dark:border-slate-600/60 dark:bg-slate-800/70"
                key={`${block.start}-${index}`}
              >
                <p className="font-semibold">
                  {block.start} • {block.duration_min} min
                </p>
                <p className="mt-1">{block.task}</p>
                <p className="mt-1 text-xs muted">{block.reason}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-sm font-semibold">{plan.motivation}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {plan.micro_goals.map((goal, index) => (
              <li className="rounded-lg bg-white/75 px-3 py-1.5 dark:bg-slate-800/75" key={`${goal}-${index}`}>
                {goal}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs muted">{plan.caution}</p>
          <p className="mt-1 text-xs muted">Updated from your current study and test records.</p>
        </div>
      ) : (
        <p className="mt-3 text-sm muted">Building today’s adaptive schedule...</p>
      )}
    </section>
  );
}

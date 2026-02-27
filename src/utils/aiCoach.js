import { getSubjectsForMode } from "./examModes";

function hashSeed(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick(items, seed) {
  return items[seed % items.length];
}

function toKeyDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function dayPeriod(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  return "evening";
}

const headerGreetingTemplates = {
  morning: [
    "Good morning, {name} {emoji}",
    "Rise and revise, {name} {emoji}",
    "Morning momentum, {name} {emoji}",
    "Fresh focus, {name} {emoji}",
    "Sunrise strategy, {name} {emoji}",
    "Bright start, {name} {emoji}",
    "Sharp morning, {name} {emoji}",
    "Calm morning grind, {name} {emoji}",
    "Morning game plan, {name} {emoji}",
    "Early excellence, {name} {emoji}",
    "Good to see you, {name} {emoji}",
    "Your morning edge is live, {name} {emoji}",
  ],
  afternoon: [
    "Good afternoon, {name} {emoji}",
    "Afternoon execution, {name} {emoji}",
    "Midday focus unlocked, {name} {emoji}",
    "Steady afternoon push, {name} {emoji}",
    "Keep the pace, {name} {emoji}",
    "Second-half surge, {name} {emoji}",
    "Strong noon rhythm, {name} {emoji}",
    "Afternoon precision, {name} {emoji}",
    "Momentum check-in, {name} {emoji}",
    "Let this block count, {name} {emoji}",
    "Sharp afternoon flow, {name} {emoji}",
    "Progress hour, {name} {emoji}",
  ],
  evening: [
    "Good evening, {name} {emoji}",
    "Evening consistency, {name} {emoji}",
    "Night revision mode, {name} {emoji}",
    "Calm evening focus, {name} {emoji}",
    "Strong finish, {name} {emoji}",
    "Evening recap energy, {name} {emoji}",
    "Night sprint starts now, {name} {emoji}",
    "Lock in this evening, {name} {emoji}",
    "Last stretch, {name} {emoji}",
    "Steady evening progress, {name} {emoji}",
    "Final push window, {name} {emoji}",
    "Quiet confidence tonight, {name} {emoji}",
  ],
};

const headerGreetingPrefixes = [
  "deep-focus",
  "rank-ready",
  "calm-execution",
  "precision-first",
  "steady-gain",
  "confidence-build",
  "revision-rich",
  "mistake-crushing",
  "concept-locking",
  "test-smart",
  "system-driven",
  "zero-noise",
  "high-clarity",
  "momentum-led",
  "result-oriented",
  "discipline-powered",
  "consistency-strong",
  "accuracy-focused",
  "exam-temperament",
  "tactical-prep",
];

const headerGreetingNouns = [
  "session",
  "sprint",
  "run",
  "window",
  "push",
  "flow",
  "cycle",
  "phase",
  "routine",
  "block",
  "cadence",
  "drive",
  "framework",
  "engine",
  "streak",
  "pulse",
  "wave",
  "rhythm",
  "charge",
  "checkpoint",
  "sequence",
  "track",
  "route",
  "climb",
  "mission",
];

const headerGreetingClosers = [
  "for strong retention",
  "for cleaner accuracy",
  "for sharper memory",
  "for better test calm",
  "for faster recall",
  "for confident revision",
  "for measurable progress",
  "for focused execution",
  "for stable consistency",
  "for exam-day confidence",
];

const headerGreetingEmoji = ["🌸", "✨", "🌿", "🌼", "🌅", "📘", "🔥", "💫", "🎯", "🌟", "🧠", "🚀"];

const DASHBOARD_GREETING_MAX = 500;

function buildDashboardGreetingPool() {
  const pool = [];
  for (let p = 0; p < headerGreetingPrefixes.length; p += 1) {
    for (let n = 0; n < headerGreetingNouns.length; n += 1) {
      for (let c = 0; c < headerGreetingClosers.length; c += 1) {
        pool.push(`${headerGreetingPrefixes[p]} ${headerGreetingNouns[n]} ${headerGreetingClosers[c]}`);
      }
    }
  }
  return pool.slice(0, DASHBOARD_GREETING_MAX);
}

const dashboardGreetingPool = buildDashboardGreetingPool();

const greetingOpeners = [
  "Calm start",
  "Strong start",
  "Focused start",
  "Fresh momentum",
  "Steady progress",
  "Confident rhythm",
  "Exam-mode activated",
  "Mindset locked",
  "Consistency unlocked",
  "Sharp energy",
  "Execution mode",
  "High intent",
  "Discipline on",
  "Quiet confidence",
  "Result-focused day",
  "Clarity first",
  "Small wins first",
  "One step at a time",
  "System over stress",
  "Deep focus window",
  "Progress in motion",
  "Strategy in place",
  "You are on track",
  "Routine in control",
];

const greetingMiddle = [
  "you are building rank through consistency",
  "today rewards precision over pressure",
  "your steady sessions are compounding",
  "this is a high-quality study day",
  "one disciplined block will change the day",
  "your process is stronger than panic",
  "your routine is creating confidence",
  "each focused hour is a competitive edge",
  "calm execution beats last-minute rush",
  "progress today protects tomorrow",
  "you are close, keep the cadence",
  "clarity and repetition will win",
  "your prep is becoming exam-ready",
  "you are training for performance",
  "keep your standards high and simple",
  "your future self will thank this session",
  "you are one clean revision away from confidence",
  "focus now, celebrate later",
  "consistency is your unfair advantage",
  "this effort is visible in scores",
];

const greetingClosers = [
  "start with one high-value block.",
  "protect your first 90 minutes.",
  "prioritize weak topics first.",
  "finish today with a quick recap.",
  "keep distractions outside this window.",
  "maintain pace, not panic.",
  "choose quality over quantity.",
  "test yourself before ending the day.",
  "revise what you got wrong yesterday.",
  "end the day with confidence notes.",
];

const motivationalOpeners = {
  morning: [
    "Morning reminder:",
    "Today starts here:",
    "Your first edge:",
    "Set the tone now:",
    "Early focus wins:",
    "Quiet confidence check:",
    "Before noon target:",
    "Morning mindset:",
    "Sharp start note:",
    "Calm prep cue:",
    "Fresh-day push:",
    "Sunrise strategy:",
  ],
  afternoon: [
    "Afternoon reset:",
    "Midday reminder:",
    "Second-half focus:",
    "Keep the rhythm:",
    "Sustain your edge:",
    "Execution check:",
    "Noon-to-evening plan:",
    "Momentum cue:",
    "Pressure-to-precision:",
    "Steady drive note:",
    "Progress checkpoint:",
    "Afternoon strategy:",
  ],
  evening: [
    "Evening note:",
    "Finish strong:",
    "Night revision cue:",
    "Last stretch reminder:",
    "Calm close strategy:",
    "Late-day focus:",
    "Consistency check:",
    "Final block mindset:",
    "Wrap-up with purpose:",
    "Confidence before sleep:",
    "Evening precision:",
    "End-day execution:",
  ],
};

const motivationalIntent = [
  "Protect attention",
  "Train exam temperament",
  "Build accurate recall",
  "Reduce silly mistakes",
  "Increase retention",
  "Strengthen consistency",
  "Sharpen weak topics",
  "Convert pressure to clarity",
  "Raise test confidence",
  "Stabilize revision quality",
  "Improve answer speed",
  "Improve conceptual depth",
  "Lock in fundamentals",
  "Stay process-first",
  "Keep routine reliable",
  "Push disciplined effort",
  "Minimize distraction spillover",
  "Turn mistakes into marks",
  "Elevate daily standards",
  "Stay calm under time limits",
  "Track measurable progress",
  "Own the next study block",
  "Finish what you start",
  "Respect the plan",
  "Prepare like exam day",
];

const motivationalAction = [
  "with one strict deep-work block",
  "with two no-phone sessions",
  "with a timed practice sprint",
  "with focused active recall",
  "with one mistake-book review",
  "with deliberate question analysis",
  "with spaced repetition",
  "with a clean revision loop",
  "with one high-value chapter closure",
  "with 40 quality MCQs",
  "with one PYQ-driven session",
  "with tighter break discipline",
  "with clear task boundaries",
  "with timer-based execution",
  "with a start-now mindset",
  "with controlled test simulation",
  "with one concept-first pass",
  "with one formula recap cycle",
  "with short but intense intervals",
  "with a correction-first approach",
  "with deliberate speed drills",
  "with one accuracy-focused round",
  "with a distraction-free environment",
  "with an honest self-review",
  "with one complete follow-through",
];

const motivationalBenefit = [
  "to make today count.",
  "to raise score stability.",
  "to protect confidence.",
  "to build long-term rank gains.",
  "to reduce stress through structure.",
  "to improve exam control.",
  "to keep your momentum alive.",
  "to make revision stick.",
  "to increase quality over quantity.",
  "to turn effort into results.",
];

const MOTIVATION_MAX = 500;

function buildMotivationPool() {
  const pool = [];
  for (let i = 0; i < motivationalIntent.length; i += 1) {
    for (let j = 0; j < motivationalAction.length; j += 1) {
      for (let k = 0; k < motivationalBenefit.length; k += 1) {
        pool.push(`${motivationalIntent[i]} ${motivationalAction[j]} ${motivationalBenefit[k]}`);
      }
    }
  }
  return pool.slice(0, MOTIVATION_MAX);
}

const motivationPool = buildMotivationPool();

function topWeakSubjects(subjectTotals = {}, fallback = []) {
  const items = Object.entries(subjectTotals || {}).map(([subject, hours]) => ({
    subject,
    hours: Number(hours || 0),
  }));

  const weak = items.filter((item) => item.hours <= 1.2).sort((a, b) => a.hours - b.hours);
  if (weak.length) {
    return weak.map((item) => item.subject);
  }

  return fallback;
}

function nextClock(start, minutes) {
  const [hRaw, mRaw] = start.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  const startMinutes = h * 60 + m;
  const total = (startMinutes + minutes) % (24 * 60);
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function localAdaptivePlan(context, userInput = "") {
  const subjects = getSubjectsForMode(context.examMode);
  const weakSubjects = topWeakSubjects(context.subjectTotals, subjects.slice(0, 2));
  const primary = weakSubjects[0] || subjects[0];
  const secondary = weakSubjects[1] || subjects[1] || subjects[0];

  const blocks = [];
  let currentStart = "06:30";
  const scoreLow = context.testAverage > 0 && context.testAverage < 65;
  const lowSleep = context.sleepHours > 0 && context.sleepHours < 6;
  const heavyBreaks = context.studyHours > 0 && context.breakHours > context.studyHours * 0.6;

  const addBlock = (duration, task, reason) => {
    blocks.push({
      start: currentStart,
      duration_min: duration,
      task,
      reason,
    });
    currentStart = nextClock(currentStart, duration + 15);
  };

  addBlock(90, `${primary}: concept revision + 25 MCQs`, "Start with weakest subject while energy is high.");
  addBlock(75, `${secondary}: active recall + PYQs`, "Second weak area before fatigue starts.");
  addBlock(45, "Error notebook review", "Convert mistakes into direct score gains.");

  if (scoreLow) {
    addBlock(60, `${primary}: one timed mini test`, "Low score trend needs timed correction today.");
  } else {
    addBlock(60, "Mixed subject timed test", "Maintain exam temperament with controlled pressure.");
  }

  if (lowSleep) {
    addBlock(25, "Recovery walk + hydration + power nap", "Low sleep detected. Reset attention quality.");
  } else if (heavyBreaks) {
    addBlock(30, "Strict Pomodoro drill (25/5 x 2)", "Break discipline needs tighter structure.");
  } else {
    addBlock(30, "Flashcards + formula recap", "Lock retention before end of day.");
  }

  addBlock(40, `${subjects[0]} quick recap + next-day planning`, "Close the day with clarity and lower stress.");

  const caution = lowSleep
    ? "Sleep debt is likely reducing retention. Protect tonight's sleep window."
    : heavyBreaks
      ? "Break ratio is high. Use intentional break timers."
      : "Routine is stable. Keep execution quality high.";

  return {
    plan_title: `${context.examMode} adaptive plan for today`,
    summary: `Prioritize ${primary} and ${secondary} with a test-feedback loop and strong closing recap.`,
    blocks: blocks.slice(0, 6),
    motivation: `Stay calm, execute block by block, and track only what moves your score.`,
    micro_goals: [
      `Finish 1 timed test and review every wrong answer.`,
      `Complete at least 2 deep-focus blocks with zero phone use.`,
      `Write 3 mistake patterns to avoid tomorrow.`,
      `Log final day reflection in notes.`,
    ],
    caution,
    user_context_applied: userInput ? `Plan adapted to your note: "${userInput}"` : "Plan adapted from your tracker data.",
  };
}

function sanitizePlan(rawPlan, fallbackPlan) {
  if (!rawPlan || typeof rawPlan !== "object") {
    return fallbackPlan;
  }

  const blocks = Array.isArray(rawPlan.blocks)
    ? rawPlan.blocks
        .map((block) => ({
          start: String(block.start || ""),
          duration_min: Number(block.duration_min || 0),
          task: String(block.task || "").trim(),
          reason: String(block.reason || "").trim(),
        }))
        .filter((block) => block.start && block.duration_min > 0 && block.task)
        .slice(0, 6)
    : fallbackPlan.blocks;

  return {
    plan_title: String(rawPlan.plan_title || fallbackPlan.plan_title),
    summary: String(rawPlan.summary || fallbackPlan.summary),
    blocks: blocks.length ? blocks : fallbackPlan.blocks,
    motivation: String(rawPlan.motivation || fallbackPlan.motivation),
    micro_goals: Array.isArray(rawPlan.micro_goals)
      ? rawPlan.micro_goals.map((item) => String(item)).filter(Boolean).slice(0, 6)
      : fallbackPlan.micro_goals,
    caution: String(rawPlan.caution || fallbackPlan.caution),
    user_context_applied: String(rawPlan.user_context_applied || fallbackPlan.user_context_applied),
  };
}

async function requestOllamaPlan({ context, model, userInput, timeoutMs = 22000 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const prompt = [
    "You are a calm, practical competitive-exam study coach.",
    "Create an adaptive one-day plan from tracker data.",
    "Return STRICT JSON only with keys:",
    "plan_title, summary, blocks, motivation, micro_goals, caution, user_context_applied",
    "Where blocks is an array of up to 6 objects with:",
    "start (HH:MM), duration_min (number), task, reason.",
    "",
    `Exam mode: ${context.examMode}`,
    `User: ${context.username}`,
    `Streak days: ${context.streak}`,
    `Study hours today: ${context.studyHours}`,
    `Break hours today: ${context.breakHours}`,
    `Sleep hours: ${context.sleepHours}`,
    `Mood: ${context.mood || "N/A"}`,
    `Subject totals this week: ${JSON.stringify(context.subjectTotals || {})}`,
    `Tests this week: ${context.testCount}`,
    `Average test score: ${context.testAverage}`,
    `Test hours this week: ${context.testHours}`,
    `User note/request: ${userInput || "No extra request"}`,
    "Tone: concise, encouraging, non-generic, actionable.",
  ].join("\n");

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.5,
          num_predict: 750,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const text = String(payload.response || "").trim();
    const parsed = JSON.parse(text);
    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

export function generateGreetingMessage({ examMode, streak, username }) {
  const period = dayPeriod();
  const seed = hashSeed(`${username}-${examMode}-${toKeyDate()}-${period}-${streak}`);
  return `${pick(greetingOpeners, seed)} ${username}, ${pick(greetingMiddle, seed + 7)} - ${pick(
    greetingClosers,
    seed + 13,
  )}`;
}

export function generateDashboardGreeting({ examMode, streak, username, sessionToken, lastIndex = null }) {
  const period = dayPeriod();
  const seed = hashSeed(`${username}-${examMode}-${sessionToken || toKeyDate()}-${period}-${streak}-header`);
  const template = pick(headerGreetingTemplates[period], seed);
  let poolIndex = seed % dashboardGreetingPool.length;
  if (typeof lastIndex === "number" && poolIndex === lastIndex) {
    poolIndex = (poolIndex + 37) % dashboardGreetingPool.length;
  }
  const suffix = dashboardGreetingPool[poolIndex];
  const emoji = pick(headerGreetingEmoji, seed + 17);

  return {
    text: `${template.replace("{name}", username).replace("{emoji}", emoji)} - ${suffix}`,
    index: poolIndex,
  };
}

export function generateMotivationalLine({
  examMode,
  username,
  streak = 0,
  sessionToken = "",
  lastIndex = null,
}) {
  const period = dayPeriod();
  const seed = hashSeed(`${username}-${examMode}-${sessionToken || toKeyDate()}-${period}-${streak}-motivation`);
  const opener = pick(motivationalOpeners[period], seed + 5);
  let poolIndex = seed % motivationPool.length;
  if (typeof lastIndex === "number" && poolIndex === lastIndex) {
    poolIndex = (poolIndex + 53) % motivationPool.length;
  }

  return {
    text: `${opener} ${motivationPool[poolIndex]}`,
    index: poolIndex,
  };
}

export async function generateAdaptiveCoachPlan({
  context,
  model = "llama3.2:3b",
  useOllama = false,
  userInput = "",
}) {
  const fallback = localAdaptivePlan(context, userInput);

  if (!useOllama) {
    return {
      source: "local-free-planner",
      plan: fallback,
      warning: "",
    };
  }

  try {
    const raw = await requestOllamaPlan({
      context,
      model,
      userInput,
    });

    return {
      source: `ollama:${model}`,
      plan: sanitizePlan(raw, fallback),
      warning: "",
    };
  } catch (error) {
    return {
      source: "local-free-planner",
      plan: fallback,
      warning:
        "Ollama was unavailable. Using offline planner. Start Ollama (`ollama serve`) and pull a model (e.g. `ollama pull llama3.2:3b`).",
    };
  }
}

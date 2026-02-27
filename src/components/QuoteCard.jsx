import { useEffect, useState } from "react";

const QUOTE_VARIANT_MAX = 500;
const QUOTE_STORAGE_KEY = "asc-last-quote-index";

const quoteStarters = [
  "Consistency",
  "Discipline",
  "Revision",
  "Accuracy",
  "Calm focus",
  "Daily effort",
  "Focused repetition",
  "Error analysis",
  "Structured practice",
  "Intentional study",
  "Quality sessions",
  "Steady momentum",
  "Exam composure",
  "Concept clarity",
  "Active recall",
  "Timed practice",
  "Purposeful breaks",
  "Systematic prep",
  "Patient progress",
  "Strong routines",
];

const quoteMiddles = [
  "turns pressure into progress",
  "builds rank quietly",
  "outperforms panic every time",
  "creates confidence before exams",
  "wins when motivation dips",
  "makes difficult chapters manageable",
  "compounds into visible score gains",
  "trains your brain for test pressure",
  "keeps your preparation measurable",
  "improves memory retention",
  "reduces silly mistakes",
  "sharpens decision-making in tests",
  "transforms weak areas into strengths",
  "builds exam stamina gradually",
  "keeps preparation realistic and strong",
  "strengthens execution over emotions",
  "protects progress from distractions",
  "improves confidence block by block",
  "keeps your strategy reliable",
  "makes every hour count",
  "turns doubts into data",
  "aligns effort with outcomes",
  "helps you recover from low days",
  "creates a stable study rhythm",
  "prepares you for consistency at scale",
];

const quoteEndings = [
  "when you keep showing up.",
  "when you respect your system.",
  "when you finish what you start.",
  "when you review mistakes honestly.",
  "when you protect deep work hours.",
  "when you stay calm under pressure.",
  "when you act before overthinking.",
  "when you prioritize high-value tasks.",
  "when you practice with intention.",
  "when you stay consistent, not perfect.",
];

function hashSeed(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildQuotePool() {
  const pool = [];
  for (let i = 0; i < quoteStarters.length; i += 1) {
    for (let j = 0; j < quoteMiddles.length; j += 1) {
      for (let k = 0; k < quoteEndings.length; k += 1) {
        pool.push(`${quoteStarters[i]} ${quoteMiddles[j]} ${quoteEndings[k]}`);
      }
    }
  }

  return pool.slice(0, QUOTE_VARIANT_MAX);
}

const quotePool = buildQuotePool();

export default function QuoteCard({ examMode, session, streak = 0 }) {
  const [quote, setQuote] = useState(quotePool[0]);

  useEffect(() => {
    const sessionToken = session?.quoteNonce || session?.loggedAt || new Date().toISOString();
    const username = session?.username || "Aspirant";
    const seed = hashSeed(`${username}-${examMode}-${sessionToken}-${streak}-quote`);

    const lastRaw = localStorage.getItem(QUOTE_STORAGE_KEY);
    const lastIndex = lastRaw === null ? null : Number(lastRaw);
    let index = seed % quotePool.length;
    if (Number.isFinite(lastIndex) && index === lastIndex) {
      index = (index + 29) % quotePool.length;
    }

    localStorage.setItem(QUOTE_STORAGE_KEY, String(index));
    setQuote(quotePool[index]);
  }, [examMode, session?.loggedAt, session?.quoteNonce, session?.username, streak]);

  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-xl font-semibold">Motivational Quote</h3>
      <p className="mt-3 text-base font-semibold leading-relaxed text-slate-700 dark:text-slate-100">
        "{quote}"
      </p>
    </section>
  );
}

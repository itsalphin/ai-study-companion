import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedHero from "../components/AnimatedHero";
import ThemeToggle from "../components/ThemeToggle";
import { smoothScrollTo } from "../script";
import { EXAM_MODES } from "../utils/examModes";

const headlineVariants = [
  "Study Smarter. Not Harder.",
  "Turn Your Study Hours into Results.",
  "Consistency Builds Rank.",
];

const features = [
  {
    title: "Smart Daily Tracking",
    text: "Log study, breaks, and sleep in seconds and stay in control.",
  },
  {
    title: "Calm Analytics",
    text: "Get charts and insights that guide action without overload.",
  },
  {
    title: "Motivating Routine",
    text: "Use streaks, notes, and gentle prompts to stay consistent.",
  },
];

export default function LandingPage({ onSelectMode, session, setTheme, theme }) {
  const navigate = useNavigate();
  const [headline, setHeadline] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHeadline((prev) => (prev + 1) % headlineVariants.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const goLogin = () => navigate("/login");

  const pickMode = (mode) => {
    onSelectMode(mode);
    navigate("/login");
  };

  return (
    <div className="px-4 pb-16 pt-5 md:px-8">
      <header className="glass-card mx-auto mb-7 flex w-full max-w-6xl flex-col items-stretch gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
        <button
          className="font-display text-left text-xl font-semibold"
          onClick={() => smoothScrollTo("hero")}
          type="button"
        >
          AI Study Companion
        </button>
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
          <nav className="flex w-full flex-wrap gap-2 text-sm font-semibold md:w-auto">
            {[
              { id: "features", label: "Features" },
              { id: "how", label: "How It Works" },
              { id: "modes", label: "Exam Modes" },
              { id: "testimonials", label: "Testimonials" },
            ].map((item) => (
              <button
                className="rounded-full bg-white/80 px-3 py-2 transition hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700"
                key={item.id}
                onClick={() => smoothScrollTo(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <ThemeToggle
            onToggle={() => setTheme((previous) => (previous === "light" ? "dark" : "light"))}
            theme={theme}
          />
          <button
            className="rounded-full bg-sky-500 px-4 py-2 text-white transition hover:bg-sky-600"
            onClick={session ? () => navigate("/dashboard") : goLogin}
            type="button"
          >
            {session ? "Open Dashboard" : "Login"}
          </button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-2" id="hero">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
            Portfolio Ready
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            Your AI Study Companion for Competitive Exams
          </h1>
          <p className="mt-4 max-w-lg text-base muted md:text-lg">
            Track, analyze, and improve your study habits with smart insights.
          </p>
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            className="gradient-text mt-3 font-display text-lg font-semibold md:text-xl"
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            {headlineVariants[headline]}
          </motion.p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              onClick={goLogin}
              type="button"
            >
              Get Started
            </button>
            <button
              className="rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={goLogin}
              type="button"
            >
              View Demo
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold dark:bg-slate-800/70">
              Start Your Study Journey
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold dark:bg-slate-800/70">
              Boost Your Productivity
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold dark:bg-slate-800/70">
              Build Your Success Routine
            </span>
          </div>
        </div>
        <AnimatedHero />
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl" id="features">
        <h2 className="section-title">Features</h2>
        <p className="mt-2 muted">A calm and clean workflow designed for daily consistency.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article className="glass-card rounded-2xl p-5" key={feature.title}>
              <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl" id="how">
        <h2 className="section-title">How It Works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Choose an exam mode and log in to your workspace.",
            "Track sessions, routine logs, and notes every day.",
            "Review analytics and follow AI insights weekly.",
          ].map((step, index) => (
            <article className="glass-card rounded-2xl p-5" key={step}>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Step {index + 1}</p>
              <p className="mt-2 font-semibold">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl" id="modes">
        <h2 className="section-title">Exam Modes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {EXAM_MODES.map((mode) => (
            <article className="glass-card rounded-2xl p-5" key={mode.value}>
              <div className={`mb-3 h-3 rounded-full bg-gradient-to-r ${mode.accent}`} />
              <h3 className="font-display text-xl font-semibold">{mode.title}</h3>
              <p className="mt-2 text-sm muted">{mode.description}</p>
              <button
                className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                onClick={() => pickMode(mode.value)}
                type="button"
              >
                Select {mode.value}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl" id="testimonials">
        <h2 className="section-title">Testimonials</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Aspirant A", "Aspirant B", "Aspirant C"].map((name) => (
            <article className="glass-card rounded-2xl p-5" key={name}>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                Placeholder: {name} improved routine consistency with this tracker.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl" id="cta">
        <div className="glass-card rounded-3xl bg-gradient-to-r from-sky-100/80 to-rose-100/80 p-7 text-center dark:from-sky-900/30 dark:to-rose-900/30">
          <h2 className="font-display text-3xl font-semibold">Build Your Success Routine</h2>
          <p className="mx-auto mt-2 max-w-2xl muted">
            Stay calm, stay focused, and turn daily effort into measurable progress.
          </p>
          <button
            className="mt-6 rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
            onClick={goLogin}
            type="button"
          >
            Start Your Study Journey
          </button>
        </div>
      </section>

      <footer className="mx-auto mt-14 w-full max-w-6xl border-t border-slate-200/80 pt-6 text-center text-sm muted dark:border-slate-700/70">
        AI Study Companion • JEE • NEET • UPSC • CA
      </footer>
    </div>
  );
}

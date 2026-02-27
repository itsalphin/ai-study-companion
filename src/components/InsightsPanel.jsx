import { getFocusSubject, getSubjectsForMode } from "../utils/examModes";

export default function InsightsPanel({ breakHours, examMode, sleepHours, studyHours, subjectTotals }) {
  const modeSubjects = getSubjectsForMode(examMode);
  const focusSubject = getFocusSubject(examMode);
  const insights = [];

  if (sleepHours > 0 && sleepHours < 6) {
    insights.push("You may need more sleep to stay productive.");
  }

  if (studyHours > 0 && breakHours > studyHours) {
    insights.push("Try reducing break duration for better focus.");
  }

  if (!subjectTotals[focusSubject] || subjectTotals[focusSubject] === 0) {
    insights.push(`${focusSubject} needs more attention this week.`);
  } else {
    const ignored = modeSubjects.find((subject) => !subjectTotals[subject] || subjectTotals[subject] === 0);
    if (ignored) {
      insights.push(`${ignored} has lower coverage this week. Add one focused session.`);
    }
  }

  if (studyHours >= 3 && sleepHours >= 6 && breakHours <= studyHours * 0.5) {
    insights.push("Great consistency! Keep it up 💪");
  }

  if (studyHours > 0) {
    insights.push(`You study best in the morning. Try scheduling ${focusSubject} revisions in the evening.`);
  }

  const finalInsights = insights.length
    ? insights
    : ["Keep logging daily data to receive sharper personalized study guidance."];

  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-xl font-semibold">Smart Insights</h3>
      <div className="mt-4 space-y-3">
        {finalInsights.map((insight) => (
          <p
            className="rounded-xl border border-sky-200/70 bg-sky-50/90 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-sky-700/40 dark:bg-sky-900/30 dark:text-sky-100"
            key={insight}
          >
            {insight}
          </p>
        ))}
      </div>
    </section>
  );
}

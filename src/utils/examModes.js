export const EXAM_MODES = [
  {
    value: "JEE",
    title: "JEE Mode",
    description: "Optimize Physics, Chemistry, and Math revision cycles.",
    accent: "from-sky-200 to-indigo-100",
    subjects: ["Physics", "Chemistry", "Math"],
    focusSubject: "Math",
  },
  {
    value: "NEET",
    title: "NEET Mode",
    description: "Build strong PCB coverage with consistent revision blocks.",
    accent: "from-pink-200 to-emerald-100",
    subjects: ["Physics", "Chemistry", "Biology"],
    focusSubject: "Biology",
  },
  {
    value: "UPSC",
    title: "UPSC Mode",
    description: "Balance Polity and GS with disciplined study windows.",
    accent: "from-emerald-200 to-cyan-100",
    subjects: ["Polity", "History", "Economy", "Geography"],
    focusSubject: "Polity",
  },
  {
    value: "CA",
    title: "CA Mode",
    description: "Track Accounts-focused sessions and concept retention.",
    accent: "from-amber-200 to-rose-100",
    subjects: ["Accounts", "Law", "Tax", "Audit"],
    focusSubject: "Accounts",
  },
];

export function getModeConfig(mode) {
  return EXAM_MODES.find((item) => item.value === mode) || EXAM_MODES[0];
}

export function getSubjectsForMode(mode) {
  return getModeConfig(mode).subjects;
}

export function getFocusSubject(mode) {
  return getModeConfig(mode).focusSubject;
}

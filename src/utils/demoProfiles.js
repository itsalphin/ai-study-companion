import { dateKey } from "./time";

export const DEMO_USERS = {
  sakshi: {
    password: "1234",
  },
  harshu: {
    password: "1234",
    forcedMode: "NEET",
    seedId: "harshu-neet-30d-v1",
  },
};

function toClock(totalMinutes) {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (wrapped % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function atTime(date, hours, minutes = 0) {
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value.toISOString();
}

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

export function createHarshuSeedData() {
  const moods = ["😊 Focused", "😌 Calm", "💪 Motivated", "😕 Distracted", "😴 Tired"];
  const subjects = ["Biology", "Chemistry", "Physics"];
  const bioTopics = [
    "Human Physiology",
    "Plant Physiology",
    "Genetics",
    "Ecology",
    "Biotechnology",
    "Reproduction",
  ];
  const chemTopics = [
    "Chemical Bonding",
    "Organic Mechanisms",
    "Coordination Compounds",
    "Electrochemistry",
    "Biomolecules",
    "Thermodynamics",
  ];
  const phyTopics = [
    "Current Electricity",
    "Ray Optics",
    "Modern Physics",
    "Thermodynamics",
    "Electrostatics",
    "SHM and Waves",
  ];

  const sessions = [];
  const testLogs = [];
  const dailyLogs = {};
  const notes = {};
  const today = new Date();
  let idCounter = 1;
  let testIdCounter = 1;

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(today.getDate() - offset);
    const dayKey = dateKey(date);
    const seedIndex = 29 - offset;

    const wakeUpMinutes = 320 + (seedIndex % 5) * 10;
    const morningStart = wakeUpMinutes + 85;
    const afternoonStart = 845 + (seedIndex % 4) * 12;
    const eveningStart = 1075 + (seedIndex % 5) * 9;
    const morningLength = 95 + (seedIndex % 3) * 12;
    const afternoonLength = 100 + ((seedIndex + 1) % 3) * 12;
    const eveningLength = 82 + (seedIndex % 4) * 11;
    const includeNightRevision = seedIndex % 4 === 0;
    const lateNightShift = seedIndex % 7 === 0 ? 45 : 0;
    const sleepMinutes = 1345 + (seedIndex % 3) * 16 + lateNightShift;

    const studyIntervals = [
      { start: toClock(morningStart), end: toClock(morningStart + morningLength) },
      { start: toClock(afternoonStart), end: toClock(afternoonStart + afternoonLength) },
      { start: toClock(eveningStart), end: toClock(eveningStart + eveningLength) },
    ];
    if (includeNightRevision) {
      studyIntervals.push({
        start: toClock(1220),
        end: toClock(1270 + (seedIndex % 2) * 10),
      });
    }

    const breakIntervals = [
      {
        start: toClock(morningStart + morningLength + 20),
        end: toClock(morningStart + morningLength + 45 + (seedIndex % 2) * 5),
      },
      {
        start: toClock(afternoonStart + afternoonLength + 18),
        end: toClock(afternoonStart + afternoonLength + 42 + (seedIndex % 3) * 4),
      },
      {
        start: toClock(eveningStart + eveningLength + 15),
        end: toClock(eveningStart + eveningLength + 35 + (seedIndex % 2) * 7),
      },
    ];

    const studyStartMinutes = morningStart;
    const studyEndMinutes = includeNightRevision
      ? 1270 + (seedIndex % 2) * 10
      : eveningStart + eveningLength;
    const breakStartMinutes = morningStart + morningLength + 20;
    const breakEndMinutes = eveningStart + eveningLength + 35 + (seedIndex % 2) * 7;

    dailyLogs[dayKey] = {
      wakeUp: toClock(wakeUpMinutes),
      studyStart: toClock(studyStartMinutes),
      studyEnd: toClock(studyEndMinutes),
      breakStart: toClock(breakStartMinutes),
      breakEnd: toClock(breakEndMinutes),
      sleepTime: toClock(sleepMinutes),
      mood: moods[seedIndex % moods.length],
      studyIntervals,
      breakIntervals,
    };

    const bioMinutes = 88 + (seedIndex % 4) * 11;
    const chemMinutes = 72 + (seedIndex % 3) * 13;
    const phyMinutes = 68 + ((seedIndex + 1) % 3) * 14;
    const includeExtraBio = seedIndex % 3 === 0;
    const includeExtraPhysics = seedIndex % 5 === 0;

    const daySessions = [
      {
        subject: "Biology",
        minutes: bioMinutes,
        hour: 7,
        minute: 20,
        source: seedIndex % 2 === 0 ? "timer" : "manual",
      },
      {
        subject: "Chemistry",
        minutes: chemMinutes,
        hour: 10,
        minute: 5,
        source: seedIndex % 2 === 0 ? "manual" : "timer",
      },
      {
        subject: "Physics",
        minutes: phyMinutes,
        hour: 16,
        minute: 12,
        source: "timer",
      },
    ];

    if (includeExtraBio) {
      daySessions.push({
        subject: "Biology",
        minutes: 40 + (seedIndex % 3) * 8,
        hour: 19,
        minute: 18,
        source: "manual",
      });
    }

    if (includeExtraPhysics) {
      daySessions.push({
        subject: "Physics",
        minutes: 35 + (seedIndex % 2) * 10,
        hour: 20,
        minute: 25,
        source: "manual",
      });
    }

    daySessions.forEach((session) => {
      sessions.push({
        id: `harshu-${idCounter}`,
        date: dayKey,
        createdAt: atTime(date, session.hour, session.minute),
        subject: session.subject,
        durationSeconds: session.minutes * 60,
        source: session.source,
      });
      idCounter += 1;
    });

    notes[dayKey] = {
      learned: `Completed ${bioTopics[seedIndex % bioTopics.length]} revision, practiced ${chemTopics[(seedIndex + 1) % chemTopics.length]}, and solved mixed NEET MCQs.`,
      mistakes: `Made avoidable mistakes in ${phyTopics[(seedIndex + 2) % phyTopics.length]} under time pressure. Need cleaner rough-work and option elimination.`,
      tomorrowGoal: `Do 2 timed Biology tests, 1 Chemistry revision sprint on ${chemTopics[seedIndex % chemTopics.length]}, and 40 Physics PYQs.`,
    };

    const mainTestSubject = subjects[seedIndex % subjects.length];
    const marksTotal = 180;
    const scoreBand = 58 + ((seedIndex * 7) % 29);
    const marksScored = Math.round((marksTotal * scoreBand) / 100);
    const durationMinutes = 78 + (seedIndex % 5) * 9;
    testLogs.push({
      id: `harshu-test-${testIdCounter}`,
      date: dayKey,
      createdAt: atTime(date, 20, 8),
      subject: mainTestSubject,
      marksScored: Math.min(marksScored, marksTotal),
      marksTotal,
      durationMinutes,
    });
    testIdCounter += 1;

    if (seedIndex % 4 === 0) {
      const sectionalSubject = subjects[(seedIndex + 1) % subjects.length];
      const sectionalTotal = 90;
      const sectionalScoreBand = 60 + ((seedIndex * 5) % 30);
      testLogs.push({
        id: `harshu-test-${testIdCounter}`,
        date: dayKey,
        createdAt: atTime(date, 21, 5),
        subject: sectionalSubject,
        marksScored: Math.min(Math.round((sectionalTotal * sectionalScoreBand) / 100), sectionalTotal),
        marksTotal: sectionalTotal,
        durationMinutes: 45 + (seedIndex % 3) * 8,
      });
      testIdCounter += 1;
    }
  }

  return {
    examMode: "NEET",
    sessions,
    testLogs,
    dailyLogs,
    notes,
    activeTimer: null,
    seedProfile: DEMO_USERS.harshu.seedId,
  };
}

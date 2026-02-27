import { dateKey, shortDay, sleepHoursFromLog, toHours } from "./time";

export function recentDateKeys(days = 7) {
  const now = new Date();
  const keys = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    keys.push(dateKey(date));
  }
  return keys;
}

export function studySecondsByDate(sessions = []) {
  const map = {};
  sessions.forEach((session) => {
    const key = session.date;
    map[key] = (map[key] || 0) + Number(session.durationSeconds || 0);
  });
  return map;
}

export function weeklySeries(sessions = [], days = 7) {
  const keys = recentDateKeys(days);
  const map = studySecondsByDate(sessions);
  return keys.map((key) => ({
    date: key,
    label: shortDay(key),
    seconds: map[key] || 0,
    hours: toHours(map[key] || 0),
  }));
}

function monthKey(input) {
  if (!input) {
    return null;
  }

  const date = new Date(`${input}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabel(key) {
  const [yearRaw, monthRaw] = String(key || "").split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    return "";
  }

  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  });
}

function recentMonthKeys(months = 6) {
  const now = new Date();
  const keys = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    keys.push(`${year}-${month}`);
  }
  return keys;
}

export function monthlySeries(sessions = [], months = 6) {
  const keys = recentMonthKeys(months);
  const buckets = {};

  keys.forEach((key) => {
    buckets[key] = {
      seconds: 0,
      days: new Set(),
    };
  });

  sessions.forEach((session) => {
    const key = monthKey(session.date);
    if (!key || !buckets[key]) {
      return;
    }

    const seconds = Number(session.durationSeconds || 0);
    buckets[key].seconds += seconds;
    if (session.date) {
      buckets[key].days.add(session.date);
    }
  });

  return keys.map((key) => {
    const hours = toHours(buckets[key].seconds);
    const activeDays = buckets[key].days.size;
    return {
      month: key,
      label: monthLabel(key),
      hours,
      activeDays,
      avgPerActiveDay: activeDays ? Number((hours / activeDays).toFixed(1)) : 0,
    };
  });
}

export function subjectTotals(sessions = [], startDate = null) {
  const totals = {};
  sessions.forEach((session) => {
    if (startDate && session.date < startDate) {
      return;
    }
    const subject = session.subject || "General";
    totals[subject] = (totals[subject] || 0) + Number(session.durationSeconds || 0);
  });

  return Object.fromEntries(
    Object.entries(totals).map(([subject, seconds]) => [subject, toHours(seconds)]),
  );
}

export function mostProductive(series = []) {
  if (!series.length) {
    return "No data";
  }
  const maxDay = [...series].sort((a, b) => b.hours - a.hours)[0];
  return `${maxDay.label} (${maxDay.hours}h)`;
}

export function streakCount(sessions = []) {
  if (!sessions.length) {
    return 0;
  }
  const set = new Set(sessions.map((item) => item.date));
  const today = new Date(`${dateKey()}T00:00:00`);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let cursor = null;
  if (set.has(dateKey(today))) {
    cursor = today;
  } else if (set.has(dateKey(yesterday))) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (cursor) {
    const key = dateKey(cursor);
    if (!set.has(key)) {
      break;
    }
    streak += 1;
    const prev = new Date(cursor);
    prev.setDate(cursor.getDate() - 1);
    cursor = prev;
  }
  return streak;
}

export function productivityScore({ studyHours = 0, sleepHours = 0, breakHours = 0, subjects = 0 }) {
  const studyScore = Math.min(45, studyHours * 15);

  let sleepScore = 4;
  if (sleepHours >= 7 && sleepHours <= 8.5) {
    sleepScore = 25;
  } else if (sleepHours >= 6) {
    sleepScore = 18;
  } else if (sleepHours >= 5) {
    sleepScore = 10;
  }

  const ratio = studyHours > 0 ? breakHours / studyHours : 1;
  let breakScore = 2;
  if (ratio <= 0.35) {
    breakScore = 20;
  } else if (ratio <= 0.6) {
    breakScore = 12;
  } else if (ratio <= 1) {
    breakScore = 7;
  }

  let subjectScore = 2;
  if (subjects >= 3) {
    subjectScore = 10;
  } else if (subjects === 2) {
    subjectScore = 7;
  } else if (subjects === 1) {
    subjectScore = 4;
  }

  return Math.round(Math.min(100, studyScore + sleepScore + breakScore + subjectScore));
}

export function heatmapData(sessions = [], days = 35) {
  const keys = recentDateKeys(days);
  const map = studySecondsByDate(sessions);
  return keys.map((key) => {
    const hours = toHours(map[key] || 0);
    return {
      date: key,
      hours,
      level: hours >= 5 ? 4 : hours >= 3 ? 3 : hours >= 1.5 ? 2 : hours > 0 ? 1 : 0,
    };
  });
}

export function consistencySummary(sessions = [], days = 30, minHours = 2) {
  const keys = recentDateKeys(days);
  const map = studySecondsByDate(sessions);
  let consistentDays = 0;
  let activeDays = 0;
  let totalHours = 0;

  keys.forEach((key) => {
    const hours = toHours(map[key] || 0);
    totalHours += hours;
    if (hours > 0) {
      activeDays += 1;
    }
    if (hours >= minHours) {
      consistentDays += 1;
    }
  });

  return {
    days,
    minHours,
    consistentDays,
    activeDays,
    consistencyPct: Math.round((consistentDays / days) * 100),
    avgDailyHours: Number((totalHours / days).toFixed(1)),
    totalHours: Number(totalHours.toFixed(1)),
  };
}

export function subjectBalanceSummary(sessions = [], startDate = null) {
  const totals = {};
  let totalSeconds = 0;

  sessions.forEach((session) => {
    if (startDate && session.date < startDate) {
      return;
    }

    const subject = session.subject || "General";
    const seconds = Number(session.durationSeconds || 0);
    totals[subject] = (totals[subject] || 0) + seconds;
    totalSeconds += seconds;
  });

  const entries = Object.entries(totals).filter(([, seconds]) => seconds > 0);
  if (!entries.length || totalSeconds <= 0) {
    return {
      score: 0,
      dominantSubject: "No data",
      dominantShare: 0,
      subjectCount: 0,
    };
  }

  const shares = entries.map(([, seconds]) => seconds / totalSeconds);
  const entropy = -shares.reduce((sum, share) => sum + share * Math.log(share), 0);
  const maxEntropy = Math.log(entries.length);
  const score = maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0;

  const [dominantSubject, dominantSeconds] = [...entries].sort((left, right) => right[1] - left[1])[0];

  return {
    score,
    dominantSubject,
    dominantShare: Math.round((dominantSeconds / totalSeconds) * 100),
    subjectCount: entries.length,
  };
}

export function focusWindowSummary(sessions = [], startDate = null) {
  const buckets = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    "Late Night": 0,
  };

  sessions.forEach((session) => {
    if (startDate && session.date < startDate) {
      return;
    }

    const createdAt = session.createdAt || (session.date ? `${session.date}T12:00:00` : null);
    const date = createdAt ? new Date(createdAt) : null;
    const hours = date && !Number.isNaN(date.getTime()) ? date.getHours() : 12;
    const seconds = Number(session.durationSeconds || 0);

    if (hours >= 5 && hours < 12) {
      buckets.Morning += seconds;
    } else if (hours >= 12 && hours < 17) {
      buckets.Afternoon += seconds;
    } else if (hours >= 17 && hours < 22) {
      buckets.Evening += seconds;
    } else {
      buckets["Late Night"] += seconds;
    }
  });

  const entries = Object.entries(buckets).map(([window, seconds]) => ({
    window,
    hours: toHours(seconds),
    seconds,
  }));
  const best = [...entries].sort((left, right) => right.seconds - left.seconds)[0];
  return {
    bestWindow: best?.window || "No data",
    bestHours: best ? toHours(best.seconds) : 0,
    breakdown: entries,
  };
}

export function testEfficiencySummary(testLogs = [], startDate = null) {
  let totalTests = 0;
  let totalMinutes = 0;
  let totalPercent = 0;

  testLogs.forEach((log) => {
    const key = testDateKey(log);
    if (!key) {
      return;
    }
    if (startDate && key < startDate) {
      return;
    }

    const marksScored = Number(log.marksScored || 0);
    const marksTotal = Number(log.marksTotal || 0);
    const durationMinutes = Number(log.durationMinutes || 0);
    if (marksTotal <= 0 || durationMinutes <= 0) {
      return;
    }

    totalTests += 1;
    totalMinutes += durationMinutes;
    totalPercent += (marksScored / marksTotal) * 100;
  });

  if (!totalTests) {
    return {
      totalTests: 0,
      avgScore: 0,
      avgDurationMinutes: 0,
      scorePerHour: 0,
    };
  }

  const avgScore = Number((totalPercent / totalTests).toFixed(1));
  const avgDurationMinutes = Number((totalMinutes / totalTests).toFixed(1));
  const scorePerHour = avgDurationMinutes
    ? Number((avgScore / (avgDurationMinutes / 60)).toFixed(1))
    : 0;

  return {
    totalTests,
    avgScore,
    avgDurationMinutes,
    scorePerHour,
  };
}

export function studyTrendDelta(sessions = [], days = 30) {
  const keys = recentDateKeys(days);
  const map = studySecondsByDate(sessions);
  const hoursList = keys.map((key) => toHours(map[key] || 0));
  const split = Math.floor(hoursList.length / 2);
  const first = hoursList.slice(0, split);
  const second = hoursList.slice(split);
  const firstAvg = first.length
    ? Number((first.reduce((sum, value) => sum + value, 0) / first.length).toFixed(1))
    : 0;
  const secondAvg = second.length
    ? Number((second.reduce((sum, value) => sum + value, 0) / second.length).toFixed(1))
    : 0;
  const delta = Number((secondAvg - firstAvg).toFixed(1));

  return {
    firstAvg,
    secondAvg,
    delta,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  };
}

export function sleepAlignmentSummary(sessions = [], dailyLogs = {}, days = 30) {
  const keys = recentDateKeys(days);
  const studyMap = studySecondsByDate(sessions);
  let trackedDays = 0;
  let alignedDays = 0;
  let riskDays = 0;

  keys.forEach((key) => {
    const sleepHours = sleepHoursFromLog(dailyLogs[key] || {});
    const studyHours = toHours(studyMap[key] || 0);
    if (sleepHours <= 0 && studyHours <= 0) {
      return;
    }

    trackedDays += 1;
    if (sleepHours >= 7 && sleepHours <= 8.5 && studyHours >= 3) {
      alignedDays += 1;
    }
    if (sleepHours < 6 && studyHours >= 4) {
      riskDays += 1;
    }
  });

  const alignmentPct = trackedDays ? Math.round((alignedDays / trackedDays) * 100) : 0;
  return {
    trackedDays,
    alignedDays,
    riskDays,
    alignmentPct,
  };
}

function testDateKey(log = {}) {
  if (log.date) {
    return log.date;
  }

  if (log.createdAt) {
    return dateKey(new Date(log.createdAt));
  }

  return null;
}

export function summarizeTests(testLogs = [], startDate = null) {
  const bySubject = {};
  let totalTests = 0;
  let totalMinutes = 0;
  let totalPercent = 0;

  testLogs.forEach((log) => {
    const key = testDateKey(log);
    if (!key) {
      return;
    }
    if (startDate && key < startDate) {
      return;
    }

    const marksScored = Number(log.marksScored || 0);
    const marksTotal = Number(log.marksTotal || 0);
    const durationMinutes = Number(log.durationMinutes || 0);
    if (marksTotal <= 0) {
      return;
    }

    const percent = (marksScored / marksTotal) * 100;
    const subject = log.subject || "General";
    if (!bySubject[subject]) {
      bySubject[subject] = {
        tests: 0,
        percentSum: 0,
        minutes: 0,
      };
    }

    bySubject[subject].tests += 1;
    bySubject[subject].percentSum += percent;
    bySubject[subject].minutes += durationMinutes;

    totalTests += 1;
    totalMinutes += durationMinutes;
    totalPercent += percent;
  });

  const averageScore = totalTests ? Number((totalPercent / totalTests).toFixed(1)) : 0;
  const totalHours = Number((totalMinutes / 60).toFixed(1));

  const subjectStats = Object.entries(bySubject).map(([subject, value]) => ({
    subject,
    tests: value.tests,
    averageScore: Number((value.percentSum / value.tests).toFixed(1)),
    hours: Number((value.minutes / 60).toFixed(1)),
  }));

  return {
    totalTests,
    averageScore,
    totalHours,
    subjectStats,
  };
}

export function weeklyTestSeries(testLogs = [], days = 7) {
  const keys = recentDateKeys(days);
  const bucket = {};

  keys.forEach((key) => {
    bucket[key] = {
      count: 0,
      percentSum: 0,
      minutes: 0,
    };
  });

  testLogs.forEach((log) => {
    const key = testDateKey(log);
    if (!key || !bucket[key]) {
      return;
    }
    const marksScored = Number(log.marksScored || 0);
    const marksTotal = Number(log.marksTotal || 0);
    const durationMinutes = Number(log.durationMinutes || 0);
    if (marksTotal <= 0) {
      return;
    }

    bucket[key].count += 1;
    bucket[key].percentSum += (marksScored / marksTotal) * 100;
    bucket[key].minutes += durationMinutes;
  });

  return keys.map((key) => ({
    date: key,
    label: shortDay(key),
    count: bucket[key].count,
    averageScore: bucket[key].count ? Number((bucket[key].percentSum / bucket[key].count).toFixed(1)) : 0,
    hours: Number((bucket[key].minutes / 60).toFixed(1)),
  }));
}

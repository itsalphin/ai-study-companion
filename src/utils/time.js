export function dateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

export function toHours(seconds) {
  return Number((seconds / 3600).toFixed(1));
}

export function formatDuration(seconds) {
  const hh = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mm = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function longDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toMinutes(clockValue) {
  if (!clockValue) {
    return null;
  }
  const [hoursRaw, minutesRaw] = clockValue.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function diffHours(start, end, allowOvernight = false) {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (startMinutes === null || endMinutes === null) {
    return 0;
  }

  let diff = endMinutes - startMinutes;
  if (allowOvernight && diff < 0) {
    diff += 24 * 60;
  }

  return Number((Math.max(0, diff) / 60).toFixed(1));
}

export function intervalsHours(intervals = [], allowOvernight = false) {
  if (!Array.isArray(intervals)) {
    return 0;
  }

  const total = intervals.reduce((sum, interval) => {
    if (!interval || typeof interval !== "object") {
      return sum;
    }

    return sum + diffHours(interval.start, interval.end, allowOvernight);
  }, 0);

  return Number(total.toFixed(1));
}

export function studyHoursFromLog(log = {}) {
  if (Array.isArray(log.studyIntervals)) {
    return intervalsHours(log.studyIntervals);
  }

  return diffHours(log.studyStart, log.studyEnd);
}

export function breakHoursFromLog(log = {}) {
  if (Array.isArray(log.breakIntervals)) {
    return intervalsHours(log.breakIntervals);
  }

  return diffHours(log.breakStart, log.breakEnd);
}

export function sleepHoursFromLog(log = {}) {
  return diffHours(log.sleepTime, log.wakeUp, true);
}

export function shortDay(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

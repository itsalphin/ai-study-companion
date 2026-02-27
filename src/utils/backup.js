const BACKUP_VERSION = 1;

function sanitizeFilePart(value) {
  return String(value || "user")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";
}

function timestampForFilename(date) {
  return date.toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

export function downloadBackup({ data, session, theme }) {
  const now = new Date();
  const payload = {
    app: "AI Study Companion",
    backupVersion: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    session: {
      username: session?.username || "User",
    },
    selectedTheme: theme || "light",
    data,
  };

  const username = sanitizeFilePart(session?.username || "user");
  const fileName = `ai-study-companion-backup-${username}-${timestampForFilename(now)}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return fileName;
}

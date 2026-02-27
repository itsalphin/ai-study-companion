import { loadTheme } from "./utils/storage";

export function applyThemeClass(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function initializeTheme() {
  applyThemeClass(loadTheme());
}

export function smoothScrollTo(id) {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

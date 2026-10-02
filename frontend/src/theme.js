const THEME_KEY = "project_tracker_theme";

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || (systemPrefersDark() ? "dark" : "light");
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

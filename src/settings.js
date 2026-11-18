const SETTINGS_KEY = "tazk.settings.v1";

const DEFAULTS = {
  theme: "system",
  accent: "#396cd8",
  scale: "normal",
};

const VALID_THEMES = ["light", "dark", "system", "hacker"];
const VALID_SCALES = ["compact", "normal", "large"];
const HEX = /^#[0-9a-fA-F]{6}$/;

function normalize(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  return {
    theme: VALID_THEMES.includes(raw.theme) ? raw.theme : DEFAULTS.theme,
    accent: typeof raw.accent === "string" && HEX.test(raw.accent) ? raw.accent : DEFAULTS.accent,
    scale: VALID_SCALES.includes(raw.scale) ? raw.scale : DEFAULTS.scale,
  };
}

export function loadSettings() {
  let parsed;
  try {
    parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
  } catch {
    return { ...DEFAULTS };
  }
  return normalize(parsed);
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalize(settings)));
    return true;
  } catch {
    return false;
  }
}

export function applySettings(settings) {
  const s = normalize(settings);
  const root = document.documentElement;

  // Theme
  if (s.theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", s.theme);
  }

  // Accent — hacker theme always uses green, ignore the color picker
    if (s.theme === "hacker") {
      root.style.setProperty("--accent", "#00ff41", "important");
      root.style.setProperty("--accent-hover", "#00cc33", "important");
      root.style.setProperty("--accent-active", "#009926", "important");
      root.style.setProperty("--accent-soft", "rgba(0, 255, 65, 0.15)", "important");
    } else {
    root.style.setProperty("--accent", s.accent, "important");
      const hover = shade(s.accent, -14);
      const active = shade(s.accent, -26);
    root.style.setProperty("--accent-hover", hover, "important");
    root.style.setProperty("--accent-active", active, "important");
    root.style.setProperty("--accent-soft", hexToRgba(s.accent, 0.16), "important");
    }

  // Scale
  const base = { compact: "14px", normal: "16px", large: "18px" }[s.scale];
  root.style.fontSize = base;
    root.style.setProperty("font-size", base, "important");

  return s;
}

function clamp(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function shade(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const t = percent / 100;
  const target = t < 0 ? 0 : 255;
  const p = Math.abs(t);
  return rgbToHex(
    clamp(r + (target - r) * p),
    clamp(g + (target - g) * p),
    clamp(b + (target - b) * p),
  );
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export { DEFAULTS };
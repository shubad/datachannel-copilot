// DataChannel design tokens — sampled from the product screenshots in the docs.
// Accent is a soft coral-orange used SPARINGLY (primary actions + active states),
// on a light neutral chrome. This replaces the old harsh #FF5A36.

export const T = {
  // brand accent
  accent: "#FD9567",
  accentHover: "#F0764A", // deeper coral for hover / pressed
  accentTint: "#FFF1EB", // active / hover fill
  accentTintStrong: "#FED8C6",
  accentText: "#B85C2E", // accent text on tint (AA)

  // neutrals / chrome
  page: "#F5F6F8",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFBFC",
  border: "#E7E9EE",
  borderStrong: "#D6DAE2",

  // text
  text: "#1B2536",
  textMuted: "#6B7280",
  textFaint: "#9AA2B1",

  // status
  ok: "#1E9E6A",
  okBg: "#E7F6EF",
  warn: "#B26B00",
  warnBg: "#FBF0DD",
  danger: "#C0392B",
  dangerBg: "#FBE9E7",
  info: "#2F6DB5",
  infoBg: "#E8F1FB",

  // ink bubble (user message)
  ink: "#1B2536",

  shadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.03)",
  shadowHover: "0 4px 14px rgba(16,24,40,0.08)",
  shadowPop: "0 12px 32px rgba(16,24,40,0.14)",
  radius: 10,
} as const;

// Back-compat alias — many components import ACCENT.
export const ACCENT = T.accent;

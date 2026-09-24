"use client";

// Shared building blocks for the task-specific response components.
// Everything reuses the library primitives (same buttons, chips, easing) so the
// response cards read as one family with the pipeline-creation cards.

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { T } from "@/lib/copilot/tokens";
import { Card, PriBtn, GhostBtn, StatusChip, Toggle, EASE, TR, type Emit, type P } from "../library";

export { Card, PriBtn, GhostBtn, StatusChip, Toggle, EASE, TR, T };
export type { Emit, P };

// ---------------- chart palette ----------------
// Validated with the dataviz palette checker (light, surface #fff, all pairs):
// lightness band, chroma floor, CVD (worst ΔE 13.0), normal-vision (16.3) and
// ≥3:1 contrast all pass. The brand coral #FD9567 is only ~2.1:1 on white — too
// faint for a data mark — so marks use its deeper step; UI chrome keeps #FD9567.
export const VIZ = {
  accent: "#EB6834", // the mark the story is about (emphasis)
  context: "#CBD1DA", // de-emphasised marks
  neutral: "#9AA3B2", // secondary data ink
  cat: ["#EB6834", "#2A78D6", "#4A3AA7"] as const, // categorical, fixed order
  other: "#B8BFCA", // folded "Other"
  grid: "#EEF0F3",
};

// Status ramps — fill, tint, and a meter track that is a lighter step of the same hue.
export type Tone = "ok" | "warn" | "danger" | "info" | "accent" | "muted";
export const TONE: Record<Tone, { fg: string; bg: string; track: string }> = {
  ok: { fg: T.ok, bg: T.okBg, track: "#D3ECDF" },
  warn: { fg: T.warn, bg: T.warnBg, track: "#F3E2C2" },
  danger: { fg: T.danger, bg: T.dangerBg, track: "#F4D3CF" },
  info: { fg: T.info, bg: T.infoBg, track: "#D2E2F4" },
  accent: { fg: VIZ.accent, bg: T.accentTint, track: T.accentTintStrong },
  muted: { fg: T.textMuted, bg: "#EEF0F3", track: "#E3E6EB" },
};

// ---------------- motion ----------------
const calm = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };
export const rise = (delay = 0) => ({
  animation: `kitRise .42s ${EASE} both`, animationDelay: `${delay}ms`,
  "@keyframes kitRise": { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "none" } },
  ...calm,
});
// Opacity-only entrance — use where the element also transforms on hover
// (a transform keyframe with fill-mode "both" would pin the transform).
export const fade = (delay = 0) => ({
  animation: `kitFade .4s ${EASE} both`, animationDelay: `${delay}ms`,
  "@keyframes kitFade": { from: { opacity: 0 }, to: { opacity: 1 } },
  ...calm,
});
export const growX = (delay = 0) => ({
  transformOrigin: "left", animation: `kitGrowX .7s ${EASE} both`, animationDelay: `${delay}ms`,
  "@keyframes kitGrowX": { from: { transform: "scaleX(0)" }, to: { transform: "none" } },
  ...calm,
});
export const growY = (delay = 0) => ({
  transformOrigin: "bottom", animation: `kitGrowY .6s ${EASE} both`, animationDelay: `${delay}ms`,
  "@keyframes kitGrowY": { from: { transform: "scaleY(0)" }, to: { transform: "none" } },
  ...calm,
});

// ---------------- text + layout ----------------
export function Head({ icon, title, sub, right, mb = 1.1 }: { icon?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; mb?: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb }}>
      {icon && (
        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: T.textMuted }}>{icon}</Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.text, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: T.textFaint, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</Typography>}
      </Box>
      {right}
    </Box>
  );
}

export function Eyebrow({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Typography sx={{ fontSize: 9.5, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: T.textFaint, ...sx }}>{children}</Typography>;
}

export function Mono({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Box component="span" sx={{ fontFamily: "monospace", fontSize: 11.5, ...sx }}>{children}</Box>;
}

export function Note({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Typography sx={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.5, mt: 1, ...sx }}>{children}</Typography>;
}

// The copilot's own read of the data — a soft accent callout.
export function Insight({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box sx={{ display: "flex", gap: 0.8, alignItems: "flex-start", px: 1.1, py: 0.85, borderRadius: 1.5, bgcolor: T.accentTint, border: `1px solid ${T.accentTintStrong}`, ...sx }}>
      <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: T.accentText, mt: 0.2, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11.5, color: T.text, lineHeight: 1.5 }}>{children}</Typography>
    </Box>
  );
}

export function Divider({ sx }: { sx?: object }) {
  return <Box sx={{ height: "1px", bgcolor: T.border, my: 1.1, ...sx }} />;
}

// Row of action buttons from `[{label, send, primary}]`.
export function Actions({ actions, emit, children, sx }: { actions?: P[]; emit: Emit; children?: React.ReactNode; sx?: object }) {
  if (!actions?.length && !children) return null;
  return (
    <Box sx={{ display: "flex", gap: 0.75, mt: 1.25, flexWrap: "wrap", ...sx }}>
      {actions?.map((a, i) => a.primary
        ? <PriBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</PriBtn>
        : <GhostBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</GhostBtn>)}
      {children}
    </Box>
  );
}

// Small inline text action ("Log", "Re-run") for dense rows.
export function LinkBtn({ children, onClick, tone = "accent" }: { children: React.ReactNode; onClick?: () => void; tone?: "accent" | "muted" }) {
  const c = tone === "accent" ? T.accentText : T.textMuted;
  return (
    <Box component="button" type="button" onClick={onClick} sx={{ all: "unset", display: "inline-flex", alignItems: "center", gap: 0.3, fontSize: 11, fontWeight: 500, color: c, cursor: "pointer", px: 0.6, py: 0.25, borderRadius: 1, whiteSpace: "nowrap", transition: TR, "&:hover": { bgcolor: tone === "accent" ? T.accentTint : T.surfaceAlt }, "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 1 } }}>{children}</Box>
  );
}

export function Avatar({ name, size = 24, you }: { name: string; size?: number; you?: boolean }) {
  const initials = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";
  return (
    <Box sx={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 500, color: you ? T.accentText : T.textMuted, bgcolor: you ? T.accentTint : "#EEF0F3", border: `1px solid ${you ? T.accentTintStrong : T.border}` }}>{initials}</Box>
  );
}

export function Dot({ tone, size = 7 }: { tone: Tone; size?: number }) {
  return <Box sx={{ width: size, height: size, borderRadius: "50%", bgcolor: TONE[tone].fg, flexShrink: 0 }} />;
}

// Horizontal meter. The unfilled track is a lighter step of the fill's own hue,
// so severity reads across the whole bar. `ghost` extends a forecast past `pct`.
export function Meter({ pct, tone = "accent", height = 6, ghost, delay = 0 }: { pct: number; tone?: Tone; height?: number; ghost?: number; delay?: number }) {
  const c = TONE[tone];
  return (
    <Box sx={{ position: "relative", height, borderRadius: height, bgcolor: c.track, overflow: "hidden" }}>
      {ghost != null && <Box sx={{ position: "absolute", inset: 0, width: `${Math.min(ghost, 100)}%`, bgcolor: c.fg, opacity: 0.28, borderRadius: height, ...growX(delay + 150) }} />}
      <Box sx={{ position: "absolute", inset: 0, width: `${Math.min(pct, 100)}%`, bgcolor: c.fg, borderRadius: height, ...growX(delay) }} />
    </Box>
  );
}

// Compact segmented control.
export function Seg({ options, value, onChange }: { options: { value: string; label: React.ReactNode; title?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <Box role="tablist" sx={{ display: "inline-flex", p: 0.3, gap: 0.3, borderRadius: 1.5, bgcolor: "#F1F3F6", border: `1px solid ${T.border}` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Box key={o.value} component="button" type="button" role="tab" aria-selected={on} title={o.title} onClick={() => onChange(o.value)} sx={{
            all: "unset", display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.85, height: 22, borderRadius: 1, cursor: "pointer",
            fontSize: 11, fontWeight: 500, color: on ? T.text : T.textMuted, bgcolor: on ? T.surface : "transparent",
            boxShadow: on ? "0 1px 2px rgba(16,24,40,.08)" : "none", transition: TR,
            "&:hover": { color: T.text }, "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 1 },
          }}>{o.label}</Box>
        );
      })}
    </Box>
  );
}

// Hover/focus tooltip. The parent sets `position: relative` and spreads `hoverTip`.
export const hoverTip = {
  "&:hover .kit-tip, &:focus-visible .kit-tip": { opacity: 1, transform: "translate(-50%, 0)" },
};
export function Tip({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box className="kit-tip" sx={{
      position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translate(-50%, 3px)", opacity: 0, pointerEvents: "none",
      bgcolor: T.text, color: "#fff", fontSize: 10.5, lineHeight: 1.4, px: 0.8, py: 0.4, borderRadius: 1, whiteSpace: "nowrap", zIndex: 6,
      boxShadow: "0 4px 12px rgba(16,24,40,.18)", transition: `opacity .14s ${EASE}, transform .14s ${EASE}`, ...sx,
    }}>{children}</Box>
  );
}

// A chart card with a Chart/Table switch — every chart has a table-view twin.
// `lead` (e.g. a hero figure) shows in both views; `children` is the chart itself.
export function ChartFrame({ title, sub, icon, table, lead, children, footer }: { title: React.ReactNode; sub?: React.ReactNode; icon?: React.ReactNode; table: { columns: { key: string; label: string; align?: "left" | "right" }[]; rows: P[] }; lead?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  const [view, setView] = React.useState("chart");
  return (
    <Card>
      <Head icon={icon} title={title} sub={sub} right={
        <Seg value={view} onChange={setView} options={[
          { value: "chart", label: <BarChartRoundedIcon sx={{ fontSize: 14 }} />, title: "Chart" },
          { value: "table", label: <TableRowsOutlinedIcon sx={{ fontSize: 14 }} />, title: "Table" },
        ]} />
      } />
      {lead}
      {view === "chart" ? children : (
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", ...rise() }}>
          <Box component="thead"><Box component="tr">
            {table.columns.map((c) => <Box component="th" key={c.key} sx={{ textAlign: c.align || "left", fontSize: 9.5, fontWeight: 500, color: T.textFaint, textTransform: "uppercase", letterSpacing: ".04em", py: 0.5, px: 0.75, borderBottom: `1px solid ${T.border}` }}>{c.label}</Box>)}
          </Box></Box>
          <Box component="tbody">
            {table.rows.map((r, i) => (
              <Box component="tr" key={i} sx={{ "&:hover": { bgcolor: T.surfaceAlt } }}>
                {table.columns.map((c) => <Box component="td" key={c.key} sx={{ textAlign: c.align || "left", fontSize: 11.5, color: T.text, py: 0.45, px: 0.75, borderBottom: i < table.rows.length - 1 ? `1px solid ${T.border}` : "none", fontVariantNumeric: "tabular-nums" }}>{r[c.key]}</Box>)}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {footer}
    </Card>
  );
}

// ---------------- 24-hour day track ----------------
// Hours as decimals (6.25 = 06:15). Marks are dots with a 2px surface ring and a
// hover tooltip; `now` draws a hairline "now" marker.
export type DayMark = { h: number; tone: Tone; label: string };
export const hhmm = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
export function DayTrack({ marks, now, band }: { marks: DayMark[]; now?: number; band?: { from: number; to: number } }) {
  const x = (h: number) => `${(h / 24) * 100}%`;
  return (
    <Box sx={{ position: "relative", height: 34, mx: 0.75 }}>
      <Box sx={{ position: "absolute", left: 0, right: 0, top: 9, height: 4, borderRadius: 2, bgcolor: VIZ.grid }} />
      {now != null && <Box sx={{ position: "absolute", left: 0, width: x(now), top: 9, height: 4, borderRadius: 2, bgcolor: "#E0E4EA", ...growX() }} />}
      {band && <Box sx={{ position: "absolute", left: x(band.from), width: `${((band.to - band.from) / 24) * 100}%`, top: 3, height: 16, borderRadius: 1, bgcolor: T.accentTint, border: `1px solid ${T.accentTintStrong}` }} />}
      {[0, 6, 12, 18, 24].map((h) => (
        <Typography key={h} sx={{ position: "absolute", left: x(h), top: 20, transform: "translateX(-50%)", fontSize: 9.5, color: T.textFaint, fontVariantNumeric: "tabular-nums" }}>{String(h).padStart(2, "0")}</Typography>
      ))}
      {now != null && (
        <Box sx={{ position: "absolute", left: x(now), top: 1, bottom: 14, width: "1px", bgcolor: T.textMuted }}>
          <Typography sx={{ position: "absolute", top: -2, left: 4, fontSize: 9, color: T.textMuted, whiteSpace: "nowrap" }}>now</Typography>
        </Box>
      )}
      {marks.map((m, i) => (
        <Box key={i} tabIndex={0} aria-label={`${hhmm(m.h)} ${m.label}`} sx={{ position: "absolute", left: x(m.h), top: 11, width: 24, height: 24, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", outline: "none", ...hoverTip }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: TONE[m.tone].fg, boxShadow: `0 0 0 2px ${T.surface}`, transition: `transform .14s ${EASE}`, ...fade(120 + i * 70), "*:hover > &": { transform: "scale(1.25)" } }} />
          <Tip>{hhmm(m.h)} · {m.label}</Tip>
        </Box>
      ))}
    </Box>
  );
}

// ---------------- numbers ----------------
export const fmtInt = (n: number) => n.toLocaleString("en-US");
export const compact = (n: number) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : `${n}`);

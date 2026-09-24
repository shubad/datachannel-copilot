"use client";

// Monitoring & health responses — each one answers a specific operator question
// (when did it fail, why, what's overdue, what runs next) instead of a generic table.

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import {
  Card, PriBtn, GhostBtn, StatusChip, T, VIZ, TONE, EASE, TR, type Tone, type Emit, type P,
  Head, Eyebrow, Mono, Note, Insight, Divider, Actions, LinkBtn, Avatar, Dot, Meter, Tip, hoverTip,
  ChartFrame, DayTrack, hhmm, rise, growX, growY, fmtInt,
} from "./kit";

const toneOf = (status: string): Tone => (/fail|error|expired/i.test(status) ? "danger" : /timeout|warn|partial|stale|expiring/i.test(status) ? "warn" : "ok");
const reducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ================= "What failed today?" =================
// A 24h timeline of failures + incidents grouped by what the user must do
// (DataChannel's Task vs Warning alert classes), not a flat table.
export function IncidentBoard({ props, emit }: { props: P; emit: Emit }) {
  const groups: P[] = props.groups || [];
  const all = groups.flatMap((g) => (g.items as P[]).map((it): P => ({ ...it, tone: g.tone as Tone })));
  return (
    <Card>
      <Head icon={<ErrorRoundedIcon sx={{ fontSize: 15, color: T.danger }} />} title={props.title} sub={props.sub} right={<Typography sx={{ fontSize: 11, color: T.textFaint }}>{props.date}</Typography>} />
      <DayTrack now={props.now} marks={all.map((it) => ({ h: it.h, tone: it.tone, label: it.name }))} />
      <Box sx={{ display: "grid", gap: 1.1, mt: 1 }}>
        {groups.map((g, gi) => (
          <Box key={gi} sx={rise(80 + gi * 90)}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mb: 0.55 }}>
              <Dot tone={g.tone} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: T.text }}>{g.label}</Typography>
              <Typography sx={{ fontSize: 11, color: T.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>· {g.hint}</Typography>
            </Box>
            <Box sx={{ border: `1px solid ${T.border}`, borderRadius: 1.5, overflow: "hidden" }}>
              {(g.items as P[]).map((it, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1, pr: 0.6, py: 0.7, borderTop: i ? `1px solid ${T.border}` : "none", boxShadow: `inset 2px 0 0 ${TONE[g.tone as Tone].fg}`, transition: TR, "&:hover": { bgcolor: T.surfaceAlt } }}>
                  <Box sx={{ fontSize: 14, flexShrink: 0 }}>{it.icon}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Mono sx={{ fontSize: 12, color: T.text, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</Mono>
                    <Typography sx={{ fontSize: 10.5, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.reason}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 11, color: T.text, fontVariantNumeric: "tabular-nums" }}>{hhmm(it.h)}</Typography>
                    <Typography sx={{ fontSize: 9.5, color: T.textFaint }}>{it.type}</Typography>
                  </Box>
                  <StatusChip value={it.status} />
                  <Box sx={{ display: "flex", flexShrink: 0 }}>
                    {it.log && <LinkBtn tone="muted" onClick={() => emit.text(it.log)}><TerminalRoundedIcon sx={{ fontSize: 12 }} />Log</LinkBtn>}
                    {it.fix && <LinkBtn onClick={() => emit.text(it.fix.send)}>{it.fix.label}</LinkBtn>}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= "Why did X fail?" =================
// Symptom → cause → root-cause chain, the facts list, blast radius, and a fix plan.
export function RootCause({ props, emit }: { props: P; emit: Emit }) {
  const chain: P[] = props.chain || [];
  const facts: P[] = props.facts || [];
  const fix: P[] = props.fix || [];
  return (
    <Card>
      <Head icon={props.icon} title={<Mono sx={{ fontSize: 13 }}>{props.title}</Mono>} sub={props.route} right={<StatusChip value={props.status} />} />

      <Eyebrow sx={{ mb: 0.7 }}>How it broke</Eyebrow>
      <Box sx={{ position: "relative", pl: 2.4 }}>
        <Box sx={{ position: "absolute", left: 7, top: 8, bottom: 10, width: "1px", bgcolor: T.border }} />
        {chain.map((c, i) => (
          <Box key={i} sx={{ position: "relative", pb: i < chain.length - 1 ? 1.1 : 0, ...rise(i * 110) }}>
            <Box sx={{ position: "absolute", left: -21, top: 2, width: 11, height: 11, borderRadius: "50%", bgcolor: c.root ? T.danger : T.surface, border: `2px solid ${c.root ? T.danger : T.borderStrong}`, boxShadow: `0 0 0 3px ${T.surface}` }} />
            <Eyebrow sx={{ color: c.root ? T.danger : T.textFaint }}>{c.label}</Eyebrow>
            <Typography sx={{ fontSize: 12.5, color: T.text, lineHeight: 1.4, mt: 0.15 }}>{c.text}</Typography>
            {c.meta && <Mono sx={{ fontSize: 10.5, color: T.textFaint }}>{c.meta}</Mono>}
          </Box>
        ))}
      </Box>

      {facts.length > 0 && (
        <>
          <Divider />
          <Box>
            {facts.map((r, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, py: 0.45, borderBottom: i < facts.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <Typography sx={{ fontSize: 11.5, color: T.textMuted, width: "38%", flexShrink: 0 }}>{r.k}</Typography>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12, color: r.tone === "danger" ? T.danger : T.text, fontFamily: r.mono ? "monospace" : "inherit" }}>{r.v}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {props.impact && (
        <Box sx={{ mt: 1.2, px: 1.1, py: 0.9, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.7 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 13, color: T.textMuted }} />
            <Typography sx={{ fontSize: 11.5, color: T.text }}>{props.impact.label}</Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
            {(props.impact.items as string[]).map((n) => (
              <Mono key={n} sx={{ fontSize: 10.5, px: 0.7, py: 0.2, borderRadius: 1, bgcolor: T.surface, border: `1px solid ${T.border}`, color: T.textMuted }}>{n}</Mono>
            ))}
            {props.impact.more ? <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>+{props.impact.more} more</Typography> : null}
          </Box>
        </Box>
      )}

      {fix.length > 0 && (
        <>
          <Eyebrow sx={{ mt: 1.4, mb: 0.6 }}>Fix plan</Eyebrow>
          <Box sx={{ display: "grid", gap: 0.5 }}>
            {fix.map((f, i) => {
              const lead = i === 0;
              return (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.7, borderRadius: 1.5, border: `1px solid ${lead ? T.accentTintStrong : T.border}`, bgcolor: lead ? T.accentTint : T.surface, ...rise(220 + i * 90) }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 500, color: lead ? "#fff" : T.textMuted, bgcolor: lead ? T.accent : "#EEF0F3" }}>{i + 1}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, color: T.text }}>{f.text}</Typography>
                    {f.sub && <Typography sx={{ fontSize: 10.5, color: T.textMuted }}>{f.sub}</Typography>}
                  </Box>
                  {f.action
                    ? lead
                      ? <PriBtn onClick={() => emit.text(f.action.send)} sx={{ height: 27, px: 1.25, fontSize: 11.5 }}>{f.action.label}</PriBtn>
                      : <GhostBtn onClick={() => emit.text(f.action.send)} sx={{ height: 27, px: 1.1, fontSize: 11.5 }}>{f.action.label}</GhostBtn>
                    : f.auto ? <Typography sx={{ display: "flex", alignItems: "center", gap: 0.35, fontSize: 10.5, color: T.textMuted, flexShrink: 0 }}><SyncRoundedIcon sx={{ fontSize: 12 }} />Automatic</Typography> : null}
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Card>
  );
}

// ================= "What's the schedule of X?" =================
export function ScheduleCard({ props, emit }: { props: P; emit: Emit }) {
  const hist: P[] = props.history || [];
  const settings: P[] = props.settings || [];
  return (
    <Card>
      <Head icon={props.icon} title={<Mono sx={{ fontSize: 13 }}>{props.title}</Mono>} sub={props.route} right={<StatusChip value={props.status} />} />
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.25, mb: 1.1, ...rise() }}>
        <Box>
          <Eyebrow>Next run</Eyebrow>
          <Typography sx={{ fontSize: 18, fontWeight: 500, color: T.text, lineHeight: 1.25, mt: 0.2 }}>{props.next.when}</Typography>
        </Box>
        <Box sx={{ mb: 0.35, display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: T.accentTint, color: T.accentText, fontSize: 11, fontWeight: 500 }}>
          <AccessTimeRoundedIcon sx={{ fontSize: 12 }} />in {props.next.in}
        </Box>
      </Box>
      <DayTrack now={props.now} marks={(props.runs as number[] | undefined ?? []).map((h) => ({ h, tone: "accent" as Tone, label: "scheduled run" }))} />

      <Box sx={{ mt: 1.1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.6 }}>
          <Eyebrow>Last {hist.length} runs</Eyebrow>
          {props.historyNote && <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{props.historyNote}</Typography>}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${hist.length}, 1fr)`, gap: 0.5 }}>
          {hist.map((r, i) => {
            const tone = toneOf(r.s);
            const Icon = tone === "ok" ? CheckRoundedIcon : tone === "warn" ? WarningAmberRoundedIcon : CloseRoundedIcon;
            return (
              <Box key={i} tabIndex={0} aria-label={`${r.d}: ${r.s}, ${r.rows} rows, ${r.dur}`} sx={{ position: "relative", outline: "none", ...hoverTip }}>
                <Box sx={{ height: 26, borderRadius: 1, bgcolor: TONE[tone].bg, border: `1px solid ${TONE[tone].track}`, display: "flex", alignItems: "center", justifyContent: "center", transition: TR, ...rise(i * 45), "*:hover > &, *:focus-visible > &": { borderColor: TONE[tone].fg } }}>
                  <Icon sx={{ fontSize: 13, color: TONE[tone].fg }} />
                </Box>
                <Typography sx={{ fontSize: 9.5, color: T.textFaint, textAlign: "center", mt: 0.3 }}>{r.d}</Typography>
                <Tip>{r.d} · {r.s} · {r.rows} rows · {r.dur}</Tip>
              </Box>
            );
          })}
        </Box>
      </Box>

      {settings.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6, mt: 1.2 }}>
          {settings.map((s, i) => (
            <Box key={i} sx={{ px: 1, py: 0.7, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
              <Eyebrow>{s.k}</Eyebrow>
              <Typography sx={{ fontSize: 12, color: T.text, mt: 0.2 }}>{s.v}</Typography>
            </Box>
          ))}
        </Box>
      )}
      {props.note && <Note>{props.note}</Note>}
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= "Which credentials are expired or expiring?" =================
// Token-lifetime meters: fill = how much of the token's life is used, by severity.
export function CredentialHealth({ props, emit }: { props: P; emit: Emit }) {
  const rows: P[] = props.rows || [];
  return (
    <Card>
      <Head icon={<KeyRoundedIcon sx={{ fontSize: 15 }} />} title={props.title} sub={props.sub} />
      <Box sx={{ display: "flex", gap: 0.6, mb: 1.1, flexWrap: "wrap" }}>
        {(props.summary as P[]).map((s, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "baseline", gap: 0.45, px: 0.85, py: 0.35, borderRadius: 1, bgcolor: TONE[s.tone as Tone].bg }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: TONE[s.tone as Tone].fg }}>{s.n}</Typography>
            <Typography sx={{ fontSize: 10.5, color: TONE[s.tone as Tone].fg }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "grid", gap: 0.6 }}>
        {rows.map((r, i) => {
          const tone = r.tone as Tone;
          return (
            <Box key={i} sx={{ p: 1, borderRadius: 1.5, border: `1px solid ${tone === "danger" ? TONE.danger.track : T.border}`, bgcolor: tone === "danger" ? "#FFFBFA" : T.surface, ...rise(i * 80) }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ fontSize: 15, flexShrink: 0 }}>{r.icon}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Mono sx={{ fontSize: 12.5, color: T.text }}>{r.name}</Mono>
                  <Typography sx={{ fontSize: 10.5, color: T.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.platform} · {r.account} · powers {r.pipelines} pipelines</Typography>
                </Box>
                {r.action && (tone === "danger"
                  ? <PriBtn onClick={() => emit.text(r.action.send)} sx={{ height: 27, px: 1.25, fontSize: 11.5 }}>{r.action.label}</PriBtn>
                  : <GhostBtn onClick={() => emit.text(r.action.send)} sx={{ height: 27, px: 1.1, fontSize: 11.5 }}>{r.action.label}</GhostBtn>)}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.8 }}>
                <Box sx={{ flex: 1 }}><Meter pct={r.used} tone={tone} height={5} delay={100 + i * 80} /></Box>
                <Typography sx={{ fontSize: 10.5, color: TONE[tone].fg, flexShrink: 0, minWidth: 128, textAlign: "right" }}>{r.label}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      {props.note && <Note>{props.note}</Note>}
    </Card>
  );
}

// ================= "Which pipelines haven't run in 3 days?" =================
// Hours since the last run on one shared scale, with a tick where the run was due.
export function Freshness({ props, emit }: { props: P; emit: Emit }) {
  const rows: P[] = props.rows || [];
  const max = Math.max(...rows.map((r) => r.lastH as number)) * 1.06;
  return (
    <Card>
      <Head icon={<HourglassEmptyRoundedIcon sx={{ fontSize: 15 }} />} title={props.title} sub={props.sub} />
      {rows.map((r, i) => {
        const over = r.expectedH ? r.lastH / r.expectedH : null;
        return (
          <Box key={i} sx={{ py: 1, borderTop: i ? `1px solid ${T.border}` : "none", ...rise(i * 90) }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
              <Box sx={{ fontSize: 14, flexShrink: 0 }}>{r.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Mono sx={{ fontSize: 12.5, color: T.text }}>{r.name}</Mono>
                <Typography sx={{ fontSize: 10.5, color: T.textMuted }}>{r.reason}</Typography>
              </Box>
              <StatusChip value={r.state} />
            </Box>
            <Box sx={{ position: "relative", height: 8, borderRadius: 4, bgcolor: VIZ.grid }}>
              <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(r.lastH / max) * 100}%`, borderRadius: 4, bgcolor: over && over > 1 ? TONE.warn.fg : VIZ.neutral, ...growX(120 + i * 90) }} />
              {r.expectedH && <Box title="When the next run was due" sx={{ position: "absolute", left: `${(r.expectedH / max) * 100}%`, top: -3, bottom: -3, width: 2, borderRadius: 1, bgcolor: T.text, boxShadow: `0 0 0 1px ${T.surface}` }} />}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {r.expectedH && <Box sx={{ width: 2, height: 10, borderRadius: 1, bgcolor: T.text }} />}
                <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{r.expectedH ? `due every ${r.cadenceLabel}` : "No schedule — runs only when triggered"}</Typography>
              </Box>
              <Typography sx={{ fontSize: 10.5, color: T.text, textAlign: "right" }}>Last run {r.last}{over ? ` · ${over.toFixed(1)}× overdue` : ""}</Typography>
            </Box>
            <Actions actions={r.actions} emit={emit} sx={{ mt: 0.8 }} />
          </Box>
        );
      })}
      {props.note && <Note sx={{ mt: 0.25 }}>{props.note}</Note>}
    </Card>
  );
}

// ================= "How many rows did we process this month?" =================
// Hero figure + daily columns (today emphasised, the rest context) + top contributors.
export function VolumeChart({ props }: { props: P; emit: Emit }) {
  const s: P[] = props.series || [];
  const max: number = props.yMax;
  const ticks: number[] = props.ticks || [0, max / 2, max];
  const last = s.length - 1;
  const top: P[] = props.breakdown || [];
  return (
    <ChartFrame
      icon={<InsightsRoundedIcon sx={{ fontSize: 15 }} />}
      title={props.title}
      sub={props.period}
      table={{ columns: [{ key: "d", label: "Day" }, { key: "v", label: "Rows", align: "right" }], rows: s.map((d, i) => ({ d: `Sep ${d.d}${i === last ? " (so far)" : ""}`, v: `${d.v.toFixed(1)}M` })) }}
      lead={
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.9, mb: 1.4, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 28, fontWeight: 500, color: T.text, lineHeight: 1, letterSpacing: "-.01em" }}>{props.hero}</Typography>
          <Typography sx={{ fontSize: 11.5, color: props.delta.good ? T.ok : T.danger }}>{props.delta.value}</Typography>
          <Typography sx={{ fontSize: 11, color: T.textFaint }}>{props.delta.vs}</Typography>
        </Box>
      }
      footer={top.length > 0 && (
        <>
          <Divider />
          <Eyebrow sx={{ mb: 0.6 }}>Top contributors</Eyebrow>
          <Box sx={{ display: "grid", gap: 0.55 }}>
            {top.map((b, i) => (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: "170px 1fr 52px 34px", alignItems: "center", columnGap: 1 }}>
                <Mono sx={{ fontSize: 11.5, color: b.other ? T.textMuted : T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</Mono>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: VIZ.grid, overflow: "hidden" }}>
                  <Box sx={{ height: "100%", width: `${b.pct}%`, bgcolor: b.other ? VIZ.other : VIZ.neutral, borderRadius: 3, ...growX(200 + i * 70) }} />
                </Box>
                <Typography sx={{ fontSize: 11, color: T.text, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.v}</Typography>
                <Typography sx={{ fontSize: 10.5, color: T.textFaint, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.pct}%</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    >
      <Box sx={{ display: "flex", gap: 0.75 }}>
        <Box sx={{ position: "relative", width: 26, height: 112, flexShrink: 0 }}>
          {ticks.map((t) => (
            <Typography key={t} sx={{ position: "absolute", right: 0, bottom: `${(t / max) * 100}%`, transform: "translateY(50%)", fontSize: 9.5, color: T.textFaint, fontVariantNumeric: "tabular-nums" }}>{t ? `${t}M` : "0"}</Typography>
          ))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ position: "relative", height: 112 }}>
            {ticks.map((t) => <Box key={t} sx={{ position: "absolute", left: 0, right: 0, bottom: `${(t / max) * 100}%`, height: "1px", bgcolor: t ? VIZ.grid : T.borderStrong }} />)}
            <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: "2px" }}>
              {s.map((d, i) => {
                const hi = i === last;
                const h = `${(d.v / max) * 100}%`;
                return (
                  <Box key={i} tabIndex={0} aria-label={`Sep ${d.d}: ${d.v}M rows`} sx={{ position: "relative", flex: 1, height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", outline: "none", ...hoverTip, "&:hover .bar, &:focus-visible .bar": { opacity: 0.78 }, "&:hover .lbl": { opacity: 0 } }}>
                    <Box className="bar" sx={{ width: "100%", maxWidth: 16, height: h, bgcolor: hi ? VIZ.accent : VIZ.context, borderRadius: "4px 4px 0 0", transition: `opacity .14s ${EASE}`, ...growY(i * 22) }} />
                    {hi && (
                      // Label sits in the free headroom above every bar, with a leader down to today's bar — never over its neighbours.
                      <>
                        <Typography className="lbl" sx={{ position: "absolute", right: 0, top: -3, fontSize: 10, color: T.text, whiteSpace: "nowrap", transition: `opacity .14s ${EASE}` }}>{props.todayLabel}</Typography>
                        <Box className="lbl" sx={{ position: "absolute", left: "50%", top: 12, bottom: `calc(${h} + 3px)`, width: "1px", bgcolor: T.textFaint, transition: `opacity .14s ${EASE}` }} />
                      </>
                    )}
                    <Tip sx={{ bottom: `calc(${h} + 6px)` }}>Sep {d.d} · {d.v.toFixed(1)}M rows{hi ? " so far" : ""}</Tip>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: "2px", mt: 0.5 }}>
            {s.map((d, i) => (
              <Typography key={i} sx={{ flex: 1, textAlign: "center", fontSize: 9.5, color: i === last ? T.text : T.textFaint, fontVariantNumeric: "tabular-nums" }}>{i === 0 || (i + 1) % 7 === 0 || i === last ? d.d : ""}</Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </ChartFrame>
  );
}

// ================= "What changed on X?" =================
// Audit trail with before → after diffs, and the copilot's read of what it means.
export function ChangeTimeline({ props, emit }: { props: P; emit: Emit }) {
  const ev: P[] = props.events || [];
  return (
    <Card>
      <Head icon={props.icon} title={<Mono sx={{ fontSize: 13 }}>{props.title}</Mono>} sub={props.route} right={<Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{ev.length} changes</Typography>} />
      {props.insight && <Insight sx={{ mb: 1.3 }}>{props.insight}</Insight>}
      <Box sx={{ position: "relative" }}>
        <Box sx={{ position: "absolute", left: 11.5, top: 14, bottom: 14, width: "1px", bgcolor: T.border }} />
        {ev.map((e, i) => (
          <Box key={i} sx={{ position: "relative", display: "flex", gap: 1.1, pb: i < ev.length - 1 ? 1.3 : 0, ...rise(i * 90) }}>
            <Box sx={{ borderRadius: "50%", boxShadow: `0 0 0 3px ${T.surface}`, height: 24, zIndex: 1 }}><Avatar name={e.who} you={e.who === "you"} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                <Typography sx={{ fontSize: 12, color: T.text, whiteSpace: "nowrap" }}>{e.who === "you" ? "You" : e.who}</Typography>
                <Typography sx={{ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.verb}</Typography>
                <Typography sx={{ fontSize: 10.5, color: T.textFaint, ml: "auto", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{e.when}</Typography>
              </Box>
              {e.to && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.55, flexWrap: "wrap" }}>
                  <Eyebrow sx={{ mr: 0.2 }}>{e.field}</Eyebrow>
                  {e.from && <Mono sx={{ fontSize: 11, px: 0.7, py: 0.2, borderRadius: 1, bgcolor: "#F1F3F6", color: T.textMuted, textDecoration: "line-through" }}>{e.from}</Mono>}
                  {e.from && <EastRoundedIcon sx={{ fontSize: 12, color: T.textFaint }} />}
                  <Mono sx={{ fontSize: 11, px: 0.7, py: 0.2, borderRadius: 1, bgcolor: T.accentTint, color: T.accentText }}>{e.to}</Mono>
                </Box>
              )}
              {e.revert && <Box sx={{ mt: 0.5, ml: -0.6 }}><LinkBtn onClick={() => emit.text(e.revert.send)}><UndoRoundedIcon sx={{ fontSize: 12 }} />{e.revert.label}</LinkBtn></Box>}
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// ================= "Re-run everything that failed overnight" =================
// Live progress: queued → running (rows counting up) → done; skips explain why.
export function BulkRunProgress({ props, emit }: { props: P; emit: Emit }) {
  const rows: P[] = props.rows || [];
  const runs = rows.filter((r) => !r.skipped);
  const end = Math.max(0, ...runs.map((r) => r.delay + r.dur));
  // Reduced motion starts (and stays) at the finished state.
  const [t, setT] = React.useState(() => (reducedMotion() ? end : 0));
  React.useEffect(() => {
    if (reducedMotion()) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { const e = now - start; setT(e); if (e < end) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  const stateOf = (r: P) => (r.skipped ? "skipped" : t < r.delay ? "queued" : t < r.delay + r.dur ? "running" : "done");
  const progress = (r: P) => { const x = Math.max(0, Math.min(1, (t - r.delay) / r.dur)); return 1 - Math.pow(1 - x, 3); };
  const done = runs.filter((r) => stateOf(r) === "done").length;
  const skipped = rows.length - runs.length;
  const finished = done === runs.length;
  return (
    <Card>
      <Head
        icon={finished ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: T.ok }} /> : <CircularProgress size={14} thickness={5} sx={{ color: T.accent }} />}
        title={finished ? `${done} re-run${done === 1 ? "" : "s"} succeeded` : `Re-running ${runs.length} pipelines…`}
        sub={finished ? (skipped ? `${skipped} skipped — needs a fix first` : "All clear") : `${done} of ${runs.length} finished`}
      />
      <Box sx={{ display: "grid", gap: 0.6 }}>
        {rows.map((r, i) => {
          const s = stateOf(r);
          const p = progress(r);
          return (
            <Box key={i} sx={{ p: 1, borderRadius: 1.5, border: `1px solid ${T.border}`, bgcolor: s === "skipped" ? T.surfaceAlt : T.surface, ...rise(i * 70) }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ fontSize: 14, flexShrink: 0, opacity: s === "skipped" ? 0.55 : 1 }}>{r.icon}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Mono sx={{ fontSize: 12, color: s === "skipped" ? T.textMuted : T.text }}>{r.name}</Mono>
                  <Typography sx={{ fontSize: 10.5, color: T.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s === "skipped" ? r.reason : r.route}</Typography>
                </Box>
                {s === "queued" && <Typography sx={{ display: "flex", alignItems: "center", gap: 0.4, fontSize: 10.5, color: T.textMuted }}><AccessTimeRoundedIcon sx={{ fontSize: 12 }} />Queued</Typography>}
                {s === "running" && <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 10.5, color: T.accentText }}><CircularProgress size={10} thickness={6} sx={{ color: T.accent }} />Running</Typography>}
                {s === "done" && <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}><Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{r.took}</Typography><StatusChip value="Success" /></Box>}
                {s === "skipped" && <StatusChip value="Skipped" />}
              </Box>
              {s !== "skipped" ? (
                <Box sx={{ mt: 0.75, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: VIZ.grid, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${p * 100}%`, bgcolor: s === "done" ? T.ok : VIZ.accent, borderRadius: 2, transition: "background-color .3s" }} />
                  </Box>
                  <Typography sx={{ fontSize: 10.5, color: T.textMuted, fontVariantNumeric: "tabular-nums", minWidth: 96, textAlign: "right" }}>{s === "queued" ? "waiting for a slot" : `${fmtInt(Math.round(r.rows * p))} rows`}</Typography>
                </Box>
              ) : r.fix ? (
                <Box sx={{ mt: 0.5, ml: -0.6 }}><LinkBtn onClick={() => emit.text(r.fix.send)}>{r.fix.label}</LinkBtn></Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

// ================= "What's scheduled to run tomorrow?" =================
// A 24h lane chart — one lane per pipeline — with the busiest window shaded.
export function Agenda({ props, emit }: { props: P; emit: Emit }) {
  const lanes: P[] = props.lanes || [];
  const x = (h: number) => `${(h / 24) * 100}%`;
  return (
    <Card>
      <Head icon={<ScheduleRoundedIcon sx={{ fontSize: 15 }} />} title={props.title} sub={props.sub} />
      <Box sx={{ display: "grid", gridTemplateColumns: "138px 1fr", columnGap: 1.25 }}>
        <Box />
        <Box sx={{ position: "relative", height: 16 }}>
          {[0, 6, 12, 18, 24].map((h) => (
            <Typography key={h} sx={{ position: "absolute", left: x(h), transform: h === 0 ? "none" : h === 24 ? "translateX(-100%)" : "translateX(-50%)", fontSize: 9.5, color: T.textFaint, fontVariantNumeric: "tabular-nums" }}>{String(h).padStart(2, "0")}:00</Typography>
          ))}
        </Box>
        {lanes.map((l, i) => (
          <React.Fragment key={i}>
            <Box title={l.name} sx={{ py: 0.65, minWidth: 0, borderTop: `1px solid ${T.border}`, ...rise(i * 60) }}>
              <Mono sx={{ fontSize: 11, color: l.paused ? T.textFaint : T.text, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</Mono>
              <Typography sx={{ fontSize: 9.5, color: T.textFaint }}>{l.cadence}</Typography>
            </Box>
            <Box sx={{ position: "relative", borderTop: `1px solid ${T.border}` }}>
              {props.peak && <Box sx={{ position: "absolute", left: x(props.peak.from), width: `${((props.peak.to - props.peak.from) / 24) * 100}%`, top: 0, bottom: 0, bgcolor: T.accentTint }} />}
              {[6, 12, 18].map((h) => <Box key={h} sx={{ position: "absolute", left: x(h), top: 0, bottom: 0, width: "1px", bgcolor: VIZ.grid }} />)}
              {l.paused ? (
                <Box sx={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ flex: 1, height: 2, bgcolor: "#E3E6EB", borderRadius: 1 }} />
                  <StatusChip value="Paused" />
                </Box>
              ) : (
                <>
                  {(l.runs as number[]).map((h, j) => {
                    const dense = l.runs.length > 6;
                    const tone = (l.tone ?? "accent") as Tone;
                    return (
                      <Box key={j} tabIndex={0} aria-label={`${hhmm(h)} ${l.name}`} sx={{ position: "absolute", left: x(h), top: "50%", transform: "translate(-50%, -50%)", width: dense ? 12 : 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", outline: "none", ...hoverTip }}>
                        <Box sx={{ width: dense ? 3 : 10, height: dense ? 12 : 10, borderRadius: dense ? 1 : "50%", bgcolor: dense ? VIZ.neutral : TONE[tone].fg, boxShadow: dense ? "none" : `0 0 0 2px ${T.surface}`, ...growY(80 + j * 12) }} />
                        <Tip>{hhmm(h)} · {l.name}{l.warn ? ` — ${l.warn}` : ""}</Tip>
                      </Box>
                    );
                  })}
                  {l.label && <Typography sx={{ position: "absolute", left: `calc(${x(l.runs[0])} + 10px)`, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: l.tone === "danger" ? T.danger : T.textMuted, whiteSpace: "nowrap", pointerEvents: "none" }}>{l.label}</Typography>}
                </>
              )}
            </Box>
          </React.Fragment>
        ))}
      </Box>
      {props.peak && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mt: 1 }}>
          <Box sx={{ width: 12, height: 10, borderRadius: 0.5, bgcolor: T.accentTint, border: `1px solid ${T.accentTintStrong}`, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11, color: T.textMuted }}>{props.peak.text}</Typography>
        </Box>
      )}
      {props.warn && <Insight sx={{ mt: 1 }}>{props.warn}</Insight>}
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= "Which connector has the most errors?" =================
// Ranked bars (worst emphasised) with success rate and the top reason per connector.
export function ErrorRanking({ props, emit }: { props: P; emit: Emit }) {
  const rows: P[] = props.rows || [];
  const max = Math.max(1, ...rows.map((r) => r.errors as number));
  const rate = (r: P) => (r.runs - r.errors) / r.runs;
  return (
    <ChartFrame
      icon={<BarChartRoundedIcon sx={{ fontSize: 15 }} />}
      title={props.title}
      sub={props.period}
      table={{
        columns: [{ key: "name", label: "Connector" }, { key: "errors", label: "Errors", align: "right" }, { key: "runs", label: "Runs", align: "right" }, { key: "ok", label: "Success", align: "right" }, { key: "reason", label: "Top reason" }],
        rows: rows.map((r) => ({ ...r, ok: `${Math.round(rate(r) * 100)}%` })),
      }}
      footer={<>{props.insight && <Insight sx={{ mt: 1.2 }}>{props.insight}</Insight>}<Actions actions={props.actions} emit={emit} /></>}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "124px 1fr 72px", columnGap: 1, mb: 0.5 }}>
        <Eyebrow>Connector</Eyebrow><Eyebrow>Errors</Eyebrow><Eyebrow sx={{ textAlign: "right" }}>Success</Eyebrow>
      </Box>
      <Box sx={{ display: "grid", gap: 0.8 }}>
        {rows.map((r, i) => {
          const k = rate(r);
          const tone: Tone = k < 0.5 ? "danger" : k < 0.95 ? "warn" : "ok";
          return (
            <Box key={i} sx={{ display: "grid", gridTemplateColumns: "124px 1fr 72px", alignItems: "center", columnGap: 1, ...rise(i * 70) }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Box sx={{ fontSize: 13 }}>{r.icon}</Box>
                  <Typography sx={{ fontSize: 12, color: T.text, whiteSpace: "nowrap" }}>{r.name}</Typography>
                </Box>
                <Typography sx={{ fontSize: 10, color: T.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.reason}</Typography>
              </Box>
              <Box tabIndex={0} aria-label={`${r.name}: ${r.errors} errors in ${r.runs} runs`} sx={{ position: "relative", display: "flex", alignItems: "center", gap: 0.6, height: 24, outline: "none", ...hoverTip }}>
                <Box sx={{ height: 14, width: r.errors ? `${(r.errors / max) * 80}%` : 2, bgcolor: i === 0 ? VIZ.accent : VIZ.context, borderRadius: "0 4px 4px 0", ...growX(80 + i * 70) }} />
                <Typography sx={{ fontSize: 11, color: T.text, fontVariantNumeric: "tabular-nums" }}>{r.errors}</Typography>
                <Tip sx={{ left: "35%" }}>{r.errors} errors in {r.runs} runs</Tip>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                <Dot tone={tone} />
                <Typography sx={{ fontSize: 10.5, color: T.textMuted, fontVariantNumeric: "tabular-nums" }}>{Math.round(k * 100)}% ok</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </ChartFrame>
  );
}

// ================= Re-authorise a credential =================
// Steps tick through (consent → approval → verified), then affected pipelines resume.
export function AuthFlow({ props, emit }: { props: P; emit: Emit }) {
  const steps = React.useMemo<P[]>(() => props.steps || [], [props.steps]);
  const [stage, setStage] = React.useState(() => (reducedMotion() ? steps.length : 0));
  React.useEffect(() => {
    if (reducedMotion()) return;
    const timers = steps.map((s, i) => setTimeout(() => setStage(i + 1), s.at));
    return () => timers.forEach(clearTimeout);
  }, [steps]);
  const complete = stage >= steps.length;
  return (
    <Card>
      <Head icon={props.icon} title={complete ? props.doneTitle : props.title} sub={props.platform} right={complete ? <StatusChip value="Active" /> : <StatusChip value="Running" />} />
      <Box sx={{ display: "grid", gap: 0.1 }}>
        {steps.map((s, i) => {
          const st = i < stage ? "done" : i === stage ? "active" : "todo";
          return (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.55 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: st === "done" ? T.ok : "transparent", border: st === "done" ? "none" : `1.5px solid ${st === "active" ? T.accent : T.borderStrong}`, transition: `all .25s ${EASE}` }}>
                {st === "done" && <CheckRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />}
                {st === "active" && <CircularProgress size={10} thickness={6} sx={{ color: T.accent }} />}
              </Box>
              <Typography sx={{ fontSize: 12, color: st === "todo" ? T.textFaint : T.text, transition: `color .25s ${EASE}` }}>{st === "done" ? s.doneLabel ?? s.label : s.label}</Typography>
            </Box>
          );
        })}
      </Box>
      {complete && props.resume && (
        <Box sx={{ mt: 1, px: 1.1, py: 0.9, borderRadius: 1.5, bgcolor: T.okBg, border: `1px solid ${TONE.ok.track}`, ...rise() }}>
          <Typography sx={{ fontSize: 11.5, color: T.text, mb: 0.6 }}>{props.resume.label}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
            {(props.resume.items as string[]).map((n, i) => (
              <Mono key={n} sx={{ fontSize: 10.5, px: 0.7, py: 0.2, borderRadius: 1, bgcolor: T.surface, border: `1px solid ${TONE.ok.track}`, color: T.textMuted, ...rise(i * 60) }}>{n}</Mono>
            ))}
            {props.resume.more ? <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>+{props.resume.more} more</Typography> : null}
          </Box>
        </Box>
      )}
      {complete && <Actions actions={props.actions} emit={emit} />}
    </Card>
  );
}

"use client";

// Admin, billing and agency responses — plus the receipt every confirmed action
// returns. Invite and alert rules are interactive: choices update the card live.

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import TollOutlinedIcon from "@mui/icons-material/TollOutlined";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import DataUsageRoundedIcon from "@mui/icons-material/DataUsageRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import {
  Card, PriBtn, Toggle, T, VIZ, TONE, EASE, TR, type Emit, type P,
  Head, Eyebrow, Mono, Insight, Divider, Actions, LinkBtn, Avatar, Tip, hoverTip, rise, growX,
} from "./kit";

// Pick ink or white for text set inside a colored fill — whichever clears more contrast.
function inkOn(hex: string) {
  const c = hex.replace("#", "").match(/../g)!.map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.068 ? "#fff" : T.text;
}

function RuleBox({ tokens }: { tokens: P[] }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.6, px: 1, py: 0.85, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, ...rise() }}>
      {tokens.map((t, i) => t.chip
        ? <Box key={i} sx={{ fontSize: 11.5, color: t.accent ? T.accentText : T.text, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: t.accent ? T.accentTint : T.surface, border: `1px solid ${t.accent ? T.accentTintStrong : T.border}` }}>{t.chip}</Box>
        : <Typography key={i} sx={{ fontSize: 12, color: T.textMuted }}>{t.t}</Typography>)}
    </Box>
  );
}

// ================= "Invite X as a read-only user" =================
// Picking a role updates the permission list in place.
export function InviteCard({ props, emit }: { props: P; emit: Emit }) {
  const roles: P[] = props.roles || [];
  const perms: string[] = props.perms || [];
  const [role, setRole] = React.useState<string>(props.role);
  const grant: number[] = props.matrix[role] || [];
  return (
    <Card>
      <Head icon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 15 }} />} title="Invite a teammate" sub={props.sub} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
        <Avatar name={props.name} size={30} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, color: T.text }}>{props.name}</Typography>
          <Mono sx={{ fontSize: 11, color: T.textMuted }}>{props.email}</Mono>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Eyebrow>Workspace</Eyebrow>
          <Typography sx={{ fontSize: 11.5, color: T.text }}>{(props.workspaces as string[]).join(", ")}</Typography>
        </Box>
      </Box>

      <Eyebrow sx={{ mt: 1.3, mb: 0.6 }}>Role</Eyebrow>
      <Box role="radiogroup" aria-label="Role" sx={{ display: "grid", gridTemplateColumns: `repeat(${roles.length}, 1fr)`, gap: 0.6 }}>
        {roles.map((r) => {
          const on = r.name === role;
          return (
            <Box key={r.name} component="button" type="button" role="radio" aria-checked={on} aria-label={`${r.name}: ${r.desc}`} onClick={() => setRole(r.name)} sx={{
              all: "unset", cursor: "pointer", p: 0.9, borderRadius: 1.5, border: `1px solid ${on ? T.accent : T.border}`, bgcolor: on ? T.accentTint : T.surface, transition: TR,
              "&:hover": { borderColor: on ? T.accent : T.borderStrong }, "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 1 },
            }}>
              <Typography component="span" sx={{ display: "block", fontSize: 12, fontWeight: 500, color: on ? T.accentText : T.text }}>{r.name}</Typography>
              <Typography component="span" sx={{ display: "block", fontSize: 10.5, color: T.textMuted, lineHeight: 1.35, mt: 0.2 }}>{r.desc}</Typography>
            </Box>
          );
        })}
      </Box>

      <Eyebrow sx={{ mt: 1.3, mb: 0.4 }}>What {props.name} can do</Eyebrow>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 1.5 }}>
        {perms.map((p, i) => {
          const ok = !!grant[i];
          return (
            <Box key={p} sx={{ display: "flex", alignItems: "center", gap: 0.7, py: 0.4 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: ok ? T.okBg : "#EEF0F3", transition: `background .2s ${EASE}` }}>
                {ok ? <CheckRoundedIcon sx={{ fontSize: 11, color: T.ok }} /> : <CloseRoundedIcon sx={{ fontSize: 11, color: T.textFaint }} />}
              </Box>
              <Typography sx={{ fontSize: 11.5, color: ok ? T.text : T.textFaint, transition: `color .2s ${EASE}` }}>{p}</Typography>
            </Box>
          );
        })}
      </Box>
      <Actions emit={emit}><PriBtn onClick={() => emit.text(props.send)}>Send invite as {role}</PriBtn></Actions>
    </Card>
  );
}

// ================= "Send pipeline errors to Slack" =================
// The rule as a sentence, options, and a live preview of the message it will post.
export function AlertRuleBuilder({ props, emit }: { props: P; emit: Emit }) {
  const options: P[] = props.options || [];
  const [on, setOn] = React.useState<boolean[]>(() => options.map((o) => !!o.on));
  const pv = props.preview;
  return (
    <Card>
      <Head icon={<NotificationsActiveOutlinedIcon sx={{ fontSize: 15 }} />} title={props.title} sub={props.sub} />
      <RuleBox tokens={props.rule} />

      <Box sx={{ mt: 1.1, display: "grid", gap: 0.2 }}>
        {options.map((o, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
            <Typography sx={{ flex: 1, fontSize: 12, color: T.text }}>{o.label}</Typography>
            <Toggle checked={on[i]} onChange={(v) => setOn((s) => s.map((x, j) => (j === i ? v : x)))} />
          </Box>
        ))}
      </Box>

      <Eyebrow sx={{ mt: 1.1, mb: 0.6 }}>Preview · {pv.channel}</Eyebrow>
      <Box sx={{ display: "flex", gap: 1, p: 1.1, borderRadius: 1.5, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
        <Box sx={{ width: 30, height: 30, borderRadius: 1.25, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Box component="img" src="/dc-icon.png" alt="" sx={{ width: 18, height: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: T.text }}>DataChannel</Typography>
            <Box sx={{ fontSize: 8.5, fontWeight: 500, color: T.textMuted, bgcolor: "#EEF0F3", px: 0.45, borderRadius: 0.5, letterSpacing: ".04em" }}>APP</Box>
            <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{pv.time}</Typography>
          </Box>
          <Box sx={{ mt: 0.5, pl: 1, borderLeft: `3px solid ${T.danger}` }}>
            <Typography sx={{ fontSize: 12, color: T.text }}>{pv.title}</Typography>
            {(pv.lines as string[]).map((l) => <Typography key={l} sx={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.5 }}>{l}</Typography>)}
            {on[0] && <Typography sx={{ fontSize: 11.5, color: T.info, mt: 0.3, display: "flex", alignItems: "center", gap: 0.3, ...rise() }}>View run log <EastRoundedIcon sx={{ fontSize: 12 }} /></Typography>}
          </Box>
          {on[1] && <Typography sx={{ fontSize: 10, color: T.textFaint, mt: 0.6, ...rise() }}>Repeats for the same pipeline are grouped — at most one message per hour.</Typography>}
          {on[2] && <Typography sx={{ fontSize: 10, color: T.textFaint, mt: 0.3, ...rise() }}>Warnings (timeouts, no new rows) will post here too.</Typography>}
        </Box>
      </Box>
      <Actions emit={emit}><PriBtn onClick={() => emit.text(props.send)}>Turn on alerts</PriBtn></Actions>
    </Card>
  );
}

// ================= "How many credits did we use?" =================
// Meter with a forecast extension and an on-pace tick, then usage by category.
export function CreditsMeter({ props }: { props: P; emit: Emit }) {
  const pct = (v: number) => (v / props.plan) * 100;
  const used = pct(props.used), proj = pct(props.projected), pace = (props.day / props.days) * 100;
  const parts: P[] = props.breakdown || [];
  const tiles: P[] = props.tiles || [];
  return (
    <Card>
      <Head icon={<TollOutlinedIcon sx={{ fontSize: 15 }} />} title={props.title} sub={props.sub} right={<Typography sx={{ fontSize: 11, color: T.textFaint }}>Resets {props.resets}</Typography>} />
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mb: 0.4 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 500, color: T.text, lineHeight: 1, letterSpacing: "-.01em" }}>{props.usedLabel}</Typography>
        <Typography sx={{ fontSize: 12, color: T.textMuted }}>of {props.planLabel} credits</Typography>
      </Box>

      <Box sx={{ position: "relative", pt: 2.3, pb: 2.4 }}>
        <Box tabIndex={0} aria-label={`Plan pace: ${Math.round(pace)}% of plan by day ${props.day}`} sx={{ position: "absolute", left: `${pace}%`, top: 0, bottom: 14, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", outline: "none", zIndex: 2 }}>
          <Typography sx={{ fontSize: 9.5, color: T.textMuted, whiteSpace: "nowrap", lineHeight: 1.2 }}>plan pace</Typography>
          <Box sx={{ flex: 1, width: 2, bgcolor: T.text, borderRadius: 1, boxShadow: `0 0 0 1px ${T.surface}` }} />
        </Box>
        <Box sx={{ position: "relative", height: 10, borderRadius: 5, bgcolor: TONE.accent.track, overflow: "hidden" }}>
          <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${proj}%`, bgcolor: VIZ.accent, opacity: 0.3, borderRadius: 5, ...growX(180) }} />
          <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${used}%`, bgcolor: VIZ.accent, borderRadius: 5, ...growX() }} />
        </Box>
        <Typography sx={{ position: "absolute", left: `${used}%`, bottom: 0, transform: "translateX(-50%)", fontSize: 10, color: T.text, whiteSpace: "nowrap" }}>Used {props.usedLabel}</Typography>
        <Typography sx={{ position: "absolute", left: `${proj}%`, bottom: 0, transform: "translateX(-10%)", fontSize: 10, color: T.textMuted, whiteSpace: "nowrap" }}>Projected {props.projectedLabel}</Typography>
        <Typography sx={{ position: "absolute", right: 0, bottom: 0, fontSize: 10, color: T.textFaint }}>{props.planLabel}</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${tiles.length}, 1fr)`, gap: 0.6, mt: 0.6 }}>
        {tiles.map((t) => (
          <Box key={t.label} sx={{ px: 1, py: 0.75, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <Eyebrow>{t.label}</Eyebrow>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: T.text, mt: 0.2, lineHeight: 1.2 }}>{t.value}</Typography>
            {t.sub && <Typography sx={{ fontSize: 10, color: T.textMuted }}>{t.sub}</Typography>}
          </Box>
        ))}
      </Box>

      {parts.length > 0 && (
        <>
          <Divider />
          <Eyebrow sx={{ mb: 0.7 }}>Where the credits went</Eyebrow>
          <Box sx={{ display: "flex", gap: "2px", height: 12 }}>
            {parts.map((b, i) => (
              <Box key={b.name} tabIndex={0} aria-label={`${b.name}: ${b.v}, ${b.pct}%`} sx={{ position: "relative", flex: `${b.pct} 1 0`, outline: "none", ...hoverTip }}>
                <Box sx={{ height: "100%", bgcolor: VIZ.cat[i], borderRadius: i === 0 ? "4px 0 0 4px" : i === parts.length - 1 ? "0 4px 4px 0" : 0, ...growX(120 + i * 80) }} />
                <Tip>{b.name} · {b.v} · {b.pct}%</Tip>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: "grid", gap: 0.4, mt: 0.9 }}>
            {parts.map((b, i) => (
              <Box key={b.name} sx={{ display: "grid", gridTemplateColumns: "10px 1fr 56px 36px", alignItems: "center", columnGap: 0.9 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: VIZ.cat[i] }} />
                <Typography sx={{ fontSize: 11.5, color: T.text }}>{b.name}</Typography>
                <Typography sx={{ fontSize: 11.5, color: T.text, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.v}</Typography>
                <Typography sx={{ fontSize: 10.5, color: T.textFaint, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.pct}%</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
      {props.insight && <Insight sx={{ mt: 1.2 }}>{props.insight}</Insight>}
    </Card>
  );
}

// ================= "Spin up a workspace for client X" =================
// The org tree with the new workspace slotted in, its config and isolation.
export function WorkspaceSetup({ props, emit }: { props: P; emit: Emit }) {
  const [copy, setCopy] = React.useState<boolean>(!!props.copy?.on);
  const ws: P[] = [...(props.existing || []), { ...props.created, isNew: true }];
  return (
    <Card>
      <Head icon={<AddBusinessOutlinedIcon sx={{ fontSize: 15 }} />} title={props.title} sub={props.sub} />
      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <ApartmentRoundedIcon sx={{ fontSize: 15, color: T.textMuted }} />
          <Typography sx={{ fontSize: 12, color: T.text }}>{props.org}</Typography>
          <Box sx={{ fontSize: 9.5, color: T.textMuted, border: `1px solid ${T.border}`, bgcolor: T.surface, px: 0.5, borderRadius: 0.75 }}>{props.plan}</Box>
        </Box>
        <Box sx={{ position: "relative", pl: 2.3, mt: 0.4 }}>
          <Box sx={{ position: "absolute", left: 7, top: 0, bottom: 15, width: "1px", bgcolor: T.borderStrong }} />
          {ws.map((w, i) => (
            <Box key={w.name} sx={{ position: "relative", display: "flex", alignItems: "center", gap: 0.8, mt: 0.5, px: 0.7, py: 0.5, borderRadius: 1.25, bgcolor: w.isNew ? T.accentTint : "transparent", border: `1px solid ${w.isNew ? T.accentTintStrong : "transparent"}`, ...rise(w.isNew ? 260 : i * 50) }}>
              <Box sx={{ position: "absolute", left: -11, top: "50%", width: 10, height: "1px", bgcolor: T.borderStrong }} />
              <Box sx={{ width: 20, height: 20, borderRadius: 1, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 500, bgcolor: w.isNew ? T.accent : "#E6E9EE", color: w.isNew ? "#fff" : T.textMuted }}>{w.name.slice(0, 2).toUpperCase()}</Box>
              <Typography sx={{ fontSize: 12, color: T.text }}>{w.name}</Typography>
              {w.isNew && <Box sx={{ fontSize: 9.5, fontWeight: 500, color: T.accentText, bgcolor: T.surface, border: `1px solid ${T.accentTintStrong}`, px: 0.5, borderRadius: 0.75 }}>New</Box>}
              <Typography sx={{ fontSize: 10.5, color: T.textFaint, ml: "auto" }}>{w.isNew ? "empty — ready to set up" : `${w.pipes} pipelines`}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.6, mt: 1.1 }}>
        {(props.config as P[]).map((c) => (
          <Box key={c.k} sx={{ px: 0.9, py: 0.7, borderRadius: 1.5, border: `1px solid ${T.border}`, minWidth: 0 }}>
            <Eyebrow>{c.k}</Eyebrow>
            <Typography sx={{ fontSize: 11.5, color: T.text, mt: 0.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.v}>{c.v}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center", mt: 1.1 }}>
        <Eyebrow sx={{ mr: 0.4 }}>Isolated to {props.created.name}</Eyebrow>
        {(props.isolation as string[]).map((x) => (
          <Box key={x} sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, fontSize: 10.5, color: T.textMuted, px: 0.6, py: 0.2, borderRadius: 1, border: `1px solid ${T.border}` }}><LockOutlinedIcon sx={{ fontSize: 11 }} />{x}</Box>
        ))}
      </Box>
      {props.shared && <Typography sx={{ fontSize: 11, color: T.textFaint, mt: 0.6 }}>{props.shared}</Typography>}

      {props.copy && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.1, p: 1, borderRadius: 1.5, border: `1px solid ${copy ? T.accentTintStrong : T.border}`, bgcolor: copy ? T.accentTint : T.surface, transition: TR }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 12, color: T.text }}>{props.copy.label}</Typography>
            <Typography sx={{ fontSize: 10.5, color: T.textMuted }}>{props.copy.sub}</Typography>
          </Box>
          <Toggle checked={copy} onChange={setCopy} />
        </Box>
      )}
      <Actions emit={emit}><PriBtn onClick={() => emit.text(copy ? props.sendWithCopy : props.send)}>Create workspace</PriBtn></Actions>
    </Card>
  );
}

// ================= "Which client is using the most credits?" =================
// Part-to-whole: one stacked bar (categorical, 2px gaps) + a legend that is the table.
export function WorkspaceShare({ props }: { props: P; emit: Emit }) {
  const rows: P[] = props.rows || [];
  return (
    <Card>
      <Head icon={<DataUsageRoundedIcon sx={{ fontSize: 15 }} />} title={props.title} sub={props.sub} right={<Typography sx={{ fontSize: 11, color: T.textFaint }}>{props.total}</Typography>} />
      <Box sx={{ display: "flex", gap: "2px", height: 24, mb: 1.1 }}>
        {rows.map((r, i) => (
          <Box key={r.name} tabIndex={0} aria-label={`${r.name}: ${r.pct}%`} sx={{ position: "relative", flex: `${r.pct} 1 0`, outline: "none", ...hoverTip }}>
            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: VIZ.cat[i], borderRadius: i === 0 ? "4px 0 0 4px" : i === rows.length - 1 ? "0 4px 4px 0" : 0, ...growX(i * 90) }}>
              {r.pct >= 9 && <Typography sx={{ fontSize: 10.5, fontWeight: 500, color: inkOn(VIZ.cat[i]) }}>{r.pct}%</Typography>}
            </Box>
            <Tip>{r.name} · {r.credits} · {r.pct}%</Tip>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "12px 1fr 72px 64px 56px", columnGap: 1, px: 0.25, pb: 0.4, borderBottom: `1px solid ${T.border}` }}>
        <Box /><Eyebrow>Workspace</Eyebrow><Eyebrow sx={{ textAlign: "right" }}>Pipelines</Eyebrow><Eyebrow sx={{ textAlign: "right" }}>Credits</Eyebrow><Eyebrow sx={{ textAlign: "right" }}>vs Aug</Eyebrow>
      </Box>
      {rows.map((r, i) => (
        <Box key={r.name} sx={{ display: "grid", gridTemplateColumns: "12px 1fr 72px 64px 56px", columnGap: 1, alignItems: "center", px: 0.25, py: 0.6, borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none", ...rise(100 + i * 60) }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: VIZ.cat[i] }} />
          <Typography sx={{ fontSize: 12, color: T.text }}>{r.name}</Typography>
          <Typography sx={{ fontSize: 11.5, color: T.textMuted, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.pipes}</Typography>
          <Typography sx={{ fontSize: 11.5, color: T.text, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.credits}</Typography>
          <Typography sx={{ fontSize: 10.5, color: T.textMuted, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.up ? "▲" : "▼"} {r.trend}</Typography>
        </Box>
      ))}
      {props.insight && <Insight sx={{ mt: 1.2 }}>{props.insight}</Insight>}
    </Card>
  );
}

// ================= Receipt for a confirmed action =================
// Distinct from an info flag: an animated check, what happened, and what's next.
export function ActionReceipt({ props, emit }: { props: P; emit: Emit }) {
  const lines: P[] = props.lines || [];
  return (
    <Box sx={{ display: "flex", gap: 1.1, alignItems: "flex-start", p: 1.25, borderRadius: `${T.radius}px`, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow, ...rise() }}>
      <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={{ width: 22, height: 22, flexShrink: 0, mt: 0.1 }}>
        <circle cx="12" cy="12" r="11" fill={T.okBg} />
        <Box component="path" d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={T.ok} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
          sx={{ strokeDasharray: 16, strokeDashoffset: 16, animation: `kitDraw .5s ${EASE} .15s forwards`, "@keyframes kitDraw": { to: { strokeDashoffset: 0 } }, "@media (prefers-reduced-motion: reduce)": { animation: "none", strokeDashoffset: 0 } }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.text }}>{props.title}</Typography>
          <Typography sx={{ fontSize: 10.5, color: T.textFaint, ml: "auto", whiteSpace: "nowrap" }}>{props.meta ?? "Just now · by you"}</Typography>
        </Box>
        {props.body && <Typography sx={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, mt: 0.25 }}>{props.body}</Typography>}
        {lines.length > 0 && (
          <Box sx={{ mt: 0.7, display: "grid", gap: 0.25 }}>
            {lines.map((l) => (
              <Box key={l.k} sx={{ display: "flex", gap: 1 }}>
                <Typography sx={{ fontSize: 11, color: T.textFaint, width: 92, flexShrink: 0 }}>{l.k}</Typography>
                <Typography sx={{ fontSize: 11.5, color: T.text, fontFamily: l.mono ? "monospace" : "inherit" }}>{l.v}</Typography>
              </Box>
            ))}
          </Box>
        )}
        {(props.next || props.undo) && (
          <Box sx={{ display: "flex", gap: 0.25, mt: 0.7, ml: -0.6 }}>
            {props.next && <LinkBtn onClick={() => emit.text(props.next.send)}>{props.next.label}<EastRoundedIcon sx={{ fontSize: 12 }} /></LinkBtn>}
            {props.undo && <LinkBtn tone="muted" onClick={() => emit.text(props.undo.send)}><UndoRoundedIcon sx={{ fontSize: 12 }} />{props.undo.label}</LinkBtn>}
          </Box>
        )}
      </Box>
    </Box>
  );
}

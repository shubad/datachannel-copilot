"use client";

// Data, transform, activation and orchestration responses — each shows the shape
// of the thing being built (a grid, a schema, a lineage, a funnel, a mapping, a flow).

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import TransformRoundedIcon from "@mui/icons-material/TransformRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  Card, T, VIZ, EASE, TR, type Emit, type P,
  Head, Eyebrow, Mono, Note, Insight, Divider, Actions, Avatar, Meter, Seg, Tip, hoverTip,
  ChartFrame, rise, growX, fmtInt,
} from "./kit";

// Collapsible SQL with copy — shared by the transform and segment builders.
function SqlToggle({ sql }: { sql: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {} };
  return (
    <Box sx={{ mt: 1.1 }}>
      <Box component="button" type="button" onClick={() => setOpen((o) => !o)} sx={{ all: "unset", display: "inline-flex", alignItems: "center", gap: 0.3, fontSize: 11, fontWeight: 500, color: T.textMuted, cursor: "pointer", "&:hover": { color: T.text }, "&:focus-visible": { outline: `2px solid ${T.accent}` } }}>
        <ChevronRightRoundedIcon sx={{ fontSize: 15, transition: `transform .18s ${EASE}`, transform: open ? "rotate(90deg)" : "none" }} />
        {open ? "Hide SQL" : "View generated SQL"}
      </Box>
      {open && (
        <Box sx={{ position: "relative", mt: 0.6, ...rise() }}>
          <Box component="pre" sx={{ m: 0, bgcolor: "#0F1729", color: "#D6DEE8", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6, p: 1.25, pr: 7, borderRadius: 1.5, overflowX: "auto" }}>{sql}</Box>
          <Box component="button" type="button" onClick={copy} sx={{ all: "unset", position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 0.4, fontSize: 10.5, color: "#AEB8C7", cursor: "pointer", px: 0.7, py: 0.3, borderRadius: 1, bgcolor: "rgba(255,255,255,.06)", "&:hover": { color: "#fff" } }}>
            <ContentCopyRoundedIcon sx={{ fontSize: 12 }} />{copied ? "Copied" : "Copy"}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ================= "Show me a sample of X" =================
const TYPE_ICON: Record<string, React.ElementType> = { string: TextFieldsRoundedIcon, number: NumbersRoundedIcon, time: CalendarTodayRoundedIcon, enum: LabelOutlinedIcon };
export function DataPreview({ props, emit }: { props: P; emit: Emit }) {
  const cols: P[] = props.columns || [];
  const rows: P[] = props.rows || [];
  return (
    <Card>
      <Head icon={props.icon} title={<Mono sx={{ fontSize: 13 }}>{props.table}</Mono>} sub={`${props.dest} · ${props.path}`} />
      <Box sx={{ display: "flex", gap: 2, mb: 1.1, px: 0.25 }}>
        {(props.meta as P[]).map((m) => (
          <Box key={m.k}><Eyebrow>{m.k}</Eyebrow><Typography sx={{ fontSize: 12.5, color: T.text, mt: 0.1 }}>{m.v}</Typography></Box>
        ))}
      </Box>
      <Box sx={{ border: `1px solid ${T.border}`, borderRadius: 1.5, overflowX: "auto", scrollbarWidth: "thin" }}>
        <Box component="table" sx={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 560 }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ position: "sticky", left: 0, zIndex: 1, bgcolor: T.surfaceAlt, width: 28, borderBottom: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }} />
              {cols.map((c) => {
                const Icon = TYPE_ICON[c.type] ?? TextFieldsRoundedIcon;
                return (
                  <Box component="th" key={c.key} sx={{ textAlign: c.align || "left", px: 0.9, py: 0.6, bgcolor: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap", fontWeight: 500 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.45 }}>
                      <Icon sx={{ fontSize: 12, color: T.textFaint }} />
                      <Mono sx={{ fontSize: 11, color: T.text }}>{c.key}</Mono>
                      {c.pii && <Box title="PII — masked in previews" sx={{ display: "inline-flex", alignItems: "center", gap: 0.2, fontSize: 9, color: T.textMuted, bgcolor: "#EEF0F3", px: 0.45, py: 0.1, borderRadius: 0.75 }}><LockOutlinedIcon sx={{ fontSize: 10 }} />PII</Box>}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box component="tbody">
            {rows.map((r, i) => (
              <Box component="tr" key={i} sx={{ "&:hover td": { bgcolor: T.surfaceAlt } }}>
                <Box component="td" sx={{ position: "sticky", left: 0, bgcolor: T.surface, fontSize: 10, color: T.textFaint, textAlign: "center", borderRight: `1px solid ${T.border}`, borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none", fontVariantNumeric: "tabular-nums", transition: TR }}>{i + 1}</Box>
                {cols.map((c) => {
                  const v = r[c.key];
                  return (
                    <Box component="td" key={c.key} sx={{ textAlign: c.align || "left", px: 0.9, py: 0.55, fontSize: 11.5, color: T.text, whiteSpace: "nowrap", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none", fontVariantNumeric: "tabular-nums", transition: TR }}>
                      {v == null ? <Mono sx={{ fontSize: 10.5, color: T.textFaint }}>null</Mono>
                        : c.type === "enum" ? <Box component="span" sx={{ fontSize: 10.5, px: 0.6, py: 0.15, borderRadius: 0.75, bgcolor: "#EEF0F3", color: T.textMuted }}>{v}</Box>
                        : c.type === "string" && !c.plain ? <Mono sx={{ fontSize: 11 }}>{v}</Mono> : v}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 10.5, color: T.textFaint, mt: 0.7 }}>{props.showing}</Typography>
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= "What columns are in X?" =================
// Searchable schema with type, key/PII/audit badges, fill rate and a sample value.
export function SchemaExplorer({ props, emit }: { props: P; emit: Emit }) {
  const cols: P[] = props.columns || [];
  const [q, setQ] = React.useState("");
  const [tab, setTab] = React.useState("all");
  const count = (f: (c: P) => boolean) => cols.filter(f).length;
  const tabs: { value: string; label: string; f: (c: P) => boolean }[] = [
    { value: "all", label: `All`, f: () => true },
    { value: "business", label: `Business ${count((c) => !c.audit)}`, f: (c) => !c.audit },
    { value: "pii", label: `PII ${count((c) => !!c.pii)}`, f: (c) => !!c.pii },
    { value: "audit", label: `Audit ${count((c) => !!c.audit)}`, f: (c) => !!c.audit },
  ];
  const f = tabs.find((t) => t.value === tab)!.f;
  const shown = cols.filter((c) => f(c) && c.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Card>
      <Head icon={<TextFieldsRoundedIcon sx={{ fontSize: 15 }} />} title={<>Schema · <Mono sx={{ fontSize: 13 }}>{props.table}</Mono></>} sub={props.sub} />
      <Box sx={{ display: "flex", gap: 0.75, mb: 1, alignItems: "center", flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 150, display: "flex", alignItems: "center", gap: 0.5, height: 28, px: 0.9, borderRadius: 1.5, border: `1px solid ${T.border}`, transition: TR, "&:focus-within": { borderColor: T.accent, boxShadow: `0 0 0 3px ${T.accentTint}` } }}>
          <SearchRoundedIcon sx={{ fontSize: 14, color: T.textFaint }} />
          <InputBase value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter columns" inputProps={{ "aria-label": "Filter columns" }} sx={{ flex: 1, fontSize: 12 }} />
        </Box>
        <Seg value={tab} onChange={setTab} options={tabs.map((t) => ({ value: t.value, label: t.label }))} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "76px 1fr 92px 96px", columnGap: 1, px: 0.5, pb: 0.4, borderBottom: `1px solid ${T.border}` }}>
        <Eyebrow>Type</Eyebrow><Eyebrow>Column</Eyebrow><Eyebrow>Filled</Eyebrow><Eyebrow>Sample</Eyebrow>
      </Box>
      <Box sx={{ maxHeight: 260, overflowY: "auto", scrollbarWidth: "thin" }}>
        {shown.map((c, i) => {
          const low = c.fill < 50;
          return (
            <Box key={c.name} sx={{ display: "grid", gridTemplateColumns: "76px 1fr 92px 96px", columnGap: 1, alignItems: "center", px: 0.5, py: 0.6, borderBottom: i < shown.length - 1 ? `1px solid ${T.border}` : "none", transition: TR, "&:hover": { bgcolor: T.surfaceAlt } }}>
              <Mono sx={{ fontSize: 9.5, color: T.textMuted, bgcolor: "#EEF0F3", px: 0.55, py: 0.2, borderRadius: 0.75, justifySelf: "start" }}>{c.type}</Mono>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                <Mono sx={{ fontSize: 11.5, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</Mono>
                {c.key && <Box title="Primary key" sx={{ display: "inline-flex", color: T.accentText }}><KeyRoundedIcon sx={{ fontSize: 12 }} /></Box>}
                {c.pii && <Box title="Personal data" sx={{ display: "inline-flex", color: T.textMuted }}><LockOutlinedIcon sx={{ fontSize: 12 }} /></Box>}
                {c.audit && <Box sx={{ fontSize: 9, color: T.textMuted, border: `1px solid ${T.border}`, px: 0.45, borderRadius: 0.75, whiteSpace: "nowrap" }}>added by DataChannel</Box>}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Box sx={{ flex: 1 }}><Meter pct={c.fill} tone={low ? "warn" : "muted"} height={4} /></Box>
                <Typography sx={{ fontSize: 10, color: low ? T.warn : T.textMuted, fontVariantNumeric: "tabular-nums", width: 30, textAlign: "right" }}>{Math.round(c.fill)}%</Typography>
              </Box>
              <Mono sx={{ fontSize: 10.5, color: T.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.sample}</Mono>
            </Box>
          );
        })}
        {shown.length === 0 && <Typography sx={{ fontSize: 11.5, color: T.textFaint, py: 1.5, textAlign: "center" }}>No columns match “{q}”.</Typography>}
      </Box>
      <Typography sx={{ fontSize: 10.5, color: T.textFaint, mt: 0.7 }}>Showing {shown.length} of {props.total} columns</Typography>
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= "Build a table joining X and Y" =================
// Lineage: inputs merge into the transform, which materialises the output table.
function Node({ icon, title, meta, accent, width }: { icon: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; accent?: boolean; width: number }) {
  return (
    <Box sx={{ width, flexShrink: 0, display: "flex", alignItems: "center", gap: 0.75, px: 0.85, height: 40, borderRadius: 1.5, bgcolor: accent ? T.accentTint : T.surface, border: `1px solid ${accent ? T.accentTintStrong : T.border}`, boxShadow: T.shadow }}>
      <Box sx={{ fontSize: 13, color: accent ? T.accentText : T.textMuted, display: "flex", flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Mono sx={{ fontSize: 11, color: T.text, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</Mono>
        {meta && <Typography sx={{ fontSize: 9.5, color: T.textFaint, whiteSpace: "nowrap" }}>{meta}</Typography>}
      </Box>
    </Box>
  );
}
export function TransformBuilder({ props, emit }: { props: P; emit: Emit }) {
  const inputs: P[] = props.inputs || [];
  const line = T.borderStrong;
  return (
    <Card>
      <Head icon={<TransformRoundedIcon sx={{ fontSize: 15 }} />} title={<>Transformation · <Mono sx={{ fontSize: 13 }}>{props.name}</Mono></>} sub={props.sub} />
      <Box sx={{ display: "flex", alignItems: "center", py: 0.5, overflowX: "auto", ...rise() }}>
        <Box sx={{ display: "grid", gap: 1 }}>
          {inputs.map((n) => <Node key={n.name} width={150} icon={n.icon} title={n.name} meta={n.meta} />)}
        </Box>
        {inputs.length > 1 && (
          <Box sx={{ width: 14, alignSelf: "stretch", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Box sx={{ width: "100%", height: "calc(100% - 40px)", borderTop: `1.5px solid ${line}`, borderRight: `1.5px solid ${line}`, borderBottom: `1.5px solid ${line}`, borderRadius: "0 8px 8px 0" }} />
          </Box>
        )}
        <Box sx={{ width: 12, height: "1.5px", bgcolor: line, flexShrink: 0 }} />
        <Node width={104} icon={<TransformRoundedIcon sx={{ fontSize: 14 }} />} title={props.op} meta={props.opMeta} />
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, color: line }}>
          <Box sx={{ width: 12, height: "1.5px", bgcolor: line }} /><EastRoundedIcon sx={{ fontSize: 14, ml: -0.6 }} />
        </Box>
        <Node width={184} accent icon={<BarChartRoundedIcon sx={{ fontSize: 14 }} />} title={props.output.name} meta={props.output.est} />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center", mt: 1.1 }}>
        <Eyebrow sx={{ mr: 0.5 }}>Output columns</Eyebrow>
        {(props.output.cols as string[]).map((c, i) => (
          <Mono key={c} sx={{ fontSize: 10.5, px: 0.7, py: 0.2, borderRadius: 1, border: `1px solid ${T.border}`, color: T.text, ...rise(80 + i * 40) }}>{c}</Mono>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6, mt: 1.1 }}>
        {(props.config as P[]).map((c) => (
          <Box key={c.k} sx={{ px: 1, py: 0.7, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <Eyebrow>{c.k}</Eyebrow><Typography sx={{ fontSize: 12, color: T.text, mt: 0.2 }}>{c.v}</Typography>
          </Box>
        ))}
      </Box>
      {props.warn && <Insight sx={{ mt: 1.1 }}>{props.warn}</Insight>}
      <SqlToggle sql={props.sql} />
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= "Customers who spent over $100 …" =================
// The rule as a sentence, the audience funnel it produces, and sample members.
export function SegmentBuilder({ props, emit }: { props: P; emit: Emit }) {
  const funnel: P[] = props.funnel || [];
  const base = funnel[0]?.v || 1;
  return (
    <Card>
      <Head icon={<FilterAltOutlinedIcon sx={{ fontSize: 15 }} />} title={<>Segment · <Mono sx={{ fontSize: 13 }}>{props.name}</Mono></>} sub={props.sub} />
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.6, px: 1, py: 0.85, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, ...rise() }}>
        {(props.rules as P[]).map((r, i) => r.join
          ? <Box key={i} sx={{ fontSize: 9.5, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: T.textMuted, px: 0.6, py: 0.15, borderRadius: 0.75, bgcolor: "#E9ECF1" }}>{r.join}</Box>
          : r.text
            ? <Typography key={i} sx={{ fontSize: 12, color: T.textMuted }}>{r.text}</Typography>
            : (
              <Box key={i} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                <Box sx={{ fontSize: 11.5, color: T.text, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: T.surface, border: `1px solid ${T.border}` }}>{r.field}</Box>
                <Typography sx={{ fontSize: 12, color: T.textMuted }}>{r.op}</Typography>
                <Box sx={{ fontSize: 11.5, color: T.accentText, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: T.accentTint, border: `1px solid ${T.accentTintStrong}` }}>{r.value}</Box>
              </Box>
            ))}
      </Box>

      <Eyebrow sx={{ mt: 1.4, mb: 0.7 }}>Audience</Eyebrow>
      <Box sx={{ display: "grid", gap: 0.8 }}>
        {funnel.map((s, i) => {
          const lead = i === funnel.length - 1;
          const pct = (s.v / base) * 100;
          return (
            <Box key={i} sx={rise(80 + i * 90)}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.35 }}>
                <Typography sx={{ fontSize: 11.5, color: lead ? T.text : T.textMuted }}>{s.label}</Typography>
                <Typography sx={{ fontSize: lead ? 14 : 11.5, fontWeight: lead ? 500 : 400, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                  {fmtInt(s.v)}{i > 0 && <Box component="span" sx={{ fontSize: 10.5, fontWeight: 400, color: T.textFaint, ml: 0.6 }}>{pct < 10 ? pct.toFixed(1) : Math.round(pct)}% of all</Box>}
                </Typography>
              </Box>
              <Box sx={{ height: 12, borderRadius: "0 4px 4px 0", width: `${Math.max(pct, 1.5)}%`, bgcolor: lead ? VIZ.accent : VIZ.context, ...growX(120 + i * 90) }} />
            </Box>
          );
        })}
      </Box>

      {props.sample && (
        <>
          <Divider />
          <Eyebrow sx={{ mb: 0.6 }}>Sample members</Eyebrow>
          <Box sx={{ display: "grid", gap: 0.35 }}>
            {(props.sample as P[]).map((m, i) => (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: "24px 1fr 70px 60px", alignItems: "center", columnGap: 1, py: 0.3 }}>
                <Avatar name={m.name} size={22} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11.5, color: T.text }}>{m.name}</Typography>
                  <Mono sx={{ fontSize: 10, color: T.textFaint }}>{m.email}</Mono>
                </Box>
                <Typography sx={{ fontSize: 11.5, color: T.text, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.spend}</Typography>
                <Typography sx={{ fontSize: 10.5, color: T.textFaint, textAlign: "right" }}>{m.orders} orders</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
      {props.note && <Note>{props.note}</Note>}
      <SqlToggle sql={props.sql} />
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= Reverse-ETL sync =================
// Source → destination with a live flow line, then field-by-field mapping.
function SystemPill({ icon, sys, name }: { icon: React.ReactNode; sys: string; name: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 0.9, py: 0.6, borderRadius: 1.5, border: `1px solid ${T.border}`, bgcolor: T.surface, minWidth: 0, flex: "0 1 auto", boxShadow: T.shadow }}>
      <Box sx={{ fontSize: 15, flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Eyebrow>{sys}</Eyebrow>
        <Mono sx={{ fontSize: 11, color: T.text, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>{name}</Mono>
      </Box>
    </Box>
  );
}
export function SyncMapper({ props, emit }: { props: P; emit: Emit }) {
  const fields: P[] = props.fields || [];
  const stats: P[] = props.stats || [];
  return (
    <Card>
      <Head icon={<SendRoundedIcon sx={{ fontSize: 14 }} />} title={props.title} sub={props.sub} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.3, ...rise() }}>
        <SystemPill {...props.from} />
        <Box sx={{ flex: 1, minWidth: 24, position: "relative", height: 2, bgcolor: T.border, borderRadius: 1, overflow: "hidden" }}>
          <Box sx={{ position: "absolute", top: 0, width: 28, height: 2, borderRadius: 1, bgcolor: VIZ.accent, animation: "kitFlow 1.8s linear infinite", "@keyframes kitFlow": { from: { left: "-28px" }, to: { left: "100%" } }, "@media (prefers-reduced-motion: reduce)": { animation: "none", left: "40%" } }} />
        </Box>
        <SystemPill {...props.to} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr 112px", columnGap: 0.75, px: 0.25, mb: 0.4 }}>
        <Eyebrow>Warehouse field</Eyebrow><Box /><Eyebrow>{props.to.sys} field</Eyebrow><Box />
      </Box>
      <Box sx={{ display: "grid", gap: 0.5 }}>
        {fields.map((f, i) => (
          <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr 112px", columnGap: 0.75, alignItems: "center", ...rise(60 + i * 55) }}>
            <Mono sx={{ fontSize: 11, px: 0.8, py: 0.45, borderRadius: 1, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.src}</Mono>
            <Box sx={{ display: "flex", alignItems: "center", color: T.borderStrong }}><Box sx={{ flex: 1, height: "1.5px", bgcolor: T.borderStrong }} /><EastRoundedIcon sx={{ fontSize: 13, ml: -0.5 }} /></Box>
            <Mono sx={{ fontSize: 11, px: 0.8, py: 0.45, borderRadius: 1, bgcolor: f.key ? T.accentTint : T.surface, border: `1px solid ${f.key ? T.accentTintStrong : T.border}`, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.dst}</Mono>
            <Box sx={{ display: "flex", gap: 0.4, flexWrap: "wrap" }}>
              {f.key && <Box title={f.keyLabel || "Match key"} sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 9.5, color: T.accentText }}><KeyRoundedIcon sx={{ fontSize: 11 }} />{f.keyLabel || "key"}</Box>}
              {f.hashed && <Box title="SHA-256 hashed in your warehouse" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 9.5, color: T.textMuted }}><LockOutlinedIcon sx={{ fontSize: 11 }} />hashed</Box>}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 0.6, mt: 1.3 }}>
        {stats.map((s) => (
          <Box key={s.k} sx={{ px: 0.9, py: 0.7, borderRadius: 1.5, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, minWidth: 0 }}>
            <Eyebrow>{s.k}</Eyebrow>
            <Typography sx={{ fontSize: 12.5, color: T.text, mt: 0.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.v}</Typography>
            {s.meter != null && <Box sx={{ mt: 0.6 }}><Meter pct={s.meter} tone="accent" height={4} delay={200} /></Box>}
          </Box>
        ))}
      </Box>
      {props.note && (
        <Box sx={{ display: "flex", gap: 0.6, alignItems: "flex-start", mt: 1.1 }}>
          <ShieldOutlinedIcon sx={{ fontSize: 13, color: T.textMuted, mt: 0.2 }} />
          <Typography sx={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.5 }}>{props.note}</Typography>
        </Box>
      )}
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= Orchestration workflow =================
const NODE_ICON: Record<string, React.ElementType> = { trigger: BoltRoundedIcon, extract: CloudDownloadOutlinedIcon, transform: TransformRoundedIcon, decision: CallSplitRoundedIcon, activate: SendRoundedIcon, end: StopCircleOutlinedIcon };
const NODE_KIND: Record<string, string> = { trigger: "Trigger", extract: "Extract", transform: "Transform", decision: "Decision", activate: "Activate", end: "End" };
function FlowNode({ n, delay }: { n: P; delay: number }) {
  const Icon = NODE_ICON[n.type] ?? BoltRoundedIcon;
  const decision = n.type === "decision";
  const quiet = n.type === "end";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, px: 0.9, py: 0.75, borderRadius: 1.5, border: `1px solid ${decision ? T.accentTintStrong : T.border}`, bgcolor: decision ? T.accentTint : quiet ? T.surfaceAlt : T.surface, boxShadow: quiet ? "none" : T.shadow, ...rise(delay) }}>
      <Box sx={{ width: 26, height: 26, borderRadius: 1.25, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: decision ? T.surface : T.surfaceAlt, border: `1px solid ${decision ? T.accentTintStrong : T.border}`, color: decision ? T.accentText : T.textMuted }}>
        <Icon sx={{ fontSize: 14, transform: decision ? "rotate(90deg)" : "none" }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, color: quiet ? T.textMuted : T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</Typography>
        {n.meta && <Typography sx={{ fontSize: 10.5, color: T.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.meta}</Typography>}
      </Box>
      <Eyebrow sx={{ flexShrink: 0 }}>{NODE_KIND[n.type]}</Eyebrow>
    </Box>
  );
}
function Down() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", color: T.borderStrong, height: 18, justifyContent: "flex-end" }}>
      <Box sx={{ width: "1.5px", flex: 1, bgcolor: T.borderStrong }} /><SouthRoundedIcon sx={{ fontSize: 12, mt: -0.6 }} />
    </Box>
  );
}
export function WorkflowDAG({ props, emit }: { props: P; emit: Emit }) {
  const nodes: P[] = props.nodes || [];
  const line = T.borderStrong;
  return (
    <Card>
      <Head icon={<CallSplitRoundedIcon sx={{ fontSize: 15, transform: "rotate(90deg)" }} />} title={props.name} sub={props.schedule} />
      <Box sx={{ px: 0.25 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Down />}
            <FlowNode n={n} delay={i * 90} />
            {n.type === "decision" && (
              <>
                <Box sx={{ position: "relative", height: 26 }}>
                  <Box sx={{ position: "absolute", left: "50%", top: 0, height: 9, width: "1.5px", bgcolor: line }} />
                  <Box sx={{ position: "absolute", left: "25%", right: "25%", top: 9, height: "1.5px", bgcolor: line }} />
                  <Box sx={{ position: "absolute", left: "25%", top: 9, bottom: 0, width: "1.5px", bgcolor: line }} />
                  <Box sx={{ position: "absolute", right: "25%", top: 9, bottom: 0, width: "1.5px", bgcolor: line }} />
                  {[{ l: "Yes", side: "left" }, { l: "No", side: "right" }].map((b) => (
                    <Box key={b.l} sx={{ position: "absolute", [b.side]: "25%", top: 4, transform: b.side === "left" ? "translateX(-50%)" : "translateX(50%)", fontSize: 9.5, fontWeight: 500, color: T.textMuted, bgcolor: T.surface, px: 0.5, border: `1px solid ${T.border}`, borderRadius: 0.75, lineHeight: 1.5 }}>{b.l}</Box>
                  ))}
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  <FlowNode n={n.yes} delay={(i + 1) * 90} />
                  <FlowNode n={n.no} delay={(i + 1) * 90 + 40} />
                </Box>
              </>
            )}
          </React.Fragment>
        ))}
      </Box>
      {props.guards && (
        <Box sx={{ display: "grid", gap: 0.4, mt: 1.3 }}>
          {(props.guards as string[]).map((g) => (
            <Box key={g} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <ShieldOutlinedIcon sx={{ fontSize: 13, color: T.textMuted }} />
              <Typography sx={{ fontSize: 11.5, color: T.textMuted }}>{g}</Typography>
            </Box>
          ))}
        </Box>
      )}
      <Actions actions={props.actions} emit={emit} />
    </Card>
  );
}

// ================= Ranked leaderboard (analytics answers) =================
export function RankedBars({ props, emit }: { props: P; emit: Emit }) {
  const rows: P[] = props.rows || [];
  const max = Math.max(1, ...rows.map((r) => r.v as number));
  const money = (n: number) => `$${(n / 1000).toFixed(1)}K`;
  return (
    <ChartFrame
      icon={<BarChartRoundedIcon sx={{ fontSize: 15 }} />}
      title={props.title}
      sub={props.sub}
      table={{
        columns: [{ key: "rank", label: "#" }, { key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "rev", label: "Revenue", align: "right" }, { key: "units", label: "Units", align: "right" }, { key: "delta", label: "vs Jul", align: "right" }],
        rows: rows.map((r, i) => ({ ...r, rank: i + 1, rev: `$${fmtInt(r.v)}` })),
      }}
      footer={
        <>
          {props.insight && <Insight sx={{ mt: 1.2 }}>{props.insight}</Insight>}
          {props.handoff && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1.1 }}>
              <Box component="img" src="/dc-icon.png" alt="" sx={{ width: 14, height: 14 }} />
              <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{props.handoff}</Typography>
            </Box>
          )}
          <Actions actions={props.actions} emit={emit} />
        </>
      }
    >
      <Box sx={{ display: "grid", gap: 0.85 }}>
        {rows.map((r, i) => {
          const lead = i === 0;
          return (
            <Box key={i} sx={{ display: "grid", gridTemplateColumns: "16px 150px 1fr 44px", alignItems: "center", columnGap: 1, ...rise(i * 60) }}>
              <Typography sx={{ fontSize: 11, color: lead ? T.text : T.textFaint, fontVariantNumeric: "tabular-nums" }}>{i + 1}</Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</Typography>
                <Mono sx={{ fontSize: 10, color: T.textFaint }}>{r.sku} · {r.units} units</Mono>
              </Box>
              <Box tabIndex={0} aria-label={`${r.name}: ${money(r.v)}`} sx={{ position: "relative", display: "flex", alignItems: "center", gap: 0.6, height: 24, outline: "none", ...hoverTip }}>
                <Box sx={{ height: 14, width: `${(r.v / max) * 74}%`, bgcolor: lead ? VIZ.accent : VIZ.context, borderRadius: "0 4px 4px 0", ...growX(80 + i * 60) }} />
                <Typography sx={{ fontSize: 11, color: T.text, fontVariantNumeric: "tabular-nums" }}>{money(r.v)}</Typography>
                <Tip sx={{ left: "30%" }}>${fmtInt(r.v)} · {r.units} units</Tip>
              </Box>
              <Typography sx={{ fontSize: 10.5, textAlign: "right", color: r.up ? T.ok : T.danger, fontVariantNumeric: "tabular-nums" }}>{r.up ? "▲" : "▼"} {r.delta}</Typography>
            </Box>
          );
        })}
      </Box>
    </ChartFrame>
  );
}

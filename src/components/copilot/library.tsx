"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AddToPhotosOutlinedIcon from "@mui/icons-material/AddToPhotosOutlined";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { SOURCES, WAREHOUSES } from "@/lib/copilot/catalog";
import { T } from "@/lib/copilot/tokens";
import type { Action } from "@/lib/copilot/engine";

export type Emit = { action: (a: Action) => void; text: (t: string) => void };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type P = Record<string, any>;

// ---------------- shared primitives ----------------
// Shared easing — one smooth curve everywhere so motion feels consistent.
export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
export const TR = `all .18s ${EASE}`;

export function Card({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: `${T.radius}px`, p: 1.5, boxShadow: T.shadow, ...sx }}>{children}</Box>;
}
export function PriBtn({ children, onClick, loading, disabled, full, sx }: { children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean; full?: boolean; sx?: object }) {
  const dead = disabled || loading;
  return (
    <Box onClick={() => !dead && onClick?.()} sx={{
      display: full ? "flex" : "inline-flex", width: full ? "100%" : "auto", justifyContent: "center", alignItems: "center", gap: 0.6, height: 31, px: 1.75, borderRadius: 1.5,
      bgcolor: dead ? "#F0D6C8" : T.accent, color: "#fff", fontSize: 12.5, fontWeight: 500, letterSpacing: 0.1, whiteSpace: "nowrap",
      cursor: dead ? "default" : "pointer", transition: TR,
      "&:hover": { bgcolor: dead ? "#F0D6C8" : T.accentHover, boxShadow: dead ? "none" : `0 2px 8px ${T.accent}55` }, "&:active": { transform: dead ? "none" : "scale(0.97)" }, ...sx,
    }}>{loading && <CircularProgress size={13} sx={{ color: "#fff" }} />}{children}</Box>
  );
}
export function GhostBtn({ children, onClick, active, sx }: { children: React.ReactNode; onClick?: () => void; active?: boolean; sx?: object }) {
  return (
    <Box onClick={onClick} sx={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 0.4, height: 31, px: 1.4, borderRadius: 1.5,
      border: `1px solid ${active ? T.accent : T.border}`, bgcolor: active ? T.accentTint : T.surface,
      color: active ? T.accentText : T.textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", transition: TR,
      "&:hover": { bgcolor: active ? T.accentTint : T.surfaceAlt, borderColor: active ? T.accent : T.borderStrong, color: active ? T.accentText : T.text }, "&:active": { transform: "scale(0.97)" }, ...sx,
    }}>{children}</Box>
  );
}
const inputSx = { width: "100%", height: 34, borderRadius: 1.5, border: `1px solid ${T.border}`, px: 1.25, fontSize: 13, color: T.text, bgcolor: T.surface, transition: `border-color .15s ${EASE}, box-shadow .15s ${EASE}`, "&:hover": { borderColor: T.borderStrong }, "&.Mui-focused": { borderColor: T.accent, boxShadow: `0 0 0 3px ${T.accentTint}` } };
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <Typography sx={{ fontSize: 11, color: T.textMuted, fontWeight: 500, mb: 0.4, letterSpacing: 0.1 }}>{children}{required && <Box component="span" sx={{ color: T.accent, ml: 0.25 }}>*</Box>}</Typography>;
}
function Tag({ children }: { children: React.ReactNode }) {
  return <Box component="span" sx={{ ml: 0.75, fontSize: 9.5, fontWeight: 500, color: T.accentText, bgcolor: T.accentTint, px: 0.6, py: 0.15, borderRadius: 0.75 }}>{children}</Box>;
}
function SelectTile({ selected, onClick, children }: { selected?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Box onClick={onClick} sx={{
      p: 1, borderRadius: 1.5, cursor: "pointer", transition: TR,
      border: `1px solid ${selected ? T.accent : T.border}`, bgcolor: selected ? T.accentTint : T.surface,
      "&:hover": { borderColor: selected ? T.accent : T.borderStrong, bgcolor: selected ? T.accentTint : T.surfaceAlt }, "&:active": { transform: "scale(0.99)" },
    }}>{children}</Box>
  );
}

// Collapsed "answered" summary — a completed step minimises to this one-liner
// with a Change affordance that re-expands the form.
function DoneBar({ label, value, onChange }: { label: string; value: React.ReactNode; onChange: () => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.85, px: 1.15, py: 0.65, borderRadius: 1.5, border: `1px solid ${T.border}`, bgcolor: T.surfaceAlt, animation: `dropIn .18s ${EASE}`, "@keyframes dropIn": { from: { opacity: 0, transform: "translateY(-3px)" }, to: { opacity: 1, transform: "none" } } }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 14, color: T.ok, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 10.5, color: T.textFaint, flexShrink: 0, textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</Typography>
      <Box onClick={onChange} sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, fontSize: 11, fontWeight: 500, color: T.accentText, cursor: "pointer", flexShrink: 0, px: 0.7, py: 0.3, borderRadius: 1, transition: TR, "&:hover": { bgcolor: T.accentTint } }}><EditOutlinedIcon sx={{ fontSize: 12 }} /> Change</Box>
    </Box>
  );
}

// The circular "N syncs" / "N Pipelines" counter on a credential row.
function CredBadge({ n, label }: { n: number; label: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.15 }}>
      <Box sx={{ minWidth: 22, height: 22, px: 0.5, borderRadius: "50%", bgcolor: T.accent, color: "#fff", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</Box>
      <Typography sx={{ fontSize: 9, color: T.textFaint }}>{label}</Typography>
    </Box>
  );
}

// A round icon button, coral-filled — the refresh / add controls on the creds header.
function RoundBtn({ children, onClick, tone = "accent" }: { children: React.ReactNode; onClick?: () => void; tone?: "accent" | "ghost" }) {
  const fill = tone === "accent";
  return (
    <Box onClick={onClick} sx={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", bgcolor: fill ? T.accent : "transparent", color: fill ? "#fff" : T.textMuted, border: fill ? "none" : `1px solid ${T.border}`, transition: TR, "&:hover": { bgcolor: fill ? T.accentHover : T.surfaceAlt }, "&:active": { transform: "scale(0.92)" } }}>{children}</Box>
  );
}

// Custom dropdown — matches the console's bordered select with a chevron.
function Dropdown({ value, options, onChange, placeholder }: { value?: string; options: string[]; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <Box ref={ref} sx={{ position: "relative" }}>
      <Box onClick={() => setOpen((o) => !o)} sx={{ display: "flex", alignItems: "center", height: 34, px: 1.25, borderRadius: 1.5, border: `1px solid ${open ? T.accent : T.border}`, bgcolor: T.surface, cursor: "pointer", transition: `border-color .15s ${EASE}, box-shadow .15s ${EASE}`, boxShadow: open ? `0 0 0 3px ${T.accentTint}` : "none", "&:hover": { borderColor: open ? T.accent : T.borderStrong } }}>
        <Typography sx={{ flex: 1, fontSize: 13, color: value ? T.text : T.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || placeholder}</Typography>
        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: T.textMuted, transform: open ? "rotate(180deg)" : "none", transition: `transform .18s ${EASE}` }} />
      </Box>
      {open && (
        <Box sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 1.5, boxShadow: T.shadowPop, maxHeight: 220, overflowY: "auto", transformOrigin: "top", animation: `dropIn .16s ${EASE}`, "@keyframes dropIn": { from: { opacity: 0, transform: "translateY(-4px) scale(0.98)" }, to: { opacity: 1, transform: "none" } } }}>
          {options.map((o) => (
            <Box key={o} onClick={() => { onChange(o); setOpen(false); }} sx={{ px: 1.25, py: 0.75, fontSize: 12.5, cursor: "pointer", color: o === value ? T.accentText : T.text, bgcolor: o === value ? T.accentTint : "transparent", transition: `background .12s ${EASE}`, "&:hover": { bgcolor: o === value ? T.accentTint : T.surfaceAlt } }}>{o}</Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Box onClick={() => onChange(!checked)} sx={{ width: 34, height: 20, borderRadius: 100, bgcolor: checked ? T.accent : "#D6DAE2", position: "relative", cursor: "pointer", transition: `background .2s ${EASE}`, flexShrink: 0 }}>
      <Box sx={{ position: "absolute", top: 2, left: checked ? 16 : 2, width: 16, height: 16, borderRadius: "50%", bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.22)", transition: `left .2s ${EASE}` }} />
    </Box>
  );
}

function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode }) {
  return (
    <Box onClick={() => onChange(!checked)} sx={{ display: "flex", alignItems: "center", gap: 0.9, cursor: "pointer", py: 0.35 }}>
      <Box sx={{ width: 16, height: 16, borderRadius: 0.75, flexShrink: 0, border: `1.5px solid ${checked ? T.accent : T.borderStrong}`, bgcolor: checked ? T.accent : T.surface, display: "flex", alignItems: "center", justifyContent: "center", transition: TR }}>{checked && <CheckCircleRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />}</Box>
      <Typography sx={{ fontSize: 12.5, color: T.text }}>{label}</Typography>
    </Box>
  );
}

const FLAG = {
  info: { bg: T.infoBg, bd: T.info, fg: "#20537F", Icon: InfoOutlinedIcon },
  warn: { bg: T.warnBg, bd: T.warn, fg: "#7A5200", Icon: WarningAmberRoundedIcon },
  danger: { bg: T.dangerBg, bd: T.danger, fg: "#8C2A26", Icon: ErrorOutlineRoundedIcon },
} as const;

// ---------------- flag / boundary / text ----------------
export function Flag({ props }: { props: P }) {
  const s = FLAG[(props.level ?? "info") as keyof typeof FLAG];
  return (
    <Box sx={{ bgcolor: s.bg, borderLeft: `3px solid ${s.bd}`, borderRadius: 1.5, px: 1.75, py: 1.25, my: 0.25 }}>
      {props.label && <Typography sx={{ fontSize: 10.5, fontWeight: 500, letterSpacing: ".07em", textTransform: "uppercase", color: s.fg, mb: 0.5, opacity: 0.9 }}>{props.label}</Typography>}
      <Typography sx={{ fontSize: 13.5, color: s.fg, lineHeight: 1.55 }}>{props.body}</Typography>
      {props.docHref && <Typography component="a" href={props.docHref} sx={{ fontSize: 12.5, color: s.fg, fontWeight: 500, mt: 0.75, display: "inline-block", textDecoration: "underline" }}>{props.docLabel || "Learn more"}</Typography>}
    </Box>
  );
}
export function ScopeBoundary({ props }: { props: P }) {
  return <Flag props={{ level: props.level ?? "info", label: props.title, body: props.body, docHref: props.docHref, docLabel: props.docLabel }} />;
}
export function TextBlock({ props }: { props: P }) {
  return <Typography sx={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{props.text}</Typography>;
}
export function Handoff({ props }: { props: P }) {
  return (
    <Card>
      <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>{props.title}</Typography>
      <Typography sx={{ fontSize: 13, color: T.textMuted, mb: 1.5 }}>{props.body}</Typography>
      <PriBtn>Open the console form</PriBtn>
    </Card>
  );
}

// ---------------- C3 source picker (gallery) ----------------
export function SourcePicker({ props, emit }: { props: P; emit: Emit }) {
  const [search, setSearch] = React.useState("");
  const [picked, setPicked] = React.useState<string | null>(props.preselect ?? null);
  const [done, setDone] = React.useState(false);
  const filtered = SOURCES.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));
  const chosen = SOURCES.find((s) => s.id === picked);
  if (done && chosen) return <DoneBar label="Source" value={<><span style={{ marginRight: 6 }}>{chosen.icon}</span>{chosen.name}</>} onChange={() => setDone(false)} />;
  return (
    <Card>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, border: `1px solid ${T.border}`, borderRadius: 1.5, px: 1.25, py: 0.5, mb: 1, "&:focus-within": { borderColor: T.accent, boxShadow: `0 0 0 3px ${T.accentTint}` } }}>
        <SearchOutlinedIcon sx={{ fontSize: 16, color: T.textFaint }} />
        <InputBase value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sources…" sx={{ fontSize: 13, flex: 1 }} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6 }}>
        {filtered.map((s) => {
          const sel = picked === s.id;
          return (
            <SelectTile key={s.id} selected={sel} onClick={() => { setPicked(s.id); setDone(true); emit.action({ type: "select-source", sourceId: s.id }); }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "#F1F3F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{s.icon}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{s.category}</Typography>
                </Box>
              </Box>
            </SelectTile>
          );
        })}
      </Box>
      {filtered.length === 0 && (
        <Box sx={{ py: 2, textAlign: "center" }}>
          <Typography sx={{ fontSize: 13, color: T.textMuted }}>No supported source matches “{search}”.</Typography>
          <Typography sx={{ fontSize: 12, color: T.textFaint, mt: 0.5 }}>We support {SOURCES.length} sources today. <Box component="span" sx={{ color: T.accent, cursor: "pointer" }}>Request a connector</Box></Typography>
        </Box>
      )}
    </Card>
  );
}

// ---------------- C23 warehouse picker (gallery) ----------------
export function WarehousePicker({ props, emit }: { props: P; emit: Emit }) {
  const [picked, setPicked] = React.useState<string | null>(props.preselect ?? null);
  const [done, setDone] = React.useState(false);
  const chosen = WAREHOUSES.find((w) => w.id === picked);
  if (done && chosen) return <DoneBar label="Warehouse" value={<><span style={{ marginRight: 6 }}>{chosen.icon}</span>{chosen.name}</>} onChange={() => setDone(false)} />;
  return (
    <Card>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6 }}>
        {WAREHOUSES.map((w) => {
          const sel = picked === w.id;
          return (
            <SelectTile key={w.id} selected={sel} onClick={() => { setPicked(w.id); setDone(true); emit.action({ type: "select-warehouse", warehouseId: w.id }); }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "#F1F3F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{w.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.text }}>{w.name}</Typography>
                  {w.recommended && <Typography sx={{ fontSize: 10, fontWeight: 500, color: T.accentText }}>Recommended · free</Typography>}
                </Box>
              </Box>
            </SelectTile>
          );
        })}
      </Box>
    </Card>
  );
}

// ---------------- connector-icon header (DC ↔ source) ----------------
function ConnectorHeader({ name, icon }: { name: string; icon: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: T.surface }}>
          <Box component="img" src="/dc-icon.png" alt="" sx={{ width: 18, height: 18 }} />
        </Box>
        <LinkRoundedIcon sx={{ fontSize: 15, color: T.textFaint }} />
        <Box sx={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: T.surface, fontSize: 17 }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontSize: 15, fontWeight: 500, color: T.text }}>Connect your {name}</Typography>
    </Box>
  );
}

// ---------------- C4 connect: existing creds (list) OR add new (form / auth) ----------------
export function ConnectCard({ props, emit }: { props: P; emit: Emit }) {
  const hasSaved = props.saved?.length > 0;
  const [mode, setMode] = React.useState<"saved" | "auth" | "form">(hasSaved ? "saved" : props.authAvailable ? "auth" : "form");
  const [name, setName] = React.useState("");
  const [vals, setVals] = React.useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    (props.credFields ?? []).forEach((f: P) => { if (f.default) o[f.key] = f.default; });
    return o;
  });
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [chosen, setChosen] = React.useState("");

  const finish = (label: string) => { setChosen(label); setDone(true); };
  const useCred = (n: string) => { finish(n); emit.action({ type: "select-credential", kind: props.kind, name: n }); };
  const doAuth = () => { setLoading(true); setTimeout(() => { setLoading(false); finish(`${name || "authorised"} · via ${props.name}`); emit.action({ type: "connect-submit", kind: props.kind, method: "auth" }); }, 1400); };
  const doSave = () => { setLoading(true); setTimeout(() => { setLoading(false); const nm = name || props.namePlaceholder; finish(nm); emit.action({ type: "connect-submit", kind: props.kind, method: "form", name: nm }); }, 1400); };

  if (done) return <DoneBar label={props.kind === "source" ? "Source" : "Warehouse"} value={<><span style={{ marginRight: 6 }}>{props.icon}</span>{props.name} · {chosen}</>} onChange={() => setDone(false)} />;

  return (
    <Card>
      {mode === "saved" && hasSaved ? (
        // ----- existing credentials list (console "Credentials" panel) -----
        <>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Credentials</Typography>
            <Box sx={{ display: "flex", gap: 0.6 }}>
              <RoundBtn tone="ghost"><RefreshRoundedIcon sx={{ fontSize: 15 }} /></RoundBtn>
              <RoundBtn onClick={() => setMode(props.authAvailable ? "auth" : "form")}><AddRoundedIcon sx={{ fontSize: 16 }} /></RoundBtn>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 11.5, color: T.textMuted, mb: 0.85 }}>Pick a {props.name} credential to use it, or add one with +.</Typography>
          <Box sx={{ display: "grid", gap: 0.5 }}>
            {props.saved.map((c: P) => (
              <Box key={c.name} onClick={() => useCred(c.name)} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.1, py: 0.7, borderRadius: 1.5, cursor: "pointer", border: `1px solid ${T.border}`, bgcolor: T.surface, transition: TR, "&:hover": { borderColor: T.accent, bgcolor: T.accentTint } }}>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, color: T.info, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <CredBadge n={c.syncs ?? 0} label="syncs" />
                  <CredBadge n={c.pipelines ?? 0} label="Pipelines" />
                  <EditOutlinedIcon sx={{ fontSize: 15, color: T.textFaint }} onClick={(e) => e.stopPropagation()} />
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 15, color: T.textFaint }} onClick={(e) => e.stopPropagation()} />
                </Box>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        // ----- add a new credential: "Connect your {source}" -----
        <>
          <ConnectorHeader name={props.name} icon={props.icon} />
          {hasSaved && <Box sx={{ mb: 1.5 }}><GhostBtn onClick={() => setMode("saved")} sx={{ height: 30, fontSize: 12 }}><WestRoundedIcon sx={{ fontSize: 14 }} /> Back to saved credentials</GhostBtn></Box>}

          {props.authAvailable && (
            <Box sx={{ display: "inline-flex", gap: 0.5, p: 0.4, bgcolor: "#F1F3F6", borderRadius: 100, mb: 1.75 }}>
              {(["auth", "form"] as const).map((m) => (
                <Box key={m} onClick={() => setMode(m)} sx={{ px: 1.5, py: 0.55, borderRadius: 100, cursor: "pointer", fontSize: 12.5, fontWeight: mode === m ? 500 : 500, color: mode === m ? "#fff" : T.textMuted, bgcolor: mode === m ? T.accent : "transparent" }}>{m === "auth" ? "Authorise" : "Enter details"}</Box>
              ))}
            </Box>
          )}

          {/* Name is always the first field */}
          <Box sx={{ mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.75 }}>
            <Box sx={{ flex: 1 }}>
              <Label required>Name</Label>
              <InputBase value={name} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_ ]/g, ""))} placeholder={props.namePlaceholder} sx={inputSx} />
            </Box>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: T.textFaint, mb: 1.25 }} />
          </Box>

          {mode === "auth" && props.authAvailable ? (
            <>
              <Typography sx={{ fontSize: 12.5, color: T.textMuted, mb: 1.5 }}>You’ll authorise on {props.name}’s side — no secrets are entered here.</Typography>
              <PriBtn full onClick={doAuth} loading={loading}>{!loading && <LinkRoundedIcon sx={{ fontSize: 16 }} />}{loading ? "Connecting…" : props.authLabel}</PriBtn>
            </>
          ) : (
            <>
              {(props.credFields ?? []).map((f: P) => (
                <Box key={f.key} sx={{ mb: 1.25 }}>
                  <Label required={f.required}>{f.label}</Label>
                  {f.kind === "select" ? (
                    <Dropdown value={vals[f.key]} options={f.options ?? []} placeholder={`Select ${f.label}`} onChange={(v) => setVals((s) => ({ ...s, [f.key]: v }))} />
                  ) : (
                    <InputBase type={f.kind === "password" ? "password" : "text"} value={vals[f.key] ?? ""} onChange={(e) => setVals((s) => ({ ...s, [f.key]: e.target.value }))} placeholder={f.placeholder} sx={inputSx} />
                  )}
                </Box>
              ))}
              <Box sx={{ mt: 1.75 }}><PriBtn full onClick={doSave} loading={loading}>{loading ? "Saving…" : "Save"}</PriBtn></Box>
            </>
          )}
          {props.secureNote && <Typography sx={{ fontSize: 11.5, color: T.textFaint, mt: 1.25 }}>{props.secureNote}</Typography>}
        </>
      )}
    </Card>
  );
}

// ---------------- C7 pipeline picker (Custom / Template + rich cards) ----------------
export function PipelinePicker({ props, emit }: { props: P; emit: Emit }) {
  const [tab, setTab] = React.useState<"custom" | "template">("custom");
  const [search, setSearch] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [picked, setPicked] = React.useState<P | null>(null);
  const list = props.reports.filter((r: P) => r.label.toLowerCase().includes(search.toLowerCase()));
  const pick = (r: P) => { setPicked(r); setDone(true); emit.action({ type: "select-report", reportId: r.id }); };
  if (done && picked) return <DoneBar label="Pipeline" value={picked.label} onChange={() => setDone(false)} />;
  return (
    <Card sx={{ p: 0, overflow: "hidden" }}>
      {/* Custom / Template tab header */}
      <Box sx={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
        {([["custom", "Custom Data Pipeline", "Create a custom data pipeline"], ["template", "Data Pipeline From Template", "Pre-defined template"]] as const).map(([id, title, sub]) => (
          <Box key={id} onClick={() => setTab(id)} sx={{ flex: 1, textAlign: "center", py: 1, cursor: "pointer", borderBottom: `2px solid ${tab === id ? T.accent : "transparent"}`, bgcolor: tab === id ? T.surface : T.surfaceAlt, transition: TR }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: tab === id ? T.text : T.textMuted }}>{title}</Typography>
            <Typography sx={{ fontSize: 10, color: T.textFaint }}>{sub}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 1.5 }}>
        {tab === "template" ? (
          <Typography sx={{ fontSize: 12, color: T.textMuted, py: 1 }}>No saved templates yet for {props.sourceName}. Create a custom pipeline first, then Save as Template at the end to reuse it.</Typography>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, border: `1px solid ${T.border}`, borderRadius: 1.5, px: 1.25, py: 0.5, mb: 1, "&:focus-within": { borderColor: T.accent, boxShadow: `0 0 0 3px ${T.accentTint}` } }}>
              <SearchOutlinedIcon sx={{ fontSize: 16, color: T.textFaint }} />
              <InputBase value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search data pipeline" sx={{ fontSize: 13, flex: 1 }} />
            </Box>
            <Box sx={{ display: "grid", gap: 0.5, maxHeight: 300, overflowY: "auto", pr: 0.25 }}>
              {list.map((r: P) => {
                const match = props.preselect === r.id && props.why;
                return (
                  <Box key={r.id} onClick={() => pick(r)} sx={{ display: "flex", gap: 1, p: 0.85, borderRadius: 1.5, cursor: "pointer", border: `1px solid ${match ? T.accent : T.border}`, bgcolor: match ? T.accentTint : T.surface, transition: TR, "&:hover": { borderColor: T.accent, bgcolor: T.accentTint } }}>
                    <Box sx={{ width: 26, height: 26, flexShrink: 0, borderRadius: 1.25, bgcolor: "#F1F3F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{props.sourceIcon}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: T.text }}>{r.label}</Typography>
                        {match && <Typography sx={{ fontSize: 10, color: T.accentText, fontWeight: 500 }}>· {props.why}</Typography>}
                      </Box>
                      <Typography sx={{ fontSize: 11.5, color: T.textMuted, mt: 0.1, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{r.desc}</Typography>
                    </Box>
                    <NorthEastRoundedIcon sx={{ fontSize: 14, color: T.textFaint, flexShrink: 0, alignSelf: "center" }} />
                  </Box>
                );
              })}
            </Box>
            <Typography sx={{ fontSize: 10.5, color: T.textFaint, mt: 0.75 }}>Pick a pipeline to continue.</Typography>
          </>
        )}
      </Box>
    </Card>
  );
}

// ---------------- transfer list (Dimension / Metric dual list) ----------------
function TransferList({ label, available, selected, onChange }: { label: React.ReactNode; available: string[]; selected: string[]; onChange: (sel: string[]) => void }) {
  const [qa, setQa] = React.useState("");
  const [qs, setQs] = React.useState("");
  const avail = available.filter((x) => !selected.includes(x));
  const fa = avail.filter((x) => x.toLowerCase().includes(qa.toLowerCase()));
  const fs = selected.filter((x) => x.toLowerCase().includes(qs.toLowerCase()));
  const panel = (items: string[], q: string, setQ: (v: string) => void, onItem: (x: string) => void) => (
    <Box sx={{ flex: 1, minWidth: 0, border: `1px solid ${T.border}`, borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.6, borderBottom: `1px solid ${T.border}`, bgcolor: T.surfaceAlt }}>
        <SearchOutlinedIcon sx={{ fontSize: 15, color: T.textFaint }} />
        <InputBase value={q} onChange={(e) => setQ(e.target.value)} placeholder="search" sx={{ fontSize: 12.5, flex: 1 }} />
      </Box>
      <Box sx={{ height: 128, overflowY: "auto" }}>
        {items.map((x) => (
          <Box key={x} onClick={() => onItem(x)} sx={{ px: 1.1, py: 0.5, fontSize: 11.5, color: T.info, cursor: "pointer", fontFamily: "monospace", transition: `background .12s ${EASE}`, "&:hover": { bgcolor: T.surfaceAlt } }}>{x}</Box>
        ))}
        {items.length === 0 && <Typography sx={{ px: 1.25, py: 1, fontSize: 11.5, color: T.textFaint }}>—</Typography>}
      </Box>
    </Box>
  );
  return (
    <Box sx={{ mb: 1.5 }}>
      <Label required>{label}</Label>
      <Box sx={{ display: "flex", gap: 1 }}>
        {panel(fa, qa, setQa, (x) => onChange([...selected, x]))}
        {panel(fs, qs, setQs, (x) => onChange(selected.filter((s) => s !== x)))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.75 }}>
        <Box onClick={() => onChange(Array.from(new Set([...selected, ...avail])))} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, height: 30, px: 1.25, borderRadius: 1.5, bgcolor: T.ink, color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Add All <EastRoundedIcon sx={{ fontSize: 15 }} /></Box>
        <Box onClick={() => onChange([])} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, height: 30, px: 1.25, borderRadius: 1.5, border: `1px solid ${T.border}`, color: T.textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer" }}><WestRoundedIcon sx={{ fontSize: 15 }} /> Remove All</Box>
      </Box>
    </Box>
  );
}

// ---------------- C8 report configuration (Dimension / Metric / Insert Mode / No of days) ----------------
const INSERT_MODE_OPTS = ["upsert", "append", "replace"];
export function ParameterCard({ props, emit }: { props: P; emit: Emit }) {
  const [dims, setDims] = React.useState<string[]>(props.selectedDimensions ?? props.dimensions ?? []);
  const [mets, setMets] = React.useState<string[]>(props.selectedMetrics ?? props.metrics ?? []);
  const [insertMode, setInsertMode] = React.useState<string>((props.insertMode ?? "UPSERT").toLowerCase());
  const [days, setDays] = React.useState<string>(String(props.noOfDays ?? 30));
  const [done, setDone] = React.useState(false);
  const submit = () => { setDone(true); emit.action({ type: "confirm-params", patch: { insertMode: insertMode.toUpperCase() as "UPSERT" | "APPEND" | "REPLACE", noOfDays: parseInt(days, 10) || undefined, dimensions: dims, metrics: mets } }); };
  if (done) return <DoneBar label="Config" value={`${dims.length + mets.length} fields · ${insertMode} · ${days}d`} onChange={() => setDone(false)} />;

  return (
    <Card>
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, mb: 0.25 }}>Report Configuration</Typography>
      {props.reportLabel && <Typography sx={{ fontSize: 11.5, color: T.textMuted, mb: 1.25 }}>{props.reportLabel}</Typography>}

      <TransferList label="Dimension" available={props.dimensions ?? []} selected={dims} onChange={setDims} />
      <TransferList label="Metric" available={props.metrics ?? []} selected={mets} onChange={setMets} />

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1 }}>
        <Box>
          <Label required>Insert Mode</Label>
          <Dropdown value={insertMode} options={INSERT_MODE_OPTS} onChange={setInsertMode} />
        </Box>
        <Box>
          <Label required>No of days</Label>
          <InputBase value={days} onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))} placeholder="No of days" sx={inputSx} />
        </Box>
      </Box>
      <Typography sx={{ fontSize: 10.5, color: T.textFaint, mb: 1.25 }}>Upsert = new & changed rows · days of data per run{props.noOfDaysMax != null ? ` (max ${props.noOfDaysMax})` : ""}.</Typography>

      <PriBtn full disabled={dims.length === 0 || !days} onClick={submit}>Continue</PriBtn>
    </Card>
  );
}

// ---------------- C9 scheduler (Manual Run Only / Select Schedule / Advanced) ----------------
const SCHEDULE_OPTS = ["Normal - Hourly", "Normal - Every 6 hours", "Normal - Daily", "Normal - Weekly", "Normal - Monthly", "Advanced Options - Hourly"];
export function SchedulePicker({ props, emit }: { props: P; emit: Emit }) {
  const [manual, setManual] = React.useState<boolean>(props.mode === "manual");
  const [sched, setSched] = React.useState<string>(props.selectSchedule ?? (props.frequency ? `Normal - ${props.frequency}` : "Normal - Daily"));
  const [adv, setAdv] = React.useState<Record<string, string>>({ Months: "Every month", Days: "Every day", Hours: "6", Minute: "0" });
  const [done, setDone] = React.useState(false);
  const isAdvanced = sched.startsWith("Advanced");
  const confirm = () => {
    setDone(true);
    if (manual) return emit.action({ type: "select-schedule", scheduleMode: "manual" });
    const freq = sched.replace(/^Normal - /, "");
    if (isAdvanced) return emit.action({ type: "select-schedule", scheduleMode: "advanced", frequency: "Hourly", schedule: `M:${adv.Months} D:${adv.Days} H:${adv.Hours} m:${adv.Minute}` });
    emit.action({ type: "select-schedule", scheduleMode: "normal", frequency: freq });
  };
  if (done) return <DoneBar label="Schedule" value={manual ? "Manual run only" : isAdvanced ? "Advanced schedule" : sched.replace(/^Normal - /, "")} onChange={() => setDone(false)} />;
  return (
    <Card>
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, mb: 1 }}>Schedule</Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.85, mb: 1.25 }}>
        <Toggle checked={manual} onChange={setManual} />
        <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: T.text }}>Manual Run Only</Typography>
      </Box>

      {!manual ? (
        <>
          <Box sx={{ mb: isAdvanced ? 1 : 0 }}>
            <Label>Select Schedule</Label>
            <Dropdown value={sched} options={SCHEDULE_OPTS} onChange={setSched} />
          </Box>
          {isAdvanced && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.85, mb: 0.5 }}>
              {(["Months", "Days", "Hours", "Minute"] as const).map((u) => (
                <Box key={u}>
                  <Label>{u}</Label>
                  <Dropdown
                    value={adv[u]}
                    options={u === "Months" ? ["Every month", "1", "2", "3", "6"] : u === "Days" ? ["Every day", "1", "7", "15"] : u === "Hours" ? ["0", "3", "6", "9", "12", "18"] : ["0", "15", "30", "45"]}
                    onChange={(v) => setAdv((s) => ({ ...s, [u]: v }))}
                  />
                </Box>
              ))}
            </Box>
          )}
        </>
      ) : (
        <Typography sx={{ fontSize: 12, color: T.textMuted, mb: 0.5 }}>Runs only when you trigger it with Run Pipeline.</Typography>
      )}

      <Box sx={{ mt: 1.5 }}><PriBtn full onClick={confirm}>Continue</PriBtn></Box>
    </Card>
  );
}

// ---------------- C21 dataset name (Data Pipeline Details) ----------------
export function NameCard({ props, emit }: { props: P; emit: Emit }) {
  const [name, setName] = React.useState<string>(props.datasetName ?? "");
  const [desc, setDesc] = React.useState<string>(props.datasetDescription ?? "");
  const [notify, setNotify] = React.useState<string>(props.notifyMode ?? "ERROR");
  const [runAfter, setRunAfter] = React.useState<boolean>(props.runAfterSave ?? true);
  const [backfill, setBackfill] = React.useState<boolean>(props.runBackfill ?? false);
  const [done, setDone] = React.useState(false);
  const submit = () => { setDone(true); emit.action({ type: "set-name", datasetName: name, datasetDescription: desc, notifyMode: notify as "ERROR" | "ERROR_SUCCESS", runAfterSave: runAfter, runBackfill: backfill }); };
  if (done) return <DoneBar label="Pipeline" value={name} onChange={() => setDone(false)} />;
  return (
    <Card>
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, mb: 1 }}>Name & save</Typography>

      <Box sx={{ mb: 1 }}>
        <InputBase value={name} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_]/g, "_"))} placeholder="Dataset Name" sx={{ ...inputSx, fontFamily: "monospace" }} />
        {props.prefixNote && <Typography sx={{ fontSize: 10.5, color: T.textFaint, mt: 0.4 }}>{props.prefixNote}</Typography>}
      </Box>
      <Box sx={{ mb: 1.25 }}>
        <InputBase value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" multiline minRows={2} sx={{ ...inputSx, height: "auto", py: 0.85, alignItems: "flex-start" }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.85, mb: 1, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 12, color: T.textMuted }}>Notify on :</Typography>
        <Box sx={{ display: "inline-flex", border: `1px solid ${T.border}`, borderRadius: 1.5, overflow: "hidden" }}>
          {[{ id: "ERROR", label: "ERROR ONLY" }, { id: "ERROR_SUCCESS", label: "ERROR & SUCCESS" }].map((n, i) => (
            <Box key={n.id} onClick={() => setNotify(n.id)} sx={{ px: 1.1, py: 0.5, fontSize: 11, fontWeight: 500, cursor: "pointer", borderLeft: i ? `1px solid ${T.border}` : "none", color: notify === n.id ? T.accentText : T.textMuted, bgcolor: notify === n.id ? T.accentTint : T.surface, transition: TR }}>{n.label}</Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 1.5, flexWrap: "wrap" }}>
        <CheckRow checked={runAfter} onChange={setRunAfter} label="Run after save" />
        <CheckRow checked={backfill} onChange={setBackfill} label="Run backfill after save" />
      </Box>

      <PriBtn full disabled={!name} onClick={submit}>Create pipeline</PriBtn>
    </Card>
  );
}

// ---------------- C24 congratulations (post-create next steps) ----------------
const NEXT_STEPS = [
  { key: "view-run-status", title: "View Run Status", body: "See the current run status of the pipeline. Preview your data after the run completes.", Icon: DescriptionOutlinedIcon, tint: "#EDE9FB", fg: "#6D5AE0" },
  { key: "create-another", title: "Add another Pipeline", body: "Add another pipeline with the same credentials.", Icon: AccountTreeOutlinedIcon, tint: "#E3F3F0", fg: "#1E9E6A" },
  { key: "connect-new", title: "Connect new data source", body: "Get data from another data source into your warehouse.", Icon: AddToPhotosOutlinedIcon, tint: T.accentTint, fg: T.accentText },
] as const;
export function CongratsCard({ props, emit }: { props: P; emit: Emit }) {
  return (
    <Card>
      <Typography sx={{ fontSize: 15, fontWeight: 500, mb: 0.25 }}>Congratulations! 🎉</Typography>
      <Typography sx={{ fontSize: 13, color: T.textMuted, mb: 1.5 }}>You successfully created a {props.source} pipeline {props.report}. What do you want to do next?</Typography>
      <Box sx={{ display: "grid", gap: 0.75 }}>
        {NEXT_STEPS.map((n) => (
          <Box key={n.key} onClick={() => emit.action({ type: n.key as Action["type"] } as Action)} sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 1.25, borderRadius: 2, border: `1px solid ${T.border}`, cursor: "pointer", transition: "all .15s", "&:hover": { borderColor: T.borderStrong, bgcolor: T.surfaceAlt } }}>
            <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: "50%", bgcolor: n.tint, display: "flex", alignItems: "center", justifyContent: "center" }}><n.Icon sx={{ fontSize: 19, color: n.fg }} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.text }}>{n.title}</Typography>
              <Typography sx={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.4 }}>{n.body}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// ---------------- C22 running status (date × hour run grid) ----------------
const RUN_STATES = [
  { key: "success", label: "SUCCESS", color: T.ok },
  { key: "partial", label: "PARTIAL SUCCESS", color: T.info },
  { key: "running", label: "RUNNING / QUEUED", color: T.accent },
  { key: "failed", label: "FAILED / ERROR / TIMEOUT", color: T.danger },
] as const;
const STATE_COLOR: Record<string, string> = { success: T.ok, partial: T.info, running: T.accent, failed: T.danger };

// Deterministic 7-day × 24-hour run history seeded from the dataset name.
function runHistory(seed: string): { day: number; hour: number; state: string }[] {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  const runs: { day: number; hour: number; state: string }[] = [];
  // today (day 0), hour 0 → the fresh run, still going
  runs.push({ day: 0, hour: 0, state: "running" });
  // a scatter of prior runs across the week for texture
  for (let d = 1; d < 7; d++) {
    const perDay = 1 + Math.floor(rand() * 2);
    for (let k = 0; k < perDay; k++) {
      const hour = Math.floor(rand() * 24);
      const r = rand();
      runs.push({ day: d, hour, state: r < 0.7 ? "success" : r < 0.85 ? "partial" : "failed" });
    }
  }
  return runs;
}
const DAYS = 7, HOURS = 24, CELL = 13, GAP = 3;
export function RunningCard({ props }: { props: P; emit: Emit }) {
  const s = props.summary || {};
  const draft = props.draft;
  const runs = React.useMemo(() => runHistory(props.seed || "x"), [props.seed]);
  // date labels: day 0 = today, going back
  const dates = React.useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let d = 0; d < DAYS; d++) { const dt = new Date(now); dt.setDate(now.getDate() - d); out.push(`${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`); }
    return out;
  }, []);
  const runAt = (day: number, hour: number) => runs.find((r) => r.day === day && r.hour === hour);

  return (
    <Card sx={{ p: 2.25 }}>
      {/* header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        {s.sourceIcon && <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: "#F1F3F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{s.sourceIcon}</Box>}
        <Typography sx={{ fontSize: 14, fontWeight: 500, fontFamily: "monospace", flex: 1, minWidth: 0 }}>{props.datasetName}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          {!draft && <CircularProgress size={13} sx={{ color: T.accent }} />}
          <Typography sx={{ fontSize: 11, fontWeight: 500, letterSpacing: ".04em", color: draft ? T.textMuted : T.accentText }}>{draft ? "DRAFT" : "RUNNING"}</Typography>
        </Box>
        <PriBtn sx={{ height: 32, px: 1.5, fontSize: 12.5 }}><PlayCircleFilledRoundedIcon sx={{ fontSize: 16 }} /> Run Pipeline</PriBtn>
      </Box>

      {(s.source || s.warehouse) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: T.textMuted, mb: 1.25, flexWrap: "wrap" }}>
          <Box component="span" sx={{ color: T.text }}>{s.source}</Box><Box component="span" sx={{ color: T.textFaint }}>→</Box><Box component="span" sx={{ color: T.text }}>{s.warehouse}</Box>
          {s.report && <Box component="span" sx={{ color: T.textFaint }}>· {s.report}</Box>}
          {s.schedule && <Box component="span" sx={{ color: T.textFaint }}>· {s.schedule}</Box>}
        </Box>
      )}

      {props.checks?.map((c: P, i: number) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75, py: 0.3 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 15, color: T.ok }} />
          <Typography sx={{ fontSize: 12.5, color: T.text }}>{c.label}</Typography>
        </Box>
      ))}

      {/* legend */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, mt: 1.75, mb: 1 }}>
        {RUN_STATES.map((r) => (
          <Box key={r.key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: r.color }} />
            <Typography sx={{ fontSize: 10, color: T.textMuted, fontWeight: 500 }}>{r.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Number of Runs — date × hour grid */}
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Box sx={{ display: "inline-block", minWidth: "max-content" }}>
          {/* hour header */}
          <Box sx={{ display: "flex", ml: `${32 + GAP}px`, mb: "3px" }}>
            {Array.from({ length: HOURS }).map((_, hHour) => (
              <Box key={hHour} sx={{ width: CELL, mr: `${GAP}px`, textAlign: "center", fontSize: 8, color: T.textFaint }}>{hHour % 3 === 0 ? hHour : ""}</Box>
            ))}
          </Box>
          {dates.map((dLabel, d) => (
            <Box key={d} sx={{ display: "flex", alignItems: "center", mb: `${GAP}px` }}>
              <Box sx={{ width: 32, fontSize: 8.5, color: T.textFaint, fontFamily: "monospace", mr: `${GAP}px`, textAlign: "right" }}>{dLabel}</Box>
              {Array.from({ length: HOURS }).map((_, hr) => {
                const run = runAt(d, hr);
                return (
                  <Box key={hr} sx={{ width: CELL, height: CELL, mr: `${GAP}px`, borderRadius: "3px", bgcolor: "#F0F1F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {run && <Box sx={{ width: CELL - 3, height: CELL - 3, borderRadius: "50%", bgcolor: STATE_COLOR[run.state], ...(run.state === "running" ? { animation: "rp 1.4s ease-in-out infinite", "@keyframes rp": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } } } : {}) }} />}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mt: 1.25, pt: 1.25, borderTop: `1px solid ${T.border}` }}>
        <Typography sx={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace", flex: 1 }}>{props.pipelineId} · next: {props.nextRun}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <GhostBtn sx={{ height: 32, fontSize: 12.5 }}><ContentCopyRoundedIcon sx={{ fontSize: 14 }} /> Copy Pipeline</GhostBtn>
        </Box>
      </Box>
    </Card>
  );
}

// ---------------- C18 existing-pipeline picker (edit / bulk) ----------------
const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  active: { bg: T.okBg, fg: T.ok }, paused: { bg: "#F1F3F6", fg: T.textMuted }, error: { bg: T.dangerBg, fg: T.danger },
};
const BULK_OPS = [{ op: "pause", label: "Pause" }, { op: "resume", label: "Resume" }, { op: "backfill", label: "Run backfill" }];
export function ExistingPipelinePicker({ props, emit }: { props: P; emit: Emit }) {
  const multi = props.multi;
  const [sel, setSel] = React.useState<Record<string, boolean>>({});
  const [op, setOp] = React.useState<string>("pause");
  const chosen = props.pipelines.filter((p: P) => sel[p.id]);
  const toggle = (id: string) => setSel((s) => ({ ...s, [id]: !s[id] }));
  return (
    <Card>
      {props.pipelines.map((p: P) => {
        const st = STATUS_STYLE[p.status] ?? STATUS_STYLE.active; const checked = !!sel[p.id];
        return (
          <Box key={p.id} onClick={() => (multi ? toggle(p.id) : emit.action({ type: "edit-pick", pipelineId: p.id }))} sx={{ display: "flex", alignItems: "center", gap: 1, py: 1, borderBottom: `1px solid ${T.border}`, cursor: "pointer", "&:hover": { bgcolor: T.surfaceAlt } }}>
            {multi && <Box sx={{ width: 18, height: 18, borderRadius: 0.75, flexShrink: 0, border: `1px solid ${checked ? T.accent : T.borderStrong}`, bgcolor: checked ? T.accent : T.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>{checked && <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "#fff" }} />}</Box>}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, fontFamily: "monospace" }}>{p.datasetName}</Typography>
              <Typography sx={{ fontSize: 11, color: T.textFaint }}>{p.source} · {p.meta}</Typography>
            </Box>
            <Box sx={{ fontSize: 10, fontWeight: 500, textTransform: "capitalize", bgcolor: st.bg, color: st.fg, px: 0.75, py: 0.3, borderRadius: 1.25 }}>{p.status}</Box>
          </Box>
        );
      })}
      {multi && (
        <Box sx={{ mt: 1.5 }}>
          <Label>Action</Label>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1.25 }}>{BULK_OPS.map((o) => <GhostBtn key={o.op} active={op === o.op} onClick={() => setOp(o.op)}>{o.label}</GhostBtn>)}</Box>
          <PriBtn disabled={chosen.length === 0} onClick={() => emit.action({ type: "bulk-apply", pipelineIds: chosen.map((p: P) => p.id), op })}>Apply to {chosen.length} pipeline{chosen.length !== 1 ? "s" : ""}</PriBtn>
        </Box>
      )}
    </Card>
  );
}

// ---------------- C19 edit panel ----------------
export function EditPanel({ props, emit }: { props: P; emit: Emit }) {
  return (
    <Card>
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, fontFamily: "monospace", mb: 1 }}>{props.datasetName}</Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", mb: 1.5 }}>
        <tbody>
          {props.rows.map((r: P) => (
            <Box component="tr" key={r.k} sx={{ "& td": { py: 0.5, borderBottom: `1px solid ${T.border}`, fontSize: 13 } }}>
              <Box component="td" sx={{ color: T.textMuted, width: "40%" }}>{r.k}</Box>
              <Box component="td" sx={{ fontFamily: "monospace", fontSize: 12, color: T.text, textTransform: "capitalize" }}>{r.v}</Box>
            </Box>
          ))}
        </tbody>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {props.actions.map((a: P, i: number) => (i === 0
          ? <PriBtn key={a.op} onClick={() => emit.action({ type: "edit-op", pipelineId: props.pipelineId, op: a.op })}>{a.label}</PriBtn>
          : <GhostBtn key={a.op} onClick={() => emit.action({ type: "edit-op", pipelineId: props.pipelineId, op: a.op })}>{a.label}</GhostBtn>))}
      </Box>
    </Card>
  );
}

// ---------------- C20 bulk result ----------------
export function BulkResult({ props }: { props: P; emit: Emit }) {
  return (
    <Card>
      <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 1 }}>{props.title}</Typography>
      {props.rows.map((r: P) => (
        <Box key={r.k} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6, borderBottom: `1px solid ${T.border}` }}>
          {r.ok ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: T.ok }} /> : <WarningAmberRoundedIcon sx={{ fontSize: 16, color: T.warn }} />}
          <Typography sx={{ fontSize: 13, fontFamily: "monospace", flex: 1 }}>{r.k}</Typography>
          <Typography sx={{ fontSize: 12, color: r.ok ? T.ok : T.warn }}>{r.v}</Typography>
        </Box>
      ))}
      {props.aside && <Typography sx={{ fontSize: 12, color: T.textFaint, mt: 1 }}>{props.aside}</Typography>}
    </Card>
  );
}

// ================= generic response components (monitoring / actions) =================
const CHIP: Record<string, { bg: string; fg: string }> = {
  success: { bg: T.okBg, fg: T.ok }, ok: { bg: T.okBg, fg: T.ok }, active: { bg: T.okBg, fg: T.ok }, healthy: { bg: T.okBg, fg: T.ok },
  error: { bg: T.dangerBg, fg: T.danger }, failed: { bg: T.dangerBg, fg: T.danger }, expired: { bg: T.dangerBg, fg: T.danger },
  running: { bg: T.accentTint, fg: T.accentText }, queued: { bg: T.accentTint, fg: T.accentText }, "re-running": { bg: T.accentTint, fg: T.accentText },
  partial: { bg: T.infoBg, fg: T.info }, info: { bg: T.infoBg, fg: T.info },
  paused: { bg: "#EEF0F3", fg: T.textMuted }, skipped: { bg: "#EEF0F3", fg: T.textMuted },
  stale: { bg: T.warnBg, fg: T.warn }, warning: { bg: T.warnBg, fg: T.warn }, expiring: { bg: T.warnBg, fg: T.warn }, timeout: { bg: T.warnBg, fg: T.warn },
};
export function StatusChip({ value }: { value: string }) {
  const c = CHIP[value.toLowerCase().split(" ")[0]] ?? { bg: "#EEF0F3", fg: T.textMuted };
  return <Box component="span" sx={{ display: "inline-block", fontSize: 9.5, fontWeight: 500, letterSpacing: ".02em", textTransform: "capitalize", color: c.fg, bgcolor: c.bg, px: 0.65, py: 0.2, borderRadius: 0.75, whiteSpace: "nowrap" }}>{value}</Box>;
}

export function StatRow({ props }: { props: P; emit: Emit }) {
  const items: P[] = props.items || [];
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 0.75 }}>
      {items.map((it, i) => (
        <Box key={i} sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 1.5, p: 1.1, boxShadow: T.shadow }}>
          <Typography sx={{ fontSize: 9.5, color: T.textFaint, textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 500 }}>{it.label}</Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 500, color: it.tone === "ok" ? T.ok : it.tone === "danger" ? T.danger : T.text, mt: 0.2, lineHeight: 1.1 }}>{it.value}</Typography>
          {it.sub && <Typography sx={{ fontSize: 10, color: T.textMuted, mt: 0.15 }}>{it.sub}</Typography>}
        </Box>
      ))}
    </Box>
  );
}

export function DataTable({ props }: { props: P; emit: Emit }) {
  const cols: P[] = props.columns || [];
  return (
    <Card>
      {props.title && <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.85 }}>{props.title}</Typography>}
      <Box sx={{ overflowX: "auto", mx: -0.5 }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: cols.length > 3 ? 460 : "auto" }}>
          <Box component="thead"><Box component="tr">
            {cols.map((c) => <Box component="th" key={c.key} sx={{ textAlign: c.align || "left", fontSize: 9.5, color: T.textFaint, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em", py: 0.5, px: 0.85, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{c.label}</Box>)}
          </Box></Box>
          <Box component="tbody">
            {props.rows.map((r: P, i: number) => (
              <Box component="tr" key={i} sx={{ "&:hover": { bgcolor: T.surfaceAlt } }}>
                {cols.map((c) => (
                  <Box component="td" key={c.key} sx={{ textAlign: c.align || "left", fontSize: 11.5, color: T.text, py: 0.55, px: 0.85, borderBottom: i < props.rows.length - 1 ? `1px solid ${T.border}` : "none", fontFamily: c.mono ? "monospace" : "inherit", whiteSpace: "nowrap" }}>
                    {c.key === props.statusKey ? <StatusChip value={String(r[c.key])} /> : r[c.key]}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {props.note && <Typography sx={{ fontSize: 11, color: T.textFaint, mt: 0.85 }}>{props.note}</Typography>}
    </Card>
  );
}

export function ListCard({ props }: { props: P; emit: Emit }) {
  return (
    <Card>
      {props.title && <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.85 }}>{props.title}</Typography>}
      <Box sx={{ display: "grid", gap: 0.5 }}>
        {props.rows.map((r: P, i: number) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.65, borderRadius: 1.5, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
            {r.icon && <Box sx={{ fontSize: 14, flexShrink: 0 }}>{r.icon}</Box>}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</Typography>
              {r.meta && <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{r.meta}</Typography>}
            </Box>
            {r.right && <Typography sx={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace", flexShrink: 0 }}>{r.right}</Typography>}
            {r.status && <StatusChip value={r.status} />}
          </Box>
        ))}
      </Box>
      {props.note && <Typography sx={{ fontSize: 11, color: T.textFaint, mt: 0.85 }}>{props.note}</Typography>}
    </Card>
  );
}

export function DetailCard({ props, emit }: { props: P; emit: Emit }) {
  const rows: P[] = props.rows || [];
  return (
    <Card>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: rows.length ? 1 : (props.note ? 0.75 : 0) }}>
        {props.icon && <Box sx={{ fontSize: 16, flexShrink: 0 }}>{props.icon}</Box>}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{props.title}</Typography>
          {props.subtitle && <Typography sx={{ fontSize: 11, color: T.textFaint }}>{props.subtitle}</Typography>}
        </Box>
        {props.status && <StatusChip value={props.status} />}
      </Box>
      {rows.length > 0 && (
        <Box sx={{ display: "grid", gap: 0 }}>
          {rows.map((r, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, py: 0.4, borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <Typography sx={{ fontSize: 11.5, color: T.textMuted, width: "40%", flexShrink: 0 }}>{r.k}</Typography>
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12, color: r.tone === "danger" ? T.danger : r.tone === "ok" ? T.ok : T.text, fontFamily: r.mono ? "monospace" : "inherit" }}>{r.v}</Typography>
            </Box>
          ))}
        </Box>
      )}
      {props.note && <Typography sx={{ fontSize: 11.5, color: T.textMuted, mt: 1, lineHeight: 1.5 }}>{props.note}</Typography>}
      {props.actions && (
        <Box sx={{ display: "flex", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}>
          {props.actions.map((a: P, i: number) => a.primary
            ? <PriBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</PriBtn>
            : <GhostBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</GhostBtn>)}
        </Box>
      )}
    </Card>
  );
}

export function CodeCard({ props, emit }: { props: P; emit: Emit }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(props.code); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {} };
  return (
    <Card>
      {props.title && <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>{props.title}</Typography>}
      <Box component="pre" sx={{ bgcolor: "#0F1729", color: "#D6DEE8", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6, p: 1.25, borderRadius: 1.5, overflowX: "auto", m: 0 }}>{props.code}</Box>
      {props.note && <Typography sx={{ fontSize: 11.5, color: T.textMuted, mt: 0.85 }}>{props.note}</Typography>}
      <Box sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}>
        {props.actions?.map((a: P, i: number) => a.primary
          ? <PriBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</PriBtn>
          : <GhostBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</GhostBtn>)}
        <GhostBtn onClick={copy}><ContentCopyRoundedIcon sx={{ fontSize: 13 }} />{copied ? "Copied" : "Copy"}</GhostBtn>
      </Box>
    </Card>
  );
}

// Terminal-style run log — the "finer detail" behind a failed / succeeded run.
// props: { title?, subtitle?, status?, run?, lines: [{ ts?, level?, text }], note?, actions? }
const LOG_LV: Record<string, string> = {
  info: "#8A97AC", debug: "#8A97AC", trace: "#6B778C",
  warn: "#E0A340", warning: "#E0A340",
  error: "#FF7A85", fatal: "#FF7A85",
  success: "#5FD08A", ok: "#5FD08A",
};
export function LogCard({ props, emit }: { props: P; emit: Emit }) {
  const lines: P[] = props.lines || [];
  const [open, setOpen] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lines.map((l) => `${l.ts ?? ""} ${(l.level ?? "").toUpperCase().padEnd(5)} ${l.text}`.trim()).join("\n"));
      setCopied(true); setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  const isErr = (lv?: string) => !!lv && ["error", "fatal"].includes(lv.toLowerCase());
  return (
    <Card>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.85 }}>
        <TerminalRoundedIcon sx={{ fontSize: 15, color: T.textMuted, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{props.title || "Run log"}</Typography>
          {props.subtitle && <Typography sx={{ fontSize: 11, color: T.textFaint }}>{props.subtitle}</Typography>}
        </Box>
        {props.status && <StatusChip value={props.status} />}
      </Box>
      <Box sx={{ bgcolor: "#0F1729", borderRadius: 1.5, overflow: "hidden", border: "1px solid #1E293B" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.55, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <Box key={c} sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c, opacity: 0.9 }} />)}</Box>
          <Typography sx={{ flex: 1, fontSize: 10, fontFamily: "monospace", color: "#5C6779", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{props.run || "run log"}</Typography>
          <Box onClick={() => setOpen((o) => !o)} sx={{ display: "flex", alignItems: "center", gap: 0.25, cursor: "pointer", color: "#8A97AC", "&:hover": { color: "#C7D0DD" } }}>
            <Typography sx={{ fontSize: 10, fontFamily: "monospace" }}>{open ? "hide" : `${lines.length} lines`}</Typography>
            {open ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 14 }} /> : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />}
          </Box>
        </Box>
        <Box sx={{ maxHeight: open ? 260 : 0, overflowY: "auto", transition: `max-height .22s ${EASE}`, scrollbarWidth: "thin", "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { background: "#2B3648", borderRadius: 3 } }}>
          <Box component="pre" sx={{ m: 0, py: 0.75, fontFamily: "monospace", fontSize: 11, lineHeight: 1.5 }}>
            {lines.map((l, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, px: 1.25, py: 0.15, whiteSpace: "pre-wrap", ...(isErr(l.level) ? { bgcolor: "rgba(255,122,133,.08)", borderLeft: "2px solid #FF7A85" } : { borderLeft: "2px solid transparent" }) }}>
                {l.ts && <Box component="span" sx={{ color: "#5C6779", flexShrink: 0 }}>{l.ts}</Box>}
                {l.level && <Box component="span" sx={{ color: LOG_LV[l.level.toLowerCase()] ?? "#8A97AC", flexShrink: 0, width: 40, textTransform: "uppercase" }}>{l.level}</Box>}
                <Box component="span" sx={{ flex: 1, color: isErr(l.level) ? "#FFC2C7" : "#CBD5E4", wordBreak: "break-word" }}>{l.text}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {props.note && <Typography sx={{ fontSize: 11.5, color: T.textMuted, mt: 0.85, lineHeight: 1.5 }}>{props.note}</Typography>}
      <Box sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}>
        {props.actions?.map((a: P, i: number) => a.primary
          ? <PriBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</PriBtn>
          : <GhostBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</GhostBtn>)}
        <GhostBtn onClick={copy}><ContentCopyRoundedIcon sx={{ fontSize: 13 }} />{copied ? "Copied" : "Copy log"}</GhostBtn>
      </Box>
    </Card>
  );
}

function DigestPill({ n, label, tone, bg }: { n: number; label: string; tone: string; bg: string }) {
  return <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.4, px: 1, py: 0.5, borderRadius: 1.5, bgcolor: bg }}><Typography sx={{ fontSize: 15, fontWeight: 500, color: tone }}>{n ?? 0}</Typography><Typography sx={{ fontSize: 10.5, fontWeight: 500, color: tone }}>{label}</Typography></Box>;
}
export function HealthDigest({ props, emit }: { props: P; emit: Emit }) {
  const c = props.counts || {};
  return (
    <Card sx={{ p: 1.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 500, flex: 1 }}>{props.title || "Pipeline health"}</Typography>
        <Typography sx={{ fontSize: 11, color: T.textFaint }}>{props.date}</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 0.75, mb: 1.25, flexWrap: "wrap" }}>
        <DigestPill n={c.ok} label="healthy" tone={T.ok} bg={T.okBg} />
        <DigestPill n={c.warn} label="warnings" tone={T.warn} bg={T.warnBg} />
        <DigestPill n={c.fail} label="failing" tone={T.danger} bg={T.dangerBg} />
      </Box>
      {props.stats && (
        <Box sx={{ display: "flex", gap: 2, mb: 1.25, pb: 1.25, borderBottom: `1px solid ${T.border}` }}>
          {props.stats.map((s: P, i: number) => (<Box key={i}><Typography sx={{ fontSize: 15, fontWeight: 500 }}>{s.value}</Typography><Typography sx={{ fontSize: 10, color: T.textFaint }}>{s.label}</Typography></Box>))}
        </Box>
      )}
      <Box sx={{ display: "grid", gap: 0.5 }}>
        {props.items.map((it: P, i: number) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.85, py: 0.3 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, bgcolor: it.level === "fail" ? T.danger : it.level === "warn" ? T.warn : T.ok }} />
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: T.text, flexShrink: 0 }}>{it.label}</Typography>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 11, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.detail}</Typography>
            {it.action && <Box onClick={() => emit.text(it.action)} sx={{ fontSize: 11, fontWeight: 500, color: T.accentText, cursor: "pointer", flexShrink: 0, "&:hover": { textDecoration: "underline" } }}>{it.actionLabel || "Fix"}</Box>}
          </Box>
        ))}
      </Box>
      {props.actions && <Box sx={{ display: "flex", gap: 0.75, mt: 1.25 }}>{props.actions.map((a: P, i: number) => a.primary ? <PriBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</PriBtn> : <GhostBtn key={i} onClick={() => a.send && emit.text(a.send)}>{a.label}</GhostBtn>)}</Box>}
    </Card>
  );
}

export { T };

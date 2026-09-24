"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { initialState, respondToUser, applyAction, type Action } from "@/lib/copilot/engine";
import type { ChatMessage, ComponentSpec, CopilotState } from "@/lib/copilot/types";
import { mentionables, type Mentionable } from "@/lib/copilot/catalog";
import { PROMPT_CATEGORIES } from "@/lib/copilot/scenarios";
import { T } from "@/lib/copilot/tokens";
import {
  SourcePicker, WarehousePicker, ConnectCard, PipelinePicker, ParameterCard,
  SchedulePicker, NameCard, RunningCard, CongratsCard, Handoff, ScopeBoundary, Flag, TextBlock,
  ExistingPipelinePicker, EditPanel, BulkResult,
  StatRow, DataTable, ListCard, DetailCard, CodeCard, HealthDigest, LogCard, type Emit,
} from "./library";
import { RESPONSE_REGISTRY } from "./responses";

// Fixed component library: id → renderer. The engine only ever names one of these.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.ComponentType<{ props: any; emit: Emit }>> = {
  C3: SourcePicker, C23: WarehousePicker, C4: ConnectCard, C7: PipelinePicker,
  C8: ParameterCard, C9: SchedulePicker, C21: NameCard, C22: RunningCard, C24: CongratsCard,
  C13: Handoff, C17: ScopeBoundary, C18: ExistingPipelinePicker, C19: EditPanel,
  C20: BulkResult, flag: Flag, text: TextBlock,
  stats: StatRow, table: DataTable, list: ListCard, detail: DetailCard, code: CodeCard, digest: HealthDigest, log: LogCard,
  ...RESPONSE_REGISTRY,
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const GREETING = "What do you want to do? I can build and run pipelines, watch their health, activate data, and more. Pick a prompt below or ask your own.";

// --- thread model (in-memory conversations) ---
type Thread = { id: string; title: string; messages: ChatMessage[]; state: CopilotState };
let _tid = 0;
const newId = () => `t${Date.now().toString(36)}_${(_tid++).toString(36)}`;
function makeThread(greeting: string): Thread {
  const id = newId();
  return { id, title: "New chat", messages: [{ role: "assistant", id: `greet_${id}`, text: greeting }], state: initialState() };
}
function deriveTitle(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 30 ? t.slice(0, 30).trimEnd() + "…" : t;
}

function BotAvatar() {
  return (
    <Box sx={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, bgcolor: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Box component="img" src="/dc-icon.png" alt="" sx={{ width: 18, height: 18 }} />
    </Box>
  );
}

// ---- thread switcher (sits above the composer) — dropdown of conversations ----
function ThreadBar({ threads, activeId, onSwitch, onNew, onClose, onReset }: { threads: Thread[]; activeId: string; onSwitch: (id: string) => void; onNew: () => void; onClose: (id: string) => void; onReset: () => void }) {
  const [open, setOpen] = React.useState(false);
  const active = threads.find((t) => t.id === activeId) ?? threads[0];
  const roundBtn = (onClick: () => void, title: string, children: React.ReactNode) => (
    <Box onClick={onClick} title={title} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", flexShrink: 0, cursor: "pointer", border: `1px solid ${T.border}`, color: T.textMuted, transition: `all .18s ${EASE}`, "&:hover": { borderColor: T.accent, color: T.accent, bgcolor: T.accentTint }, "&:active": { transform: "scale(0.92)" } }}>{children}</Box>
  );
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
        {/* trigger */}
        <Box onClick={() => setOpen((o) => !o)} sx={{
          display: "flex", alignItems: "center", gap: 0.6, height: 28, pl: 1, pr: 0.6, borderRadius: 100, cursor: "pointer", width: "100%",
          border: `1px solid ${open ? T.accent : T.border}`, bgcolor: open ? T.accentTint : T.surface, transition: `all .18s ${EASE}`,
          "&:hover": { borderColor: open ? T.accent : T.borderStrong, bgcolor: open ? T.accentTint : T.surfaceAlt },
        }}>
          <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 13, color: open ? T.accentText : T.textFaint, flexShrink: 0 }} />
          <Typography sx={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: open ? T.accentText : T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{active.title}</Typography>
          {threads.length > 1 && (
            <Box sx={{ fontSize: 9.5, fontWeight: 500, color: T.textFaint, bgcolor: T.surfaceAlt, borderRadius: 100, px: 0.55, py: 0.05, flexShrink: 0 }}>{threads.length}</Box>
          )}
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: open ? T.accentText : T.textFaint, flexShrink: 0, transition: `transform .18s ${EASE}`, transform: open ? "rotate(180deg)" : "none" }} />
        </Box>

        {/* dropdown — opens upward, above the composer */}
        {open && (
          <>
            <Box onClick={() => setOpen(false)} sx={{ position: "fixed", inset: 0, zIndex: 30 }} />
            <Box sx={{
              position: "absolute", left: 0, right: 0, bottom: "100%", mb: 0.6, zIndex: 31,
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 2, boxShadow: T.shadowPop, overflow: "hidden",
              maxHeight: 260, overflowY: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, py: 0.5,
              animation: `msgIn .16s ${EASE}`,
            }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: T.textFaint, px: 1.25, py: 0.5 }}>Conversations</Typography>
              {threads.map((t) => {
                const isActive = t.id === activeId;
                return (
                  <Box key={t.id} onClick={() => { onSwitch(t.id); setOpen(false); }} sx={{
                    display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.7, cursor: "pointer",
                    bgcolor: isActive ? T.accentTint : "transparent", transition: `background .14s ${EASE}`,
                    "&:hover": { bgcolor: isActive ? T.accentTint : T.surfaceAlt, "& .thr-x": { opacity: 1 } },
                  }}>
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 13, color: isActive ? T.accentText : T.textFaint, flexShrink: 0 }} />
                    <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 500, color: isActive ? T.accentText : T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</Typography>
                    {isActive && <CheckRoundedIcon sx={{ fontSize: 14, color: T.accent, flexShrink: 0 }} />}
                    {threads.length > 1 && (
                      <Box className="thr-x" onClick={(e) => { e.stopPropagation(); onClose(t.id); }} sx={{ display: "flex", width: 17, height: 17, borderRadius: "50%", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.textFaint, opacity: isActive ? 1 : 0, transition: `opacity .14s ${EASE}`, "&:hover": { bgcolor: "rgba(0,0,0,.06)", color: T.text } }}>
                        <CloseRoundedIcon sx={{ fontSize: 12 }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>
      {roundBtn(onReset, "Reset this chat", <RestartAltRoundedIcon sx={{ fontSize: 16 }} />)}
      {roundBtn(onNew, "New chat", <AddRoundedIcon sx={{ fontSize: 17 }} />)}
    </Box>
  );
}

// ---- prompt library (empty state) — everything you can ask, by category ----
function Suggestions({ onPick }: { onPick: (q: string) => void }) {
  const [active, setActive] = React.useState<string>(PROMPT_CATEGORIES[0].name);
  const cat = PROMPT_CATEGORIES.find((c) => c.name === active) ?? PROMPT_CATEGORIES[0];
  return (
    <Box sx={{ animation: `msgIn .3s ${EASE}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 1, ml: 0.25 }}>
        <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: T.accent }} />
        <Typography sx={{ fontSize: 11, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: T.textFaint }}>Things you can ask</Typography>
      </Box>
      {/* category chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
        {PROMPT_CATEGORIES.map((c) => {
          const on = c.name === active;
          return (
            <Box key={c.name} onClick={() => setActive(c.name)} sx={{
              px: 1, py: 0.4, borderRadius: 100, cursor: "pointer", fontSize: 11, fontWeight: on ? 500 : 500,
              border: `1px solid ${on ? T.accent : T.border}`, bgcolor: on ? T.accentTint : T.surface, color: on ? T.accentText : T.textMuted,
              transition: `all .18s ${EASE}`, "&:hover": { borderColor: on ? T.accent : T.borderStrong },
            }}>{c.name}</Box>
          );
        })}
      </Box>
      {/* prompts in the active category */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {cat.prompts.map((q) => (
          <Box key={q} onClick={() => onPick(q)} sx={{
            display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.85, borderRadius: 1.5, cursor: "pointer",
            border: `1px solid ${T.border}`, bgcolor: T.surface, transition: `all .18s ${EASE}`,
            "&:hover": { borderColor: T.accent, bgcolor: T.accentTint, transform: "translateX(2px)", "& .arrow": { opacity: 1, transform: "none" } },
          }}>
            <Typography sx={{ flex: 1, fontSize: 12.5, color: T.text }}>{q}</Typography>
            <NorthEastRoundedIcon className="arrow" sx={{ fontSize: 14, color: T.accent, opacity: 0, transform: "translate(-3px,3px)", transition: `all .18s ${EASE}` }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ComponentRenderer({ spec, emit }: { spec: ComponentSpec; emit: Emit }) {
  const C = REGISTRY[spec.id];
  if (!C) return null;
  return <C props={spec.props} emit={emit} />;
}

export default function CopilotChat({ greeting, compact = false }: { greeting?: string; compact?: boolean }) {
  const greet = greeting ?? GREETING;
  const [threads, setThreads] = React.useState<Thread[]>(() => [makeThread(greet)]);
  const [activeId, setActiveId] = React.useState<string>(() => threads[0].id);
  const [input, setInput] = React.useState("");
  const [menuIndex, setMenuIndex] = React.useState(0);
  const endRef = React.useRef<HTMLDivElement>(null);
  const activeIdRef = React.useRef(activeId);
  activeIdRef.current = activeId;

  const active = threads.find((t) => t.id === activeId) ?? threads[0];
  const showSuggestions = active.messages.length === 1 && active.messages[0].role === "assistant";

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active.messages, activeId]);

  const updateThread = (id: string, fn: (t: Thread) => Thread) => setThreads((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));

  const runTurn = (threadId: string, produce: (s: CopilotState) => { messages: ChatMessage[]; statePatch: Partial<CopilotState> }) => {
    updateThread(threadId, (t) => ({ ...t, messages: [...t.messages, { role: "assistant-typing", id: `typing_${Date.now()}` }] }));
    setTimeout(() => {
      updateThread(threadId, (t) => {
        const turn = produce(t.state);
        return { ...t, state: { ...t.state, ...turn.statePatch }, messages: [...t.messages.filter((x) => x.role !== "assistant-typing"), ...turn.messages] };
      });
    }, 650);
  };

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setInput("");
    const id = activeIdRef.current;
    updateThread(id, (t) => ({ ...t, title: t.title === "New chat" ? deriveTitle(text) : t.title, messages: [...t.messages, { role: "user", id: `u_${Date.now()}`, text }] }));
    runTurn(id, (s) => respondToUser(s, text));
  };

  const dispatch = (a: Action) => runTurn(activeIdRef.current, (s) => applyAction(s, a));
  const emit: Emit = { action: dispatch, text: sendText };

  const addThread = () => { const t = makeThread(greet); setThreads((ts) => [...ts, t]); setActiveId(t.id); setInput(""); };
  const resetThread = () => {
    const id = activeIdRef.current;
    updateThread(id, (t) => ({ id: t.id, title: "New chat", messages: [{ role: "assistant", id: `greet_${t.id}_${Date.now()}`, text: greet }], state: initialState() }));
    setInput("");
  };
  const closeThread = (id: string) => {
    setThreads((ts) => {
      if (ts.length <= 1) return ts;
      const next = ts.filter((t) => t.id !== id);
      if (id === activeIdRef.current) setActiveId(next[next.length - 1].id);
      return next;
    });
  };

  const applyMention = (m: Mentionable) => { setInput((cur) => insertMention(cur, m)); setMenuIndex(0); };
  const onInputKeyDown = (e: React.KeyboardEvent) => {
    const matches = mentionMatches(input);
    if (matches.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMenuIndex((i) => (i + 1) % matches.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMenuIndex((i) => (i - 1 + matches.length) % matches.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); applyMention(matches[Math.min(menuIndex, matches.length - 1)]); return; }
      if (e.key === "Escape") { e.preventDefault(); setInput((c) => c + " "); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(input); }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: compact ? "100%" : "calc(100vh - 92px)", maxWidth: compact ? "100%" : 720, mx: "auto", width: "100%", "@keyframes msgIn": { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } } }}>
      {/* stream */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 2, px: 1.5, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
        {active.messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <Box key={msg.id} sx={{ display: "flex", justifyContent: "flex-end", mb: 1.75, animation: `msgIn .28s ${EASE}` }}>
                <Box sx={{ bgcolor: "#EBEDF1", color: T.text, borderRadius: "13px 13px 4px 13px", px: 1.6, py: 0.95, maxWidth: "80%" }}>
                  <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>{msg.text}</Typography>
                </Box>
              </Box>
            );
          }
          if (msg.role === "assistant-typing") {
            return (
              <Box key={msg.id} sx={{ display: "flex", gap: 1.25, mb: 1.75, alignItems: "flex-start" }}>
                <BotAvatar />
                <Box sx={{ display: "flex", gap: 0.5, pt: 1 }}>
                  {[0, 1, 2].map((d) => (
                    <Box key={d} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: T.borderStrong, animation: "cbt 1.2s infinite", animationDelay: `${d * 0.2}s`, "@keyframes cbt": { "0%,60%,100%": { opacity: 0.3, transform: "scale(0.8)" }, "30%": { opacity: 1, transform: "scale(1)" } } }} />
                  ))}
                </Box>
              </Box>
            );
          }
          return (
            <Box key={msg.id} sx={{ display: "flex", gap: 1.25, mb: 1.75, alignItems: "flex-start", animation: `msgIn .3s ${EASE}` }}>
              <BotAvatar />
              <Box sx={{ maxWidth: 552, width: "100%", display: "flex", flexDirection: "column", gap: 0.85 }}>
                {msg.text && <Typography sx={{ fontSize: 13.5, lineHeight: 1.55, color: T.text, pt: 0.35 }}>{msg.text}</Typography>}
                {msg.components?.map((spec, i) => <ComponentRenderer key={i} spec={spec} emit={emit} />)}
                {showSuggestions && msg.id === active.messages[0].id && <Box sx={{ mt: 0.5 }}><Suggestions onPick={sendText} /></Box>}
              </Box>
            </Box>
          );
        })}
        <div ref={endRef} />
      </Box>

      {/* thread switcher — sits directly above the composer */}
      <Box sx={{ px: 1.5, pt: 1, pb: 0.75, borderTop: `1px solid ${T.border}` }}>
        <ThreadBar threads={threads} activeId={activeId} onSwitch={setActiveId} onNew={addThread} onClose={closeThread} onReset={resetThread} />
      </Box>

      {/* input */}
      <Box sx={{ px: 1.5, pb: compact ? 1.5 : 2.25, pt: 1, position: "relative" }}>
        <MentionMenu input={input} activeIndex={menuIndex} onPick={applyMention} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, border: `1px solid ${T.border}`, borderRadius: 2.5, px: 0.85, py: 0.4, bgcolor: T.surface, boxShadow: T.shadow, transition: `border-color .15s ${EASE}, box-shadow .15s ${EASE}`, "&:focus-within": { borderColor: T.accent, boxShadow: `0 0 0 3px ${T.accentTint}` } }}>
          <InputBase
            value={input}
            onChange={(e) => { setInput(e.target.value); setMenuIndex(0); }}
            onKeyDown={onInputKeyDown}
            placeholder="Describe what you need — @ to mention, /cred @name to reuse a credential"
            sx={{ flex: 1, fontSize: 13.5, py: 0.6, px: 0.85 }}
            fullWidth
          />
          <IconButton onClick={() => sendText(input)} disabled={!input.trim()} sx={{ bgcolor: input.trim() ? T.accent : "#E3E6EB", color: "#fff", width: 30, height: 30, transition: `background .18s ${EASE}, transform .12s ${EASE}`, "&:hover": { bgcolor: input.trim() ? T.accentHover : "#E3E6EB" }, "&:active": { transform: input.trim() ? "scale(0.92)" : "none" }, "&.Mui-disabled": { bgcolor: "#E3E6EB", color: "#fff" } }}>
            <ArrowUpwardRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// --- @-mention support ---
const KIND_LABEL: Record<Mentionable["kind"], string> = { source: "Source", destination: "Destination", pipeline: "Pipeline", cred: "Credential" };
const KIND_COLOR: Record<Mentionable["kind"], string> = { source: T.info, destination: T.warn, pipeline: T.ok, cred: T.accent };

function activeToken(input: string): { query: string; kinds: Mentionable["kind"][] } | null {
  const cred = input.match(/\/cred\s+@?([\w]*)$/i);
  if (cred) return { query: cred[1], kinds: ["cred"] };
  const at = input.match(/(?:^|\s)@([\w]*)$/);
  if (at) return { query: at[1], kinds: ["source", "destination", "pipeline", "cred"] };
  return null;
}
function mentionMatches(input: string): Mentionable[] {
  const tok = activeToken(input);
  if (!tok) return [];
  const q = tok.query.toLowerCase();
  return mentionables().filter((m) => tok.kinds.includes(m.kind) && (q === "" || m.label.toLowerCase().includes(q) || m.sub.toLowerCase().includes(q))).slice(0, 6);
}
function insertMention(input: string, m: Mentionable): string {
  if (/\/cred\s+@?[\w]*$/i.test(input)) return input.replace(/\/cred\s+@?[\w]*$/i, `/cred @${m.label} `);
  return input.replace(/(^|\s)@[\w]*$/, `$1@${m.label} `);
}
function MentionMenu({ input, activeIndex, onPick }: { input: string; activeIndex: number; onPick: (m: Mentionable) => void }) {
  const matches = mentionMatches(input);
  if (matches.length === 0) return null;
  return (
    <Box sx={{ position: "absolute", left: 12, right: 12, bottom: "100%", mb: 0.5, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 2, boxShadow: T.shadowPop, overflow: "hidden", zIndex: 20, animation: `msgIn .16s ${EASE}` }}>
      {matches.map((m, i) => {
        const act = i === Math.min(activeIndex, matches.length - 1);
        return (
          <Box key={m.kind + m.id} onMouseDown={(e) => { e.preventDefault(); onPick(m); }} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.9, cursor: "pointer", bgcolor: act ? T.surfaceAlt : T.surface, "&:hover": { bgcolor: T.surfaceAlt } }}>
            <Box sx={{ width: 22, textAlign: "center", fontSize: 14 }}>{m.icon ?? "•"}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</Typography>
              <Typography sx={{ fontSize: 10.5, color: T.textFaint }}>{m.sub}</Typography>
            </Box>
            <Box sx={{ fontSize: 9, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: KIND_COLOR[m.kind], bgcolor: `${KIND_COLOR[m.kind]}18`, px: 0.7, py: 0.2, borderRadius: 0.75 }}>{KIND_LABEL[m.kind]}</Box>
          </Box>
        );
      })}
    </Box>
  );
}

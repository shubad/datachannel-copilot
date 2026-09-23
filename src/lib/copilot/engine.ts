import type {
  CopilotState,
  EngineTurn,
  ChatMessage,
  ComponentSpec,
  StepId,
} from "./types";
import { parseIntent, detectTaskType } from "./intent";
import { matchScenario } from "./scenarios";
import {
  findSource,
  findReport,
  findWarehouse,
  reportFields,
  SOURCES,
  MARKETPLACES,
  NORMAL_FREQUENCIES,
  BQ_REGIONS,
  EXISTING_PIPELINES,
  savedCredsForSource,
  savedWarehousesFor,
  type ExistingPipeline,
} from "./catalog";

let _id = 0;
const uid = () => `m${Date.now().toString(36)}_${(_id++).toString(36)}`;

function text(t: string): ChatMessage {
  return { role: "assistant", id: uid(), text: t };
}
function comp(t: string | undefined, components: ComponentSpec[]): ChatMessage {
  return { role: "assistant", id: uid(), text: t, components };
}

export function initialState(): CopilotState {
  return {
    taskType: "unknown",
    steps: [
      { id: "source", label: "Source", status: "not-started" },
      { id: "warehouse", label: "Warehouse", status: "not-started" },
      { id: "connect", label: "Connect", status: "not-started" },
      { id: "pipeline", label: "Pipeline", status: "not-started" },
      { id: "schedule", label: "Schedule", status: "not-started" },
    ],
    intent: { raw: "" },
    sourceConnected: false,
    warehouseConnected: false,
    confirmed: [],
    launched: false,
    draft: false,
  };
}

function freshState(): CopilotState {
  return initialState();
}

function setStep(state: CopilotState, id: StepId, status: "not-started" | "in-progress" | "done"): CopilotState["steps"] {
  return state.steps.map((s) => (s.id === id ? { ...s, status } : s));
}
function addConfirmed(state: CopilotState, key: string): string[] {
  return state.confirmed.includes(key) ? state.confirmed : [...state.confirmed, key];
}

// --- Actions from component interactions ---
export type Action =
  | { type: "select-source"; sourceId: string }
  | { type: "select-warehouse"; warehouseId: string }
  | { type: "select-credential"; kind: "source" | "warehouse"; name: string }
  | { type: "connect-submit"; kind: "source" | "warehouse"; method: "auth" | "form"; name?: string }
  | { type: "select-report"; reportId: string }
  | { type: "confirm-params"; patch: Partial<CopilotState["intent"]> }
  | { type: "select-schedule"; scheduleMode: "manual" | "normal" | "advanced"; frequency?: string; schedule?: string }
  | { type: "set-name"; datasetName: string; datasetDescription?: string; notifyMode?: "ERROR" | "ERROR_SUCCESS"; runAfterSave?: boolean; runBackfill?: boolean }
  | { type: "create-pipeline" }
  | { type: "save-draft" }
  | { type: "escape-hatch" }
  | { type: "go-back" }
  | { type: "view-run-status" }
  | { type: "create-another" }
  | { type: "connect-new" }
  // edit / bulk
  | { type: "edit-pick"; pipelineId: string }
  | { type: "edit-op"; pipelineId: string; op: "pause" | "resume" | "backfill" | "schedule" | "insert-mode" }
  | { type: "bulk-apply"; pipelineIds: string[]; op: string };

// =========================================================================
// Free-text turn
// =========================================================================
export function respondToUser(state: CopilotState, raw: string): EngineTurn {
  // Scripted scenario catalogue — monitoring, activation, admin, etc. A matched
  // prompt returns its designed response and leaves the create-flow state alone.
  const scenario = matchScenario(raw);
  if (scenario) {
    return { statePatch: {}, messages: [{ role: "assistant", id: uid(), text: scenario.text, components: scenario.components }] };
  }

  const detected = detectTaskType(raw);
  const wasUnknown = state.taskType === "unknown";
  const switching = !wasUnknown && (detected === "edit" || detected === "bulk") && detected !== state.taskType;
  const taskType = wasUnknown ? detected : switching ? detected : state.taskType;

  const base = wasUnknown || switching ? { ...freshState(), taskType } : { ...state, taskType };
  const intent = parseIntent(raw, switching ? { raw } : state.intent);
  let next: CopilotState = { ...base, intent };
  const pre: ChatMessage[] = [];

  // Non-creation tasks get their own entry points — not the create flow.
  if (wasUnknown || switching) {
    if (taskType === "edit") return editEntry(next, raw, pre);
    if (taskType === "bulk") return bulkEntry(next, pre);
    if (taskType === "question") {
      return turnWith(next, pre, [
        text("Happy to explain — ask away. When you want to act on it (create, edit, or bulk-change pipelines), just tell me and I’ll pull up the right controls."),
      ]);
    }
  }

  // "/cred @name" reuses an existing saved credential — source is already connected.
  if (intent.credentialName) {
    next = { ...next, sourceConnected: true, sourceCredential: intent.credentialName };
    pre.push(comp(undefined, [{ id: "flag", props: { level: "info", label: "Using saved credential", body: `@${intent.credentialName} — reusing this existing ${findSource(intent.sourceId)?.name ?? ""} connection.` } }]));
  }

  // Out-of-scope: reframe (dashboard) then continue, or explain & stop (ip-whitelist).
  if (intent.outOfScope === "dashboard") {
    pre.push(comp(undefined, [{ id: "C17", props: { title: "Reframe, then continue", body: "DataChannel doesn’t build the dashboard — it lands your data in the warehouse on a schedule, and your BI tool reads from there. Let’s get the data flowing first." } }]));
  } else if (intent.outOfScope === "ip-whitelist") {
    return { statePatch: { intent }, messages: [comp(undefined, [{ id: "C17", props: { title: "Out of scope", level: "info", body: "IP whitelisting is configured in your warehouse’s network settings, not in DataChannel. No action taken here.", docHref: "#", docLabel: "Warehouse IP allowlist guide" } }])] };
  }

  return turnWith(next, pre, planCreate(next));
}

// =========================================================================
// Component action turn
// =========================================================================
export function applyAction(state: CopilotState, action: Action): EngineTurn {
  let next = { ...state };

  switch (action.type) {
    case "select-source":
      next = { ...next, intent: { ...next.intent, sourceId: action.sourceId }, steps: setStep(next, "source", "done") };
      next.steps = setStep(next, "warehouse", "in-progress");
      return turnWith(next, [], planCreate(next));

    case "select-warehouse":
      next = { ...next, intent: { ...next.intent, warehouseId: action.warehouseId }, steps: setStep(next, "warehouse", "done") };
      next.steps = setStep(next, "connect", "in-progress");
      return turnWith(next, [], planCreate(next));

    case "select-credential": {
      if (action.kind === "source") next = { ...next, sourceConnected: true, sourceCredential: action.name };
      else next = { ...next, warehouseConnected: true, warehouseConnection: action.name };
      next = markConnectStep(next);
      return turnWith(next, [], planCreate(next));
    }

    case "connect-submit": {
      const label = action.name || (action.method === "auth" ? "authorised" : "connection");
      if (action.kind === "source") next = { ...next, sourceConnected: true, sourceCredential: label };
      else next = { ...next, warehouseConnected: true, warehouseConnection: label };
      next = markConnectStep(next);
      const name = action.kind === "source" ? findSource(next.intent.sourceId)?.name : findWarehouse(next.intent.warehouseId)?.name;
      return turnWith(next, [comp(undefined, [{ id: "flag", props: { level: "info", label: "Connected", body: `${name} connected${action.method === "auth" ? " via authorisation" : ` as “${label}”`}.` } }])], planCreate(next));
    }

    case "select-report":
      next = { ...next, intent: { ...next.intent, reportId: action.reportId }, confirmed: addConfirmed(next, "report"), steps: setStep(next, "pipeline", "in-progress") };
      return turnWith(next, [], planCreate(next));

    case "confirm-params":
      next = { ...next, intent: { ...next.intent, ...action.patch }, confirmed: addConfirmed(next, "params") };
      return turnWith(next, [], planCreate(next));

    case "select-schedule": {
      const sched = action.scheduleMode === "manual" ? "Manual run" : `${action.frequency ?? "Daily"}${action.schedule ? " · " + action.schedule : ""}`;
      next = { ...next, intent: { ...next.intent, scheduleMode: action.scheduleMode, frequency: action.frequency, schedule: sched }, confirmed: addConfirmed(next, "schedule"), steps: setStep(next, "schedule", "done") };
      if (next.taskType === "edit") return turnWith(next, [], [editResult(next, `Schedule updated to ${sched}`)]);
      return turnWith(next, [], planCreate(next));
    }

    case "set-name": {
      next = {
        ...next,
        intent: {
          ...next.intent,
          datasetName: action.datasetName,
          datasetDescription: action.datasetDescription,
          notifyMode: action.notifyMode ?? next.intent.notifyMode,
          runAfterSave: action.runAfterSave,
          runBackfill: action.runBackfill,
        },
        confirmed: addConfirmed(next, "name"),
        launched: true,
        steps: next.steps.map((s) => ({ ...s, status: "done" as const })),
      };
      return turnWith(next, [], [congratsCard(next), runningCard(next)]);
    }

    case "create-pipeline":
      next = { ...next, launched: true, steps: next.steps.map((s) => ({ ...s, status: "done" as const })) };
      return turnWith(next, [], [congratsCard(next), runningCard(next)]);

    case "save-draft":
      next = { ...next, draft: true };
      return turnWith(next, [], [runningCard(next, true)]);

    case "view-run-status":
      return turnWith(next, [], [runningCard(next)]);

    case "create-another": {
      // keep source, warehouse and their connections; clear the report-onward choices
      next = {
        ...next,
        intent: { ...next.intent, reportId: undefined, datasetName: undefined, datasetDescription: undefined, dimensions: undefined, metrics: undefined },
        confirmed: [],
        launched: false,
      };
      next.steps = next.steps.map((s) =>
        s.id === "pipeline" ? { ...s, status: "in-progress" as const } : s.id === "schedule" ? { ...s, status: "not-started" as const } : s
      );
      return turnWith(next, [text("Sure — another pipeline on the same credentials. Which report?")], planCreate(next));
    }

    case "connect-new":
      return { statePatch: initialState(), messages: [text("Let’s connect a new data source. What do you want to pull from?"), ...planCreate(initialState())] };

    case "go-back":
      next = stepBack(next);
      return turnWith(next, [], planCreate(next));

    case "escape-hatch":
      return turnWith(next, [], [comp(undefined, [{ id: "C13", props: { title: "Switch to the manual form", body: "I’ll carry everything you’ve entered into the standard console form — nothing is lost.", filled: summarize(next) } }])]);

    // --- edit / bulk ---
    case "edit-pick": {
      const pl = EXISTING_PIPELINES.find((p) => p.id === action.pipelineId);
      return turnWith(next, [], pl ? [editPanel(pl)] : []);
    }
    case "edit-op": {
      const pl = EXISTING_PIPELINES.find((p) => p.id === action.pipelineId);
      if (!pl) return turnWith(next, [], []);
      if (action.op === "schedule") {
        next = { ...next, intent: { ...next.intent, sourceId: pl.sourceId, reportId: pl.reportId, frequency: pl.frequency, scheduleMode: "normal" } };
        return turnWith(next, [text(`Editing schedule for ${pl.datasetName} (currently ${pl.frequency}).`)], [scheduleCard(next)]);
      }
      if (action.op === "pause") return turnWith(next, [], [editResult(next, `${pl.datasetName} paused — it won’t run on schedule until resumed.`, pl)]);
      if (action.op === "resume") return turnWith(next, [], [editResult(next, `${pl.datasetName} resumed — next run on its ${pl.frequency.toLowerCase()} schedule.`, pl)]);
      if (action.op === "backfill") return turnWith(next, [], [backfillCard(pl)]);
      return turnWith(next, [], []);
    }
    case "bulk-apply": {
      const pls = EXISTING_PIPELINES.filter((p) => action.pipelineIds.includes(p.id));
      return turnWith(next, [], [bulkResult(pls, action.op)]);
    }
  }
}

function markConnectStep(state: CopilotState): CopilotState {
  if (state.sourceConnected && state.warehouseConnected) {
    return { ...state, steps: setStep(setStepObj(state, "connect", "done"), "pipeline", "in-progress") };
  }
  return { ...state, steps: setStep(state, "connect", "in-progress") };
}
function setStepObj(state: CopilotState, id: StepId, status: "not-started" | "in-progress" | "done"): CopilotState {
  return { ...state, steps: setStep(state, id, status) };
}

// =========================================================================
// Create flow planner — source → warehouse → connect both → pipeline →
// config → schedule → name → running. Fills from the prompt; asks for gaps.
// =========================================================================
function planCreate(state: CopilotState): ChatMessage[] {
  const intent = state.intent;
  const source = findSource(intent.sourceId);

  // 1. source
  if (!source) {
    return [
      text("What source do you want to pull data from? Pick one, or just tell me."),
      comp(undefined, [{ id: "C3", props: { action: "pick-source", search: true, preselect: intent.sourceId } }]),
    ];
  }

  // 2. warehouse
  const warehouse = findWarehouse(intent.warehouseId);
  if (!warehouse) {
    return [
      text("Where should the data land? Choose your destination warehouse."),
      comp(undefined, [{ id: "C23", props: { action: "pick-warehouse", preselect: intent.warehouseId } }]),
    ];
  }

  // 3. connect source, then warehouse
  if (!state.sourceConnected) {
    return [connectCard(state, "source")];
  }
  if (!state.warehouseConnected) {
    return [connectCard(state, "warehouse")];
  }

  // 4. pick the pipeline / report
  if (!state.confirmed.includes("report")) {
    return [
      text(`Which ${source.name} data pipeline do you want to create? Here’s the closest match to what you described:`),
      comp(undefined, [{
        id: "C7",
        props: {
          action: "pick-report",
          sourceName: source.name,
          sourceIcon: source.icon,
          reports: source.reports.map((r) => ({ id: r.id, label: r.label, desc: r.desc })),
          preselect: intent.reportId ?? source.reports[0]?.id,
          why: intent.reportId ? "matches your request" : undefined,
        },
      }]),
    ];
  }

  // 5. pipeline configuration
  if (!state.confirmed.includes("params")) {
    return [paramCard(state)];
  }

  // 6. scheduling
  if (!state.confirmed.includes("schedule")) {
    return [scheduleCard(state)];
  }

  // 7. name
  if (!state.confirmed.includes("name")) {
    return [nameCard(state)];
  }

  // 8. running
  return [runningCard(state)];
}

// =========================================================================
// Connect card (C4) — select a saved credential OR connect new (auth / form)
// =========================================================================
function connectCard(state: CopilotState, kind: "source" | "warehouse"): ChatMessage {
  if (kind === "source") {
    const source = findSource(state.intent.sourceId)!;
    const saved = savedCredsForSource(source.id).map((c) => ({ name: c.name, syncs: c.syncs ?? 0, pipelines: c.pipelines ?? 0 }));
    const authAvailable = source.authKind === "oauth" || source.authKind === "spapi";
    return {
      role: "assistant",
      id: uid(),
      components: [{
        id: "C4",
        props: {
          kind: "source",
          name: source.name,
          icon: source.icon,
          saved,
          authAvailable,
          authLabel: source.authKind === "spapi" ? "Authorise on Amazon (SP-API)" : `Authorise with ${source.name}`,
          credFields: source.credFields,
          namePlaceholder: `${source.prefix}_prod`,
          secureNote: "Opens DataChannel’s secure form. The copilot never sees these values.",
        },
      }],
    };
  }
  const wh = findWarehouse(state.intent.warehouseId)!;
  const saved = savedWarehousesFor(wh.id).map((w) => ({ name: w.name, syncs: 0, pipelines: 0 }));
  const managed = wh.id === "managed";
  return {
    role: "assistant",
    id: uid(),
    components: [{
      id: "C4",
      props: {
        kind: "warehouse",
        name: wh.name,
        icon: wh.icon,
        saved,
        authAvailable: managed,
        authLabel: "Authorise with Google",
        credFields: managed
          ? [{ key: "google_account", label: "Google account (gets access)", kind: "text", required: true, placeholder: "admin@yourcompany.com" }, { key: "region", label: "BigQuery region", kind: "select", options: [...BQ_REGIONS], default: BQ_REGIONS[0] }]
          : warehouseCredFields(wh.id),
        namePlaceholder: `${wh.id}_prod`,
        secureNote: managed ? "Free tier — a managed BigQuery is provisioned for you." : "Credentials are stored encrypted; the copilot never sees them.",
      },
    }],
  };
}

function warehouseCredFields(id: string): { key: string; label: string; kind: "text" | "password" | "select"; required?: boolean; placeholder?: string }[] {
  if (id === "bigquery") return [
    { key: "project", label: "Project ID", kind: "text", required: true, placeholder: "my-gcp-project" },
    { key: "dataset", label: "Dataset", kind: "text", required: true, placeholder: "RAW" },
    { key: "sa_json", label: "Service account JSON", kind: "password", required: true, placeholder: "paste JSON key" },
  ];
  if (id === "snowflake") return [
    { key: "account", label: "Account", kind: "text", required: true, placeholder: "org-account" },
    { key: "warehouse", label: "Warehouse", kind: "text", placeholder: "COMPUTE_WH" },
    { key: "database", label: "Database", kind: "text", required: true, placeholder: "ANALYTICS" },
    { key: "username", label: "Username", kind: "text", required: true, placeholder: "LOADER" },
    { key: "password", label: "Password", kind: "password", required: true },
  ];
  return [
    { key: "host", label: "Host", kind: "text", required: true, placeholder: "cluster.region.redshift.amazonaws.com" },
    { key: "port", label: "Port", kind: "text", default: "5439", placeholder: "5439" } as { key: string; label: string; kind: "text"; placeholder?: string },
    { key: "database", label: "Database", kind: "text", required: true, placeholder: "analytics" },
    { key: "username", label: "Username", kind: "text", required: true, placeholder: "admin" },
    { key: "password", label: "Password", kind: "password", required: true },
  ];
}

// =========================================================================
// Pipeline config (C8) — DataChannel "Data Pipeline configuration"
// =========================================================================
function hasMarketplace(state: CopilotState): boolean {
  return findSource(state.intent.sourceId)?.authKind === "spapi";
}
function defaultDataset(state: CopilotState): string {
  if (state.intent.datasetName) return state.intent.datasetName;
  const source = findSource(state.intent.sourceId);
  const report = findReport(source, state.intent.reportId);
  const base = (report?.id || "pipeline").replace(/[^a-z0-9_]/gi, "_");
  return `${source?.prefix ?? "dc"}_${base}`;
}

function paramCard(state: CopilotState): ChatMessage {
  const source = findSource(state.intent.sourceId)!;
  const report = findReport(source, state.intent.reportId);
  const noOfDays = Math.min(state.intent.noOfDays ?? source.backfillMaxDays, source.backfillMaxDays);
  const insertMode = state.intent.insertMode ?? "UPSERT";
  const { dimensions, metrics } = reportFields(report);
  return {
    role: "assistant",
    id: uid(),
    components: [{
      id: "C8",
      props: {
        reportLabel: report?.label,
        dimensions,
        metrics,
        // agent pre-selects everything so the user can just review & Next
        selectedDimensions: state.intent.dimensions ?? dimensions,
        selectedMetrics: state.intent.metrics ?? metrics,
        insertMode,
        noOfDays,
        noOfDaysMax: source.backfillMaxDays,
        action: "confirm-params",
      },
    }],
  };
}

function buildConfig(state: CopilotState) {
  const source = findSource(state.intent.sourceId)!;
  const report = findReport(source, state.intent.reportId);
  const mp = state.intent.marketplace ? MARKETPLACES[state.intent.marketplace] : MARKETPLACES.IN;
  const days = Math.min(state.intent.noOfDays ?? source.backfillMaxDays, source.backfillMaxDays);
  return {
    data_source: source.id,
    data_pipeline: report?.id,
    configuration: {
      ...(hasMarketplace(state) ? { marketplace_id: mp.mpId } : {}),
      no_of_days: days,
      insert_mode: state.intent.insertMode ?? "UPSERT",
    },
    destination: { warehouse: findWarehouse(state.intent.warehouseId)?.id ?? "managed", dataset: defaultDataset(state) },
    scheduling: state.intent.scheduleMode === "manual" ? "Manual run" : `Normal · ${state.intent.frequency ?? "Daily"}`,
    notifications: state.intent.notifyMode ?? "ERROR",
  };
}

// =========================================================================
// Scheduling (C9) — Manual / Normal / Advanced
// =========================================================================
function scheduleCard(state: CopilotState): ChatMessage {
  const source = findSource(state.intent.sourceId);
  const report = findReport(source, state.intent.reportId);
  return {
    role: "assistant",
    id: uid(),
    components: [{
      id: "C9",
      props: {
        phrase: state.intent.schedule,
        mode: state.intent.scheduleMode ?? "normal",
        frequency: state.intent.frequency ?? "Daily",
        selectSchedule: state.intent.frequency ? `Normal - ${state.intent.frequency}` : "Normal - Daily",
        frequencies: [...NORMAL_FREQUENCIES],
        backfillAvailable: (source?.backfillMaxDays ?? 0) > 0,
        settlementNote: report?.settlementLagHours
          ? `~${report.settlementLagHours}h settlement lag — a Backfill run can re-pull a corrected range later.`
          : undefined,
        action: "pick-schedule",
      },
    }],
  };
}

// =========================================================================
// Name (C21) — dataset/pipeline name + description → create
// =========================================================================
function nameCard(state: CopilotState): ChatMessage {
  const source = findSource(state.intent.sourceId);
  return {
    role: "assistant",
    id: uid(),
    components: [{
      id: "C21",
      props: {
        datasetName: defaultDataset(state),
        datasetDescription: state.intent.datasetDescription ?? "",
        notifyMode: state.intent.notifyMode ?? "ERROR",
        runAfterSave: state.intent.runAfterSave ?? true,
        runBackfill: state.intent.runBackfill ?? false,
        prefixNote: `DataChannel prefixes the table by source, e.g. ${source?.prefix ?? "dc"}_…`,
        summary: summarize(state),
        action: "set-name",
      },
    }],
  };
}

// =========================================================================
// Running (C22) — status + GitHub-style activity chart
// =========================================================================
function runningCard(state: CopilotState, draft = false): ChatMessage {
  const summary = summarize(state);
  return {
    role: "assistant",
    id: uid(),
    components: [{
      id: "C22",
      props: {
        draft: draft || state.draft,
        datasetName: defaultDataset(state),
        pipelineId: "pl_8c31f0",
        summary,
        checks: [
          { label: `${summary.source} credential authorised`, ok: true },
          { label: `${summary.warehouse} reachable & writable`, ok: true },
          { label: `First run queued`, ok: true },
        ],
        nextRun: draft || state.draft ? "activates when the connection clears" : "backfill now, then on schedule",
        seed: defaultDataset(state),
      },
    }],
  };
}

// Congratulations / "what next" card (C24), shown just before the run status.
function congratsCard(state: CopilotState): ChatMessage {
  const s = summarize(state);
  return { role: "assistant", id: uid(), components: [{ id: "C24", props: { source: s.source, report: s.report } }] };
}

// Reverse the create flow by one gate (the Back buttons on each form).
function stepBack(state: CopilotState): CopilotState {
  const c = state.confirmed;
  if (c.includes("schedule")) return { ...state, confirmed: c.filter((k) => k !== "schedule"), steps: setStep(state, "schedule", "in-progress") };
  if (c.includes("params")) return { ...state, confirmed: c.filter((k) => k !== "params") };
  if (c.includes("report")) return { ...state, confirmed: c.filter((k) => k !== "report"), steps: setStep(state, "pipeline", "in-progress") };
  if (state.warehouseConnected) return { ...state, warehouseConnected: false, steps: setStep(state, "connect", "in-progress") };
  if (state.sourceConnected) return { ...state, sourceConnected: false };
  if (state.intent.warehouseId) return { ...state, intent: { ...state.intent, warehouseId: undefined }, steps: setStep(state, "warehouse", "in-progress") };
  if (state.intent.sourceId) return { ...state, intent: { ...state.intent, sourceId: undefined }, steps: setStep(state, "source", "in-progress") };
  return state;
}

// =========================================================================
// Edit / bulk (existing pipelines)
// =========================================================================
function existingPickerSpec(multi: boolean): ComponentSpec {
  return {
    id: "C18",
    props: {
      multi,
      pipelines: EXISTING_PIPELINES.map((p) => ({ id: p.id, datasetName: p.datasetName, source: findSource(p.sourceId)?.name, meta: `${p.frequency} · ${p.insertMode} · ${p.lastRun}`, status: p.status })),
      action: multi ? "bulk-select" : "edit-pick",
    },
  };
}
function editEntry(state: CopilotState, raw: string, pre: ChatMessage[]): EngineTurn {
  const named = EXISTING_PIPELINES.find((p) => raw.toLowerCase().includes(p.datasetName));
  if (named) return turnWith(state, pre, [text(`Found ${named.datasetName}. What would you like to change?`), editPanel(named)]);
  return turnWith(state, pre, [text("Let’s edit an existing pipeline. Which one?"), { role: "assistant", id: uid(), components: [existingPickerSpec(false)] }]);
}
function bulkEntry(state: CopilotState, pre: ChatMessage[]): EngineTurn {
  return turnWith(state, pre, [text("Bulk action across your pipelines. Select the pipelines and choose what to do."), { role: "assistant", id: uid(), components: [existingPickerSpec(true)] }]);
}
function editPanel(pl: ExistingPipeline): ChatMessage {
  return {
    role: "assistant",
    id: uid(),
    components: [{
      id: "C19",
      props: {
        pipelineId: pl.id, datasetName: pl.datasetName, source: findSource(pl.sourceId)?.name,
        rows: [{ k: "Status", v: pl.status }, { k: "Frequency", v: pl.frequency }, { k: "Insert mode", v: pl.insertMode }, { k: "Last run", v: pl.lastRun }],
        actions: [{ op: "schedule", label: "Change schedule" }, pl.status === "paused" ? { op: "resume", label: "Resume" } : { op: "pause", label: "Pause" }, { op: "backfill", label: "Run backfill" }],
      },
    }],
  };
}
function backfillCard(pl: ExistingPipeline): ChatMessage {
  return {
    role: "assistant",
    id: uid(),
    components: [
      { id: "flag", props: { level: "info", label: "Backfill", body: `A backfill re-pulls a historical date range for ${pl.datasetName}. Its normal schedule pauses until the backfill completes.` } },
      { id: "C22", props: { draft: false, datasetName: pl.datasetName, pipelineId: pl.id, summary: { source: findSource(pl.sourceId)?.name, report: pl.datasetName }, checks: [{ label: "Backfill queued for last 30 days", ok: true }], nextRun: "backfill running", seed: pl.datasetName } },
    ],
  };
}
function editResult(state: CopilotState, message: string, pl?: ExistingPipeline): ChatMessage {
  void state;
  return {
    role: "assistant",
    id: uid(),
    components: [
      { id: "flag", props: { level: "info", label: "Updated", body: message } },
      { id: "C22", props: { draft: false, datasetName: pl?.datasetName ?? "pipeline", pipelineId: pl?.id ?? "pl_edit", summary: { source: pl ? findSource(pl.sourceId)?.name : undefined, report: pl?.datasetName }, checks: [{ label: "Change applied", ok: true }], nextRun: "on schedule", seed: pl?.datasetName ?? "x" } },
    ],
  };
}
function bulkResult(pls: ExistingPipeline[], op: string): ChatMessage {
  const opLabel: Record<string, string> = { pause: "Paused", resume: "Resumed", backfill: "Backfill queued for", "insert-mode": "Insert mode changed for" };
  const rows = pls.map((p) => {
    const failed = p.status === "error" && op !== "resume";
    return { k: p.datasetName, v: failed ? "skipped — pipeline in error state" : "done", ok: !failed };
  });
  const okCount = rows.filter((r) => r.ok).length;
  return { role: "assistant", id: uid(), components: [{ id: "C20", props: { title: `${opLabel[op] ?? "Applied"} ${okCount}/${pls.length} pipelines`, rows, aside: okCount < pls.length ? "Per-pipeline result — the rest still applied." : "All selected pipelines updated." } }] };
}

// =========================================================================
// helpers
// =========================================================================
function summarize(state: CopilotState) {
  const source = findSource(state.intent.sourceId);
  const report = findReport(source, state.intent.reportId);
  const wh = findWarehouse(state.intent.warehouseId);
  return {
    source: source?.name,
    sourceIcon: source?.icon,
    report: report?.label,
    warehouse: wh?.name,
    warehouseIcon: wh?.icon,
    schedule: state.intent.schedule || (state.intent.scheduleMode === "manual" ? "Manual run" : state.intent.frequency ? `Daily · ${state.intent.frequency}` : undefined),
    insertMode: state.intent.insertMode ?? "UPSERT",
  };
}

function turnWith(state: CopilotState, pre: ChatMessage[], msgs: ChatMessage[]): EngineTurn {
  return {
    statePatch: {
      intent: state.intent,
      taskType: state.taskType,
      steps: state.steps,
      sourceConnected: state.sourceConnected,
      warehouseConnected: state.warehouseConnected,
      sourceCredential: state.sourceCredential,
      warehouseConnection: state.warehouseConnection,
      confirmed: state.confirmed,
      launched: state.launched,
      draft: state.draft,
    },
    messages: [...pre, ...msgs],
  };
}

export { SOURCES };

// Core types for the AI onboarding + in-product copilot engine.
// The engine never generates markup. It emits ComponentSpec objects that name a
// component from the fixed library and carry its pre-filled props.

// The create flow's high-level phases (shown as a slim progress strip).
export type StepId = "source" | "warehouse" | "connect" | "pipeline" | "schedule";

export type StepStatus = "not-started" | "in-progress" | "done";

export type FlowStep = {
  id: StepId;
  label: string;
  status: StepStatus;
};

// --- The fixed component library. Each id maps 1:1 to a React component. ---
export type ComponentId =
  | "C2" // choice chips
  | "C3" // source picker
  | "C4" // connect (select saved credential OR connect new: auth / form)
  | "C6" // connection fields (non-secret, legacy)
  | "C7" // pipeline picker
  | "C8" // parameter card
  | "C9" // schedule picker
  | "C10" // validation
  | "C11" // review & save
  | "C12" // result card
  | "C13" // handoff / escape hatch
  | "C15" // scope confirm (cross-account)
  | "C16" // clone from existing
  | "C17" // scope boundary (reframe & continue)
  | "C18" // existing-pipeline picker (edit / bulk)
  | "C19" // edit panel
  | "C20" // bulk result
  | "C21" // pipeline name step
  | "C22" // running status + activity chart
  | "C23" // warehouse picker
  | "C24" // congratulations / next steps
  | "stats" // metric tiles row
  | "table" // generic data table (run history, alerts, previews…)
  | "list" // titled list of rows with status/meta
  | "detail" // key/value detail card with actions
  | "code" // SQL / JSON block with copy
  | "digest" // pipeline health digest
  | "log" // terminal-style run log (finer failure detail)
  // task-specific responses (components/copilot/responses)
  | "incidents" // failures today: 24h timeline + grouped by action class
  | "diagnosis" // why it failed: cause chain, facts, blast radius, fix plan
  | "schedule" // a pipeline's schedule: next run, day track, last runs
  | "credentials" // credential expiry meters
  | "freshness" // staleness vs expected cadence
  | "volume" // rows processed: hero + daily columns
  | "changes" // audit trail with diffs
  | "bulkrun" // live bulk re-run progress
  | "agenda" // tomorrow's runs as 24h lanes
  | "ranking" // errors by connector
  | "authflow" // credential re-authorisation steps
  | "preview" // typed data grid sample
  | "schema" // searchable schema explorer
  | "transform" // lineage + SQL transform builder
  | "segment" // rule sentence + audience funnel
  | "mapping" // reverse-ETL field mapping
  | "workflow" // orchestration node flow
  | "leaderboard" // ranked analytics bars
  | "invite" // invite with live role permissions
  | "alertrule" // alert rule + message preview
  | "credits" // credit meter with forecast
  | "wssetup" // new client workspace
  | "share" // usage share by workspace
  | "receipt" // confirmation of a completed action
  | "flag" // blue/amber/red annotation
  | "text"; // plain assistant prose

export type FlagLevel = "info" | "warn" | "danger";

// A rendered turn from the assistant: some prose and/or a component.
export type ComponentSpec = {
  id: ComponentId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
};

export type ChatMessage =
  | { role: "user"; id: string; text: string }
  | { role: "assistant"; id: string; text?: string; components?: ComponentSpec[] }
  | { role: "assistant-typing"; id: string };

// --- Parsed intent from a user message (deterministic, catalog-backed). ---
export type ParsedIntent = {
  raw: string;
  sourceId?: string;
  reportId?: string;
  warehouseId?: string;
  marketplace?: string; // e.g. "IN"
  noOfDays?: number; // "No of Days" — days of data fetched each run
  insertMode?: "UPSERT" | "APPEND" | "REPLACE"; // DataChannel "Insert Mode"
  dimensions?: string[]; // selected Dimension columns (Report Details step)
  metrics?: string[]; // selected Metric columns (Report Details step)
  schedule?: string; // human phrase e.g. "every morning"
  scheduleMode?: "manual" | "normal" | "advanced";
  frequency?: string; // normal-scheduling interval label
  datasetName?: string; // = table name (source prefix added by DataChannel)
  datasetDescription?: string;
  notifyMode?: "ERROR" | "ERROR_SUCCESS";
  runAfterSave?: boolean;
  runBackfill?: boolean;
  targetSchema?: string;
  targetTable?: string;
  destinationApp?: string; // reverse-etl target (out of pipeline source scope)
  accountRef?: string;
  credentialName?: string; // from "/cred @name" — use an existing saved credential
  pipelineRef?: string; // from "@dataset_name" — an existing pipeline to act on
  accountSubtype?: string; // e.g. amazon "seller" vs "vendor"
  clonedReports?: string[];
  outOfScope?: OutOfScopeKind;
};

export type OutOfScopeKind = "dashboard" | "ip-whitelist" | "unknown-source";

// What the user is trying to do this session — the copilot is not always
// creating a new pipeline. Drives whether the create-wizard strip shows.
export type TaskType = "unknown" | "create" | "edit" | "bulk" | "question";

// Snapshot the engine keeps across turns.
export type CopilotState = {
  taskType: TaskType;
  steps: FlowStep[];
  intent: ParsedIntent;
  sourceConnected: boolean;
  warehouseConnected: boolean;
  sourceCredential?: string; // selected/created source credential name
  warehouseConnection?: string; // selected/created warehouse connection name
  // review steps the user has explicitly confirmed (report, params, schedule, name)
  confirmed: string[];
  launched: boolean;
  draft: boolean;
};

// What the engine returns for a user turn.
export type EngineTurn = {
  messages: ChatMessage[];
  statePatch: Partial<CopilotState>;
};

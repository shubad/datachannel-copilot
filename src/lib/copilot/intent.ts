import type { ParsedIntent, OutOfScopeKind, TaskType } from "./types";
import { SOURCES, WAREHOUSES, MARKETPLACES, DESTINATION_APPS, findSource, findCredential, EXISTING_PIPELINES } from "./catalog";

// Deterministic intent parser. Catalog-backed: it only ever resolves to ids that
// exist in the catalog, so the engine can never name an unsupported connector.

const KNOWN_ACCOUNTS = ["mamaearth", "nykaa", "boat", "sugar", "wow"];

function matchByKeywords<T extends { keywords: string[] }>(text: string, items: T[]): T | undefined {
  const lower = text.toLowerCase();
  // longest keyword first so "google ads" beats "ads"
  let best: { item: T; len: number } | undefined;
  for (const item of items) {
    for (const kw of item.keywords) {
      if (lower.includes(kw) && (!best || kw.length > best.len)) {
        best = { item, len: kw.length };
      }
    }
  }
  return best?.item;
}

export function parseIntent(text: string, prior?: ParsedIntent): ParsedIntent {
  const lower = text.toLowerCase();
  const intent: ParsedIntent = { ...(prior ?? { raw: text }), raw: text };

  // "/cred @name" — reference an existing saved credential (skips credential entry)
  const credMatch = text.match(/\/cred\s+@?([a-z0-9_]+)/i);
  if (credMatch) {
    const cred = findCredential(credMatch[1]);
    if (cred) { intent.credentialName = cred.name; intent.sourceId = cred.sourceId; }
  }

  // "@dataset_name" — reference an existing pipeline
  for (const m of text.matchAll(/@([a-z0-9_]+)/gi)) {
    const pl = EXISTING_PIPELINES.find((p) => p.datasetName.toLowerCase() === m[1].toLowerCase());
    if (pl) { intent.pipelineRef = pl.id; intent.sourceId = intent.sourceId ?? pl.sourceId; }
  }

  // out-of-scope requests take precedence
  const outOfScope = detectOutOfScope(lower);
  if (outOfScope) intent.outOfScope = outOfScope;

  // source
  const source = matchByKeywords(lower, SOURCES);
  if (source) intent.sourceId = source.id;

  // report + account subtype (only within a resolved or prior source)
  const resolvedSource = findSource(intent.sourceId);
  if (resolvedSource) {
    const report = matchByKeywords(lower, resolvedSource.reports);
    if (report) intent.reportId = report.id;
    if (resolvedSource.accounts) {
      const acc = matchByKeywords(lower, resolvedSource.accounts);
      if (acc) intent.accountSubtype = acc.id;
    }
  }

  // warehouse ("i don't know" maps to managed)
  const warehouse = matchByKeywords(lower, WAREHOUSES);
  if (warehouse) intent.warehouseId = warehouse.id;

  // marketplace
  for (const key of Object.keys(MARKETPLACES)) {
    const mp = MARKETPLACES[key];
    if (
      new RegExp(`\\b${key.toLowerCase()}\\b`).test(lower) ||
      lower.includes(mp.label.toLowerCase())
    ) {
      intent.marketplace = key;
      break;
    }
  }

  // "No of Days": "60d", "60 days", "last 30 days", "180-day backfill"
  const days = lower.match(/(\d{1,4})\s*[- ]?(?:d\b|day)/);
  if (days) intent.noOfDays = parseInt(days[1], 10);

  // Insert Mode (DataChannel vocabulary): incremental/upsert → UPSERT, append → APPEND, full/replace → REPLACE
  if (/\bupsert\b|\bincremental\b/.test(lower)) intent.insertMode = "UPSERT";
  else if (/\bappend\b/.test(lower)) intent.insertMode = "APPEND";
  else if (/\breplace\b|\bfull\b|\brefresh all\b|\boverwrite\b/.test(lower)) intent.insertMode = "REPLACE";

  // schedule phrase + normal-scheduling frequency
  const sched = detectSchedule(lower);
  if (sched) intent.schedule = sched;
  const freq = detectFrequency(lower);
  if (freq) { intent.frequency = freq; intent.scheduleMode = "normal"; }
  if (/\bmanual(ly)?\b|\brun (it )?myself\b|\bon demand\b/.test(lower)) intent.scheduleMode = "manual";

  // target schema.table e.g. "into raw.amazon" or "raw.amazon.sales"
  const target = lower.match(/\b(raw|staging|analytics)[._]([a-z0-9_]+)(?:[._]([a-z0-9_]+))?/i);
  if (target) {
    intent.targetSchema = `${target[1].toUpperCase()}.${target[2].toUpperCase()}`;
    if (target[3]) intent.targetTable = target[3].toUpperCase();
  }

  // reverse-etl destination app (data going OUT to an app)
  for (const app of DESTINATION_APPS) {
    if (lower.includes(app) && app !== resolvedSource?.name.toLowerCase()) {
      // only treat as destination if phrased as a push
      if (/\b(to|into|push|send|sync to)\b/.test(lower)) intent.destinationApp = app;
    }
  }

  // account reference (agency): "same as Mamaearth", "like last time"
  const accountRef = detectAccountRef(lower);
  if (accountRef) intent.accountRef = accountRef;

  return intent;
}

function detectOutOfScope(lower: string): OutOfScopeKind | undefined {
  // A named BI tool or "dashboard" as the destination: DataChannel lands data in
  // the warehouse; the BI tool reads from there. Reframe and continue (non-blocking).
  if (/\b(tableau|looker|power ?bi|dashboard)\b/.test(lower)) return "dashboard";
  if (/\bwhitelist\b.*\bip\b|\bip\b.*\bwhitelist\b/.test(lower)) return "ip-whitelist";
  return undefined;
}

function detectSchedule(lower: string): string | undefined {
  if (/\bevery morning\b|\bmorning\b/.test(lower)) return "every morning";
  const at = lower.match(/\b(?:at|by)\s*(\d{1,2})\s*(am|pm)/);
  if (at) return `daily at ${at[1]} ${at[2].toUpperCase()}`;
  if (/\btwice daily\b/.test(lower)) return "twice daily";
  if (/\bhourly\b|\bevery hour\b/.test(lower)) return "hourly";
  if (/\bdaily\b|\beach day\b|\bevery day\b/.test(lower)) return "daily";
  if (/\bweekly\b/.test(lower)) return "weekly";
  return undefined;
}

function detectFrequency(lower: string): string | undefined {
  if (/\bhourly\b|\bevery hour\b/.test(lower)) return "Hourly";
  if (/\bevery\s*6\s*hours?\b/.test(lower)) return "Every 6 hours";
  if (/\bweekly\b|\bevery week\b/.test(lower)) return "Weekly";
  if (/\bmonthly\b|\bevery month\b/.test(lower)) return "Monthly";
  if (/\bdaily\b|\beach day\b|\bevery day\b|\bevery morning\b|\bmorning\b/.test(lower)) return "Daily";
  return undefined;
}

function detectAccountRef(lower: string): string | undefined {
  for (const acc of KNOWN_ACCOUNTS) {
    if (lower.includes(acc)) return acc.charAt(0).toUpperCase() + acc.slice(1);
  }
  if (/\bsame (?:as|thing).{0,20}\b(last time|before|other)\b/.test(lower)) return "__ambiguous__";
  if (/\blike (?:we|i) (?:have|did|set up)\b/.test(lower)) return "__ambiguous__";
  return undefined;
}

// Did the user supply a fully-specified pipeline in one line? (expert path)
export function isFullSpec(intent: ParsedIntent): boolean {
  return Boolean(intent.sourceId && intent.reportId && intent.schedule && (intent.targetSchema || intent.warehouseId));
}

// Classify what the user is trying to do — the copilot is not always creating.
export function detectTaskType(text: string): TaskType {
  const lower = text.toLowerCase();

  // Bulk: acting on many pipelines at once.
  if (/\b(bulk|all (of my )?pipelines|every pipeline|all my|across (all|multiple)|multiple pipelines)\b/.test(lower)) return "bulk";
  if (/\b(pause|resume|stop|start|backfill|reschedule|re-?run|change).{0,24}\ball\b/.test(lower)) return "bulk";

  // Edit: changing something that already exists.
  if (/\b(edit|change|update|modify|rename|pause|resume|stop|disable|enable|reschedule|re-?schedule|fix|re-?run|backfill|delete)\b/.test(lower)
      && /\b(existing|current|my|the)\b.*\b(pipeline|dataset|report|sync|schedule|table)\b/.test(lower)) return "edit";
  if (/\b(pipeline|dataset|sync)\b.*\b(is failing|failed|broken|not running|stuck)\b/.test(lower)) return "edit";
  // reference to a known dataset name implies acting on it
  if (/\b(amz_|fb_|gads_|shopify_|pg_)[a-z0-9_]+/.test(lower)) return "edit";

  // Pure question / help.
  if (/^(how|what|why|when|where|can i|does|is there|explain|help)\b/.test(lower) && !/\b(set up|create|connect|sync|move|pull|ingest)\b/.test(lower)) return "question";

  // Otherwise assume a new pipeline creation.
  return "create";
}

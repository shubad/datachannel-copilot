// Scripted scenario catalogue — each suggested prompt maps to a designed AG-UI
// response: assistant text + a purpose-built component (components/copilot/responses)
// that fits the question, rather than a generic table/detail card.
//
// The mock inventory is kept consistent across answers: "now" is Fri, Sep 18,
// 14:30 IST; fb_main expired Sep 16 (fb_campaign_insights failing); Amazon's
// report queue timed out amz_fba_inventory at 06:15; gads_campaign_perf has been
// paused since Sep 15; gads_keyword_daily hit an API rate limit at 11:20.

import type { ComponentSpec } from "./types";

export type ScenarioResponse = { text?: string; components: ComponentSpec[] };
type Scenario = { id: string; category: string; prompt: string; sig?: string; response: ScenarioResponse };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9@#$ ]/g, " ").replace(/\s+/g, " ").trim();

const NOW = 14.5; // 14:30 IST

// A confirmed action returns a receipt, not an info flag.
const receipt = (title: string, body: string, extra: Record<string, unknown> = {}): ScenarioResponse => ({ components: [{ id: "receipt", props: { title, body, ...extra } }] });

// ---------------- failure diagnoses ----------------
// Cause chain + the facts list + fix plan, followed by the raw terminal log — the
// summary says what's wrong, the log is the line-by-line evidence. Defined once so
// "why did X fail?" and "show the run log for X" stay in sync.
const fbDiagnosis: ComponentSpec = { id: "diagnosis", props: {
  icon: "📘", title: "fb_campaign_insights", route: "Facebook Ads → BigQuery", status: "Error",
  chain: [
    { label: "Symptom", text: "3 scheduled runs failed in a row", meta: "since Sep 17, 09:00" },
    { label: "Immediate cause", text: "Facebook's API rejected the access token", meta: "OAuthException · code 190" },
    { label: "Root cause", text: "Credential fb_main expired — not a data or config problem", meta: "expired Sep 16, 04:11 UTC", root: true },
  ],
  facts: [
    { k: "Error type", v: "Credential Expiry", tone: "danger" },
    { k: "Alert class", v: "Task — action needed on your side" },
    { k: "Failed at", v: "today 09:00, 06:00, and yesterday 09:00" },
    { k: "Failure count", v: "3 runs in a row" },
    { k: "Cursor", v: "last good sync 2 days ago", mono: true },
  ],
  impact: { label: "fb_main powers 9 pipelines — all of them stop until it's renewed", items: ["fb_campaign_insights", "fb_adset_daily", "fb_ad_creatives"], more: 6 },
  fix: [
    { text: "Re-authorise fb_main", sub: "One OAuth approval on Facebook", action: { label: "Re-authorise", send: "Re-authorise the fb_main credential" } },
    { text: "Re-run the 9 affected pipelines", sub: "Queued automatically once the token is valid", auto: true },
    { text: "Backfill Sep 16 – 18", sub: "The cursor resumes from the last good sync — no gaps", auto: true },
  ],
} };
const fbFailLog: ComponentSpec = { id: "log", props: {
  title: "fb_campaign_insights · run log", subtitle: "Facebook Ads → BigQuery", status: "Error",
  run: "run #48213 · today 09:00:02 IST · scheduled · incremental",
  lines: [
    { ts: "09:00:02", level: "info", text: "Run started · trigger=schedule · mode=incremental · cursor=2026-09-16T09:00Z" },
    { ts: "09:00:02", level: "info", text: "Resolving credential fb_main (Facebook Ads Marketing API v19.0)" },
    { ts: "09:00:03", level: "error", text: "OAuthException (code 190): Error validating access token — session has expired" },
    { ts: "09:00:03", level: "error", text: "Token for credential fb_main expired at 2026-09-16 04:11 UTC" },
    { ts: "09:00:03", level: "warn", text: "0 of 9 ad accounts reachable — aborting before extract" },
    { ts: "09:00:03", level: "info", text: "Cursor left unchanged · last good sync 2026-09-16 09:00 · no rows dropped" },
    { ts: "09:00:04", level: "error", text: "Run failed after 2.1s · rows_read=0 · rows_written=0 · exit=CRED_EXPIRED" },
  ],
} };
const amzDiagnosis: ComponentSpec = { id: "diagnosis", props: {
  icon: "📦", title: "amz_fba_inventory", route: "Amazon Seller Central → Snowflake", status: "Timeout",
  chain: [
    { label: "Symptom", text: "Today's 06:15 run timed out after 60 minutes", meta: "run #48198" },
    { label: "Immediate cause", text: "Amazon's report never reached DONE", meta: "GET_FBA_INVENTORY_AGED_DATA · IN_PROGRESS" },
    { label: "Root cause", text: "Amazon's report queue was congested — transient, on Amazon's side", meta: "SP-API reports degraded 06:00 – 07:40", root: true },
  ],
  facts: [
    { k: "Error type", v: "Timeout", tone: "danger" },
    { k: "Alert class", v: "Warning — transient, Amazon-side" },
    { k: "Failed at", v: "today 06:15 (timed out 07:15)" },
    { k: "Duration", v: "60m — hit the report wait limit" },
    { k: "Cursor", v: "unchanged · safe to retry", mono: true },
  ],
  fix: [
    { text: "Re-run now", sub: "Amazon's queue has drained since 07:40", action: { label: "Re-run", send: "Re-run amz_fba_inventory" } },
    { text: "Raise the report timeout to 120m", sub: "More room on slow Amazon days", action: { label: "Raise", send: "Increase the timeout for amz_fba_inventory" } },
  ],
} };
const amzFailLog: ComponentSpec = { id: "log", props: {
  title: "amz_fba_inventory · run log", subtitle: "Amazon Seller Central → Snowflake", status: "Timeout",
  run: "run #48198 · today 06:15:00 IST · scheduled · incremental",
  lines: [
    { ts: "06:15:00", level: "info", text: "Run started · trigger=schedule · report=GET_FBA_INVENTORY_AGED_DATA" },
    { ts: "06:15:01", level: "info", text: "Report requested from Amazon SP-API · polling for readiness" },
    { ts: "06:20:04", level: "warn", text: "Report still IN_PROGRESS after 5m · Amazon queue is congested" },
    { ts: "06:45:07", level: "warn", text: "Report still IN_PROGRESS after 30m · 3 poll retries remaining" },
    { ts: "07:15:00", level: "error", text: "Timeout: report not DONE within 60m limit · last state=IN_PROGRESS" },
    { ts: "07:15:00", level: "info", text: "Partial data discarded · cursor left at 2026-09-17 06:15 · safe to retry" },
    { ts: "07:15:01", level: "error", text: "Run failed after 60m · rows_read=0 · rows_written=0 · exit=TIMEOUT" },
  ],
} };

export const SCENARIOS: Scenario[] = [
  // ---------------- Monitoring & health ----------------
  {
    id: "failed-today", category: "Monitoring", prompt: "What pipelines failed today?", sig: "failed today",
    response: {
      text: "3 runs failed today. Only one actually needs you — the other two were upstream hiccups:",
      components: [{ id: "incidents", props: {
        title: "3 failed runs today", sub: "1 needs you · 2 are transient and safe to retry", date: "Fri, Sep 18", now: NOW,
        groups: [
          { label: "Needs your action", hint: "Task alert — won't fix itself", tone: "danger", items: [
            { icon: "📘", name: "fb_campaign_insights", reason: "Credential fb_main expired", h: 9, type: "Scheduled", status: "Error", log: "Show the run log for fb_campaign_insights", fix: { label: "Re-auth", send: "Re-authorise the fb_main credential" } },
          ] },
          { label: "Transient · safe to retry", hint: "Warning alerts — upstream hiccups", tone: "warn", items: [
            { icon: "📦", name: "amz_fba_inventory", reason: "Amazon report timed out after 60m", h: 6.25, type: "Scheduled", status: "Timeout", log: "Show the run log for amz_fba_inventory", fix: { label: "Re-run", send: "Re-run amz_fba_inventory" } },
            { icon: "📊", name: "gads_keyword_daily", reason: "Google Ads API rate limit — daily quota hit", h: 11.33, type: "Manual", status: "Failed", fix: { label: "Retry", send: "Re-run gads_keyword_daily" } },
          ] },
        ],
        actions: [{ label: "Re-run the transient ones", primary: true, send: "Re-run everything that failed overnight" }, { label: "Why did fb_campaign_insights fail?", send: "Why did fb_campaign_insights fail?" }],
      } }],
    },
  },
  {
    id: "why-failed", category: "Monitoring", prompt: "Why did fb_campaign_insights fail?", sig: "why did",
    response: {
      text: "It's a credential problem, not your data. Here's the diagnosis, with the full run log underneath:",
      components: [fbDiagnosis, fbFailLog],
    },
  },
  {
    id: "run-log-fb", category: "Monitoring", prompt: "Show the run log for fb_campaign_insights", sig: "run log for fb",
    response: { text: "Here's the diagnosis and the full run log — the failure is on line 3:", components: [fbDiagnosis, fbFailLog] },
  },
  {
    id: "run-log-amz", category: "Monitoring", prompt: "Show the run log for amz_fba_inventory", sig: "run log for amz",
    response: { text: "The run timed out mid-extract. Here's the diagnosis, then the log showing where it stalled:", components: [amzDiagnosis, amzFailLog] },
  },
  {
    id: "schedule-of", category: "Monitoring", prompt: "What's the schedule of amz_sales_traffic_daily?", sig: "schedule of",
    response: {
      components: [{ id: "schedule", props: {
        icon: "📦", title: "amz_sales_traffic_daily", route: "Amazon Seller Central → Snowflake", status: "Active",
        next: { when: "Tomorrow, 06:00 IST", in: "15h 30m" }, runs: [6], now: NOW,
        history: [
          { d: "Sat", s: "Success", rows: "1.1M", dur: "4m 02s" }, { d: "Sun", s: "Success", rows: "0.9M", dur: "3m 40s" },
          { d: "Mon", s: "Success", rows: "1.2M", dur: "4m 18s" }, { d: "Tue", s: "Partial", rows: "0.6M", dur: "6m 55s" },
          { d: "Wed", s: "Success", rows: "1.2M", dur: "4m 09s" }, { d: "Thu", s: "Success", rows: "1.3M", dur: "4m 21s" },
          { d: "Fri", s: "Success", rows: "1.2M", dur: "4m 12s" },
        ],
        historyNote: "6 clean · 1 partial",
        settings: [{ k: "Frequency", v: "Daily · 06:00" }, { k: "Insert mode", v: "UPSERT" }, { k: "Timezone", v: "Asia/Kolkata (IST)" }, { k: "Avg duration", v: "4m 34s" }],
        note: "Amazon settles sales ~48h late — UPSERT rewrites the last 2 days on every run, so recent numbers self-correct.",
        actions: [{ label: "Run now", primary: true, send: "Re-run amz_sales_traffic_daily" }, { label: "Change to hourly", send: "Change amz_sales_traffic_daily to run hourly" }],
      } }],
    },
  },
  {
    id: "creds-expiring", category: "Monitoring", prompt: "Which credentials are expired or expiring?", sig: "expir",
    response: {
      text: "One is already expired and one is close:",
      components: [{ id: "credentials", props: {
        title: "Credential health", sub: "7 credentials · showing the ones worth knowing about",
        summary: [{ n: 1, label: "expired", tone: "danger" }, { n: 1, label: "expiring soon", tone: "warn" }, { n: 5, label: "healthy", tone: "ok" }],
        rows: [
          { icon: "📘", name: "fb_main", platform: "Facebook Ads", account: "acme-marketing", pipelines: 9, tone: "danger", used: 100, label: "Expired 2 days ago · Sep 16", action: { label: "Re-authorise", send: "Re-authorise the fb_main credential" } },
          { icon: "📊", name: "gads_main", platform: "Google Ads", account: "MCC 812-440", pipelines: 5, tone: "warn", used: 92, label: "Expires in 5 days · Sep 23", action: { label: "Renew now", send: "Renew the gads_main credential" } },
          { icon: "📦", name: "amazon_prod", platform: "Amazon SP-API", account: "Seller · NA", pipelines: 7, tone: "ok", used: 34, label: "Expires in 241 days" },
          { icon: "🛒", name: "shopify_store", platform: "Shopify", account: "acme.myshopify.com", pipelines: 3, tone: "ok", used: 0, label: "Doesn't expire" },
        ],
        note: "Facebook tokens last 60 days. Google refresh tokens can also be revoked early when someone changes their password.",
      } }],
    },
  },
  {
    id: "digest", category: "Monitoring", prompt: "Give me a morning health digest", sig: "digest",
    response: {
      components: [{ id: "digest", props: {
        title: "Pipeline health", date: "Fri, Sep 18",
        counts: { ok: 9, warn: 1, fail: 2 },
        stats: [{ value: "47.2M", label: "rows today" }, { value: "12", label: "pipelines" }, { value: "98.3%", label: "success · 7d" }],
        items: [
          { level: "fail", label: "fb_campaign_insights", detail: "credential expiry · failed 3×", action: "Re-authorise the fb_main credential", actionLabel: "Re-auth" },
          { level: "fail", label: "amz_fba_inventory", detail: "timeout at 06:15", action: "Re-run amz_fba_inventory", actionLabel: "Re-run" },
          { level: "warn", label: "shopify_orders", detail: "no new rows in last 2 runs" },
          { level: "ok", label: "9 others", detail: "running on schedule" },
        ],
        actions: [{ label: "Re-run all failed", primary: true, send: "Re-run everything that failed overnight" }],
      } }],
    },
  },
  {
    id: "stale", category: "Monitoring", prompt: "Which pipelines haven't run in 3 days?", sig: "haven",
    response: {
      components: [{ id: "freshness", props: {
        title: "2 pipelines have gone quiet", sub: "No run in the last 72 hours",
        rows: [
          { icon: "📊", name: "gads_campaign_perf", reason: "Paused by you on Sep 15 — its schedule is off", state: "Paused", expectedH: 24, cadenceLabel: "24h", lastH: 79.5, last: "3 days ago · Sep 15, 07:00",
            actions: [{ label: "Resume", primary: true, send: "Resume gads_campaign_perf" }, { label: "What changed?", send: "What changed on gads_campaign_perf?" }] },
          { icon: "📦", name: "old_return_report", reason: "Manual-only — never put on a schedule", state: "Stale", expectedH: null, lastH: 296, last: "12 days ago · Sep 6",
            actions: [{ label: "Schedule daily", send: "Schedule old_return_report daily" }, { label: "Archive", send: "Archive old_return_report" }] },
        ],
        note: "Everything else ran inside its expected window.",
      } }],
    },
  },
  {
    id: "rows-month", category: "Monitoring", prompt: "How many rows did we process this month?", sig: "rows did we process",
    response: {
      components: [{ id: "volume", props: {
        title: "Rows processed", period: "September · month to date",
        hero: "312.8M", delta: { value: "▲ 8.4%", good: true, vs: "vs the same point in August" },
        yMax: 25, ticks: [0, 10, 20], todayLabel: "Today so far",
        series: [17.8, 18.4, 18.9, 19.3, 14.1, 13.2, 18.2, 18.7, 19.4, 19.8, 20.1, 14.6, 13.5, 18.6, 19.2, 19.9, 16.1, 13.0].map((v, i) => ({ d: i + 1, v })),
        breakdown: [
          { name: "shopify_orders", v: "88.1M", pct: 28 },
          { name: "amz_sales_traffic_daily", v: "61.4M", pct: 20 },
          { name: "fb_campaign_insights", v: "42.0M", pct: 13 },
          { name: "11 other pipelines", v: "121.3M", pct: 39, other: true },
        ],
      } }],
    },
  },
  {
    id: "change-history", category: "Monitoring", prompt: "What changed on gads_campaign_perf?", sig: "what changed on",
    response: {
      components: [{ id: "changes", props: {
        icon: "📊", title: "gads_campaign_perf", route: "Google Ads → BigQuery",
        insight: "Paused since Sep 15 — that's why it hasn't run in 3 days. Also worth knowing: Dana's Sep 10 switch to REPLACE means each run overwrites the table instead of merging.",
        events: [
          { who: "you", verb: "paused the pipeline", when: "Sep 15 · 18:42", field: "Schedule", from: "Daily 07:00", to: "Paused", revert: { label: "Resume", send: "Resume gads_campaign_perf" } },
          { who: "dana@acme.com", verb: "changed the insert mode", when: "Sep 10 · 11:05", field: "Insert mode", from: "UPSERT", to: "REPLACE" },
          { who: "dana@acme.com", verb: "switched the report", when: "Sep 10 · 11:04", field: "Report", from: "campaign_daily", to: "campaign_performance" },
          { who: "you", verb: "created the pipeline", when: "Sep 2 · 09:30", field: "Route", to: "Google Ads → BigQuery" },
        ],
      } }],
    },
  },
  {
    id: "rerun-failed", category: "Monitoring", prompt: "Re-run everything that failed overnight", sig: "re run everything",
    response: {
      text: "Re-queued the two transient failures. I held back fb_campaign_insights — it would just fail again until its credential is fixed.",
      components: [{ id: "bulkrun", props: {
        rows: [
          { icon: "📦", name: "amz_fba_inventory", route: "Amazon Seller Central → Snowflake", rows: 482113, dur: 2600, delay: 250, took: "6m 41s" },
          { icon: "📊", name: "gads_keyword_daily", route: "Google Ads → BigQuery", rows: 91840, dur: 1800, delay: 900, took: "2m 05s" },
          { icon: "📘", name: "fb_campaign_insights", skipped: true, reason: "fb_main expired — a re-run would fail again", fix: { label: "Re-authorise fb_main first", send: "Re-authorise the fb_main credential" } },
        ],
      } }],
    },
  },
  {
    id: "tomorrow", category: "Monitoring", prompt: "What's scheduled to run tomorrow?", sig: "run tomorrow",
    response: {
      components: [{ id: "agenda", props: {
        title: "Tomorrow · Sat, Sep 19", sub: "27 scheduled runs across 4 active pipelines · times in IST",
        lanes: [
          { name: "shopify_orders", cadence: "Hourly · 24 runs", runs: Array.from({ length: 24 }, (_, i) => i) },
          { name: "amz_sales_traffic_daily", cadence: "Daily", runs: [6], label: "06:00" },
          { name: "amz_fba_inventory", cadence: "Daily", runs: [6.25], label: "06:15" },
          { name: "fb_campaign_insights", cadence: "Daily", runs: [9], label: "09:00 · will fail", tone: "danger", warn: "will fail — fb_main expired" },
          { name: "gads_campaign_perf", cadence: "Daily · paused", paused: true },
        ],
        peak: { from: 6, to: 6.5, text: "06:00 – 06:30 is the busiest window — both Amazon reports start alongside the hourly Shopify sync" },
        warn: "fb_campaign_insights will fail at 09:00 unless fb_main is re-authorised before then.",
        actions: [{ label: "Re-authorise fb_main", primary: true, send: "Re-authorise the fb_main credential" }],
      } }],
    },
  },
  {
    id: "most-errors", category: "Monitoring", prompt: "Which connector has the most errors this week?", sig: "most errors",
    response: {
      components: [{ id: "ranking", props: {
        title: "Errors by connector", period: "Last 7 days · Sep 12 – 18",
        rows: [
          { icon: "📘", name: "Facebook Ads", errors: 14, runs: 16, reason: "All 14 · expired credential" },
          { icon: "📦", name: "Amazon", errors: 3, runs: 42, reason: "Report timeouts" },
          { icon: "📊", name: "Google Ads", errors: 2, runs: 9, reason: "API rate limit" },
          { icon: "🛒", name: "Shopify", errors: 0, runs: 168, reason: "No errors" },
        ],
        insight: "Facebook's 14 errors are one problem, not fourteen — they all trace back to the expired fb_main credential. Fixing it removes ~74% of this week's errors.",
        actions: [{ label: "Re-authorise fb_main", primary: true, send: "Re-authorise the fb_main credential" }],
      } }],
    },
  },

  // ---------------- Pipelines (data) ----------------
  {
    id: "preview", category: "Pipelines", prompt: "Show me a sample of shopify_orders", sig: "sample of",
    response: {
      text: "Here's a live sample from BigQuery:",
      components: [{ id: "preview", props: {
        icon: "🛒", table: "shopify_orders", dest: "BigQuery", path: "acme-prod.shopify.orders",
        meta: [{ k: "Rows", v: "88.1M" }, { k: "Columns", v: "31" }, { k: "Size", v: "12.4 GB" }, { k: "Last sync", v: "8 min ago" }],
        columns: [
          { key: "order_id", type: "string" }, { key: "created_at", type: "time" }, { key: "customer_email", type: "string", pii: true },
          { key: "total_price", type: "number", align: "right" }, { key: "financial_status", type: "enum" }, { key: "discount_code", type: "string" },
        ],
        rows: [
          { order_id: "#1042", created_at: "2026-09-18 08:12", customer_email: "m•••@gmail.com", total_price: "$128.40", financial_status: "paid", discount_code: "FALL15" },
          { order_id: "#1041", created_at: "2026-09-18 07:55", customer_email: "j•••@outlook.com", total_price: "$54.00", financial_status: "paid", discount_code: null },
          { order_id: "#1040", created_at: "2026-09-18 07:31", customer_email: "p•••@acme.io", total_price: "$212.90", financial_status: "refunded", discount_code: null },
          { order_id: "#1039", created_at: "2026-09-18 07:02", customer_email: "a•••@yahoo.com", total_price: "$76.25", financial_status: "pending", discount_code: "WELCOME10" },
          { order_id: "#1038", created_at: "2026-09-18 06:48", customer_email: "r•••@gmail.com", total_price: "$19.99", financial_status: "paid", discount_code: null },
        ],
        showing: "Showing 5 of 88.1M rows · newest first · emails masked",
        actions: [{ label: "See all columns", send: "What columns are in shopify_orders?" }, { label: "Build a segment from this", send: "Customers who spent over $100 in the last 30 days" }],
      } }],
    },
  },
  {
    id: "schema", category: "Pipelines", prompt: "What columns are in shopify_orders?", sig: "what columns",
    response: {
      components: [{ id: "schema", props: {
        table: "shopify_orders", sub: "BigQuery · acme-prod.shopify.orders", total: 31,
        columns: [
          { name: "order_id", type: "STRING", key: true, fill: 100, sample: "#1042" },
          { name: "created_at", type: "TIMESTAMP", fill: 100, sample: "2026-09-18 08:12" },
          { name: "customer_id", type: "STRING", fill: 99.6, sample: "c_88213" },
          { name: "customer_email", type: "STRING", pii: true, fill: 97.1, sample: "m•••@gmail.com" },
          { name: "phone", type: "STRING", pii: true, fill: 41.8, sample: "+1 •••• 0192" },
          { name: "total_price", type: "NUMERIC", fill: 100, sample: "128.40" },
          { name: "currency", type: "STRING", fill: 100, sample: "USD" },
          { name: "financial_status", type: "STRING", fill: 100, sample: "paid" },
          { name: "discount_code", type: "STRING", fill: 18.4, sample: "FALL15" },
          { name: "shipping_country", type: "STRING", fill: 99.1, sample: "US" },
          { name: "row_id", type: "STRING", audit: true, fill: 100, sample: "a9f3c1…" },
          { name: "ts_created", type: "TIMESTAMP", audit: true, fill: 100, sample: "2026-09-18 08:14" },
        ],
        actions: [{ label: "Preview rows", send: "Show me a sample of shopify_orders" }],
      } }],
    },
  },

  // ---------------- Activation (Reverse ETL) ----------------
  {
    id: "push-fb", category: "Activation", prompt: "Push my high-value customers to Facebook Ads", sig: "high value customers to facebook",
    response: {
      text: "I'll set up a reverse-ETL audience sync. Check the field mapping, then create it:",
      components: [{ id: "mapping", props: {
        title: "Sync · High-value customers → Facebook Ads", sub: "Reverse ETL · audience sync",
        from: { icon: "🗄️", sys: "BigQuery", name: "seg_high_value_customers" },
        to: { icon: "📘", sys: "Facebook Ads", name: "Custom Audience · High value" },
        fields: [
          { src: "email", dst: "EMAIL", key: true, keyLabel: "match key", hashed: true },
          { src: "phone", dst: "PHONE", key: true, keyLabel: "match key", hashed: true },
          { src: "first_name", dst: "FN", hashed: true },
          { src: "country", dst: "COUNTRY" },
        ],
        stats: [{ k: "Audience", v: "24,318" }, { k: "Est. match rate", v: "~68%", meter: 68 }, { k: "Schedule", v: "Every 6h" }, { k: "Mode", v: "Mirror" }],
        note: "Emails, phones and names are SHA-256 hashed inside your warehouse before anything leaves it. Mirror mode also removes people who drop out of the segment.",
        actions: [{ label: "Create sync", primary: true, send: "Create the Facebook Ads sync" }],
      } }],
    },
  },
  {
    id: "sync-sf", category: "Activation", prompt: "Sync my orders table to Salesforce", sig: "to salesforce",
    response: {
      components: [{ id: "mapping", props: {
        title: "Sync · Orders → Salesforce", sub: "Reverse ETL · record sync",
        from: { icon: "🗄️", sys: "BigQuery", name: "shopify_orders" },
        to: { icon: "☁️", sys: "Salesforce", name: "Order object" },
        fields: [
          { src: "order_id", dst: "External_Id__c", key: true, keyLabel: "upsert key" },
          { src: "customer_email", dst: "BillToContact.Email" },
          { src: "total_price", dst: "TotalAmount" },
          { src: "created_at", dst: "EffectiveDate" },
          { src: "financial_status", dst: "Status" },
        ],
        stats: [{ k: "Records", v: "1.2M" }, { k: "Mode", v: "Upsert" }, { k: "Schedule", v: "Daily 07:00" }, { k: "API calls / run", v: "~2.1K" }],
        note: "Upserting on External_Id__c means re-syncs update existing Orders instead of creating duplicates.",
        actions: [{ label: "Create sync", primary: true, send: "Create the Salesforce sync" }],
      } }],
    },
  },

  // ---------------- Transform & Segment ----------------
  {
    id: "build-transform", category: "Transform", prompt: "Build a daily table joining orders and ad spend by SKU", sig: "joining orders",
    response: {
      text: "Here's the transformation — it runs inside your warehouse (ELT), so the raw tables stay untouched:",
      components: [{ id: "transform", props: {
        name: "daily_sku_performance", sub: "ELT · runs inside BigQuery",
        inputs: [{ icon: "🛒", name: "shopify_orders", meta: "88.1M rows" }, { icon: "📊", name: "gads_campaign_perf", meta: "4.2M rows" }],
        op: "LEFT JOIN", opMeta: "on sku, day",
        output: { name: "daily_sku_performance", est: "~182K rows", cols: ["sku", "day", "revenue", "units", "ad_spend", "roas"] },
        config: [{ k: "Trigger", v: "After both inputs finish" }, { k: "Materialize", v: "Table · replace daily" }],
        warn: "Heads-up: gads_campaign_perf has been paused since Sep 15, so ad_spend and roas will read 0 from then until it resumes.",
        sql: "CREATE OR REPLACE TABLE analytics.daily_sku_performance AS\nSELECT\n  o.sku,\n  DATE(o.created_at)         AS day,\n  SUM(o.total_price)         AS revenue,\n  SUM(o.quantity)            AS units,\n  COALESCE(MAX(a.spend), 0)  AS ad_spend,\n  SAFE_DIVIDE(SUM(o.total_price), MAX(a.spend)) AS roas\nFROM shopify_orders o\nLEFT JOIN gads_campaign_perf a\n  ON a.sku = o.sku AND a.day = DATE(o.created_at)\nGROUP BY 1, 2;",
        actions: [{ label: "Create & schedule", primary: true, send: "Create and schedule the transformation" }, { label: "Test run", send: "Test the transformation" }],
      } }],
    },
  },
  {
    id: "segment", category: "Transform", prompt: "Customers who spent over $100 in the last 30 days", sig: "spent over",
    response: {
      text: "Here's the segment I'll build:",
      components: [{ id: "segment", props: {
        name: "high_value_customers", sub: "BigQuery · shopify_orders · recomputes daily at 03:00",
        rules: [{ text: "Customers where" }, { field: "Total spend", op: "is more than", value: "$100" }, { join: "and" }, { field: "Order date", op: "is within the last", value: "30 days" }],
        funnel: [{ label: "All customers", v: 182406 }, { label: "Ordered in the last 30 days", v: 41220 }, { label: "…and spent more than $100", v: 24318 }],
        sample: [
          { name: "Maya Reyes", email: "m•••@gmail.com", spend: "$412.80", orders: 4 },
          { name: "Jon Kim", email: "j•••@outlook.com", spend: "$268.10", orders: 2 },
          { name: "Priya Shah", email: "p•••@acme.io", spend: "$184.00", orders: 3 },
        ],
        sql: "SELECT customer_id, email\nFROM shopify_orders\nWHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)\nGROUP BY customer_id, email\nHAVING SUM(total_price) > 100;",
        actions: [{ label: "Save segment", primary: true, send: "Save the high_value_customers segment" }, { label: "Sync to Facebook Ads", send: "Push my high-value customers to Facebook Ads" }],
      } }],
    },
  },

  // ---------------- Orchestration ----------------
  {
    id: "workflow", category: "Orchestration", prompt: "Every day pull Shopify, rebuild the revenue table, then post to Slack", sig: "rebuild the revenue",
    response: {
      text: "Here's the workflow — four steps and a decision gate:",
      components: [{ id: "workflow", props: {
        name: "Daily Shopify → Slack", schedule: "Every day at 02:00 IST · 4 steps, 1 decision",
        nodes: [
          { type: "trigger", title: "Every day at 02:00", meta: "Schedule trigger" },
          { type: "extract", title: "Run shopify_orders", meta: "Retry 2× · 5 min backoff" },
          { type: "transform", title: "Rebuild daily_revenue", meta: "Only if step 2 finished in the last 2h" },
          { type: "decision", title: "At least 10 new orders today?", meta: "Checks daily_revenue.order_count",
            yes: { type: "activate", title: "Post summary to #sales", meta: "Slack · revenue, orders, top SKU" },
            no: { type: "end", title: "Stop quietly", meta: "Logged, no message" } },
        ],
        guards: ["Freshness guard: the rebuild waits for fresh Shopify data", "If any node fails, #data-alerts gets the run log"],
        actions: [{ label: "Create workflow", primary: true, send: "Create the daily Shopify workflow" }],
      } }],
    },
  },

  // ---------------- Admin & team ----------------
  {
    id: "invite", category: "Admin", prompt: "Invite dana@acme.com as a read-only user", sig: "invite dana",
    response: {
      components: [{ id: "invite", props: {
        name: "Dana", email: "dana@acme.com", sub: "They'll get an email to join your account",
        role: "Read-only", workspaces: ["Default"],
        roles: [{ name: "Admin", desc: "Everything, incl. users & billing" }, { name: "Editor", desc: "Build and change pipelines" }, { name: "Read-only", desc: "View and run only" }],
        perms: ["View pipelines & logs", "Run pipelines", "Create pipelines", "Edit & delete pipelines", "Manage credentials", "Users & billing"],
        matrix: { "Admin": [1, 1, 1, 1, 1, 1], "Editor": [1, 1, 1, 1, 1, 0], "Read-only": [1, 1, 0, 0, 0, 0] },
        send: "Send the invite to dana@acme.com",
      } }],
    },
  },
  {
    id: "slack-alerts", category: "Admin", prompt: "Send pipeline errors to our #data-alerts Slack", sig: "data alerts",
    response: {
      components: [{ id: "alertrule", props: {
        title: "Alert rule · pipeline errors", sub: "Posts to Slack the moment a run errors",
        rule: [{ t: "When" }, { chip: "any pipeline" }, { t: "has a run that" }, { chip: "errors or fails", accent: true }, { t: "post to" }, { chip: "Slack · #data-alerts", accent: true }],
        options: [
          { label: "Include a link to the run log", on: true },
          { label: "Group repeats — one message per pipeline per hour", on: true },
          { label: "Also alert on warnings (timeouts, no new rows)", on: false },
        ],
        preview: { channel: "#data-alerts", time: "09:00", title: "fb_campaign_insights failed", lines: ["Credential expiry — fb_main's token expired", "3rd failure in a row · 9 pipelines share this credential"] },
        send: "Turn on the Slack error notifications",
      } }],
    },
  },
  {
    id: "credits", category: "Admin", prompt: "How many credits did we use this month?", sig: "credits did we use",
    response: {
      components: [{ id: "credits", props: {
        title: "Credits this month", sub: "September · day 18 of 30 · Professional plan",
        used: 1.84, plan: 5, projected: 2.9, day: 18, days: 30, resets: "Oct 1",
        usedLabel: "1.84M", planLabel: "5M", projectedLabel: "2.9M",
        tiles: [{ label: "Daily burn", value: "102K", sub: "avg, last 7 days" }, { label: "Projected", value: "2.9M", sub: "58% of plan" }, { label: "Headroom", value: "2.1M", sub: "left at month end" }],
        breakdown: [{ name: "Extract (ETL)", v: "1.14M", pct: 62 }, { name: "Transform", v: "0.42M", pct: 23 }, { name: "Activation", v: "0.28M", pct: 15 }],
        insight: "You're under plan pace — 37% used with 60% of the month gone. The hourly Shopify sync is the biggest single line (0.31M).",
      } }],
    },
  },

  // ---------------- Agency / workspaces ----------------
  {
    id: "workspace", category: "Agency", prompt: "Spin up a workspace for client Hooli", sig: "workspace for client",
    response: {
      components: [{ id: "wssetup", props: {
        title: "New client workspace · Hooli", sub: "An isolated workspace under your enterprise account",
        org: "Your agency", plan: "Enterprise",
        existing: [{ name: "Acme", pipes: 26 }, { name: "Globex", pipes: 9 }, { name: "Initech", pipes: 4 }],
        created: { name: "Hooli" },
        config: [{ k: "Timezone", v: "America/New_York" }, { k: "Warehouse", v: "Shared BigQuery" }, { k: "Admins", v: "You (super-admin)" }],
        isolation: ["Credentials", "Pipelines", "API keys", "Run logs"],
        shared: "Billing rolls up to your enterprise account, and your super-admin role keeps access.",
        copy: { label: "Copy my Amazon setup into Hooli", sub: "7 pipelines as templates — Hooli connects its own Amazon credential", on: false },
        send: "Create the Hooli workspace", sendWithCopy: "Create the Hooli workspace and copy my Amazon setup into it",
      } }],
    },
  },
  {
    id: "workspace-usage", category: "Agency", prompt: "Which client is using the most credits?", sig: "most credits",
    response: {
      components: [{ id: "share", props: {
        title: "Credits by client workspace", sub: "September · month to date", total: "1.84M credits",
        rows: [
          { name: "Acme", pipes: 26, credits: "1.10M", pct: 60, trend: "12%", up: true },
          { name: "Globex", pipes: 9, credits: "0.50M", pct: 27, trend: "3%", up: false },
          { name: "Initech", pipes: 4, credits: "0.24M", pct: 13, trend: "1%", up: true },
        ],
        insight: "Acme is 60% of usage on 26 pipelines, and 11 of those run hourly. Moving 8 of them to daily would save ~0.3M credits a month — worth raising before their renewal.",
      } }],
    },
  },

  // ---------------- Ask your data (analytics) ----------------
  {
    id: "top-skus", category: "Analytics", prompt: "What were my top 5 SKUs by revenue last month?", sig: "top 5 skus",
    response: {
      text: "From your Amazon + Shopify tables, last month:",
      components: [{ id: "leaderboard", props: {
        title: "Top 5 SKUs by revenue", sub: "August 2026 · Amazon + Shopify",
        rows: [
          { sku: "VC-500", name: "VitaCup Focus 16ct", v: 142880, units: "9,530", delta: "18%", up: true },
          { sku: "BB-210", name: "Better Being Multivit", v: 98120, units: "6,540", delta: "4%", up: true },
          { sku: "PX-018", name: "Plix Glow 15", v: 74300, units: "4,950", delta: "7%", up: false },
          { sku: "NW-004", name: "Nimble Wireless Buds", v: 61220, units: "1,020", delta: "22%", up: true },
          { sku: "FS-330", name: "Face Shop Serum", v: 52700, units: "3,510", delta: "2%", up: false },
        ],
        insight: "VitaCup Focus alone is a third of top-5 revenue — and still growing (+18% vs July).",
        handoff: "Answered by Ask Neo (analytics) — the copilot handed this over and returned the result",
      } }],
    },
  },

  // ---------------- follow-ups (from action buttons) ----------------
  {
    id: "reauth", category: "Monitoring", prompt: "Re-authorise the fb_main credential", sig: "re auth",
    response: { components: [{ id: "authflow", props: {
      icon: "📘", title: "Re-authorising fb_main", doneTitle: "fb_main is connected again", platform: "Facebook Ads · acme-marketing",
      steps: [
        { label: "Opening Facebook's consent screen", doneLabel: "Opened Facebook's consent screen", at: 500 },
        { label: "Waiting for your approval on Facebook", doneLabel: "Approved on Facebook", at: 1900 },
        { label: "Verifying the new token", doneLabel: "New token verified · valid until Nov 17", at: 2700 },
      ],
      resume: { label: "Resuming 9 pipelines from their last good cursor — Sep 16 – 18 will backfill", items: ["fb_campaign_insights", "fb_adset_daily", "fb_ad_creatives"], more: 6 },
      actions: [{ label: "Re-run fb_campaign_insights now", primary: true, send: "Re-run fb_campaign_insights" }],
    } }] },
  },
  { id: "renew-gads", category: "Monitoring", prompt: "Renew the gads_main credential", sig: "renew the gads",
    response: receipt("gads_main renewed", "New Google Ads refresh token issued — good for another 60 days.", { lines: [{ k: "Pipelines", v: "5 keep running, uninterrupted" }, { k: "Next expiry", v: "Nov 22" }] }) },
  { id: "resume-gads", category: "Monitoring", prompt: "Resume gads_campaign_perf", sig: "resume gads",
    response: receipt("gads_campaign_perf resumed", "Back on its daily 07:00 schedule — next run tomorrow at 07:00.", { next: { label: "Backfill the paused days", send: "Backfill gads_campaign_perf from Sep 15" } }) },
  { id: "backfill-gads", category: "Monitoring", prompt: "Backfill gads_campaign_perf from Sep 15", sig: "backfill gads",
    response: receipt("Backfill queued", "gads_campaign_perf will re-pull Sep 15 – 18 (4 days) right after its next run.", { lines: [{ k: "Run type", v: "Backfill" }, { k: "Window", v: "2026-09-15 → 2026-09-18", mono: true }] }) },
  { id: "schedule-old", category: "Monitoring", prompt: "Schedule old_return_report daily", sig: "schedule old return",
    response: receipt("Scheduled daily", "old_return_report now runs every day at 05:00 IST.") },
  { id: "archive-old", category: "Monitoring", prompt: "Archive old_return_report", sig: "archive old",
    response: receipt("Archived", "old_return_report is archived and won't run — its table stays in your warehouse.") },
  { id: "cf-timeout", category: "Monitoring", prompt: "Increase the timeout for amz_fba_inventory", sig: "increase the timeout",
    response: receipt("Timeout raised", "amz_fba_inventory now waits up to 120m for Amazon's report (was 60m).", { next: { label: "Re-run it now", send: "Re-run amz_fba_inventory" } }) },
  { id: "cf-sync-fb", category: "Activation", prompt: "Create the Facebook Ads sync", sig: "facebook ads sync",
    response: receipt("Sync is live", "High-value customers → Facebook Ads. The first sync runs within the hour.", { lines: [{ k: "Audience", v: "24,318 profiles queued" }, { k: "Schedule", v: "Every 6 hours" }], next: { label: "Alert me if it fails", send: "Send pipeline errors to our #data-alerts Slack" } }) },
  { id: "cf-sync-sf", category: "Activation", prompt: "Create the Salesforce sync", sig: "salesforce sync",
    response: receipt("Salesforce sync created", "Orders → Salesforce Order object, upserting on External_Id__c.", { lines: [{ k: "First run", v: "Tomorrow, 07:00" }] }) },
  { id: "cf-transform", category: "Transform", prompt: "Create and schedule the transformation", sig: "schedule the transformation",
    response: receipt("Transformation scheduled", "daily_sku_performance rebuilds after shopify_orders and gads_campaign_perf finish each day.", { next: { label: "Resume gads_campaign_perf too", send: "Resume gads_campaign_perf" } }) },
  { id: "cf-test", category: "Transform", prompt: "Test the transformation", sig: "test the transformation",
    response: receipt("Test run passed", "Ran on a 1% sample in 3.2s with no errors.", { lines: [{ k: "Rows out", v: "1,842" }, { k: "ad_spend = 0", v: "100% of rows — source is paused" }] }) },
  { id: "cf-segment", category: "Transform", prompt: "Save the high_value_customers segment", sig: "customers segment",
    response: receipt("Segment saved", "high_value_customers (~24,318 people) recomputes daily at 03:00.", { next: { label: "Sync it to Facebook Ads", send: "Push my high-value customers to Facebook Ads" } }) },
  { id: "cf-workflow", category: "Orchestration", prompt: "Create the daily Shopify workflow", sig: "shopify workflow",
    response: receipt("Workflow created", "Daily Shopify → Slack runs at 02:00, retrying each node twice.", { lines: [{ k: "First run", v: "Tomorrow, 02:00" }] }) },
  { id: "cf-invite", category: "Admin", prompt: "Send the invite to dana@acme.com", sig: "invite to dana",
    response: receipt("Invite sent", "dana@acme.com will get an email to join with the role you picked.", { lines: [{ k: "Link expires", v: "in 7 days" }], undo: { label: "Revoke invite", send: "Revoke the invite to dana@acme.com" } }) },
  { id: "revoke-invite", category: "Admin", prompt: "Revoke the invite to dana@acme.com", sig: "revoke the invite",
    response: receipt("Invite revoked", "dana@acme.com's invite link no longer works.") },
  { id: "cf-notif", category: "Admin", prompt: "Turn on the Slack error notifications", sig: "slack error notifications",
    response: receipt("Alerts are on", "Pipeline errors now post to Slack #data-alerts in real time.", { next: { label: "Send a test message", send: "Send a test alert to #data-alerts" } }) },
  { id: "test-alert", category: "Admin", prompt: "Send a test alert to #data-alerts", sig: "test alert",
    response: receipt("Test alert sent", "Check #data-alerts in Slack — a sample failure message just posted.") },
  { id: "cf-workspace-copy", category: "Agency", prompt: "Create the Hooli workspace and copy my Amazon setup into it", sig: "copy my amazon setup",
    response: receipt("Workspace created", "Hooli is live, with your 7 Amazon pipelines copied in as templates.", { lines: [{ k: "Next step", v: "Hooli connects its own Amazon credential" }] }) },
  { id: "cf-workspace", category: "Agency", prompt: "Create the Hooli workspace", sig: "hooli workspace",
    response: receipt("Workspace created", "Hooli is live — America/New_York, shared BigQuery. Switch to it any time.") },
  // generic single re-run — must stay after "rerun-failed" so the "everything" variant wins first
  { id: "rerun-one", category: "Monitoring", prompt: "Re-run a pipeline", sig: "re run",
    response: receipt("Run queued", "A manual run is queued — it shows up in the run grid within a minute.") },
];

export function matchScenario(raw: string): ScenarioResponse | null {
  const n = norm(raw);
  const exact = SCENARIOS.find((s) => norm(s.prompt) === n);
  if (exact) return exact.response;
  const bySig = SCENARIOS.find((s) => s.sig && n.includes(s.sig));
  return bySig ? bySig.response : null;
}

// The categorized prompt library shown in the empty state. Includes create /
// manage prompts that route through the live engine (no scenario) plus every
// scenario prompt above.
export const PROMPT_CATEGORIES: { name: string; prompts: string[] }[] = [
  { name: "Create a pipeline", prompts: ["Pipe my Shopify orders into BigQuery every morning"] },
  { name: "Manage pipelines", prompts: ["Change amz_sales_traffic_daily to run hourly", "Pause all my Facebook Ads pipelines", "Show me a sample of shopify_orders", "What columns are in shopify_orders?"] },
  { name: "Monitoring & health", prompts: ["Give me a morning health digest", "What pipelines failed today?", "Why did fb_campaign_insights fail?", "Show the run log for fb_campaign_insights", "Show the run log for amz_fba_inventory", "Which credentials are expired or expiring?", "What's the schedule of amz_sales_traffic_daily?", "Which pipelines haven't run in 3 days?", "What's scheduled to run tomorrow?", "Which connector has the most errors this week?", "What changed on gads_campaign_perf?", "How many rows did we process this month?", "Re-run everything that failed overnight"] },
  { name: "Activation (Reverse ETL)", prompts: ["Push my high-value customers to Facebook Ads", "Sync my orders table to Salesforce"] },
  { name: "Transform & segment", prompts: ["Build a daily table joining orders and ad spend by SKU", "Customers who spent over $100 in the last 30 days"] },
  { name: "Orchestration", prompts: ["Every day pull Shopify, rebuild the revenue table, then post to Slack"] },
  { name: "Admin & team", prompts: ["Invite dana@acme.com as a read-only user", "Send pipeline errors to our #data-alerts Slack", "How many credits did we use this month?"] },
  { name: "Agency / workspaces", prompts: ["Spin up a workspace for client Hooli", "Which client is using the most credits?"] },
  { name: "Ask your data", prompts: ["What were my top 5 SKUs by revenue last month?"] },
];

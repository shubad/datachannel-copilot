// Scripted scenario catalogue — each suggested prompt maps to a designed
// AG-UI response (assistant text + one or more library components). This is the
// data behind the "prompt library" the prototype shows: every card here is a
// concrete example of what the copilot can answer/do. Grounded in the mock
// inventory in catalog.ts (shopify_orders, fb_campaign_insights[error], …).

import type { ComponentSpec } from "./types";

export type ScenarioResponse = { text?: string; components: ComponentSpec[] };
type Scenario = { id: string; category: string; prompt: string; sig?: string; response: ScenarioResponse };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9@#$ ]/g, " ").replace(/\s+/g, " ").trim();

// Failure diagnoses are shown as a structured detail list PLUS the raw terminal
// log — the summary tells you what's wrong, the log shows the finer, line-by-line
// evidence. Defined once so "why did X fail?" and "show the run log for X" match.
const fbFailDetail: ComponentSpec = { id: "detail", props: {
  title: "fb_campaign_insights · failure", subtitle: "Facebook Ads → BigQuery", status: "Error",
  rows: [
    { k: "Error type", v: "Credential Expiry", tone: "danger" },
    { k: "Alert class", v: "Task — action needed on your side" },
    { k: "Failed at", v: "today 09:00, 06:00, and yesterday 09:00" },
    { k: "Failure count", v: "3 runs in a row" },
    { k: "Cursor", v: "last good sync 2 days ago", mono: true },
  ],
  note: "The Facebook Ads token behind credential fb_main expired. Re-authorise it, then re-run — the cursor resumes from the last good sync, so no data is lost.",
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
  actions: [{ label: "Re-authorise fb_main", primary: true, send: "Re-authorise the fb_main credential" }, { label: "Re-run pipeline", send: "Re-run fb_campaign_insights" }],
} };
const amzFailDetail: ComponentSpec = { id: "detail", props: {
  title: "amz_fba_inventory · failure", subtitle: "Amazon Seller Central → Snowflake", status: "Timeout", icon: "📦",
  rows: [
    { k: "Error type", v: "Timeout", tone: "danger" },
    { k: "Alert class", v: "Warning — transient, Amazon-side" },
    { k: "Failed at", v: "today 06:15 (timed out 07:15)" },
    { k: "Duration", v: "60m — hit the report wait limit" },
    { k: "Cursor", v: "unchanged · safe to retry", mono: true },
  ],
  note: "Amazon's report queue was congested, so the SP-API report never reached DONE within the 60m limit. This usually clears on a re-run.",
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
  actions: [{ label: "Re-run now", primary: true, send: "Re-run amz_fba_inventory" }, { label: "Raise the timeout", send: "Increase the timeout for amz_fba_inventory" }],
} };

export const SCENARIOS: Scenario[] = [
  // ---------------- Monitoring & health ----------------
  {
    id: "failed-today", category: "Monitoring", prompt: "What pipelines failed today?", sig: "failed today",
    response: {
      text: "3 pipelines failed today (Sep 18). Here's the breakdown:",
      components: [{ id: "table", props: {
        statusKey: "status",
        columns: [{ key: "name", label: "Pipeline", mono: true }, { key: "type", label: "Run" }, { key: "at", label: "When" }, { key: "rows", label: "Rows", align: "right" }, { key: "status", label: "Status" }],
        rows: [
          { name: "fb_campaign_insights", type: "Scheduled", at: "09:00", rows: "0", status: "Error" },
          { name: "amz_fba_inventory", type: "Scheduled", at: "06:15", rows: "0", status: "Timeout" },
          { name: "gads_campaign_perf", type: "Manual", at: "11:20", rows: "0", status: "Failed" },
        ],
        note: "Ask “why did fb_campaign_insights fail?” to dig in, “show the run log for amz_fba_inventory” for line-by-line detail, or “re-run everything that failed overnight”.",
      } }],
    },
  },
  {
    id: "why-failed", category: "Monitoring", prompt: "Why did fb_campaign_insights fail?", sig: "why did",
    response: {
      text: "It's a credential problem, not your data. Here's the diagnosis, with the full run log underneath:",
      components: [fbFailDetail, fbFailLog],
    },
  },
  {
    id: "schedule-of", category: "Monitoring", prompt: "What's the schedule of amz_sales_traffic_daily?", sig: "schedule of",
    response: {
      components: [{ id: "detail", props: {
        title: "amz_sales_traffic_daily · schedule", subtitle: "Amazon Seller Central → Snowflake", status: "Active", icon: "📦",
        rows: [
          { k: "Frequency", v: "Daily (Normal)" },
          { k: "Next run", v: "tomorrow 06:00 IST" },
          { k: "Last run", v: "today 06:00 · Success · 1.2M rows" },
          { k: "Insert mode", v: "UPSERT" },
          { k: "Settlement", v: "~48h lag — Upsert keeps recent days fresh" },
        ],
        actions: [{ label: "Change schedule", send: "Change amz_sales_traffic_daily to run hourly" }, { label: "Run now", primary: true, send: "Re-run amz_sales_traffic_daily" }],
      } }],
    },
  },
  {
    id: "creds-expiring", category: "Monitoring", prompt: "Which credentials are expired or expiring?", sig: "expir",
    response: {
      text: "Two credentials need attention:",
      components: [{ id: "list", props: {
        title: "Credentials · expiry status",
        rows: [
          { icon: "📘", title: "fb_main", meta: "Facebook Ads · powers 9 pipelines", status: "Expired" },
          { icon: "📊", title: "gads_main", meta: "Google Ads · powers 5 pipelines", status: "Expiring" },
          { icon: "📦", title: "amazon_prod", meta: "Amazon · powers 7 pipelines", status: "Active" },
        ],
        note: "fb_main expired 2 days ago (9 pipelines affected). gads_main expires in 5 days.",
      } }],
    },
  },
  {
    id: "digest", category: "Monitoring", prompt: "Give me a morning health digest", sig: "digest",
    response: {
      components: [{ id: "digest", props: {
        title: "Pipeline health", date: "Thu, Sep 18",
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
      text: "Two pipelines have gone stale:",
      components: [{ id: "table", props: {
        statusKey: "status",
        columns: [{ key: "name", label: "Pipeline", mono: true }, { key: "last", label: "Last run" }, { key: "freq", label: "Frequency" }, { key: "status", label: "State" }],
        rows: [
          { name: "gads_campaign_perf", last: "3 days ago", freq: "Daily", status: "Paused" },
          { name: "old_return_report", last: "12 days ago", freq: "Manual", status: "Stale" },
        ],
        note: "gads_campaign_perf is paused. old_return_report is manual-only and never triggered.",
      } }],
    },
  },
  {
    id: "rows-month", category: "Monitoring", prompt: "How many rows did we process this month?", sig: "rows did we process",
    response: {
      components: [{ id: "stats", props: { items: [
        { label: "Rows · month to date", value: "312.8M" },
        { label: "Data · last 24h", value: "18.4 GB", sub: "▲ 6% vs prior day" },
        { label: "Top mover", value: "shopify_orders", sub: "88.1M rows" },
      ] } }],
    },
  },
  {
    id: "change-history", category: "Monitoring", prompt: "What changed on gads_campaign_perf?", sig: "what changed on",
    response: {
      components: [{ id: "table", props: {
        title: "Change history · gads_campaign_perf",
        columns: [{ key: "when", label: "When" }, { key: "who", label: "By" }, { key: "change", label: "Change" }],
        rows: [
          { when: "Sep 17", who: "you", change: "Schedule: Daily → Paused" },
          { when: "Sep 10", who: "dana@acme", change: "Insert mode: UPSERT → REPLACE" },
          { when: "Sep 2", who: "you", change: "Pipeline created" },
        ],
      } }],
    },
  },
  {
    id: "rerun-failed", category: "Monitoring", prompt: "Re-run everything that failed overnight", sig: "re run everything",
    response: {
      text: "Re-queued the ones I safely can:",
      components: [{ id: "C20", props: {
        title: "Re-queued 2 of 3 failed pipelines",
        rows: [
          { k: "amz_fba_inventory", v: "re-running", ok: true },
          { k: "gads_campaign_perf", v: "re-running", ok: true },
          { k: "fb_campaign_insights", v: "skipped — fix the expired credential first", ok: false },
        ],
        aside: "fb_campaign_insights needs fb_main re-authorised before it can run.",
      } }],
    },
  },
  {
    id: "tomorrow", category: "Monitoring", prompt: "What's scheduled to run tomorrow?", sig: "run tomorrow",
    response: {
      text: "14 scheduled runs tomorrow (Sep 19). The first few:",
      components: [{ id: "list", props: {
        rows: [
          { icon: "🛒", title: "shopify_orders", meta: "Hourly · 24 runs", right: "00:00" },
          { icon: "📦", title: "amz_sales_traffic_daily", meta: "Daily", right: "06:00" },
          { icon: "📦", title: "amz_fba_inventory", meta: "Daily", right: "06:15" },
          { icon: "📊", title: "gads_campaign_perf", meta: "Daily · paused", right: "—", status: "Paused" },
        ],
        note: "Times in your account timezone (IST).",
      } }],
    },
  },
  {
    id: "most-errors", category: "Monitoring", prompt: "Which connector has the most errors this week?", sig: "most errors",
    response: {
      text: "Facebook Ads is your problem child this week:",
      components: [{ id: "table", props: {
        statusKey: "health",
        columns: [{ key: "connector", label: "Connector" }, { key: "errors", label: "Errors", align: "right" }, { key: "success", label: "Success", align: "right" }, { key: "health", label: "Rate" }],
        rows: [
          { connector: "Facebook Ads", errors: "14", success: "2", health: "Error" },
          { connector: "Amazon", errors: "3", success: "39", health: "Success" },
          { connector: "Shopify", errors: "0", success: "168", health: "Success" },
        ],
        note: "All 14 Facebook errors trace back to the expired fb_main credential.",
      } }],
    },
  },
  {
    id: "run-log-fb", category: "Monitoring", prompt: "Show the run log for fb_campaign_insights", sig: "run log for fb",
    response: {
      text: "Here's the diagnosis and the full run log — the failure is on line 3:",
      components: [fbFailDetail, fbFailLog],
    },
  },
  {
    id: "run-log-amz", category: "Monitoring", prompt: "Show the run log for amz_fba_inventory", sig: "run log for amz",
    response: {
      text: "The run timed out mid-extract. Here's the diagnosis, then the log showing where it stalled:",
      components: [amzFailDetail, amzFailLog],
    },
  },

  // ---------------- Pipelines (data) ----------------
  {
    id: "preview", category: "Pipelines", prompt: "Show me a sample of shopify_orders", sig: "sample of",
    response: {
      text: "Here's a live sample from BigQuery:",
      components: [{ id: "table", props: {
        columns: [{ key: "id", label: "order_id", mono: true }, { key: "created", label: "created_at" }, { key: "total", label: "total_price", align: "right" }, { key: "status", label: "financial_status" }],
        rows: [
          { id: "#1042", created: "2026-09-18 08:12", total: "$128.40", status: "paid" },
          { id: "#1041", created: "2026-09-18 07:55", total: "$54.00", status: "paid" },
          { id: "#1040", created: "2026-09-18 07:31", total: "$212.90", status: "refunded" },
        ],
        note: "Showing 3 of 88.1M rows · table shopify_orders.",
      } }],
    },
  },
  {
    id: "schema", category: "Pipelines", prompt: "What columns are in shopify_orders?", sig: "what columns",
    response: {
      components: [{ id: "table", props: {
        title: "Schema · shopify_orders",
        columns: [{ key: "col", label: "Column", mono: true }, { key: "type", label: "Type" }],
        rows: [
          { col: "order_id", type: "STRING" }, { col: "created_at", type: "TIMESTAMP" }, { col: "financial_status", type: "STRING" },
          { col: "total_price", type: "NUMERIC" }, { col: "customer_id", type: "STRING" }, { col: "row_id", type: "STRING · dc audit" }, { col: "ts_created", type: "TIMESTAMP · dc audit" },
        ],
        note: "31 columns total · row_id and ts_created are added by DataChannel.",
      } }],
    },
  },

  // ---------------- Activation (Reverse ETL) ----------------
  {
    id: "push-fb", category: "Activation", prompt: "Push my high-value customers to Facebook Ads", sig: "high value customers to facebook",
    response: {
      text: "I'll set up a reverse-ETL sync. Here's the plan — review the field mapping and confirm:",
      components: [{ id: "detail", props: {
        title: "Sync · High-value customers → Facebook Ads", subtitle: "Reverse ETL", icon: "📘",
        rows: [
          { k: "Source", v: "BigQuery · seg_high_value_customers", mono: true },
          { k: "Destination", v: "Facebook Ads · Custom Audience" },
          { k: "Match keys", v: "email → email, phone → phone" },
          { k: "Audience size", v: "24,318 customers" },
          { k: "Schedule", v: "every 6 hours" },
        ],
        note: "Emails and phones are hashed before they leave the warehouse.",
        actions: [{ label: "Create sync", primary: true, send: "Create the Facebook Ads sync" }, { label: "Edit mapping", send: "Edit the field mapping" }],
      } }],
    },
  },
  {
    id: "sync-sf", category: "Activation", prompt: "Sync my orders table to Salesforce", sig: "to salesforce",
    response: {
      components: [{ id: "detail", props: {
        title: "Sync · Orders → Salesforce", subtitle: "Reverse ETL", icon: "☁️",
        rows: [
          { k: "Source", v: "BigQuery · shopify_orders", mono: true },
          { k: "Destination", v: "Salesforce · Order object" },
          { k: "Mode", v: "Upsert on external_id" },
          { k: "Schedule", v: "Daily 07:00" },
        ],
        actions: [{ label: "Create sync", primary: true, send: "Create the Salesforce sync" }],
      } }],
    },
  },

  // ---------------- Transform & Segment ----------------
  {
    id: "build-transform", category: "Transform", prompt: "Build a daily table joining orders and ad spend by SKU", sig: "joining orders",
    response: {
      text: "Drafted the transformation SQL — it runs in your warehouse (ELT), so raw data stays intact:",
      components: [{ id: "code", props: {
        title: "Transformation · daily_sku_performance",
        code: "CREATE OR REPLACE TABLE daily_sku_performance AS\nSELECT\n  o.sku,\n  DATE(o.created_at) AS day,\n  SUM(o.total_price) AS revenue,\n  SUM(o.quantity)    AS units,\n  COALESCE(a.spend, 0) AS ad_spend\nFROM shopify_orders o\nLEFT JOIN gads_campaign_perf a\n  ON a.sku = o.sku AND a.day = DATE(o.created_at)\nGROUP BY 1, 2, a.spend;",
        note: "I'll schedule it to run after shopify_orders and gads_campaign_perf finish (dependency), so numbers are always fresh.",
        actions: [{ label: "Create & schedule", primary: true, send: "Create and schedule the transformation" }, { label: "Test run", send: "Test the transformation" }],
      } }],
    },
  },
  {
    id: "segment", category: "Transform", prompt: "Customers who spent over $100 in the last 30 days", sig: "spent over",
    response: {
      text: "Here's the segment I'll build:",
      components: [
        { id: "code", props: {
          title: "Segment · high_value_customers",
          code: "SELECT customer_id, email\nFROM shopify_orders\nWHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)\nGROUP BY customer_id, email\nHAVING SUM(total_price) > 100;",
          actions: [{ label: "Save segment", primary: true, send: "Save the high_value_customers segment" }, { label: "Preview rows", send: "Show me a sample of shopify_orders" }],
        } },
        { id: "flag", props: { level: "info", label: "Preview", body: "~24,318 customers match this segment right now." } },
      ],
    },
  },

  // ---------------- Orchestration ----------------
  {
    id: "workflow", category: "Orchestration", prompt: "Every day pull Shopify, rebuild the revenue table, then post to Slack", sig: "rebuild the revenue",
    response: {
      text: "Here's the workflow I'll wire up — 4 nodes, chained with a decision gate:",
      components: [{ id: "detail", props: {
        title: "Workflow · Daily Shopify → Slack", subtitle: "Data Orchestration",
        rows: [
          { k: "1 · Extract", v: "run shopify_orders" },
          { k: "2 · Transform", v: "rebuild daily_revenue (after step 1)" },
          { k: "3 · Decision", v: "≥ 10 new orders today?" },
          { k: "4 · Activate", v: "post summary to #sales Slack (if yes)" },
          { k: "Schedule", v: "daily 02:00 · retry each node 2×" },
        ],
        note: "Freshness guard: step 2 only runs if step 1 finished within the last 2 hours.",
        actions: [{ label: "Create workflow", primary: true, send: "Create the daily Shopify workflow" }],
      } }],
    },
  },

  // ---------------- Admin & team ----------------
  {
    id: "invite", category: "Admin", prompt: "Invite dana@acme.com as a read-only user", sig: "invite dana",
    response: {
      components: [{ id: "detail", props: {
        title: "Invite teammate", icon: "✉️",
        rows: [
          { k: "Email", v: "dana@acme.com", mono: true },
          { k: "Role", v: "Read-only (view · run)" },
          { k: "Workspaces", v: "Default" },
        ],
        note: "Read-only can view and run pipelines but not create, edit, or delete.",
        actions: [{ label: "Send invite", primary: true, send: "Send the invite to dana@acme.com" }, { label: "Change role", send: "Make a role that can run but not delete pipelines" }],
      } }],
    },
  },
  {
    id: "slack-alerts", category: "Admin", prompt: "Send pipeline errors to our #data-alerts Slack", sig: "data alerts",
    response: {
      components: [{ id: "detail", props: {
        title: "Notification rule", icon: "🔔",
        rows: [
          { k: "Channel", v: "Slack · #data-alerts" },
          { k: "Trigger", v: "Error only" },
          { k: "Scope", v: "All pipelines" },
        ],
        note: "You'll get a message the moment any pipeline errors, with a link to its logs.",
        actions: [{ label: "Turn on", primary: true, send: "Turn on the Slack error notifications" }],
      } }],
    },
  },
  {
    id: "credits", category: "Admin", prompt: "How many credits did we use this month?", sig: "credits did we use",
    response: {
      components: [{ id: "stats", props: { items: [
        { label: "Credits · MTD", value: "1.84M" },
        { label: "Plan", value: "Professional", sub: "5M / month" },
        { label: "Projected", value: "2.9M", sub: "58% of plan" },
      ] } }],
    },
  },

  // ---------------- Agency / workspaces ----------------
  {
    id: "workspace", category: "Agency", prompt: "Spin up a workspace for client Acme", sig: "workspace for client",
    response: {
      components: [{ id: "detail", props: {
        title: "New workspace · Acme", subtitle: "Isolated client workspace", icon: "🏢",
        rows: [
          { k: "Type", v: "Client workspace" },
          { k: "Timezone", v: "America/New_York" },
          { k: "Shared warehouse", v: "Default BigQuery" },
          { k: "Admin", v: "you (Super-admin retains access)" },
        ],
        note: "Credentials, pipelines and API keys stay isolated to this workspace. Billing rolls up to your enterprise account.",
        actions: [{ label: "Create workspace", primary: true, send: "Create the Acme workspace" }, { label: "Copy my Amazon setup into it", send: "Copy my Amazon setup to the Acme workspace" }],
      } }],
    },
  },
  {
    id: "workspace-usage", category: "Agency", prompt: "Which client is using the most credits?", sig: "most credits",
    response: {
      components: [{ id: "table", props: {
        title: "Credits by workspace · this month",
        columns: [{ key: "ws", label: "Workspace" }, { key: "pipes", label: "Pipelines", align: "right" }, { key: "credits", label: "Credits", align: "right" }, { key: "share", label: "Share", align: "right" }],
        rows: [
          { ws: "Acme", pipes: "26", credits: "1.1M", share: "60%" },
          { ws: "Globex", pipes: "9", credits: "0.5M", share: "27%" },
          { ws: "Initech", pipes: "4", credits: "0.24M", share: "13%" },
        ],
        note: "Acme is your heaviest workspace — useful for profitability and billing.",
      } }],
    },
  },

  // ---------------- Ask your data (analytics) ----------------
  {
    id: "top-skus", category: "Analytics", prompt: "What were my top 5 SKUs by revenue last month?", sig: "top 5 skus",
    response: {
      text: "From your Amazon + Shopify tables, last month:",
      components: [{ id: "table", props: {
        columns: [{ key: "sku", label: "SKU", mono: true }, { key: "name", label: "Product" }, { key: "rev", label: "Revenue", align: "right" }, { key: "units", label: "Units", align: "right" }],
        rows: [
          { sku: "VC-500", name: "VitaCup Focus 16ct", rev: "$142,880", units: "9,530" },
          { sku: "BB-210", name: "Better Being Multivit", rev: "$98,120", units: "6,540" },
          { sku: "PX-018", name: "Plix Glow 15", rev: "$74,300", units: "4,950" },
          { sku: "NW-004", name: "Nimble Wireless Buds", rev: "$61,220", units: "1,020" },
          { sku: "FS-330", name: "Face Shop Serum", rev: "$52,700", units: "3,510" },
        ],
        note: "Answered by Ask Neo (analytics) — the operational copilot handed this to Neo and returned the result.",
      } }],
    },
  },

  // ---------------- follow-up confirmations (from action buttons) ----------------
  {
    id: "reauth", category: "Monitoring", prompt: "Re-authorise the fb_main credential", sig: "re auth",
    response: { components: [{ id: "detail", props: {
      title: "Re-authorise · fb_main", subtitle: "Facebook Ads", status: "Active", icon: "📘",
      rows: [{ k: "Pipelines affected", v: "9" }, { k: "Step", v: "OAuth approval on Facebook" }],
      note: "Opened Facebook's authorisation window. Once you approve, the 9 pipelines resume from their last cursor — no data lost.",
      actions: [{ label: "Re-run affected now", primary: true, send: "Re-run everything that failed overnight" }],
    } }] },
  },
  { id: "cf-sync-fb", category: "Activation", prompt: "Create the Facebook Ads sync", sig: "facebook ads sync",
    response: { components: [{ id: "flag", props: { level: "info", label: "Sync created", body: "High-value customers → Facebook Ads is live. First sync runs within the hour; 24,318 profiles queued." } }] } },
  { id: "cf-sync-sf", category: "Activation", prompt: "Create the Salesforce sync", sig: "salesforce sync",
    response: { components: [{ id: "flag", props: { level: "info", label: "Sync created", body: "Orders → Salesforce is live, running daily at 07:00." } }] } },
  { id: "cf-transform", category: "Transform", prompt: "Create and schedule the transformation", sig: "schedule the transformation",
    response: { components: [{ id: "flag", props: { level: "info", label: "Transformation scheduled", body: "daily_sku_performance will run after shopify_orders and gads_campaign_perf finish each day." } }] } },
  { id: "cf-test", category: "Transform", prompt: "Test the transformation", sig: "test the transformation",
    response: { components: [{ id: "flag", props: { level: "info", label: "Test passed", body: "daily_sku_performance ran on sample data in 3.2s with no errors." } }] } },
  { id: "cf-segment", category: "Transform", prompt: "Save the high_value_customers segment", sig: "customers segment",
    response: { components: [{ id: "flag", props: { level: "info", label: "Segment saved", body: "high_value_customers (~24,318 people) is ready to sync or analyse." } }] } },
  { id: "cf-workflow", category: "Orchestration", prompt: "Create the daily Shopify workflow", sig: "shopify workflow",
    response: { components: [{ id: "flag", props: { level: "info", label: "Workflow created", body: "Daily Shopify → Slack is scheduled for 02:00, with 2 retries per node." } }] } },
  { id: "cf-invite", category: "Admin", prompt: "Send the invite to dana@acme.com", sig: "invite to dana",
    response: { components: [{ id: "flag", props: { level: "info", label: "Invite sent", body: "dana@acme.com invited as Read-only — they'll get an email to join." } }] } },
  { id: "cf-timeout", category: "Monitoring", prompt: "Increase the timeout for amz_fba_inventory", sig: "increase the timeout",
    response: { components: [{ id: "flag", props: { level: "info", label: "Timeout raised", body: "amz_fba_inventory report timeout is now 120m (was 60m). Its next run has more room before Amazon's queue is declared stalled." } }] } },
  { id: "cf-notif", category: "Admin", prompt: "Turn on the Slack error notifications", sig: "slack error notifications",
    response: { components: [{ id: "flag", props: { level: "info", label: "Notifications on", body: "Pipeline errors now post to Slack #data-alerts in real time." } }] } },
  { id: "cf-workspace", category: "Agency", prompt: "Create the Acme workspace", sig: "acme workspace",
    response: { components: [{ id: "flag", props: { level: "info", label: "Workspace created", body: "Acme workspace is live (America/New_York, shared BigQuery). Switch to it any time." } }] } },
  // generic single re-run — must stay after "rerun-failed" so the "everything" variant wins first
  { id: "rerun-one", category: "Monitoring", prompt: "Re-run a pipeline", sig: "re run",
    response: { components: [{ id: "flag", props: { level: "info", label: "Re-running", body: "Queued a manual run — you can watch it in the run-status grid." } }] } },
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
  { name: "Agency / workspaces", prompts: ["Spin up a workspace for client Acme", "Which client is using the most credits?"] },
  { name: "Ask your data", prompts: ["What were my top 5 SKUs by revenue last month?"] },
];

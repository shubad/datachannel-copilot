// Connector catalog — the single source of truth for the copilot.
// Every fact the copilot states (report names, source limits, settlement lag,
// API quotas) comes from here, never from the model. This is the boundary that
// keeps warnings trustworthy.

export type SourceReport = {
  id: string;
  label: string;
  desc: string;
  grain: "daily" | "weekly" | "order-level";
  // catalog-sourced operational facts surfaced as warnings
  settlementLagHours?: number;
  defaultSchedule?: string;
  keywords: string[];
  // "Report Details" step — the Dimension / Metric transfer-list columns
  // (mirrors the DataChannel "Enter Report Configuration" form).
  dimensions?: string[];
  metrics?: string[];
};

// A field on the "Connect your {source}" add-credential form (screenshot form).
export type CredField = {
  key: string;
  label: string;
  kind: "text" | "select" | "password";
  required?: boolean;
  options?: string[];
  default?: string;
  placeholder?: string;
};

export type SourceDef = {
  id: string;
  name: string;
  category: string;
  icon: string;
  authKind: "oauth" | "spapi" | "apikey" | "db";
  // DataChannel prefixes the dataset (table) name by source, e.g. fb_ / amz_
  prefix: string;
  // account subtypes (e.g. Amazon Seller vs Vendor Central)
  accounts?: { id: string; label: string; desc: string; keywords: string[] }[];
  backfillMaxDays: number;
  apiQuotaPerSec?: number;
  reports: SourceReport[];
  keywords: string[];
  // "Connect your {source}" form fields (the Name field is always rendered first).
  credFields: CredField[];
};

// Amazon "Marketplace" dropdown + "Marketplace Timezone" dropdown options.
export const MARKETPLACE_OPTIONS = [
  "United States", "Canada", "Mexico", "Brazil", "United Kingdom", "Germany",
  "France", "Italy", "Spain", "Netherlands", "Sweden", "Poland", "India",
  "Japan", "Australia", "Singapore", "United Arab Emirates", "Saudi Arabia",
] as const;
export const TIMEZONES = [
  "Asia/Kolkata", "America/Los_Angeles", "America/New_York", "America/Chicago",
  "America/Sao_Paulo", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney", "Asia/Dubai",
] as const;

// Generic Dimension / Metric fallback when a report has no explicit field list.
const GENERIC_DIMENSIONS = ["date", "id", "name", "status", "created_at", "updated_at", "category", "channel", "region", "currency"];
const GENERIC_METRICS = ["quantity", "amount", "revenue", "cost", "clicks", "impressions", "conversions", "sessions"];
export function reportFields(report?: SourceReport): { dimensions: string[]; metrics: string[] } {
  return {
    dimensions: report?.dimensions ?? GENERIC_DIMENSIONS,
    metrics: report?.metrics ?? GENERIC_METRICS,
  };
}

// --- DataChannel pipeline vocabulary (from the real console forms) ---

// "Insert Mode" — how data lands in the warehouse each run.
export const INSERT_MODES = [
  { id: "UPSERT", label: "Upsert", desc: "Insert new & changed records", recommended: true },
  { id: "APPEND", label: "Append", desc: "Insert all fetched data at the end" },
  { id: "REPLACE", label: "Replace", desc: "Drop the table and recreate it each run" },
] as const;

// "Normal Scheduling" — interval frequency (min frequency varies per pipeline).
export const NORMAL_FREQUENCIES = ["Hourly", "Every 6 hours", "Daily", "Weekly", "Monthly"] as const;

// Pipeline run/notify events.
export const NOTIFY_MODES = [
  { id: "ERROR", label: "Error only" },
  { id: "ERROR_SUCCESS", label: "Error & success" },
] as const;

// DataChannel-managed BigQuery (free tier) regions.
export const BQ_REGIONS = ["US (multi-region)", "EU (multi-region)", "asia-south1 (Mumbai)", "us-central1 (Iowa)", "europe-west2 (London)"] as const;

export type WarehouseDef = {
  id: string;
  name: string;
  icon: string;
  recommended?: boolean;
  keywords: string[];
};

export const MARKETPLACES: Record<string, { id: string; label: string; mpId: string; tz: string }> = {
  IN: { id: "IN", label: "India", mpId: "A21TJRUUN4KGV", tz: "Asia/Kolkata" },
  US: { id: "US", label: "United States", mpId: "ATVPDKIKX0DER", tz: "America/Los_Angeles" },
  UK: { id: "UK", label: "United Kingdom", mpId: "A1F83G8C2ARO7P", tz: "Europe/London" },
};

export const SOURCES: SourceDef[] = [
  {
    id: "amazon_seller_central",
    prefix: "amz",
    name: "Amazon Seller Central",
    category: "E-commerce",
    icon: "📦",
    authKind: "spapi",
    accounts: [
      { id: "seller", label: "Seller Central", desc: "You sell your own products", keywords: ["seller", "sales", "sell my"] },
      { id: "vendor", label: "Vendor Central", desc: "You sell to Amazon wholesale", keywords: ["vendor", "wholesale"] },
    ],
    backfillMaxDays: 60,
    apiQuotaPerSec: 1,
    reports: [
      {
        id: "sales_and_traffic_by_date",
        label: "Sales and traffic report by date",
        desc: "Daily totals — sales, sessions, conversion rate",
        grain: "daily",
        settlementLagHours: 48,
        defaultSchedule: "Daily at 6:00 AM",
        keywords: ["sales", "traffic", "numbers", "revenue", "daily"],
      },
      {
        id: "sales_and_traffic_by_asin",
        label: "Sales and traffic report by ASIN",
        desc: "Same metrics, split per product",
        grain: "daily",
        settlementLagHours: 48,
        keywords: ["asin", "per product", "product"],
      },
      {
        id: "flat_file_orders_by_date",
        label: "Flat File Orders By Order Date Report",
        desc: "Request and retrieve tab-delimited flat file report that shows all orders placed in the specified period for all sellers.",
        grain: "order-level",
        keywords: ["orders", "order-level", "flat file"],
        dimensions: [
          "amazon_order_id", "merchant_order_id", "purchase_date", "last_updated_date",
          "order_status", "fulfillment_channel", "sales_channel", "order_channel",
          "ship_service_level", "product_name", "sku", "asin", "item_status",
          "is_business_order", "price_designation", "buyer_email", "buyer_name",
          "ship_city", "ship_state", "ship_postal_code", "ship_country",
        ],
        metrics: [
          "gift_wrap_price", "gift_wrap_tax", "item_price", "item_promotion_discount",
          "item_tax", "quantity", "ship_promotion_discount", "shipping_price", "shipping_tax",
        ],
      },
      {
        id: "fba_inventory",
        label: "FBA inventory",
        desc: "Fulfilment inventory levels by SKU",
        grain: "daily",
        keywords: ["fba", "inventory", "stock"],
      },
      {
        id: "search_query_performance",
        label: "Search query performance",
        desc: "Query-level impressions and clicks",
        grain: "weekly",
        keywords: ["search", "query", "keywords"],
      },
    ],
    keywords: ["amazon", "seller central", "seller", "sp-api", "spapi"],
    credFields: [
      { key: "managed_app", label: "DC Managed APP", kind: "select", options: ["Yes", "No"], default: "Yes" },
      { key: "marketplace", label: "Marketplace", kind: "select", options: [...MARKETPLACE_OPTIONS], default: "United States" },
      { key: "seller_name", label: "Seller Name", kind: "text", required: true },
      { key: "timezone", label: "Marketplace Timezone", kind: "select", options: [...TIMEZONES], default: "Asia/Kolkata" },
    ],
  },
  {
    id: "shopify",
    prefix: "shopify",
    name: "Shopify",
    category: "E-commerce",
    icon: "🛒",
    authKind: "oauth",
    backfillMaxDays: 365,
    reports: [
      {
        id: "orders", label: "Orders", desc: "Order-level detail — line items, totals, fulfilment and financial status.", grain: "order-level", keywords: ["orders"],
        dimensions: ["order_id", "order_number", "created_at", "processed_at", "financial_status", "fulfillment_status", "customer_id", "email", "currency", "source_name", "tags", "sku", "product_title", "variant_title"],
        metrics: ["subtotal_price", "total_discounts", "total_tax", "total_shipping", "total_price", "quantity", "refund_amount"],
      },
      { id: "customers", label: "Customers", desc: "Customer records", grain: "daily", keywords: ["customers"] },
      { id: "products", label: "Products", desc: "Catalog & variants", grain: "daily", keywords: ["products", "catalog"] },
    ],
    keywords: ["shopify"],
    credFields: [
      { key: "shop", label: "Shop domain", kind: "text", required: true, placeholder: "my-store.myshopify.com" },
      { key: "access_token", label: "Admin API access token", kind: "password", required: true, placeholder: "shpat_…" },
    ],
  },
  {
    id: "google_ads",
    prefix: "gads",
    name: "Google Ads",
    category: "Advertising",
    icon: "📊",
    authKind: "oauth",
    backfillMaxDays: 365,
    reports: [
      { id: "campaigns", label: "Campaign performance", desc: "Spend, clicks, conversions by campaign", grain: "daily", keywords: ["campaigns", "spend", "ads"] },
    ],
    keywords: ["google ads", "adwords"],
    credFields: [
      { key: "customer_id", label: "Customer ID", kind: "text", required: true, placeholder: "123-456-7890" },
      { key: "login_customer_id", label: "Manager (MCC) ID", kind: "text", placeholder: "optional" },
    ],
  },
  {
    id: "facebook_ads",
    prefix: "fb",
    name: "Facebook Ads",
    category: "Advertising",
    icon: "📘",
    authKind: "oauth",
    backfillMaxDays: 365,
    reports: [
      { id: "campaigns", label: "Campaign insights", desc: "Spend, reach, ROAS by campaign", grain: "daily", keywords: ["campaigns", "insights", "spend"] },
    ],
    keywords: ["facebook ads", "meta ads", "fb ads"],
    credFields: [
      { key: "ad_account_id", label: "Ad Account ID", kind: "text", required: true, placeholder: "act_1234567890" },
    ],
  },
  {
    id: "stripe",
    prefix: "stripe",
    name: "Stripe",
    category: "Payments",
    icon: "💳",
    authKind: "apikey",
    backfillMaxDays: 365,
    reports: [
      { id: "charges", label: "Charges", desc: "Payment-level detail", grain: "order-level", keywords: ["charges", "payments", "transactions"] },
    ],
    keywords: ["stripe"],
    credFields: [
      { key: "api_key", label: "Secret API key", kind: "password", required: true, placeholder: "sk_live_…" },
    ],
  },
  {
    id: "postgres",
    prefix: "pg",
    name: "PostgreSQL",
    category: "Database",
    icon: "🐘",
    authKind: "db",
    backfillMaxDays: 3650,
    reports: [
      { id: "table_sync", label: "Table replication", desc: "Replicate selected tables", grain: "daily", keywords: ["table", "replicate", "sync"] },
    ],
    keywords: ["postgres", "postgresql"],
    credFields: [
      { key: "host", label: "Host", kind: "text", required: true, placeholder: "db.example.com" },
      { key: "port", label: "Port", kind: "text", default: "5432" },
      { key: "database", label: "Database", kind: "text", required: true, placeholder: "analytics" },
      { key: "username", label: "Username", kind: "text", required: true, placeholder: "loader" },
      { key: "password", label: "Password", kind: "password", required: true },
    ],
  },
];

export const WAREHOUSES: WarehouseDef[] = [
  { id: "snowflake", name: "Snowflake", icon: "❄️", keywords: ["snowflake"] },
  { id: "bigquery", name: "Google BigQuery", icon: "🔷", keywords: ["bigquery", "big query", "gbq"] },
  { id: "redshift", name: "AWS Redshift", icon: "🟥", keywords: ["redshift"] },
  { id: "synapse", name: "Azure Synapse", icon: "🔵", keywords: ["synapse", "azure"] },
  { id: "managed", name: "DataChannel Managed BigQuery", icon: "✨", recommended: true, keywords: ["managed", "free", "don't know", "dont know", "not sure", "unsure"] },
];

// Reverse-ETL destination apps (used to detect an out-of-source-scope request).
export const DESTINATION_APPS = [
  "facebook ads", "google ads", "salesforce", "hubspot", "mailchimp", "klaviyo", "braze", "intercom",
];

// Existing pipelines already configured in the account — the inventory that
// edit / bulk tasks act on (the copilot is not always creating something new).
export type ExistingPipeline = {
  id: string;
  datasetName: string;
  sourceId: string;
  reportId: string;
  frequency: string;
  insertMode: "UPSERT" | "APPEND" | "REPLACE";
  status: "active" | "paused" | "error";
  lastRun: string;
};

export const EXISTING_PIPELINES: ExistingPipeline[] = [
  { id: "pl_1001", datasetName: "amz_sales_traffic_daily", sourceId: "amazon_seller_central", reportId: "sales_and_traffic_by_date", frequency: "Daily", insertMode: "UPSERT", status: "active", lastRun: "2h ago" },
  { id: "pl_1002", datasetName: "amz_fba_inventory", sourceId: "amazon_seller_central", reportId: "fba_inventory", frequency: "Daily", insertMode: "REPLACE", status: "active", lastRun: "5h ago" },
  { id: "pl_1003", datasetName: "fb_campaign_insights", sourceId: "facebook_ads", reportId: "campaigns", frequency: "Every 6 hours", insertMode: "UPSERT", status: "error", lastRun: "failed 1h ago" },
  { id: "pl_1004", datasetName: "gads_campaign_perf", sourceId: "google_ads", reportId: "campaigns", frequency: "Daily", insertMode: "UPSERT", status: "paused", lastRun: "3d ago" },
  { id: "pl_1005", datasetName: "shopify_orders", sourceId: "shopify", reportId: "orders", frequency: "Hourly", insertMode: "UPSERT", status: "active", lastRun: "12m ago" },
];

// Saved credentials already configured in the account (referenced via /cred @name).
// syncs / pipelines mirror the two counters on each credential row in the console.
export type SavedCredential = { name: string; sourceId: string; addedBy?: string; syncs?: number; pipelines?: number };
export const SAVED_CREDENTIALS: SavedCredential[] = [
  { name: "amazon_prod", sourceId: "amazon_seller_central", syncs: 0, pipelines: 7 },
  { name: "amazon_us", sourceId: "amazon_seller_central", syncs: 0, pipelines: 4 },
  { name: "fb_main", sourceId: "facebook_ads", syncs: 0, pipelines: 9 },
  { name: "gads_main", sourceId: "google_ads", syncs: 0, pipelines: 5 },
  { name: "shopify_store", sourceId: "shopify", syncs: 0, pipelines: 2 },
  { name: "stripe_live", sourceId: "stripe", syncs: 0, pipelines: 3 },
];

// Warehouse connections already configured in the account.
export type SavedWarehouse = { name: string; warehouseId: string };
export const SAVED_WAREHOUSES: SavedWarehouse[] = [
  { name: "snowflake_prod", warehouseId: "snowflake" },
  { name: "analytics_bq", warehouseId: "bigquery" },
];

export function savedCredsForSource(sourceId?: string): SavedCredential[] {
  return SAVED_CREDENTIALS.filter((c) => c.sourceId === sourceId);
}
export function savedWarehousesFor(warehouseId?: string): SavedWarehouse[] {
  return SAVED_WAREHOUSES.filter((w) => w.warehouseId === warehouseId);
}

// Everything the chat "@" menu can mention.
export type Mentionable = { kind: "source" | "destination" | "pipeline" | "cred"; id: string; label: string; sub: string; icon?: string };

export function mentionables(): Mentionable[] {
  return [
    ...SOURCES.map((s) => ({ kind: "source" as const, id: s.id, label: s.name, sub: s.category, icon: s.icon })),
    ...WAREHOUSES.map((w) => ({ kind: "destination" as const, id: w.id, label: w.name, sub: "Destination", icon: w.icon })),
    ...EXISTING_PIPELINES.map((p) => ({ kind: "pipeline" as const, id: p.id, label: p.datasetName, sub: `${findSource(p.sourceId)?.name ?? ""} · ${p.status}` })),
    ...SAVED_CREDENTIALS.map((c) => ({ kind: "cred" as const, id: c.name, label: c.name, sub: `${findSource(c.sourceId)?.name ?? ""} credential` })),
  ];
}

export function findCredential(name?: string): SavedCredential | undefined {
  return SAVED_CREDENTIALS.find((c) => c.name.toLowerCase() === (name ?? "").toLowerCase());
}

export function findSource(id?: string): SourceDef | undefined {
  return SOURCES.find((s) => s.id === id);
}
export function findReport(source: SourceDef | undefined, id?: string): SourceReport | undefined {
  return source?.reports.find((r) => r.id === id);
}
export function findWarehouse(id?: string): WarehouseDef | undefined {
  return WAREHOUSES.find((w) => w.id === id);
}

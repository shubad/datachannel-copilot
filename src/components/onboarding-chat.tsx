"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";

const ACCENT = "#FD9567";
const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)";
const CARD_SHADOW_HOVER = "0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)";

// --- Types ---

type PathChoice = "etl" | "reverse-etl" | null;

type ExtractedInfo = {
  source?: string;
  data?: string;
  warehouse?: string;
  schedule?: string;
  destination?: string;
};

type StepStatus = "pending" | "active" | "done";

type ChecklistStep = {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
  icon: React.ReactNode;
};

type Message =
  | { type: "bot-text"; text: string }
  | { type: "user-text"; text: string }
  | { type: "path-selection"; selected: PathChoice }
  | { type: "summary"; extracted: ExtractedInfo }
  | { type: "accordion-checklist" }
  | { type: "bot-typing" }
  | { type: "success"; pipeline: string };

// --- Source catalog ---

const SOURCE_CATALOG = [
  { name: "Shopify", category: "E-commerce", icon: "🛒" },
  { name: "Google Ads", category: "Advertising", icon: "📊" },
  { name: "Facebook Ads", category: "Advertising", icon: "📘" },
  { name: "Stripe", category: "Payments", icon: "💳" },
  { name: "HubSpot", category: "CRM", icon: "🔶" },
  { name: "Salesforce", category: "CRM", icon: "☁️" },
  { name: "Amazon Ads", category: "Advertising", icon: "📦" },
  { name: "Instagram", category: "Social", icon: "📷" },
  { name: "TikTok", category: "Social", icon: "🎵" },
  { name: "MySQL", category: "Database", icon: "🗄️" },
  { name: "PostgreSQL", category: "Database", icon: "🐘" },
  { name: "MongoDB", category: "Database", icon: "🍃" },
  { name: "Airtable", category: "Productivity", icon: "📋" },
  { name: "Zendesk", category: "Support", icon: "💬" },
  { name: "Intercom", category: "Support", icon: "💭" },
  { name: "Mailchimp", category: "Marketing", icon: "📧" },
  { name: "Klaviyo", category: "Marketing", icon: "📨" },
  { name: "Mixpanel", category: "Analytics", icon: "📈" },
  { name: "Segment", category: "Analytics", icon: "🔀" },
  { name: "Twilio", category: "Communication", icon: "📱" },
];

const WAREHOUSE_CATALOG = [
  { name: "Google BigQuery", icon: "🔷" },
  { name: "AWS Redshift", icon: "🟥" },
  { name: "Snowflake", icon: "❄️" },
  { name: "MySQL", icon: "🗄️" },
  { name: "Azure Synapse", icon: "🔵" },
  { name: "Managed (Free)", icon: "✨", recommended: true },
];

// --- Simple NLP extraction ---

function extractInfo(text: string): ExtractedInfo {
  const lower = text.toLowerCase();
  const info: ExtractedInfo = {};

  for (const s of SOURCE_CATALOG) {
    if (lower.includes(s.name.toLowerCase())) {
      info.source = s.name;
      break;
    }
  }

  const dataTypes = [
    "orders", "customers", "products", "transactions", "campaigns",
    "contacts", "leads", "events", "sessions", "users", "invoices",
    "subscriptions", "payments", "reports", "analytics",
  ];
  for (const d of dataTypes) {
    if (lower.includes(d)) {
      info.data = d[0].toUpperCase() + d.slice(1);
      break;
    }
  }

  const warehouses = [
    { key: "bigquery", label: "Google BigQuery" },
    { key: "redshift", label: "AWS Redshift" },
    { key: "snowflake", label: "Snowflake" },
    { key: "synapse", label: "Azure Synapse" },
  ];
  for (const w of warehouses) {
    if (lower.includes(w.key)) {
      info.warehouse = w.label;
      break;
    }
  }

  const destinations = [
    "facebook ads", "google ads", "amazon", "salesforce", "hubspot",
    "mailchimp", "klaviyo", "braze", "intercom",
  ];
  for (const d of destinations) {
    if (lower.includes(d) && d !== info.source?.toLowerCase()) {
      info.destination = d.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
      break;
    }
  }

  const schedulePatterns = [
    /every\s*day\s*at\s*(\d{1,2}\s*(?:am|pm))/i,
    /daily\s*at\s*(\d{1,2}\s*(?:am|pm))/i,
    /at\s*(\d{1,2}\s*(?:am|pm))/i,
    /every\s*(\d+)\s*hours?/i,
    /hourly/i, /daily/i, /weekly/i,
  ];
  for (const p of schedulePatterns) {
    const m = text.match(p);
    if (m) {
      if (m[1]) info.schedule = `Daily at ${m[1].toUpperCase()}`;
      else if (/hourly/i.test(m[0])) info.schedule = "Every hour";
      else if (/daily/i.test(m[0])) info.schedule = "Daily";
      else if (/weekly/i.test(m[0])) info.schedule = "Weekly";
      break;
    }
  }

  return info;
}

// --- Shared styles ---

const inputFieldSx = {
  width: "100%", height: 38, borderRadius: 2, border: "1px solid",
  borderColor: "#e5e7eb", px: 1.5, fontSize: 13, bgcolor: "#fff",
  transition: "border-color 0.15s, box-shadow 0.15s",
  "&:hover": { borderColor: "#d1d5db" },
  "&.Mui-focused": { borderColor: ACCENT, boxShadow: `0 0 0 3px ${ACCENT}14` },
};

// --- Sub-components ---

function BotAvatar() {
  return (
    <Box
      sx={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${ACCENT} 0%, #ff8a65 50%, #ffb74d 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(255,90,54,0.25)",
      }}
    >
      <Box component="img" src="/dc-icon.png" alt="" sx={{ width: 18, height: 18, filter: "brightness(10)" }} />
    </Box>
  );
}

function UserAvatar() {
  return (
    <Box
      sx={{
        width: 32, height: 32, borderRadius: "50%", bgcolor: "#1a1a2e", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 500, flexShrink: 0, letterSpacing: 0.5,
      }}
    >
      A
    </Box>
  );
}

function PathSelectionCard({
  selected, onSelect,
}: {
  selected: PathChoice;
  onSelect: (p: PathChoice) => void;
}) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
      {([
        { id: "etl" as const, icon: <HubOutlinedIcon sx={{ fontSize: 24 }} />, label: "ETL Pipeline", desc: "Move data from apps into your warehouse" },
        { id: "reverse-etl" as const, icon: <SyncAltOutlinedIcon sx={{ fontSize: 24 }} />, label: "Reverse ETL", desc: "Push warehouse data back into your apps" },
      ]).map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <Box
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            sx={{
              p: 2.5, borderRadius: 3,
              border: isSelected ? `2px solid ${ACCENT}` : "1px solid #e5e7eb",
              bgcolor: isSelected ? `${ACCENT}06` : "#fff",
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: isSelected ? `0 0 0 3px ${ACCENT}10` : CARD_SHADOW,
              "&:hover": {
                boxShadow: isSelected ? `0 0 0 3px ${ACCENT}10` : CARD_SHADOW_HOVER,
                borderColor: isSelected ? ACCENT : "#d1d5db",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, mb: 1.5,
              bgcolor: isSelected ? `${ACCENT}12` : "#f8f9fa",
              color: isSelected ? ACCENT : "#6b7280",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {opt.icon}
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.25, color: "#111827" }}>{opt.label}</Typography>
            <Typography sx={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.5 }}>{opt.desc}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function SummaryCard({ extracted }: { extracted: ExtractedInfo }) {
  const entries = [
    { label: "Source", value: extracted.source },
    { label: "Data", value: extracted.data },
    { label: "Warehouse", value: extracted.warehouse },
    { label: "Destination", value: extracted.destination },
    { label: "Schedule", value: extracted.schedule },
  ].filter((e) => e.value);

  return (
    <Box sx={{ mt: 1, p: 2.5, borderRadius: 3, bgcolor: "#fff", boxShadow: CARD_SHADOW, border: "1px solid #e5e7eb" }}>
      <Typography sx={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8, mb: 1.5 }}>
        Extracted from your message
      </Typography>
      {entries.map((e) => (
        <Box key={e.label} sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 0.6 }}>
          <Typography sx={{ fontSize: 13, color: "#6b7280", minWidth: 80 }}>{e.label}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{e.value}</Typography>
          <Chip label="auto-detected" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 500, bgcolor: "#ecfdf5", color: "#059669", borderRadius: 1.5, "& .MuiChip-label": { px: 0.75 } }} />
        </Box>
      ))}
    </Box>
  );
}

// --- Source Selection with Search ---

function SourceSelectionStep({
  selectedSource,
  onSelect,
}: {
  selectedSource: string | null;
  onSelect: (source: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  const filtered = SOURCE_CATALOG.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ pt: 1 }}>
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: 0.75,
          border: "1px solid #e5e7eb", borderRadius: 2.5,
          px: 1.5, py: 0.75, mb: 1.5, bgcolor: "#fff",
          transition: "border-color 0.15s, box-shadow 0.15s",
          "&:focus-within": { borderColor: ACCENT, boxShadow: `0 0 0 3px ${ACCENT}14` },
        }}
      >
        <SearchOutlinedIcon sx={{ fontSize: 17, color: "#9ca3af" }} />
        <InputBase
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sources..."
          sx={{ fontSize: 13, flex: 1 }}
        />
      </Box>
      <Box
        sx={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0.75, maxHeight: 210, overflowY: "auto",
          scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {filtered.map((s) => {
          const isSel = selectedSource === s.name;
          return (
            <Box
              key={s.name}
              onClick={() => onSelect(s.name)}
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                px: 1.25, py: 1, borderRadius: 2,
                border: isSel ? `2px solid ${ACCENT}` : "1px solid #e5e7eb",
                bgcolor: isSel ? `${ACCENT}06` : "#fff",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: isSel ? `0 0 0 2px ${ACCENT}10` : "none",
                "&:hover": { borderColor: isSel ? ACCENT : "#d1d5db", bgcolor: isSel ? `${ACCENT}06` : "#fafafa" },
              }}
            >
              <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {s.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</Typography>
                <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>{s.category}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      {filtered.length === 0 && (
        <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", py: 3 }}>
          No sources found for &ldquo;{search}&rdquo;
        </Typography>
      )}
    </Box>
  );
}

// --- Credential Form Step ---

function CredentialFormStep({
  source,
  onSubmit,
}: {
  source: string;
  onSubmit: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(); }, 1800);
  };

  const sourceLower = source.toLowerCase();
  let fields: { label: string; placeholder: string; type?: string }[] = [];

  if (sourceLower === "shopify") {
    fields = [
      { label: "Store URL", placeholder: "your-store.myshopify.com" },
      { label: "API key", placeholder: "shpat_xxxxx" },
      { label: "API secret", placeholder: "shpss_xxxxx", type: "password" },
    ];
  } else if (sourceLower === "stripe") {
    fields = [{ label: "API key", placeholder: "sk_live_xxxxx", type: "password" }];
  } else if (["google ads", "facebook ads", "hubspot", "salesforce", "instagram"].includes(sourceLower)) {
    fields = [];
  } else if (["mysql", "postgresql", "mongodb"].includes(sourceLower)) {
    fields = [
      { label: "Host", placeholder: "db.example.com" },
      { label: "Port", placeholder: "3306" },
      { label: "Database", placeholder: "my_database" },
      { label: "Username", placeholder: "admin" },
      { label: "Password", placeholder: "••••••••", type: "password" },
    ];
  } else {
    fields = [
      { label: "API key", placeholder: "Enter your API key", type: "password" },
      { label: "Account ID", placeholder: "Enter account ID" },
    ];
  }

  const hasOAuth = ["shopify", "google ads", "facebook ads", "hubspot", "salesforce", "instagram"].includes(sourceLower);
  const oauthOnly = fields.length === 0 && hasOAuth;

  return (
    <Box sx={{ pt: 1 }}>
      {!oauthOnly && fields.map((f, i) => (
        <Box key={i} sx={{ mb: 1.25 }}>
          <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500, mb: 0.5 }}>{f.label}</Typography>
          <InputBase type={f.type || "text"} placeholder={f.placeholder} sx={inputFieldSx} />
        </Box>
      ))}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 2 }}>
        {!oauthOnly && (
          <Box
            onClick={handleConnect}
            sx={{
              height: 36, borderRadius: 2, bgcolor: ACCENT, color: "#fff",
              fontSize: 13, fontWeight: 500, px: 2.5, display: "flex", alignItems: "center", gap: 0.75,
              cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : `0 1px 3px ${ACCENT}40`,
              transition: "all 0.15s",
              "&:hover": { boxShadow: loading ? "none" : `0 4px 12px ${ACCENT}30`, transform: loading ? "none" : "translateY(-1px)" },
            }}
          >
            {loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <LinkOutlinedIcon sx={{ fontSize: 15 }} />}
            {loading ? "Connecting..." : `Connect ${source}`}
          </Box>
        )}
        {hasOAuth && !oauthOnly && <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>or</Typography>}
        {hasOAuth && (
          <Box
            onClick={handleConnect}
            sx={{
              height: 36, borderRadius: 2, border: "1px solid #e5e7eb",
              color: "#374151", fontSize: 13, fontWeight: 500, px: 2.5,
              display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#fff",
              cursor: loading ? "default" : "pointer", transition: "all 0.15s",
              "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" },
            }}
          >
            {loading && oauthOnly ? <CircularProgress size={14} sx={{ color: "#6b7280" }} /> : <AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />}
            {loading && oauthOnly ? "Connecting..." : "Connect with OAuth"}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// --- Pipeline Setup Form ---

function PipelineSetupStep({
  source,
  prefilledData,
  prefilledSchedule,
  onSubmit,
}: {
  source: string;
  prefilledData?: string;
  prefilledSchedule?: string;
  onSubmit: (data: string, schedule: string) => void;
}) {
  const [data, setData] = React.useState(prefilledData || "");
  const [schedule, setSchedule] = React.useState(prefilledSchedule || "");
  const [syncMode, setSyncMode] = React.useState<"incremental" | "full">("incremental");
  const [pipelineName, setPipelineName] = React.useState(
    source !== "Source" ? `${source.toLowerCase().replace(/\s+/g, "_")}_pipeline` : ""
  );
  const [destTable, setDestTable] = React.useState("");

  React.useEffect(() => {
    if (source !== "Source" && !pipelineName) setPipelineName(`${source.toLowerCase().replace(/\s+/g, "_")}_pipeline`);
  }, [source]);

  React.useEffect(() => {
    if (data) setDestTable(`raw_${source.toLowerCase().replace(/\s+/g, "_")}_${data.toLowerCase()}`);
  }, [data, source]);

  const dataOptions = ["Orders", "Customers", "Products", "Transactions", "Campaigns", "Contacts", "Leads", "Events", "Sessions", "Invoices"];
  const scheduleOptions = ["Every hour", "Daily at 9 AM", "Daily at 6 PM", "Every 6 hours", "Weekly"];
  const isValid = data && schedule && pipelineName;

  const chipSx = (active: boolean) => ({
    height: 30, fontSize: 12, fontWeight: active ? 500 : 400,
    bgcolor: active ? `${ACCENT}0F` : "#fff",
    color: active ? ACCENT : "#374151",
    border: active ? `1.5px solid ${ACCENT}50` : "1px solid #e5e7eb",
    borderRadius: 2,
    cursor: "pointer", transition: "all 0.15s",
    "&:hover": { bgcolor: active ? `${ACCENT}0F` : "#f9fafb", borderColor: active ? `${ACCENT}50` : "#d1d5db" },
  });

  return (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500, mb: 0.5 }}>Pipeline name</Typography>
        <InputBase value={pipelineName} onChange={(e) => setPipelineName(e.target.value)} placeholder="my_pipeline" sx={inputFieldSx} />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500, mb: 0.75 }}>Data to sync from {source}</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {dataOptions.map((d) => (
            <Chip key={d} label={d} size="small" onClick={() => setData(d)} sx={chipSx(data === d)} />
          ))}
        </Box>
        {prefilledData && (
          <Chip label="auto-detected" size="small" sx={{ mt: 0.75, height: 20, fontSize: 10, fontWeight: 500, bgcolor: "#ecfdf5", color: "#059669", borderRadius: 1.5, "& .MuiChip-label": { px: 0.75 } }} />
        )}
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500, mb: 0.75 }}>Sync mode</Typography>
        <Box sx={{ display: "flex", gap: 0.75 }}>
          {([
            { id: "incremental" as const, label: "Incremental", desc: "Only new & changed rows" },
            { id: "full" as const, label: "Full refresh", desc: "Replace all data each run" },
          ]).map((m) => {
            const active = syncMode === m.id;
            return (
              <Box
                key={m.id}
                onClick={() => setSyncMode(m.id)}
                sx={{
                  flex: 1, px: 1.5, py: 1.25, borderRadius: 2.5,
                  border: active ? `1.5px solid ${ACCENT}50` : "1px solid #e5e7eb",
                  bgcolor: active ? `${ACCENT}06` : "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                  "&:hover": { borderColor: active ? `${ACCENT}50` : "#d1d5db" },
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: active ? ACCENT : "#111827" }}>{m.label}</Typography>
                <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.25 }}>{m.desc}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500, mb: 0.75 }}>Sync schedule</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {scheduleOptions.map((s) => (
            <Chip key={s} label={s} size="small" onClick={() => setSchedule(s)} sx={chipSx(schedule === s)} />
          ))}
        </Box>
        {prefilledSchedule && (
          <Chip label="auto-detected" size="small" sx={{ mt: 0.75, height: 20, fontSize: 10, fontWeight: 500, bgcolor: "#ecfdf5", color: "#059669", borderRadius: 1.5, "& .MuiChip-label": { px: 0.75 } }} />
        )}
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500, mb: 0.5 }}>Destination table name</Typography>
        <InputBase value={destTable} onChange={(e) => setDestTable(e.target.value)} placeholder="raw_source_data" sx={{ ...inputFieldSx, fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', monospace", fontSize: 12.5 }} />
      </Box>

      <Box
        onClick={() => { if (isValid) onSubmit(data, schedule); }}
        sx={{
          height: 36, borderRadius: 2,
          bgcolor: isValid ? ACCENT : "#d1d5db",
          color: "#fff", fontSize: 13, fontWeight: 500, px: 2.5,
          display: "inline-flex", alignItems: "center", gap: 0.5,
          cursor: isValid ? "pointer" : "default",
          boxShadow: isValid ? `0 1px 3px ${ACCENT}40` : "none",
          transition: "all 0.15s",
          "&:hover": { boxShadow: isValid ? `0 4px 12px ${ACCENT}30` : "none", transform: isValid ? "translateY(-1px)" : "none" },
        }}
      >
        Confirm pipeline
      </Box>
    </Box>
  );
}

// --- Warehouse Selection Step ---

function WarehouseSelectionStep({
  selectedWarehouse,
  onSelect,
}: {
  selectedWarehouse: string | null;
  onSelect: (warehouse: string) => void;
}) {
  return (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75 }}>
        {WAREHOUSE_CATALOG.map((w) => {
          const isSel = selectedWarehouse === w.name;
          return (
            <Box
              key={w.name}
              onClick={() => onSelect(w.name)}
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 1.5, py: 1.25, borderRadius: 2,
                border: isSel ? `2px solid ${ACCENT}` : "1px solid #e5e7eb",
                bgcolor: isSel ? `${ACCENT}06` : "#fff",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: isSel ? `0 0 0 2px ${ACCENT}10` : "none",
                "&:hover": { borderColor: isSel ? ACCENT : "#d1d5db", transform: "translateY(-1px)", boxShadow: isSel ? `0 0 0 2px ${ACCENT}10` : CARD_SHADOW },
              }}
            >
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {w.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: "#111827" }}>{w.name}</Typography>
                {w.recommended && (
                  <Chip label="Recommended" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 500, bgcolor: `${ACCENT}0F`, color: ACCENT, borderRadius: 1, "& .MuiChip-label": { px: 0.5 } }} />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// --- Warehouse Config Form ---

function WarehouseConfigStep({
  warehouse,
  onSubmit,
}: {
  warehouse: string;
  onSubmit: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(); }, 1500);
  };

  const wLower = warehouse.toLowerCase();
  const isManaged = wLower.includes("managed");

  if (isManaged) {
    return (
      <Box sx={{ pt: 1 }}>
        <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#166534", mb: 0.25 }}>
            Free managed warehouse
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#15803d", lineHeight: 1.5 }}>
            We&apos;ll set up a BigQuery instance for you. No configuration needed.
          </Typography>
        </Box>
        <Box
          onClick={handleConnect}
          sx={{
            mt: 1.5, height: 36, borderRadius: 2, bgcolor: ACCENT, color: "#fff",
            fontSize: 13, fontWeight: 500, px: 2.5, display: "inline-flex", alignItems: "center", gap: 0.75,
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : `0 1px 3px ${ACCENT}40`,
            transition: "all 0.15s",
            "&:hover": { boxShadow: loading ? "none" : `0 4px 12px ${ACCENT}30`, transform: loading ? "none" : "translateY(-1px)" },
          }}
        >
          {loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <StorageOutlinedIcon sx={{ fontSize: 15 }} />}
          {loading ? "Setting up..." : "Set up managed warehouse"}
        </Box>
      </Box>
    );
  }

  let fields: { label: string; placeholder: string; type?: string }[] = [];
  if (wLower.includes("bigquery")) {
    fields = [
      { label: "Project ID", placeholder: "my-gcp-project" },
      { label: "Dataset", placeholder: "my_dataset" },
      { label: "Service account JSON", placeholder: "Paste JSON key or upload file" },
    ];
  } else if (wLower.includes("redshift")) {
    fields = [
      { label: "Host", placeholder: "cluster.region.redshift.amazonaws.com" },
      { label: "Port", placeholder: "5439" },
      { label: "Database", placeholder: "analytics" },
      { label: "Username", placeholder: "admin" },
      { label: "Password", placeholder: "••••••••", type: "password" },
    ];
  } else if (wLower.includes("snowflake")) {
    fields = [
      { label: "Account", placeholder: "org-account" },
      { label: "Warehouse", placeholder: "COMPUTE_WH" },
      { label: "Database", placeholder: "ANALYTICS" },
      { label: "Username", placeholder: "LOADER" },
      { label: "Password", placeholder: "••••••••", type: "password" },
    ];
  } else {
    fields = [
      { label: "Host", placeholder: "db.example.com" },
      { label: "Port", placeholder: "3306" },
      { label: "Database", placeholder: "analytics" },
      { label: "Username", placeholder: "admin" },
      { label: "Password", placeholder: "••••••••", type: "password" },
    ];
  }

  return (
    <Box sx={{ pt: 1 }}>
      {fields.map((f, i) => (
        <Box key={i} sx={{ mb: 1.25 }}>
          <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500, mb: 0.5 }}>{f.label}</Typography>
          <InputBase type={f.type || "text"} placeholder={f.placeholder} sx={inputFieldSx} />
        </Box>
      ))}
      <Box
        onClick={handleConnect}
        sx={{
          mt: 1, height: 36, borderRadius: 2, bgcolor: ACCENT, color: "#fff",
          fontSize: 13, fontWeight: 500, px: 2.5, display: "inline-flex", alignItems: "center", gap: 0.75,
          cursor: loading ? "default" : "pointer",
          boxShadow: loading ? "none" : `0 1px 3px ${ACCENT}40`,
          transition: "all 0.15s",
          "&:hover": { boxShadow: loading ? "none" : `0 4px 12px ${ACCENT}30`, transform: loading ? "none" : "translateY(-1px)" },
        }}
      >
        {loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <LinkOutlinedIcon sx={{ fontSize: 15 }} />}
        {loading ? "Connecting..." : `Connect ${warehouse}`}
      </Box>
    </Box>
  );
}

// --- Accordion Checklist ---

function AccordionChecklist({
  steps,
  activeStep,
  onToggleStep,
  renderStepContent,
}: {
  steps: ChecklistStep[];
  activeStep: string | null;
  onToggleStep: (id: string) => void;
  renderStepContent: (stepId: string) => React.ReactNode;
}) {
  const doneCount = steps.filter((s) => s.status === "done").length;

  return (
    <Box
      sx={{
        mt: 1, borderRadius: 3, bgcolor: "#fff",
        boxShadow: CARD_SHADOW, border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6" }}>
        <Typography sx={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>
          Setup checklist
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 60, height: 4, borderRadius: 2, bgcolor: "#f3f4f6", overflow: "hidden" }}>
            <Box sx={{ height: "100%", borderRadius: 2, bgcolor: doneCount === steps.length ? "#10b981" : ACCENT, width: `${(doneCount / steps.length) * 100}%`, transition: "width 0.4s ease" }} />
          </Box>
          <Typography sx={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
            {doneCount}/{steps.length}
          </Typography>
        </Box>
      </Box>
      {steps.map((step, idx) => {
        const isOpen = activeStep === step.id;
        const isClickable = step.status === "active" || step.status === "done";

        return (
          <Box key={step.id}>
            {idx > 0 && <Box sx={{ mx: 2.5, borderTop: "1px solid #f3f4f6" }} />}
            <Box
              onClick={() => isClickable && onToggleStep(step.id)}
              sx={{
                display: "flex", alignItems: "center", gap: 1.25, px: 2.5, py: 1.5,
                cursor: isClickable ? "pointer" : "default",
                bgcolor: isOpen ? "#fafbfc" : "transparent",
                transition: "background 0.15s",
                "&:hover": { bgcolor: isClickable ? (isOpen ? "#fafbfc" : "#f9fafb") : "transparent" },
              }}
            >
              {step.status === "done" ? (
                <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                </Box>
              ) : step.status === "active" ? (
                <Box sx={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT }} />
                </Box>
              ) : (
                <Box sx={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontSize: 10, color: "#d1d5db", fontWeight: 500 }}>{idx + 1}</Typography>
                </Box>
              )}

              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: step.status === "active" ? 500 : step.status === "done" ? 400 : 400,
                    color: step.status === "pending" ? "#9ca3af" : step.status === "active" ? "#111827" : "#6b7280",
                  }}
                >
                  {step.label}
                </Typography>
                {step.detail && step.status === "done" && (
                  <Chip label={step.detail} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 500, bgcolor: "#ecfdf5", color: "#059669", borderRadius: 1.5, "& .MuiChip-label": { px: 0.75 } }} />
                )}
              </Box>

              {isClickable && (
                <ExpandMoreOutlinedIcon
                  sx={{
                    fontSize: 18, color: "#9ca3af",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                  }}
                />
              )}
            </Box>

            <Collapse in={isOpen}>
              <Box sx={{ px: 2.5, pb: 2.5, pl: 6 }}>
                {renderStepContent(step.id)}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}

// --- Success Card ---

function SuccessCard({ pipeline }: { pipeline: string }) {
  return (
    <Box
      sx={{
        mt: 1, p: 4, borderRadius: 3, textAlign: "center",
        bgcolor: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.1)", border: "1px solid #d1fae5",
        position: "relative", overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, #10b981, #34d399, #6ee7b7)",
        }}
      />
      <Box
        sx={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2,
        }}
      >
        <CheckCircleOutlinedIcon sx={{ fontSize: 30, color: "#10b981" }} />
      </Box>
      <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 0.5, color: "#111827" }}>Pipeline launched</Typography>
      <Typography sx={{ fontSize: 13.5, color: "#6b7280", mb: 3, lineHeight: 1.6 }}>
        {pipeline} is now active. Your first data sync will begin shortly.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.25, justifyContent: "center" }}>
        <Box sx={{
          height: 38, borderRadius: 2, bgcolor: ACCENT, color: "#fff", fontSize: 13.5, fontWeight: 500, px: 3,
          display: "flex", alignItems: "center", cursor: "pointer",
          boxShadow: `0 1px 3px ${ACCENT}40`, transition: "all 0.15s",
          "&:hover": { boxShadow: `0 4px 12px ${ACCENT}30`, transform: "translateY(-1px)" },
        }}>
          View pipeline
        </Box>
        <Box sx={{
          height: 38, borderRadius: 2, border: "1px solid #e5e7eb", bgcolor: "#fff",
          fontSize: 13.5, fontWeight: 500, px: 3, color: "#374151",
          display: "flex", alignItems: "center", cursor: "pointer", transition: "all 0.15s",
          "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" },
        }}>
          Add another source
        </Box>
      </Box>
    </Box>
  );
}

// --- Main Chat Component ---

export default function OnboardingChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    { type: "bot-text", text: "Welcome to DataChannel! I'm here to help you set up your first data pipeline. Tell me what you'd like to do, or pick a path below." },
    { type: "path-selection", selected: null },
  ]);
  const [input, setInput] = React.useState("");
  const [path, setPath] = React.useState<PathChoice>(null);
  const [extracted, setExtracted] = React.useState<ExtractedInfo>({});
  const [flowStage, setFlowStage] = React.useState<"welcome" | "path-chosen" | "setup" | "launched">("welcome");

  const [steps, setSteps] = React.useState<ChecklistStep[]>([]);
  const [activeStep, setActiveStep] = React.useState<string | null>(null);
  const [selectedSource, setSelectedSource] = React.useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<string | null>(null);
  const [pipelineData, setPipelineData] = React.useState<string>("");
  const [pipelineSchedule, setPipelineSchedule] = React.useState<string>("");

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeStep]);

  const addMessages = (...msgs: Message[]) => {
    setMessages((prev) => [...prev, ...msgs]);
  };

  const addBotTypingThen = (callback: () => void, delay = 1200) => {
    setMessages((prev) => [...prev, { type: "bot-typing" }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.type !== "bot-typing"));
      callback();
    }, delay);
  };

  const buildETLSteps = (info: ExtractedInfo): ChecklistStep[] => [
    { id: "source", label: "Select data source", status: info.source ? "done" : "active", detail: info.source, icon: <HubOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "creds", label: "Add credentials", status: "pending", icon: <LinkOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "pipeline", label: "Configure pipeline", status: "pending", icon: <ScheduleOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "warehouse-select", label: "Select warehouse", status: info.warehouse ? "done" : "pending", detail: info.warehouse, icon: <StorageOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "warehouse-config", label: "Connect warehouse", status: "pending", icon: <LinkOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "launch", label: "Launch pipeline", status: "pending", icon: <PlayArrowOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  const buildReverseETLSteps = (info: ExtractedInfo): ChecklistStep[] => [
    { id: "warehouse-select", label: "Connect warehouse", status: info.warehouse ? "done" : "active", detail: info.warehouse, icon: <StorageOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "warehouse-config", label: "Warehouse credentials", status: "pending", icon: <LinkOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "source", label: "Select destination", status: info.destination ? "done" : "pending", detail: info.destination, icon: <HubOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "creds", label: "Add credentials", status: "pending", icon: <LinkOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "pipeline", label: "Configure sync", status: "pending", icon: <ScheduleOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "launch", label: "Launch sync", status: "pending", icon: <PlayArrowOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  const activateNextPendingStep = (currentSteps: ChecklistStep[], afterId: string) => {
    const idx = currentSteps.findIndex((s) => s.id === afterId);
    for (let i = idx + 1; i < currentSteps.length; i++) {
      if (currentSteps[i].status === "pending") {
        currentSteps[i].status = "active";
        return currentSteps[i].id;
      }
    }
    return null;
  };

  const handlePathSelect = (p: PathChoice) => {
    if (flowStage !== "welcome") return;
    setPath(p);
    setMessages((prev) =>
      prev.map((m) => (m.type === "path-selection" ? { ...m, selected: p } : m))
    );

    const pathLabel = p === "etl" ? "ETL" : "Reverse ETL";

    addBotTypingThen(() => {
      const info: ExtractedInfo = {};
      const newSteps = p === "etl" ? buildETLSteps(info) : buildReverseETLSteps(info);
      const firstActive = newSteps.find((s) => s.status === "active")?.id || null;
      setSteps(newSteps);
      setActiveStep(firstActive);
      setFlowStage("setup");
      addMessages(
        { type: "bot-text", text: `Great, let's set up ${pathLabel}. You can describe what you need in plain language — like "move my Shopify orders to BigQuery daily at 9 PM" — and I'll fill in everything I can. Or go through each step below.` },
        { type: "accordion-checklist" },
      );
    });
  };

  const handleSourceSelect = (source: string) => {
    setSelectedSource(source);
    setExtracted((prev) => ({ ...prev, source }));
    const newSteps = steps.map((s) =>
      s.id === "source" ? { ...s, status: "done" as StepStatus, detail: source } : s
    );
    const nextId = activateNextPendingStep(newSteps, "source");
    setSteps(newSteps);
    setActiveStep(nextId);
  };

  const handleCredentialSubmit = () => {
    const newSteps = steps.map((s) =>
      s.id === "creds" ? { ...s, status: "done" as StepStatus, detail: "Connected" } : s
    );
    const nextId = activateNextPendingStep(newSteps, "creds");
    setSteps(newSteps);
    setActiveStep(nextId);
  };

  const handlePipelineSubmit = (data: string, schedule: string) => {
    setPipelineData(data);
    setPipelineSchedule(schedule);
    setExtracted((prev) => ({ ...prev, data, schedule }));
    const newSteps = steps.map((s) =>
      s.id === "pipeline" ? { ...s, status: "done" as StepStatus, detail: `${data} · ${schedule}` } : s
    );
    const nextId = activateNextPendingStep(newSteps, "pipeline");
    setSteps(newSteps);
    setActiveStep(nextId);
  };

  const handleWarehouseSelect = (warehouse: string) => {
    setSelectedWarehouse(warehouse);
    setExtracted((prev) => ({ ...prev, warehouse }));
    const newSteps = steps.map((s) =>
      s.id === "warehouse-select" ? { ...s, status: "done" as StepStatus, detail: warehouse } : s
    );
    const nextId = activateNextPendingStep(newSteps, "warehouse-select");
    setSteps(newSteps);
    setActiveStep(nextId);
  };

  const handleWarehouseConfigSubmit = () => {
    const newSteps = steps.map((s) =>
      s.id === "warehouse-config" ? { ...s, status: "done" as StepStatus, detail: "Connected" } : s
    );
    const nextId = activateNextPendingStep(newSteps, "warehouse-config");
    setSteps(newSteps);
    setActiveStep(nextId);
  };

  const handleLaunch = () => {
    const newSteps = steps.map((s) =>
      s.id === "launch" ? { ...s, status: "done" as StepStatus, detail: "Active" } : s
    );
    setSteps(newSteps);
    setActiveStep(null);
    setFlowStage("launched");

    const source = extracted.source || extracted.destination || "Source";
    const warehouse = extracted.warehouse || "Warehouse";
    const data = extracted.data || pipelineData || "data";

    addBotTypingThen(() => {
      addMessages(
        { type: "bot-text", text: "Everything is configured. Your pipeline is now live!" },
        { type: "success", pipeline: `${source} ${data} → ${warehouse}` },
      );
    }, 1000);
  };

  const handleToggleStep = (id: string) => {
    setActiveStep((prev) => (prev === id ? null : id));
  };

  const renderStepContent = (stepId: string): React.ReactNode => {
    switch (stepId) {
      case "source":
        return <SourceSelectionStep selectedSource={selectedSource} onSelect={handleSourceSelect} />;
      case "creds":
        return <CredentialFormStep source={selectedSource || extracted.source || "Source"} onSubmit={handleCredentialSubmit} />;
      case "pipeline":
        return <PipelineSetupStep source={selectedSource || extracted.source || "Source"} prefilledData={extracted.data} prefilledSchedule={extracted.schedule} onSubmit={handlePipelineSubmit} />;
      case "warehouse-select":
        return <WarehouseSelectionStep selectedWarehouse={selectedWarehouse} onSelect={handleWarehouseSelect} />;
      case "warehouse-config":
        return <WarehouseConfigStep warehouse={selectedWarehouse || extracted.warehouse || "Warehouse"} onSubmit={handleWarehouseConfigSubmit} />;
      case "launch":
        return (
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 1.5 }}>
              Everything is ready. Click below to start your pipeline.
            </Typography>
            <Box
              onClick={handleLaunch}
              sx={{
                height: 38, borderRadius: 2, bgcolor: ACCENT, color: "#fff",
                fontSize: 13.5, fontWeight: 500, px: 3, display: "inline-flex",
                alignItems: "center", gap: 0.75, cursor: "pointer",
                boxShadow: `0 1px 3px ${ACCENT}40`, transition: "all 0.15s",
                "&:hover": { boxShadow: `0 4px 12px ${ACCENT}30`, transform: "translateY(-1px)" },
              }}
            >
              <RocketLaunchOutlinedIcon sx={{ fontSize: 16 }} />
              Launch pipeline
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  const handleUserMessage = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMessages({ type: "user-text", text });

    if (flowStage === "welcome") {
      const info = extractInfo(text);
      const detectedPath: PathChoice = info.destination ? "reverse-etl" : "etl";
      setPath(detectedPath);
      setExtracted(info);
      if (info.source) setSelectedSource(info.source);
      if (info.warehouse) setSelectedWarehouse(info.warehouse);

      setMessages((prev) =>
        prev.map((m) => (m.type === "path-selection" ? { ...m, selected: detectedPath } : m))
      );

      addBotTypingThen(() => {
        const newSteps = detectedPath === "etl" ? buildETLSteps(info) : buildReverseETLSteps(info);

        for (let i = 0; i < newSteps.length; i++) {
          if (newSteps[i].status === "pending") {
            newSteps[i].status = "active";
            break;
          }
        }

        const firstActive = newSteps.find((s) => s.status === "active")?.id || null;
        setSteps(newSteps);
        setActiveStep(firstActive);
        setFlowStage("setup");

        addMessages(
          { type: "bot-text", text: "Got it! Here's what I understood from your message:" },
          { type: "summary", extracted: info },
          { type: "bot-text", text: "I've pre-filled what I could. Complete the remaining steps below:" },
          { type: "accordion-checklist" },
        );
      }, 1500);
    } else if (flowStage === "setup") {
      const info = extractInfo(text);
      const merged = { ...extracted, ...info };
      setExtracted(merged);
      if (info.source) setSelectedSource(info.source);
      if (info.warehouse) setSelectedWarehouse(info.warehouse);

      addBotTypingThen(() => {
        if (Object.values(info).some(Boolean)) {
          addMessages(
            { type: "bot-text", text: "Updated! I've filled in the new details in your checklist." },
          );
          const updatedSteps = steps.map((s) => {
            if (s.id === "source" && info.source) return { ...s, status: "done" as StepStatus, detail: info.source };
            if (s.id === "warehouse-select" && info.warehouse) return { ...s, status: "done" as StepStatus, detail: info.warehouse };
            return s;
          });
          for (let i = 0; i < updatedSteps.length; i++) {
            if (updatedSteps[i].status === "pending") {
              updatedSteps[i].status = "active";
              break;
            }
          }
          const firstActive = updatedSteps.find((s) => s.status === "active")?.id || null;
          setSteps(updatedSteps);
          setActiveStep(firstActive);
        } else {
          addMessages(
            { type: "bot-text", text: "I couldn't extract specific details from that. You can continue filling in the steps in the checklist, or try describing your need — like 'connect my Shopify to Snowflake'." },
          );
        }
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage();
    }
  };

  return (
    <Box
      sx={{
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 90px)", maxWidth: 740, mx: "auto", width: "100%",
      }}
    >
      {/* Chat stream */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 3, px: 1.5, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
        {messages.map((msg, i) => {
          switch (msg.type) {
            case "bot-text":
              return (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "flex-start" }}>
                  <BotAvatar />
                  <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: "#374151", maxWidth: 540, pt: 0.5 }}>
                    {msg.text}
                  </Typography>
                </Box>
              );
            case "user-text":
              return (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2.5, justifyContent: "flex-end", alignItems: "flex-start" }}>
                  <Box sx={{
                    bgcolor: "#1a1a2e", borderRadius: "16px 16px 4px 16px", px: 2.5, py: 1.5,
                    maxWidth: 480, color: "#fff",
                  }}>
                    <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>{msg.text}</Typography>
                  </Box>
                  <UserAvatar />
                </Box>
              );
            case "path-selection":
              return (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "flex-start" }}>
                  <Box sx={{ width: 32, flexShrink: 0 }} />
                  <Box sx={{ maxWidth: 540, width: "100%" }}>
                    <PathSelectionCard selected={msg.selected} onSelect={handlePathSelect} />
                  </Box>
                </Box>
              );
            case "summary":
              return (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "flex-start" }}>
                  <Box sx={{ width: 32, flexShrink: 0 }} />
                  <Box sx={{ maxWidth: 540, width: "100%" }}>
                    <SummaryCard extracted={msg.extracted} />
                  </Box>
                </Box>
              );
            case "accordion-checklist":
              return (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "flex-start" }}>
                  <Box sx={{ width: 32, flexShrink: 0 }} />
                  <Box sx={{ maxWidth: 580, width: "100%" }}>
                    <AccordionChecklist
                      steps={steps}
                      activeStep={activeStep}
                      onToggleStep={handleToggleStep}
                      renderStepContent={renderStepContent}
                    />
                  </Box>
                </Box>
              );
            case "success":
              return (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "flex-start" }}>
                  <Box sx={{ width: 32, flexShrink: 0 }} />
                  <Box sx={{ maxWidth: 540, width: "100%" }}>
                    <SuccessCard pipeline={msg.pipeline} />
                  </Box>
                </Box>
              );
            case "bot-typing":
              return (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "flex-start" }}>
                  <BotAvatar />
                  <Box sx={{ display: "flex", gap: 0.5, pt: 1.2 }}>
                    {[0, 1, 2].map((d) => (
                      <Box
                        key={d}
                        sx={{
                          width: 7, height: 7, borderRadius: "50%", bgcolor: "#d1d5db",
                          animation: "typing 1.2s infinite", animationDelay: `${d * 0.2}s`,
                          "@keyframes typing": {
                            "0%, 60%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                            "30%": { opacity: 1, transform: "scale(1)" },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            default:
              return null;
          }
        })}
        <div ref={chatEndRef} />
      </Box>

      {/* Input bar */}
      <Box sx={{ px: 1.5, pb: 2.5, pt: 1 }}>
        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            border: "1px solid #e5e7eb", borderRadius: 3.5,
            px: 1, py: 0.5, bgcolor: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            transition: "border-color 0.15s, box-shadow 0.15s",
            "&:focus-within": { borderColor: ACCENT, boxShadow: `0 0 0 3px ${ACCENT}10, 0 1px 4px rgba(0,0,0,0.04)` },
          }}
        >
          <IconButton size="small" sx={{ color: "#9ca3af" }}>
            <AttachFileOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <InputBase
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you need or ask a question..."
            sx={{ flex: 1, fontSize: 14, py: 0.75, px: 0.5 }}
            fullWidth
          />
          <IconButton
            onClick={handleUserMessage}
            disabled={!input.trim()}
            sx={{
              bgcolor: input.trim() ? ACCENT : "#e5e7eb",
              color: "#fff", width: 34, height: 34,
              transition: "all 0.15s",
              "&:hover": { bgcolor: input.trim() ? ACCENT : "#e5e7eb", opacity: 0.9 },
              "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#fff" },
            }}
          >
            <ArrowUpwardOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

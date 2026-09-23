"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CopilotDrawer from "@/components/copilot/CopilotDrawer";

import { T } from "@/lib/copilot/tokens";

const DRAWER_WIDTH = 200;
const DRAWER_WIDTH_MINI = 68;
const ACCENT = T.accent;

type NavItem = {
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Quick Start", icon: <RocketLaunchOutlinedIcon sx={{ fontSize: 20 }} /> },
  { label: "Dashboard", icon: <GridViewOutlinedIcon sx={{ fontSize: 20 }} /> },
  { label: "ETL", icon: <HubOutlinedIcon sx={{ fontSize: 20 }} /> },
  { label: "Reverse ETL", icon: <SyncAltOutlinedIcon sx={{ fontSize: 20 }} /> },
  { label: "Orchestration", icon: <AccountTreeOutlinedIcon sx={{ fontSize: 20 }} /> },
  { label: "Transformations", icon: <ChangeCircleOutlinedIcon sx={{ fontSize: 20 }} /> },
  { label: "Warehouses", icon: <StorageOutlinedIcon sx={{ fontSize: 20 }} /> },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Ask Neo", icon: <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} /> },
  { label: "Settings", icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} /> },
];

export default function MuiAppSidebar({
  children,
  title,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  title: string;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [active, setActive] = React.useState("Dashboard");
  const [copilotOpen, setCopilotOpen] = React.useState(false);

  const width = collapsed ? DRAWER_WIDTH_MINI : DRAWER_WIDTH;

  const renderNavButton = (label: string, icon: React.ReactNode) => {
    const selected = active === label;
    const isCopilot = label === "Ask Neo";
    const button = (
      <ListItemButton
        key={label}
        selected={selected && !isCopilot}
        onClick={() => (isCopilot ? setCopilotOpen(true) : setActive(label))}
        sx={{
          borderRadius: 1.5,
          mb: 0.25,
          py: 1,
          color: selected ? ACCENT : "#555",
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 1 : 1.5,
          minHeight: 40,
          "&.Mui-selected": {
            bgcolor: `${ACCENT}10`,
            "&:hover": { bgcolor: `${ACCENT}18` },
          },
          "&:hover": {
            bgcolor: selected ? `${ACCENT}18` : "rgba(0,0,0,0.04)",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? "auto" : 30,
            color: selected ? ACCENT : "#888",
            justifyContent: "center",
          }}
        >
          {icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            slotProps={{
              primary: {
                sx: { fontSize: 13.5, fontWeight: selected ? 500 : 400, color: selected ? ACCENT : "#444" },
              },
            }}
          />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip key={label} title={label} placement="right">
        <Box>{button}</Box>
      </Tooltip>
    ) : (
      button
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: T.page, overflow: "hidden" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1)",
          "& .MuiDrawer-paper": {
            width,
            overflowX: "hidden",
            boxSizing: "border-box",
            borderRight: "1px solid #f0e8e6",
            bgcolor: "#fff",
            boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
            transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1)",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 1 : 1.5,
              py: 2,
            }}
          >
            {collapsed ? (
              <Box component="img" src="/dc-icon.png" alt="DataChannel" sx={{ width: 32, height: 32 }} />
            ) : (
              <Box component="img" src="/dc-logo.png" alt="DataChannel" sx={{ height: 28 }} />
            )}
          </Box>

          {/* Main nav */}
          <List sx={{ px: collapsed ? 0.75 : 1.25, py: 0, flexGrow: 1 }}>
            {NAV_ITEMS.map((item) => renderNavButton(item.label, item.icon))}

            <Box sx={{ mt: 3 }} />

            {BOTTOM_ITEMS.map((item) => renderNavButton(item.label, item.icon))}
          </List>

          {/* Professional card + collapse */}
          <Box sx={{ p: collapsed ? 0.75 : 1.25, borderTop: "1px solid #f0f0f0" }}>
            {collapsed ? (
              <Tooltip title="Professional" placement="right">
                <IconButton sx={{ width: "100%", borderRadius: 2, bgcolor: "#F7F7F8", mb: 0.5 }}>
                  <OpenInNewOutlinedIcon sx={{ fontSize: 15, color: "#999" }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 1.5,
                  bgcolor: "#F7F7F8",
                  px: 1.5,
                  py: 1,
                  mb: 0.5,
                  cursor: "pointer",
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Professional</Typography>
                <OpenInNewOutlinedIcon sx={{ fontSize: 15, color: "#999" }} />
              </Box>
            )}

            <Tooltip title={collapsed ? "Expand" : ""} placement="right">
              <Box
                onClick={() => setCollapsed((v) => !v)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  py: 0.75,
                  px: 0.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: "#999",
                  "&:hover": { color: "#666" },
                }}
              >
                {collapsed ? (
                  <ChevronRightOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <>
                    <ChevronLeftOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: 12.5, fontWeight: 400, color: "inherit" }}>
                      Collapse Side Bar
                    </Typography>
                  </>
                )}
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", pl: 1.5 }}>
        {/* Top bar — flush to the top, thin, sticky */}
        <Box sx={{ position: "sticky", top: 0, zIndex: (t) => t.zIndex.appBar, flexShrink: 0 }}>
          <AppBar
            position="static"
            color="inherit"
            elevation={0}
            sx={{
              bgcolor: "#fff",
              borderRadius: 0,
              borderBottom: "1px solid #f0e8e6",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
          <Toolbar variant="dense" sx={{ gap: 2, minHeight: "44px !important", px: "20px !important" }}>
            <Typography sx={{ fontWeight: 500, fontSize: 15, color: "#222", flexShrink: 0 }}>
              {title}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* Search */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                px: 1.25,
                py: 0.25,
                minWidth: 180,
              }}
            >
              <SearchOutlinedIcon sx={{ fontSize: 16, color: "#bbb" }} />
              <InputBase placeholder="Search..." sx={{ fontSize: 13, flexGrow: 1 }} />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Workspace selector */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                px: 1.25,
                py: 0.25,
                cursor: "pointer",
              }}
            >
              <WorkOutlineOutlinedIcon sx={{ fontSize: 16, color: "#888" }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#444" }}>
                Demo Reds...
              </Typography>
              <ExpandMoreOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
            </Box>

            <IconButton size="small" sx={{ color: "#888", p: 0.5 }}>
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: "#888", p: 0.5 }}>
              <HelpOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: "#888", p: 0.5 }}>
              <Badge variant="dot" color="error">
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
            <Avatar sx={{ width: 28, height: 28, bgcolor: ACCENT, fontSize: 13 }}>A</Avatar>
          </Toolbar>
        </AppBar>
        </Box>

        {/* Page content */}
        <Box sx={{ p: 3, flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>{children}</Box>
      </Box>

      {/* In-product copilot — same engine as onboarding, available on every page */}
      <CopilotDrawer open={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </Box>
  );
}

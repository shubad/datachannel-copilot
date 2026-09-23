"use client";

import * as React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CopilotChat from "./CopilotChat";
import { T } from "@/lib/copilot/tokens";

const ACCENT = T.accent;

export default function CopilotDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 460 }, maxWidth: "100%", bgcolor: T.page } } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2, py: 1.5, borderBottom: `1px solid ${T.border}`, bgcolor: T.surface }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(140deg,${T.accent},${T.accentHover})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${T.accent}40` }}>
            <Box component="img" src="/dc-icon.png" alt="" sx={{ width: 16, height: 16, filter: "brightness(10)" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.1 }}>Ask Neo</Typography>
            <Typography sx={{ fontSize: 11.5, color: T.textMuted }}>Set up or manage a pipeline without leaving this page</Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><CloseOutlinedIcon sx={{ fontSize: 19 }} /></IconButton>
        </Box>
        {/* engine — same component library as onboarding, compact surface */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <CopilotChat
            compact
            greeting="What do you want to set up or change? Describe it in plain language, or paste a spec."
          />
        </Box>
      </Box>
    </Drawer>
  );
}

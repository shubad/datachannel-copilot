import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiAppSidebar from "@/components/mui-app-sidebar";

export default function Page() {
  return (
    <MuiAppSidebar title="Dashboard">
      {/* Greeting card */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #eee",
          borderRadius: 2,
          p: 2.5,
          mb: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontWeight: 500, fontSize: 15, color: "#333" }}>
          Hey Admin, Good Morning !
        </Typography>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Typography sx={{ fontSize: 13, color: "#999" }}>Rows Processed -</Typography>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 500, fontSize: 16, color: "#222" }}>
              1.1M{" "}
              <Box component="span" sx={{ color: "error.main", fontSize: 12, fontWeight: 500 }}>
                ↓ -1.74%
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#999" }}>This Month MTD</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 500, fontSize: 16, color: "#222" }}>
              79.6K{" "}
              <Box component="span" sx={{ color: "success.main", fontSize: 12, fontWeight: 500 }}>
                ↑ 6.22%
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#999" }}>Previous 24 hrs</Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: ACCENT, cursor: "pointer", fontWeight: 500 }}>
            View Details
          </Typography>
        </Box>
      </Box>

      {/* Recommended Actions */}
      <Typography sx={{ fontWeight: 500, fontSize: 15, mb: 1, color: "#333" }}>
        Recommended Actions
      </Typography>
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #eee",
          borderRadius: 2,
          px: 2,
          py: 1.25,
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
      >
        <Typography sx={{ fontSize: 13.5, color: "#444" }}>👥 Invite your Teammates</Typography>
        <Box component="span" sx={{ color: ACCENT, fontSize: 14 }}>→</Box>
      </Box>

      {/* Scheduled Jobs */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #eee",
          borderRadius: 2,
          p: 2.5,
        }}
      >
        <Typography sx={{ fontWeight: 500, fontSize: 15, mb: 2, color: "#333" }}>
          Scheduled Jobs in your account
        </Typography>
        <Box sx={{ minHeight: 320, borderRadius: 2, bgcolor: "#fafafa" }} />
      </Box>
    </MuiAppSidebar>
  );
}

const ACCENT = "#FD9567";

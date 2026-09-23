import MuiAppSidebar from "@/components/mui-app-sidebar";
import CopilotChat from "@/components/copilot/CopilotChat";

export default function Page() {
  return (
    <MuiAppSidebar title="Quick start" defaultCollapsed>
      <CopilotChat />
    </MuiAppSidebar>
  );
}

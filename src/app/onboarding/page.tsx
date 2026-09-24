import MuiAppSidebar from "@/components/mui-app-sidebar";
import CopilotChat from "@/components/copilot/CopilotChat";

export default function Page() {
  return (
    <MuiAppSidebar title="DC-Copilot" defaultCollapsed>
      <CopilotChat />
    </MuiAppSidebar>
  );
}

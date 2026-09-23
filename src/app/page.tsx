import { redirect } from "next/navigation";

// The root sends people straight into the copilot.
export default function Home() {
  redirect("/onboarding");
}

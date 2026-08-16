import { VerificationDashboard as DashboardComponent } from "../../core/knowledge/verification/components/VerificationDashboard";

export default function VerificationDashboard({ userRole = "ADMIN" }: { userRole?: "ADMIN" | "END_USER" }) {
  return <DashboardComponent userRole={userRole} />;
}

export { DashboardComponent as VerificationDashboard };

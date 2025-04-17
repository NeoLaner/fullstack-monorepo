import { type ReactNode } from "react";
import ProtectedRoute from "../_ui/protectedRoute";
import DashboardLayout from "./_ui/dashboard-layout";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute roles={["moderator", "admin"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

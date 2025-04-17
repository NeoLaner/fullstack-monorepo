import { unauthorized } from "next/navigation";
import { type ReactNode } from "react";
import { ProtectedUserDataProvider } from "~/providers/protected-user-data-provider";

import { auth } from "~/server/auth";
import type { UserRoles } from "~/server/db/schema";
import { api } from "~/trpc/server";

async function ProtectedRoute({
  roles,
  children,
}: {
  roles: UserRoles;
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) return unauthorized();

  const userData = await api.users.getUser(session.user);
  if (!userData) return unauthorized();
  if (!roles.includes(session.user.role)) return unauthorized();

  return (
    <ProtectedUserDataProvider userData={userData}>
      {children}
    </ProtectedUserDataProvider>
  );
}

export default ProtectedRoute;

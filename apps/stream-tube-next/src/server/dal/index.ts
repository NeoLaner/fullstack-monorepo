import type { Session } from "../auth";
import { type UserPermissions } from "../db/schema";

type Methods = "CREATE" | "READ" | "UPDATE" | "DELETE";

type TableName =
  UserPermissions[number] extends `${Lowercase<Methods>}${infer K}` ? K : null;

export function getDataAccessLayer(session: NonNullable<Session>) {
  const isAdmin = session.user.role === "admin";
  const permissions = session.user.permissions;

  function checkAccess(method: Methods, tableName: TableName) {
    if (!isAdmin) return true;

    return permissions?.find(
      (permission) => permission === `${method.toLowerCase()}${tableName}`,
    );
  }

  return { checkAccess };
}

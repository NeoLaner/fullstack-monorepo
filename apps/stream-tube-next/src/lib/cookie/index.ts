/* lib/cookie/index.ts */

import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "~/env";
import type { UserPermissions, UserRoles } from "~/server/db/schema";

export type Cookies = {
  "next-temp-auth": {
    userId: string;
    identifier: string;
    expires: number | Date;
  };
  "next-auth-session": {
    userId: string;
    sessionToken: string;
    role: UserRoles[number];
    permission?: UserPermissions;
    expires: number | Date;
  };
};

export async function setCookie<T extends keyof Cookies>({
  name,
  payload,
  expires,
}: {
  name: T;
  payload: Cookies[T];
  expires?: number | Date;
}) {
  const token = jwt.sign(payload, env.AUTH_SECRET);

  const isProduction = env.NODE_ENV === "production";

  (await cookies()).set({
    name: `${isProduction ? "__Secure-" : ""}${name}`,
    value: token,
    sameSite: "lax",
    secure: isProduction,
    httpOnly: isProduction,
    expires,
  });
}

export async function getCookie<T extends keyof Cookies>(name: T) {
  const cookie = (await cookies()).get(name);
  if (!cookie) return;

  const decodedData = jwt.verify(cookie.value, env.AUTH_SECRET);
  if (!decodedData) return;

  return JSON.parse(JSON.stringify(decodedData)) as Cookies[T];
}

export async function deleteCookie<T extends keyof Cookies>(name: T) {
  (await cookies()).delete(name);
}

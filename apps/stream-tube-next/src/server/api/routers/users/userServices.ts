import type { InferSelectModel } from "drizzle-orm";
import { cache } from "react";
import type { db as database } from "~/server/db";
import type { users } from "~/server/db/schema";

export function getUserServiceMethods(db: typeof database) {
  async function getUser(id: string) {
    const _user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (!_user) return null;

    return toUserDto(_user);
  }

  return { getUser: cache(getUser) };
}

function toUserDto(_user: InferSelectModel<typeof users>) {
  return {
    id: _user.id,
    name: _user.name,
    image: _user.image,
    email: _user.email,
  };
}

export type UserData = ReturnType<typeof toUserDto>;

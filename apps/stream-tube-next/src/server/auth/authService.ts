import { and, eq, type InferSelectModel } from "drizzle-orm";
import { cache, experimental_taintObjectReference } from "react";
import "server-only";
import type { db as database } from "~/server/db";
import { sessions, users, verificationTokens } from "~/server/db/schema";

export function getAuthServiceMethods(db: typeof database) {
  async function createSession(input: {
    userId: string;
    sessionToken: string;
    expires: Date;
  }) {
    const [_session] = await db.insert(sessions).values(input).returning();

    if (!_session) throw Error("The session can't be created.");

    return toSessionDto(_session);
  }

  async function deleteSession(sessionToken: string) {
    const [_session] = await db
      .delete(sessions)
      .where(eq(sessions.sessionToken, sessionToken))
      .returning();

    if (!_session) throw Error("The session can't be deleted.");
    return toSessionDto(_session);
  }

  async function deleteToken(input: { email: string }) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, input.email));
  }

  async function getAndDeleteToken(input: { email: string; otp: string }) {
    const [verificationToken] = await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, input.email),
          eq(verificationTokens.token, input.otp),
        ),
      )
      .returning();

    return verificationToken;
  }

  async function createToken(input: {
    expires: Date;
    token: string;
    identifier: string;
  }) {
    const [createdVerificationToken] = await db
      .insert(verificationTokens)
      .values(input)
      .returning();

    if (!createdVerificationToken)
      throw Error("The verification token can't be created");

    return createdVerificationToken;
  }

  async function getUser(email: string) {
    const _user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });
    if (!_user) return null;
    return toUserDto(_user);
  }

  async function getTaintedUserData(email: string) {
    const _user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });
    if (!_user) return null;

    experimental_taintObjectReference(
      "Don't pass the tainted user data to client component",
      _user,
    );

    return _user;
  }

  async function updateUserEmailVerifiedDate(
    email: string,
    values: { emailVerified: Date },
  ) {
    const [_updatedUser] = await db
      .update(users)
      .set(values)
      .where(eq(users.email, email))
      .returning();

    if (!_updatedUser) throw Error("Can't update the user.");
    return toUserDto(_updatedUser);
  }

  async function updateUserPassword(
    email: string,
    values: { password: string },
  ) {
    const [_updatedUser] = await db
      .update(users)
      .set(values)
      .where(eq(users.email, email))
      .returning();

    if (!_updatedUser) throw Error("Can't update the user.");
    return toUserDto(_updatedUser);
  }

  async function createUser(input: {
    fullName: string;
    email: string;
    hashedPassword: string;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        name: input.fullName,
        email: input.email,
        password: input.hashedPassword,
        image: "/avatar/02-men.png",
      })
      .returning();

    if (!user) throw Error("User can't be created");
    return user;
  }

  return {
    createSession,
    getAndDeleteToken,
    createToken,
    deleteToken,
    getUser: cache(getUser),
    getTaintedUserData: cache(getTaintedUserData),
    updateUserEmailVerifiedDate,
    updateUserPassword,
    createUser,
    deleteSession,
  };
}

function toUserDto(_user: InferSelectModel<typeof users>) {
  const user = {
    id: _user.id,
    email: _user.email,
    emailVerified: _user.emailVerified,
    name: _user.name,
    image: _user.image,
    permissions: _user.permissions,
    role: _user.role,
  };
  return user;
}

export type UserAuth = ReturnType<typeof toSessionDto>;

function toSessionDto(_session: InferSelectModel<typeof sessions>) {
  return {
    userId: _session.userId,
    expires: _session.expires,
    sessionToken: _session.sessionToken,
  };
}

export type Session = ReturnType<typeof toSessionDto>;

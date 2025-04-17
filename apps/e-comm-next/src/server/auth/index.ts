import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { cache } from "react";
import "server-only";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";
import { deleteCookie, getCookie, setCookie, type Cookies } from "~/lib/cookie";
import { errMethods } from "~/lib/utils";
import { db } from "../db";
import { getAuthServiceMethods } from "./authService";

const service = getAuthServiceMethods(db);

async function createSession(userId: string) {
  const sessionToken = uuidv4();

  const EXPIRES = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);

  const sessionData = await service.createSession({
    userId,
    sessionToken,
    expires: EXPIRES,
  });

  const sessionCookieData: Cookies["next-auth-session"] = {
    userId: sessionData.userId,
    role: "user",
    sessionToken: sessionData.sessionToken,
    expires: EXPIRES,
  };

  await setCookie({
    name: "next-auth-session",
    payload: sessionCookieData,
    expires: sessionCookieData.expires,
  });
  await deleteCookie("next-temp-auth");
}

async function optimisticAuth() {
  const cookieSession = await getCookie("next-auth-session");
  if (cookieSession) await deleteCookie("next-temp-auth");
  return cookieSession;
}

const auth = cache(async function uncachedAuth() {
  const cookieSession = await getCookie("next-auth-session");

  if (!cookieSession?.userId) return;

  const databaseSession = await db.query.sessions.findFirst({
    where: (sessions, { eq }) =>
      eq(sessions.sessionToken, cookieSession.sessionToken),
  });

  if (!databaseSession) return;

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, databaseSession?.userId),
  });

  if (!user?.emailVerified) return;

  return {
    session: {
      userId: databaseSession.userId,
      expires: databaseSession.expires,
      sessionToken: databaseSession.sessionToken,
    },
    user: {
      ...user,
      password: null,
    },
  };
});

async function credentialsLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const _user = await service.getTaintedUserData(email);
  if (!_user) return errMethods.messageError("Email or password is wrong");

  if (!_user.emailVerified) {
    await service.deleteToken({ email });
    return errMethods.messageError(
      "Your account not verified yet, Go to signup page and create your account again.",
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, _user.password);

  if (!isPasswordCorrect)
    return errMethods.messageError("Email or password is wrong");

  const sessionToken = uuidv4();

  const EXPIRES = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);

  const sessionData = await service.createSession({
    sessionToken,
    expires: EXPIRES,
    userId: _user.id,
  });

  const sessionCookieData: Cookies["next-auth-session"] = {
    userId: sessionData.userId,
    role: "user",
    sessionToken: sessionData.sessionToken,
    expires: EXPIRES,
  };

  await setCookie({
    name: "next-auth-session",
    payload: sessionCookieData,
  });

  return;
}

async function signupWithCredentials({
  email,
  fullName,
  password,
}: {
  email: string;
  password: string;
  fullName: string;
}) {
  const existedUser = await service.getUser(email);
  const canSignupWithEmail = !!existedUser && !!existedUser.emailVerified;
  if (canSignupWithEmail)
    return errMethods.manualInputError({ email: "This email exist." });

  await service.deleteToken({ email });

  const token = randomInt(100000, 1000000).toString();
  const EXPIRATION_TIME = new Date(Date.now() + 5 * 60 * 1000);
  const createdVerificationToken = await service.createToken({
    expires: EXPIRATION_TIME,
    identifier: email,
    token,
  });

  if (!createdVerificationToken)
    throw new Error(
      "createVerificationToken executed but no verification token returned!",
    );

  if (env.NODE_ENV === "production") {
    // Email or SMS The OTP
  } else {
    console.log(`❌❌ OTP Code is: ${createdVerificationToken.token} ❌❌`);
  }

  const SALT_ROUNDS = 12;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const userData = existedUser
    ? await service.updateUserPassword(email, { password: hashedPassword })
    : await service.createUser({
        email,
        fullName,
        hashedPassword,
      });

  if (!userData) throw Error("auth.createUser executed but no user returned!");

  await setCookie({
    name: "next-temp-auth",
    payload: {
      identifier: createdVerificationToken.identifier,
      expires: createdVerificationToken.expires,
      userId: userData.id,
    },
  });
}

async function verifyEmailAddress(email: string) {
  const user = await service.updateUserEmailVerifiedDate(email, {
    emailVerified: new Date(Date.now()),
  });

  return user;
}

async function verifyOtp(email: string, otp: string) {
  const verificationToken = await service.getAndDeleteToken({ email, otp });

  if (!verificationToken) return false;
  const isExpired = verificationToken.expires < new Date(Date.now());
  if (isExpired) return false;

  return !!verificationToken;
}

async function signout() {
  const cookieSession = await getCookie("next-auth-session");
  if (!cookieSession) return null;
  await service.deleteSession(cookieSession?.sessionToken);
  await deleteCookie("next-auth-session");
  await deleteCookie("next-temp-auth");
}

type Session = Awaited<ReturnType<typeof auth>>;

export {
  auth,
  createSession,
  credentialsLogin,
  optimisticAuth,
  signout,
  signupWithCredentials,
  verifyEmailAddress,
  verifyOtp,
  type Session,
};

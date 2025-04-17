"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCookie } from "~/lib/cookie";
import { createSession, verifyEmailAddress, verifyOtp } from "../auth";

const optActionInputSchema = z.object({ otp: z.string().min(6).max(6) });

export async function otpSignupAction(prvState: unknown, formData: FormData) {
  const tempAuthData = await getCookie("next-temp-auth");
  if (!tempAuthData) redirect("/auth/signup");
  const { identifier: email, userId } = tempAuthData;

  const parseResult = optActionInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parseResult.success) return parseResult.error;
  const { otp } = parseResult.data;

  const isVerified = await verifyOtp(email, otp);
  if (!isVerified) return { message: "Invalid OTP" };

  await verifyEmailAddress(email);
  await createSession(userId);

  redirect("/");
}

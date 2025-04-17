"use server";

import { redirect } from "next/navigation";
import { signupSchema } from "~/lib/schema";
import { errMethods } from "~/lib/utils";

import { signupWithCredentials } from "../auth";

export async function signupAction(prvState: unknown, formData: FormData) {
  const { success, data, error } = signupSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!success) return errMethods.zodToError(error);

  const signupData = await signupWithCredentials(data);
  if (signupData?.failed) return signupData;

  redirect("/auth/otp");
}

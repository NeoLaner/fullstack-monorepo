"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "~/lib/schema";
import { errMethods } from "~/lib/utils";

import { credentialsLogin } from "../auth";

export async function loginAction(prvState: unknown, formData: FormData) {
  const { success, data, error } = loginSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!success) {
    return errMethods.zodToError(error);
  }
  const loginData = await credentialsLogin(data);
  if (loginData?.failed) return loginData;

  redirect("/");
}

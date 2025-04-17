"use server";
import { redirect } from "next/navigation";
import { signout } from "../auth";

export async function signoutAction() {
  await signout();
  redirect("/auth/login");
}

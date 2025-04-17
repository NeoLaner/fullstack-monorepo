import { z } from "zod";

export const fullNameSchema = z
  .string()
  .min(3, "Your full name must at least has 3 characters");

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .min(2)
  .max(100);

export const passwordSignupSchema = z
  .string()
  .min(8, "The password must at least have 8 characters")
  .refine((val) => !/\s/.test(val), {
    message: "The password can't have space.",
  });

export const passwordLoginSchema = z
  .string()
  .min(1, "You forgot to put your password!")
  .trim();

export const signupSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSignupSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordLoginSchema,
});

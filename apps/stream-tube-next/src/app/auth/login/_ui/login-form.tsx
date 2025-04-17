"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@neolaner/ui/components/ui/form";
import { Input } from "@neolaner/ui/components/ui/input";
import { useServerErrorHandler } from "@neolaner/ui/hooks/useServerErrorHandler";
import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { env } from "~/env";
import { loginSchema } from "~/lib/schema";
import { loginAction } from "~/server/action/loginAction";
import { SubmitBtn } from "../../_ui/submit-btn";

const formSchema = loginSchema;

export function LoginForm({ className }: { className?: string }) {
  const [serverState, formAction] = useActionState(loginAction, null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: env.NEXT_PUBLIC_NODE_ENV === "production" ? "" : "11111111",
    },
    mode: "onChange",
  });

  useServerErrorHandler(serverState, form);

  return (
    <Form {...form}>
      <form className={className} action={formAction}>
        <div className="grid gap-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormLabel htmlFor="email">Email</FormLabel>

                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <div className="flex items-center">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Link
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitBtn
              disabled={!form.formState.isValid}
              pendingMessage="Login you in..."
              type="submit"
              className="w-full"
            >
              Login
            </SubmitBtn>
          </div>
        </div>
      </form>
    </Form>
  );
}

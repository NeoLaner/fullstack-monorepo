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
import { useActionState, useRef } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { signupSchema } from "~/lib/schema";
import { signupAction } from "~/server/action/signupAction";
import { SubmitBtn } from "../../_ui/submit-btn";

export default function SignupForm({ className }: { className?: string }) {
  const [serverState, formAction] = useActionState(signupAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  useServerErrorHandler(serverState, form);

  return (
    <Form {...form}>
      <form ref={formRef} className={className} action={formAction}>
        <div className="grid gap-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormLabel htmlFor="fullName">Fullname</FormLabel>
                  <FormControl>
                    <Input placeholder="Yasin Askari" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      placeholder="at least 8 characters"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SubmitBtn disabled={!form.formState.isValid}>Signup</SubmitBtn>
          </div>
        </div>
      </form>
    </Form>
  );
}

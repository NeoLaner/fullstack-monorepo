"use client";
import { useActionState, useEffect, useRef, useState } from "react";

import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@neolaner/ui/components/ui/input-otp";
import { otpSignupAction } from "~/server/action/otpSignupAction";
import { SubmitBtn } from "../../_ui/submit-btn";

export default function OtpForm({ className }: { className?: string }) {
  const [state, action, pending] = useActionState(otpSignupAction, null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const [otpValue, setOtpValue] = useState("");
  const REGEXP_ONLY_DIGITS = /^[0-9]*$/ as unknown as string;

  useEffect(() => {
    if (otpValue?.toString().length === 6) submitBtnRef.current?.click();
  }, [otpValue]);

  useEffect(() => {
    if (state?.message) toast.error(state?.message);
  }, [state]);

  return (
    <form className={className} action={action}>
      <div className="grid gap-6">
        <div className="grid w-full gap-6">
          <InputOTP
            name="otp"
            pattern={REGEXP_ONLY_DIGITS}
            maxLength={6}
            value={otpValue}
            onChange={setOtpValue}
            className=""
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <SubmitBtn
            pendingActionState={pending}
            ref={submitBtnRef}
            pendingMessage="Verifying"
          >
            Verify
          </SubmitBtn>
        </div>
      </div>
    </form>
  );
}

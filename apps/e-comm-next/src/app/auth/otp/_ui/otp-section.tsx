import { FormHeader } from "../../_ui/form-header";
import Section from "../../_ui/section";
import OtpForm from "./otp-form";

export default function OtpSection() {
  return (
    <Section>
      <SignupFormHeader />
      <OtpForm />
    </Section>
  );
}

function SignupFormHeader() {
  return (
    <FormHeader
      title="Enter Your OTP Code"
      description="Check your email address and give us the otp code that we've sent to you."
    />
  );
}

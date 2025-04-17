import AuthTypeSwitchBtn from "../../_ui/auth-type-switch-btn";
import { FormHeader } from "../../_ui/form-header";
import Section from "../../_ui/section";
import { TermsAndService } from "../../_ui/terms-and-service";
import SignupForm from "./signup-form";

export default function SignupSection() {
  return (
    <Section>
      <SignupFormHeader />
      <SignupForm />
      <AuthTypeSwitchBtn />
      <TermsAndService />
    </Section>
  );
}

function SignupFormHeader() {
  return (
    <FormHeader
      title="Create Account"
      description="Enter your email below which you want to created account with."
    />
  );
}

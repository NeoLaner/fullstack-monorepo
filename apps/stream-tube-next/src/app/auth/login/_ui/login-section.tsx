import AuthTypeSwitchBtn from "../../_ui/auth-type-switch-btn";
import { FormHeader } from "../../_ui/form-header";
import Section from "../../_ui/section";
import { TermsAndService } from "../../_ui/terms-and-service";
import { LoginForm } from "./login-form";

export default function LoginSection() {
  return (
    <Section>
      <LoginFormHeader />
      <LoginForm />
      <AuthTypeSwitchBtn />
      <TermsAndService />
    </Section>
  );
}

function LoginFormHeader() {
  return (
    <FormHeader
      title="Welcome Back"
      description="Enter your email below to login to your account"
    />
  );
}

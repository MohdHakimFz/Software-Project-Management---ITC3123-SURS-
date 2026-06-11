import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back to SURS"
      subtitle="Sign in to manage your registration, courses, and payments."
    >
      <LoginForm />
    </AuthLayout>
  );
}

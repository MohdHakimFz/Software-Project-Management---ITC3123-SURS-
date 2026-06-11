import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFormGlow } from "@/components/auth/auth-form-glow";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Start your academic journey"
      subtitle="Register as a new UPTM student and access the full registration portal."
    >
      <AuthFormGlow>
        <RegisterForm />
      </AuthFormGlow>
    </AuthLayout>
  );
}

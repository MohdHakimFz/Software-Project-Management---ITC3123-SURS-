interface AuthFormGlowProps {
  children: React.ReactNode;
}

/** Animated gradient border around login/register card. */
export function AuthFormGlow({ children }: AuthFormGlowProps) {
  return (
    <div className="auth-form-glow relative w-full max-w-md rounded-2xl p-[1px] sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
      <div className="relative rounded-2xl">{children}</div>
    </div>
  );
}

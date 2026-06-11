/**
 * Central env access — never hardcode secrets in source files.
 * All keys must live in .env.local (local) or Vercel env (production).
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getStripeSecretKey(): string {
  const key = requireEnv("STRIPE_SECRET_KEY");
  if (process.env.NODE_ENV === "production" && key.startsWith("sk_live_")) {
    throw new Error(
      "Live Stripe keys are disabled for this project. Use sk_test_... in Vercel env."
    );
  }
  return key;
}

export function getStripeWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return key.startsWith("sk_test_");
}

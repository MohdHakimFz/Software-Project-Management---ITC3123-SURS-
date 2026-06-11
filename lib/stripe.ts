import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/env";

export function getStripe(): Stripe {
  return new Stripe(getStripeSecretKey());
}

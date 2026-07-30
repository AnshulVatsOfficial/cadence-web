"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    price: "$0",
    description: "Basic access for individuals.",
    features: ["1 Project", "Up to 2 Members", "Basic Support"],
    mostPopular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE,
  },
  {
    name: "Pro",
    id: "tier-pro",
    price: "$19",
    description: "Perfect for small teams.",
    features: [
      "Up to 10 Projects",
      "Up to 10 Members per project",
      "Priority Support",
      "Advanced Analytics",
    ],
    mostPopular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    price: "$99",
    description: "For large organizations.",
    features: [
      "Unlimited Projects",
      "Unlimited Members",
      "24/7 Dedicated Support",
      "Custom Integrations",
    ],
    mostPopular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleSubscribe = async (priceId: string | undefined, tierId: string) => {
    if (!priceId) {
      toast.error("Price ID not configured for this tier.");
      return;
    }
    
    // For free tier, just redirect to projects
    if (tierId === "tier-free") {
      window.location.href = "/projects";
      return;
    }

    try {
      setLoading(tierId);
      const res = await api.post("/stripe/checkout", { priceId });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to start checkout process.");
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      const res = await api.post("/stripe/portal");
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Could not open billing portal. You might not have an active subscription yet.");
      setPortalLoading(false);
    }
  };

  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pricing plans for teams of all sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
          Choose an affordable plan that's packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
        </p>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
            {portalLoading ? "Loading..." : "Manage Current Billing"}
          </Button>
        </div>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-border xl:p-10 ${
                tier.mostPopular ? "bg-primary/5 ring-primary" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={`text-lg font-semibold leading-8 ${
                    tier.mostPopular ? "text-primary" : "text-foreground"
                  }`}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                    Most popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">{tier.price}</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
              </p>
              <Button
                onClick={() => handleSubscribe(tier.priceId, tier.id)}
                disabled={loading === tier.id}
                variant={tier.mostPopular ? "default" : "outline"}
                className="mt-6 w-full"
              >
                {loading === tier.id ? "Redirecting..." : tier.name === "Free" ? "Get Started" : "Subscribe"}
              </Button>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

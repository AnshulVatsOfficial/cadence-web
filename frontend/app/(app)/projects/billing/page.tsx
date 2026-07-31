"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Check, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import ProjectLayoutShell from "@/components/projects/ProjectLayoutShell";
import { ProjectProvider } from "@/components/projects/ProjectContext";

const tiers = [
  {
    name: "FREE",
    id: "tier-free",
    price: "$0",
    description: "Basic access for individuals.",
    features: ["1 Project", "Up to 2 Members", "Basic Support"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE,
  },
  {
    name: "PRO",
    id: "tier-pro",
    price: "$19",
    description: "Perfect for small teams.",
    features: [
      "Up to 10 Projects",
      "Up to 10 Members per project",
      "Priority Support",
      "Advanced Analytics",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
  },
  {
    name: "ENTERPRISE",
    id: "tier-enterprise",
    price: "$99",
    description: "For large organizations.",
    features: [
      "Unlimited Projects",
      "Unlimited Members",
      "24/7 Dedicated Support",
      "Custom Integrations",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
  },
];

export default function BillingPage() {
  const [planData, setPlanData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [planRes, historyRes] = await Promise.all([
        api.get("/stripe/plan"),
        api.get("/stripe/history"),
      ]);
      setPlanData(planRes.data.plan);
      setInvoices(historyRes.data.invoices || []);
    } catch (error) {
      console.error("Failed to load billing data", error);
      toast.error("Failed to load billing details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string | undefined, tierId: string) => {
    if (!priceId) {
      toast.error("Price ID not configured for this tier.");
      return;
    }
    
    // Can't checkout free tier
    if (tierId === "tier-free") {
      return;
    }

    try {
      setActionLoading(tierId);
      const res = await api.post("/stripe/checkout", { priceId });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to start checkout process.");
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading("manage");
      const res = await api.post("/stripe/portal");
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Could not open billing portal. You might not have an active subscription yet.");
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <ProjectProvider>
        <ProjectLayoutShell>
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
          </div>
        </ProjectLayoutShell>
      </ProjectProvider>
    );
  }

  const currentTier = tiers.find(t => t.name === planData?.name) || tiers[0];

  return (
    <ProjectProvider>
      <ProjectLayoutShell>
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#172B4D] mb-1">Billing & Subscriptions</h1>
          <p className="text-sm text-[#5E6C84]">Manage your current plan, limits, and view past transactions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE (2 cols wide on lg) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Available Plans Section */}
            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-4">All Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier) => {
                  const isCurrent = planData?.name === tier.name;
                  return (
                    <div
                      key={tier.id}
                      className={`border rounded-md p-5 flex flex-col ${
                        isCurrent ? "border-[#0052CC] bg-[#DEEBFF]/30 shadow-sm" : "border-[#DFE1E6] bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-[#172B4D]">{tier.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-white bg-[#0052CC] px-2 py-0.5 rounded-full uppercase">Current</span>
                        )}
                      </div>
                      <div className="mb-4">
                        <span className="text-xl font-bold text-[#172B4D]">{tier.price}</span>
                        <span className="text-xs text-[#5E6C84]">/month</span>
                      </div>
                      
                      <ul className="space-y-2 text-xs text-[#172B4D] flex-1 mb-5">
                        {tier.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#0052CC]" />
                            {feat}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full mt-auto"
                        variant={isCurrent ? "outline" : "default"}
                        disabled={isCurrent || actionLoading === tier.id || tier.name === "FREE"}
                        onClick={() => handleSubscribe(tier.priceId, tier.id)}
                      >
                        {actionLoading === tier.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrent ? (
                          "Active"
                        ) : tier.name === "FREE" ? (
                          "Included"
                        ) : (
                          "Upgrade"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Current Plan Info Section */}
            <section className="bg-white border border-[#DFE1E6] rounded-md overflow-hidden">
              <div className="bg-[#FAFBFC] border-b border-[#DFE1E6] p-4">
                <h2 className="text-sm font-semibold text-[#172B4D] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0052CC]" />
                  Current Plan Info
                </h2>
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#172B4D] mb-2">{planData?.name || "FREE"}</h3>
                  <p className="text-sm text-[#5E6C84] mb-4">{currentTier.description}</p>
                  {planData?.currentPeriodEnd && (
                    <p className="text-xs font-medium text-[#172B4D] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF991F]" />
                      Renews on {format(new Date(planData.currentPeriodEnd), "MMMM do, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex-1 w-full bg-[#F4F5F7] p-4 rounded-md">
                  <h4 className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-3">Plan Limits</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-[#172B4D]">
                        <span>Projects</span>
                        <span className="font-medium">{planData?.limits.projects === Infinity ? "Unlimited" : planData?.limits.projects}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-[#172B4D]">
                        <span>Members per Project</span>
                        <span className="font-medium">{planData?.limits.members === Infinity ? "Unlimited" : planData?.limits.members}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section className="bg-white border border-[#DFE1E6] rounded-md overflow-hidden">
              <div className="bg-[#FAFBFC] border-b border-[#DFE1E6] p-4">
                <h2 className="text-sm font-semibold text-[#172B4D] flex items-center gap-2">
                  Payment Information
                </h2>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#172B4D] mb-1">Manage your payment methods and billing details securely via Stripe.</p>
                  <p className="text-xs text-[#5E6C84]">Only available for paid plans.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={!!actionLoading || planData?.name === "FREE"}>
                  {actionLoading === "manage" ? "Loading..." : "Manage Payment Method"}
                </Button>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE (1 col wide on lg) */}
          <div className="lg:col-span-1">
            {/* Transaction History */}
            <section>
              <h2 className="text-lg font-bold text-[#172B4D] mb-4">Transaction History</h2>
              {invoices.length === 0 ? (
                <div className="bg-[#FAFBFC] border border-[#DFE1E6] border-dashed rounded-md p-6 text-center">
                  <p className="text-sm text-[#5E6C84]">No transactions found.</p>
                </div>
              ) : (
                <div className="border border-[#DFE1E6] rounded-md overflow-hidden bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6]">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-[#5E6C84] text-xs uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 font-semibold text-[#5E6C84] text-xs uppercase tracking-wider text-right">Amount</th>
                        <th className="px-4 py-3 font-semibold text-[#5E6C84] text-xs uppercase tracking-wider text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE1E6]">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#FAFBFC]">
                          <td className="px-4 py-3 text-[#172B4D] text-xs">
                            {format(new Date(inv.created * 1000), "MMM do, yyyy")}
                            <div className="mt-0.5">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {inv.status?.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#172B4D] font-medium text-right">
                            ${(inv.amount_paid / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {inv.hosted_invoice_url ? (
                              <a 
                                href={inv.hosted_invoice_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[#0052CC] hover:underline text-xs font-medium"
                              >
                                PDF
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
        </div>
      </ProjectLayoutShell>
    </ProjectProvider>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Check, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import ProjectLayoutShell from "@/components/projects/ProjectLayoutShell";
import { ProjectProvider } from "@/components/projects/ProjectContext";
import CustomDialog from "@/components/shared/CustomDialog";

const tiers = [
  {
    name: "FREE",
    id: "tier-free",
    price: "$0",
    description: "Basic access for individuals.",
    features: ["1 Project", "Up to 2 Members", "Basic Support"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE || "price_free",
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
  const [confirmingTier, setConfirmingTier] = useState<any>(null);
  const [amountDue, setAmountDue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams(window.location.search);
      const sessionId = searchParams.get("session_id");
      const checkoutSuccess = searchParams.get("checkout_success");

      if (checkoutSuccess) {
        toast.success("Payment successful! Updating your plan...");
      }

      const planUrl = sessionId ? `/stripe/plan?session_id=${sessionId}` : "/stripe/plan";
      const historyUrl = sessionId ? `/stripe/history?session_id=${sessionId}` : "/stripe/history";

      const [planRes, historyRes] = await Promise.all([
        api.get(planUrl),
        api.get(historyUrl),
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

  const handleUpgradeClick = async (tier: any) => {
    setConfirmingTier(tier);
    setAmountDue(null);
    if (tier.id === "tier-free") {
      setAmountDue(0);
      return;
    }

    if (tier.priceId) {
      setIsCalculating(true);
      try {
        const res = await api.get(`/stripe/preview-proration?priceId=${tier.priceId}`);
        setAmountDue(res.data.amountDue);
      } catch (err) {
        console.error(err);
        toast.error("Failed to calculate prorated amount.");
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handleConfirmSubscribe = async () => {
    if (!confirmingTier) return;

    try {
      setActionLoading(confirmingTier.id);
      const targetPriceId = confirmingTier.priceId || (confirmingTier.id === "tier-free" ? "tier-free" : undefined);
      
      if (!targetPriceId) {
        toast.error("Invalid price configuration for tier");
        return;
      }

      const res = await api.post("/stripe/update-subscription", { priceId: targetPriceId });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      } else if (res.data.success) {
        toast.success(res.data.message || "Subscription updated successfully!");
        setConfirmingTier(null);
        await fetchBillingData();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update subscription.");
    } finally {
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

  const currentPlanName = (planData?.name || "FREE").toUpperCase();
  const currentTier = tiers.find(t => t.name.toUpperCase() === currentPlanName) || tiers[0];

  return (
    <ProjectProvider>
      <ProjectLayoutShell>
        <div className="p-6 md:p-8 w-full h-full overflow-y-auto">
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
                  const isCurrent = currentPlanName === tier.name.toUpperCase();
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
                        disabled={isCurrent || actionLoading === tier.id}
                        onClick={() => handleUpgradeClick(tier)}
                      >
                        {actionLoading === tier.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrent ? (
                          "Active"
                        ) : currentPlanName === "FREE" ? (
                          `Upgrade to ${tier.name}`
                        ) : tier.name === "FREE" ? (
                          "Downgrade to Free"
                        ) : (
                          `Switch to ${tier.name}`
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
                  <h3 className="text-2xl font-bold text-[#172B4D] mb-2">{currentTier.name}</h3>
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
                        <span className="font-medium">{planData?.limits?.projects === Infinity ? "Unlimited" : planData?.limits?.projects || 1}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-[#172B4D]">
                        <span>Members per Project</span>
                        <span className="font-medium">{planData?.limits?.members === Infinity ? "Unlimited" : planData?.limits?.members || 2}</span>
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
                  <p className="text-xs text-[#5E6C84]">Only available for active paid plans.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={!!actionLoading || currentPlanName === "FREE"}>
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
                  <Table className="w-full text-left text-sm">
                    <TableHeader className="bg-[#FAFBFC] border-b border-[#DFE1E6]">
                      <TableRow className="hover:bg-transparent border-[#DFE1E6]">
                        <TableHead className="px-4 py-3 font-semibold text-[#5E6C84] text-xs uppercase tracking-wider h-auto">Date</TableHead>
                        <TableHead className="px-4 py-3 font-semibold text-[#5E6C84] text-xs uppercase tracking-wider text-right h-auto">Amount</TableHead>
                        <TableHead className="px-4 py-3 font-semibold text-[#5E6C84] text-xs uppercase tracking-wider text-center h-auto">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#DFE1E6]">
                      {invoices.map((inv) => (
                        <TableRow key={inv.id} className="hover:bg-[#FAFBFC] border-[#DFE1E6]">
                          <TableCell className="px-4 py-3 text-[#172B4D] text-xs">
                            {format(new Date(inv.created * 1000), "MMM do, yyyy")}
                            <div className="mt-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold uppercase rounded-[2px] px-1.5 py-0 ${
                                  inv.status === "paid"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                }`}
                              >
                                {inv.status?.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-[#172B4D] font-medium text-right text-xs">
                            ${(inv.amount_paid / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center text-xs">
                            {inv.hosted_invoice_url ? (
                              <Button
                                asChild
                                variant="link"
                                size="xs"
                                className="text-[#0052CC] hover:underline text-xs font-medium h-auto p-0"
                              >
                                <a 
                                  href={inv.hosted_invoice_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                >
                                  PDF
                                </a>
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        </div>
        </div>
      </ProjectLayoutShell>

      {confirmingTier && (
        <CustomDialog
          isOpen={true}
          onClose={() => setConfirmingTier(null)}
          title={confirmingTier.name === "FREE" ? "Downgrade Subscription" : "Confirm Subscription Change"}
          description={confirmingTier.name === "FREE" ? "You are about to switch to the Free plan." : "You are about to update your plan."}
        >
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-md p-4 mb-6 mt-2">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-5 h-5 text-[#0052CC]" />
              <h3 className="font-semibold text-[#172B4D]">{confirmingTier.name} Plan</h3>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-[#DFE1E6] pt-3">
              <span className="text-[#5E6C84]">Total Due Today</span>
              <span className="font-bold text-[#172B4D] text-lg">
                {isCalculating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0052CC] inline" />
                ) : amountDue !== null ? (
                  `$${(amountDue / 100).toFixed(2)}`
                ) : (
                  confirmingTier.price
                )}
              </span>
            </div>
            <p className="text-xs text-[#5E6C84] mt-2">
              {confirmingTier.name === "FREE"
                ? "Downgrading to Free will cancel your paid subscription."
                : "This amount reflects prorated charges based on your current subscription status and billing cycle."}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmingTier(null)} disabled={!!actionLoading}>
              Back
            </Button>
            <Button
              onClick={handleConfirmSubscribe}
              disabled={!!actionLoading || isCalculating}
              className="bg-[#0052CC] hover:bg-[#0047B3] text-white flex items-center gap-2"
            >
              {actionLoading === confirmingTier.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : confirmingTier.name === "FREE" ? (
                "Confirm Downgrade"
              ) : (
                "Proceed to Pay"
              )}
            </Button>
          </div>
        </CustomDialog>
      )}
    </ProjectProvider>
  );
}

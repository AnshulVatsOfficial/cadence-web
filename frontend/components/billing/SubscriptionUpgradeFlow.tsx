"use client";

import React, { useState } from "react";
import { Check, CreditCard, X, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import CustomDialog from "../shared/CustomDialog";
import { Dialog, DialogContent } from "../ui/dialog";

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

interface SubscriptionUpgradeFlowProps {
  isOpen: boolean;
  onClose: () => void;
  alertMessage?: string;
}

type Step = "alert" | "plans" | "confirm";

export default function SubscriptionUpgradeFlow({
  isOpen,
  onClose,
  alertMessage = "Your plan has reached its limits. To achieve this, please upgrade your plan.",
}: SubscriptionUpgradeFlowProps) {
  const [step, setStep] = useState<Step>("alert");
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [amountDue, setAmountDue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleClose = () => {
    setStep("alert");
    setSelectedTier(null);
    onClose();
  };

  const handleSelectTier = async (tier: any) => {
    setSelectedTier(tier);
    setStep("confirm");
    setAmountDue(null);
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

  const handleSubscribe = async () => {
    if (!selectedTier || !selectedTier.priceId) {
      toast.error("Invalid plan selection.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/stripe/update-subscription", { priceId: selectedTier.priceId });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else if (res.data.success) {
        toast.success("Subscription updated successfully!");
        handleClose();
        window.location.reload();
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update subscription.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* STEP 1: ALERT MODAL */}
      {/* STEP 1: ALERT MODAL */}
      {step === "alert" && (
        <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="bg-white max-w-sm border border-[#DFE1E6] rounded-[8px] p-0 focus:outline-none overflow-hidden">
            <div className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Upgrade Required</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-[#5E6C84] text-sm mb-6 leading-relaxed">
                {alertMessage}
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setStep("plans")}
                  className="bg-[#0052CC] hover:bg-[#0047B3] text-white w-full shadow-sm"
                >
                  View Upgrade Plans
                </Button>
                <Button variant="ghost" onClick={handleClose} className="w-full text-[#5E6C84] hover:text-[#172B4D]">
                  Not right now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* STEP 2: PLANS MODAL */}
      {step === "plans" && (
        <CustomDialog
          isOpen={true}
          onClose={handleClose}
          title="Choose a Plan"
          description="Select a plan that fits your team's needs."
          className="max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="border border-[#DFE1E6] rounded-md p-5 bg-white flex flex-col h-full"
              >
                <div className="mb-4">
                  <h3 className="font-bold text-[#172B4D]">{tier.name}</h3>
                  <p className="text-xs text-[#5E6C84] mt-1">{tier.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-2xl font-bold text-[#172B4D]">{tier.price}</span>
                  <span className="text-xs text-[#5E6C84]">/month</span>
                </div>
                <ul className="space-y-2 text-xs text-[#172B4D] flex-1 mb-6">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0052CC]" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.name === "FREE" ? "outline" : "default"}
                  disabled={tier.name === "FREE"}
                  onClick={() => {
                    if (tier.name !== "FREE") {
                      handleSelectTier(tier);
                    }
                  }}
                >
                  {tier.name === "FREE" ? "Current Plan" : "Buy this plan"}
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </CustomDialog>
      )}

      {/* STEP 3: CONFIRM MODAL */}
      {step === "confirm" && selectedTier && (
        <CustomDialog
          isOpen={true}
          onClose={handleClose}
          title="Confirm Subscription"
          description="You are about to upgrade your workspace."
        >
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-md p-4 mb-6 mt-2">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-5 h-5 text-[#0052CC]" />
              <h3 className="font-semibold text-[#172B4D]">{selectedTier.name} Plan</h3>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-[#DFE1E6] pt-3">
              <span className="text-[#5E6C84]">Total Due Today</span>
              <span className="font-bold text-[#172B4D] text-lg">
                {isCalculating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0052CC] inline" />
                ) : amountDue !== null ? (
                  `$${(amountDue / 100).toFixed(2)}`
                ) : (
                  selectedTier.price
                )}
              </span>
            </div>
            <p className="text-xs text-[#5E6C84] mt-2">
              Note: This amount reflects prorated charges based on your current subscription status and billing cycle.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStep("plans")} disabled={loading}>
              Back
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-[#0052CC] hover:bg-[#0047B3] text-white flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Proceed to Checkout
            </Button>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

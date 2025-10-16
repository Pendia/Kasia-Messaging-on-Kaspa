import React, { useState } from "react";
import { useBlocklistStore } from "../../../store/blocklist.store";
import { X, Plus, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { toast } from "../../../utils/toast-helper";
import { BLOCKED_PLACEHOLDER } from "../../../components/MessagesPane/Broadcasts/BroadcastMessagesList";
import { Button } from "../../Common/Button";

export const BlockList: React.FC = () => {
  const blocklistStore = useBlocklistStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newReason, setNewReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBroadcastExpanded, setIsBroadcastExpanded] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddress.trim()) {
      toast.error("Please enter an address");
      return;
    }

    // Basic Kaspa address validation (starts with kaspa:)
    if (
      !newAddress.trim().startsWith("kaspa:") &&
      !newAddress.trim().startsWith("kaspatest:")
    ) {
      toast.error("Please enter a valid Kaspa address");
      return;
    }

    setIsSubmitting(true);

    try {
      await blocklistStore.blockAddress(
        newAddress.trim(),
        newReason.trim() || undefined
      );
      toast.success("Address blocked successfully");
      setNewAddress("");
      setNewReason("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error blocking address:", error);
      toast.error("Failed to block address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewAddress("");
    setNewReason("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Content wrapper with sliding animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showAddForm
            ? "max-h-0 overflow-hidden opacity-0"
            : "max-h-screen opacity-100"
        }`}
      >
        {/* broadcast display mode toggle - collapsible */}
        <div
          className={`border-primary-border bg-primary-bg rounded-2xl border p-4 ${!showAddForm ? "mb-2" : ""}`}
        >
          {/* Collapsible Header */}
          <button
            onClick={() => setIsBroadcastExpanded(!isBroadcastExpanded)}
            className="hover:bg-secondary-bg -my-2 flex w-full cursor-pointer items-center justify-between rounded-lg p-2 transition-colors"
          >
            <h4 className="text-text-primary text-base font-bold">
              Broadcast Display Mode
            </h4>
            {isBroadcastExpanded ? (
              <ChevronUp className="text-text-secondary h-5 w-5" />
            ) : (
              <ChevronDown className="text-text-secondary h-5 w-5" />
            )}
          </button>

          {/* Collapsible Content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isBroadcastExpanded
                ? "mt-4 max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="text-muted-foreground mb-3 text-xs">
              Choose how to display messages from blocked participants in
              broadcasts
            </div>
            <div className="space-y-2">
              <button
                onClick={() =>
                  blocklistStore.setBroadcastBlockedDisplayMode("placeholder")
                }
                className={clsx(
                  "flex w-full cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all",
                  blocklistStore.broadcastBlockedDisplayMode === "placeholder"
                    ? "bg-kas-secondary/10 border-kas-secondary"
                    : "bg-primary-bg border-primary-border hover:bg-primary-bg/50"
                )}
              >
                <div className="text-left">
                  <div className="text-sm font-semibold">Show Placeholder</div>
                  <div className="text-muted-foreground text-xs">
                    Display "{BLOCKED_PLACEHOLDER}"
                  </div>
                </div>
              </button>
              <button
                onClick={() =>
                  blocklistStore.setBroadcastBlockedDisplayMode("hide")
                }
                className={clsx(
                  "flex w-full cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all",
                  blocklistStore.broadcastBlockedDisplayMode === "hide"
                    ? "bg-kas-secondary/10 border-kas-secondary"
                    : "bg-primary-bg border-primary-border hover:bg-primary-bg/50"
                )}
              >
                <div className="text-left">
                  <div className="text-sm font-semibold">Hide Completely</div>
                  <div className="text-muted-foreground text-xs">
                    Don't show messages from blocked participants
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* blocked addresses list */}
        <div className="border-primary-border bg-primary-bg rounded-2xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">
              Blocked Addresses ({blocklistStore.blockedAddressList.length})
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-primary hover:bg-secondary-bg rounded-lg p-2 transition-colors"
              aria-label="Add blocked address"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {blocklistStore.blockedAddressList.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center text-sm">
              No blocked addresses
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {blocklistStore.blockedAddressList.map((blocked) => (
                <div
                  key={blocked.id}
                  className="bg-primary-bg/50 border-primary-border flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="text-xs break-all text-[var(--text-primary)]">
                      {blocked.kaspaAddress}
                    </div>
                    {blocked.reason && (
                      <div className="text-muted-foreground mt-1 text-xs">
                        {blocked.reason}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await blocklistStore.unblockAddress(
                          blocked.kaspaAddress
                        );
                        toast.success("Address unblocked");
                      } catch (error) {
                        console.error("Error unblocking address:", error);
                        toast.error("Failed to unblock address");
                      }
                    }}
                    className="text-muted-foreground ml-2 p-1 transition-colors hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Form - slides in to take over the whole component */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showAddForm
            ? "-mt-4 max-h-screen opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="border-primary-border bg-primary-bg rounded-2xl border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold">Add Blocked Address</h4>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-primary p-1 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label
                htmlFor="block-address"
                className="mb-2 block text-sm font-medium"
              >
                Kaspa Address
              </label>
              <input
                type="text"
                id="block-address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="border-primary-border bg-primary-bg text-primary focus:ring-kas-secondary/80 w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
                placeholder="kaspa:..."
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="block-reason"
                className="mb-2 block text-sm font-medium"
              >
                Reason (Optional)
              </label>
              <input
                type="text"
                id="block-reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="border-primary-border bg-primary-bg text-primary focus:ring-kas-secondary/80 w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
                placeholder="Why are you blocking this address?"
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                disabled={isSubmitting}
                className="sm:flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !newAddress.trim()}
                className="sm:flex-1"
              >
                {isSubmitting ? "Blocking..." : "Block Address"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

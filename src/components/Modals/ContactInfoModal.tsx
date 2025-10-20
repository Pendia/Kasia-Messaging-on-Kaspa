import { FC, useState } from "react";
import { OneOnOneConversation } from "../../types/all";
import { AvatarHash } from "../icons/AvatarHash";
import { Tooltip } from "../Common/Tooltip";
import clsx from "clsx";
import { useMessagingStore } from "../../store/messaging.store";
import { Pencil, X, Check } from "lucide-react";

type ContactInfoModalProps = {
  oooc: OneOnOneConversation;
  onClose: () => void;
};

export const ContactInfoModal: FC<ContactInfoModalProps> = ({ oooc }) => {
  const [editingAlias, setEditingAlias] = useState<"my" | "their" | null>(null);
  const [myAliasValue, setMyAliasValue] = useState(oooc.conversation.myAlias);
  const [theirAliasValue, setTheirAliasValue] = useState(
    oooc.conversation.theirAlias ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const updateConversationAliases = useMessagingStore(
    (state) => state.updateConversationAliases
  );

  const handleSaveAlias = async (type: "my" | "their") => {
    setError(null);
    setIsSaving(true);

    try {
      const aliasToSave = type === "my" ? myAliasValue : theirAliasValue;

      // validate alias format (hex string, specific length)
      if (!/^[0-9a-fA-F]+$/.test(aliasToSave)) {
        setError("Alias must be a hexadecimal string");
        setIsSaving(false);
        return;
      }

      if (aliasToSave.length !== oooc.conversation.myAlias.length) {
        setError(
          `Alias must be ${oooc.conversation.myAlias.length} characters`
        );
        setIsSaving(false);
        return;
      }

      await updateConversationAliases(
        oooc.conversation.id,
        type === "my" ? myAliasValue : undefined,
        type === "their" ? theirAliasValue : undefined
      );

      setEditingAlias(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alias");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (type: "my" | "their") => {
    if (type === "my") {
      setMyAliasValue(oooc.conversation.myAlias);
    } else {
      setTheirAliasValue(oooc.conversation.theirAlias ?? "");
    }
    setError(null);
    setEditingAlias(null);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <AvatarHash
              address={oooc.contact.kaspaAddress}
              size={40}
              className={clsx({
                "opacity-60": !!oooc.contact.name?.trim()?.[0],
              })}
              selected={true}
            />
            {oooc.contact.name?.trim()?.slice(0, 2)?.toUpperCase() && (
              <span
                className={clsx(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "pointer-events-none select-none",
                  "flex h-10 w-10 items-center justify-center",
                  "rounded-full text-sm leading-none font-bold tracking-wide text-[var(--text-primary)]/80"
                )}
              >
                {oooc.contact.name.trim().slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold break-all text-[var(--text-primary)]">
              {oooc.contact.name || "No nickname"}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Contact</div>
          </div>
        </div>
        {/* Indented content below avatar/nickname/contact */}
        <div className="space-y-2 pl-2">
          {" "}
          {/* pl-14 aligns with avatar+gap */}
          <div>
            <div className="text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
              Address
            </div>
            <div className="text-sm break-all text-[var(--text-primary)]">
              {oooc.contact.kaspaAddress}
            </div>
          </div>
          {oooc.contact.name && (
            <div>
              <div className="text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
                Nickname
              </div>
              <div className="text-sm break-all text-[var(--text-primary)]">
                {oooc.contact.name}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
              Messages
            </div>
            <div className="text-sm text-[var(--text-primary)]">
              {oooc.events.length || 0} messages
            </div>
          </div>
          <div>
            <div className="text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
              Last Activity
            </div>
            <div className="text-sm text-[var(--text-primary)]">
              {oooc.conversation.lastActivityAt.toLocaleString()}
            </div>
          </div>
          <div className="mt-4">
            <Tooltip trigger="MY ALIAS" position="top start">
              This is sent from you to the contact. They use this to identify
              messages from you.
            </Tooltip>
            {editingAlias === "my" ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={myAliasValue}
                  onChange={(e) => setMyAliasValue(e.target.value)}
                  className="flex-1 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1 font-mono text-sm text-[var(--text-primary)]"
                  placeholder="Enter alias"
                  disabled={isSaving}
                />
                <button
                  onClick={() => handleSaveAlias("my")}
                  disabled={isSaving}
                  className="rounded bg-[var(--success)] p-1 text-[var(--primary-bg)] hover:opacity-80 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleCancelEdit("my")}
                  disabled={isSaving}
                  className="rounded bg-[var(--accent-red)] p-1 text-[var(--primary-bg)] hover:opacity-80 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm break-all text-[var(--text-primary)]">
                  {oooc.conversation.myAlias}
                </div>
                <button
                  onClick={() => setEditingAlias("my")}
                  className="relative cursor-pointer rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  disabled={isSaving}
                >
                  <Pencil className="size-3" />
                  <span className="absolute inset-0 p-3 pointer-fine:hidden" />
                </button>
              </div>
            )}
          </div>
          <div>
            <Tooltip trigger="THEIR ALIAS" position="top start">
              Your contacts sent alias. Kasia uses this to 'scan' for messages
              for you.
            </Tooltip>

            {editingAlias === "their" ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={theirAliasValue}
                  onChange={(e) => setTheirAliasValue(e.target.value)}
                  className="flex-1 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1 font-mono text-sm text-[var(--text-primary)]"
                  placeholder="Enter their alias"
                  disabled={isSaving}
                />
                <button
                  onClick={() => handleSaveAlias("their")}
                  disabled={isSaving}
                  className="rounded bg-[var(--success)] p-1 text-[var(--primary-bg)] hover:opacity-80 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleCancelEdit("their")}
                  disabled={isSaving}
                  className="rounded bg-[var(--accent-red)] p-1 text-[var(--primary-bg)] hover:opacity-80 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm break-all text-[var(--text-primary)]">
                  {oooc.conversation.theirAlias ?? "N/A"}
                </div>
                {oooc.conversation.theirAlias && (
                  <button
                    onClick={() => setEditingAlias("their")}
                    className="relative cursor-pointer rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                    disabled={isSaving}
                  >
                    <Pencil className="size-3" />
                    <span className="absolute inset-0 p-3" />
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Error display */}
          {error && (
            <div className="mt-4 rounded border border-[var(--accent-red)] bg-[var(--secondary-bg)] p-3 text-sm text-[var(--accent-red)]">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { IconInbox } from "@tabler/icons-react";

/**
 * EmptyState — shown when a list has no items.
 * Props: message, icon
 */
export default function EmptyState({ message = "No items found.", icon: Icon = IconInbox }) {
  return (
    <div className="empty-state">
      <Icon size={28} strokeWidth={1.4} />
      <span>{message}</span>
    </div>
  );
}

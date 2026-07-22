import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  children,
  size = "sm",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="th-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-box ${size === "lg" ? "lg" : ""}`}>{children}</div>
    </div>
  );
}

export function ModalHeader({
  icon,
  title,
  subtitle,
  onClose,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-header">
      <span className="modal-close" onClick={onClose}>
        <i className="fas fa-times" />
      </span>
      <i className={`fas ${icon} head-ic`} />
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

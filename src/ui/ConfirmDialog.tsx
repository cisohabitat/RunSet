import { useEffect, useRef } from "react";
export function ConfirmDialog({
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
}: {
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    safe = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    safe.current?.focus();
    return () => {
      ref.current?.close();
      if (previous?.isConnected && previous.getClientRects().length)
        previous.focus();
      else {
        const summary = previous
          ?.closest("details")
          ?.querySelector<HTMLElement>("summary");
        (
          summary ?? document.querySelector<HTMLButtonElement>(".brand")
        )?.focus();
      }
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="dialog-title">{title}</h2>
      <div className="dialog-copy">{children}</div>
      <div className="dialog-actions">
        <button
          ref={safe}
          className="secondary"
          onClick={onCancel}
          disabled={busy}
        >
          {cancelLabel}
        </button>
        <button className="primary danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

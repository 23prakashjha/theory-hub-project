import React, { useEffect, useRef } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Button } from "./primitives";
import { cx } from "../../lib/cx";

/**
 * Accessible replacement for window.confirm.
 * Locks background scroll, closes on Escape or backdrop click, and
 * keeps focus on the dialog while it is open.
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-950/80 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="glass w-full max-w-md animate-pop rounded-2xl p-6 shadow-lift outline-none"
      >
        <div
          className={cx(
            "mb-4 inline-flex size-11 items-center justify-center rounded-xl",
            tone === "danger"
              ? "bg-rose-500/14 text-rose-300 ring-1 ring-rose-400/25"
              : "bg-brand-500/14 text-brand-300 ring-1 ring-brand-400/25",
          )}
        >
          <FaExclamationTriangle />
        </div>

        <h2
          id="confirm-title"
          className="text-lg font-bold text-white"
        >
          {title}
        </h2>
        <p id="confirm-message" className="mt-2 text-sm leading-relaxed text-slate-400">
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="soft"
            onClick={onCancel}
            disabled={busy}
            className="sm:min-w-28"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={busy}
            className="sm:min-w-32"
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

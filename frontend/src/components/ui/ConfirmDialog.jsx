import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

/* Promise-based replacement for window.confirm(), styled to the
   KnowGap theme with an animated backdrop + scale-in panel.
   Usage: const ok = await confirmDialog("Delete this role?"); */
let resolver = null;
let setState = null;

export function confirmDialog(message, opts = {}) {
  return new Promise((resolve) => {
    resolver = resolve;
    if (setState) {
      setState({
        open: true,
        message,
        confirmLabel: opts.confirmLabel || "Confirm",
        cancelLabel: opts.cancelLabel || "Cancel",
        danger: opts.danger !== false,
      });
    } else {
      resolve(window.confirm(message));
    }
  });
}

export default function ConfirmDialogHost() {
  const [state, setLocalState] = useState({ open: false, message: "" });

  useEffect(() => {
    setState = setLocalState;
    return () => {
      setState = null;
    };
  }, []);

  const close = (result) => {
    setLocalState((s) => ({ ...s, open: false }));
    if (resolver) {
      resolver(result);
      resolver = null;
    }
  };

  if (!state.open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ animation: "kg-confirm-backdrop .2s ease both" }}
    >
      <div
        className="absolute inset-0 bg-text/40 backdrop-blur-sm"
        onClick={() => close(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-2xl"
        style={{ animation: "kg-confirm-pop .32s cubic-bezier(.22,1.4,.36,1) both" }}
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{
            background: state.danger
              ? "color-mix(in srgb, var(--color-rust) 16%, transparent)"
              : "var(--color-primary-tint)",
            color: state.danger ? "var(--color-rust)" : "var(--color-primary)",
          }}
        >
          <FiAlertTriangle className="h-5 w-5" />
        </span>
        <p className="mt-4 text-sm font-medium leading-relaxed text-text">
          {state.message}
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => close(false)}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-sub transition-colors hover:bg-bg"
          >
            {state.cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform"
            style={{
              background: state.danger ? "var(--color-rust)" : "var(--color-primary)",
            }}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes kg-confirm-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kg-confirm-pop {
          from { opacity: 0; transform: scale(.92) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

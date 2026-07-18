import { useEffect, useState, useCallback, useRef } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

/* ------------------------------------------------------------------
   Tiny pub/sub so any page can call `toast.success("...")` etc.
   without needing a provider/hook wired through every component.
   Mount <ToastContainer /> once (done in App.jsx) and every page's
   old alert("...") calls become toast.success("...") /
   toast.error("...") / toast.info("...") / toast.warning("...").
------------------------------------------------------------------- */
let listeners = [];
let idSeed = 0;

function emit(toast) {
  listeners.forEach((l) => l(toast));
}

function push(type, message, opts = {}) {
  const id = ++idSeed;
  emit({ id, type, message, duration: opts.duration ?? 4200 });
  return id;
}

export const toast = {
  success: (message, opts) => push("success", message, opts),
  error: (message, opts) => push("error", message, opts),
  info: (message, opts) => push("info", message, opts),
  warning: (message, opts) => push("warning", message, opts),
};

const ICONS = {
  success: FiCheckCircle,
  error: FiXCircle,
  info: FiInfo,
  warning: FiAlertTriangle,
};

const ACCENT = {
  success: "var(--color-primary)",
  error: "var(--color-rust)",
  info: "var(--color-primary)",
  warning: "var(--color-gold)",
};

function ToastItem({ item, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(item.id), 260);
  }, [item.id, onDismiss]);

  useEffect(() => {
    timerRef.current = setTimeout(close, item.duration);
    return () => clearTimeout(timerRef.current);
  }, [close, item.duration]);

  const Icon = ICONS[item.type] || FiInfo;
  const accent = ACCENT[item.type] || "var(--color-primary)";

  return (
    <div
      role="status"
      onMouseEnter={() => clearTimeout(timerRef.current)}
      onMouseLeave={() => {
        timerRef.current = setTimeout(close, 1200);
      }}
      style={{
        borderLeft: `3px solid ${accent}`,
        boxShadow: "var(--kg-cardshadow, var(--shadow-card))",
        animation: leaving
          ? "kg-toast-out .26s cubic-bezier(.4,0,1,1) both"
          : "kg-toast-in .38s cubic-bezier(.22,1.2,.36,1) both",
      }}
      className="pointer-events-auto relative flex w-[336px] max-w-[90vw] items-start gap-3 overflow-hidden rounded-xl border border-line bg-panel p-4 pr-9"
    >
      <span
        className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full"
        style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="pt-1 text-[13px] font-medium leading-snug text-text">{item.message}</p>
      <button
        aria-label="Dismiss"
        onClick={close}
        className="absolute right-2 top-2 rounded-md p-1 text-mute transition-colors hover:bg-primary-tint hover:text-primary"
      >
        <FiX className="h-3.5 w-3.5" />
      </button>
      <span
        className="absolute bottom-0 left-0 h-[3px] rounded-full"
        style={{
          background: accent,
          opacity: 0.55,
          animation: `kg-toast-progress ${item.duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

export default function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const listener = (t) => setItems((cur) => [...cur, t]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id) => {
    setItems((cur) => cur.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2.5 sm:right-6 sm:top-6">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={dismiss} />
      ))}
      <style>{`
        @keyframes kg-toast-in {
          from { opacity: 0; transform: translateX(24px) scale(.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes kg-toast-out {
          from { opacity: 1; transform: translateX(0) scale(1); max-height: 200px; margin-bottom: 0; }
          to   { opacity: 0; transform: translateX(24px) scale(.96); }
        }
        @keyframes kg-toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

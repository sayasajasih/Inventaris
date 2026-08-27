"use client";

import { useCallback, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4000);
    },
    []
  );

  return { toasts, showToast };
}

export function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col gap-3 pointer-events-none print:hidden">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-slate-900 text-white animate-fade-in-up pointer-events-auto border ${
            toast.type === "error" ? "border-rose-500/50" : "border-slate-700"
          }`}
        >
          {toast.type === "success" ? (
            <i className="ph-fill ph-check-circle text-emerald-400 text-xl" />
          ) : (
            <i className="ph-fill ph-warning-circle text-rose-400 text-xl" />
          )}
          <span className="text-sm font-medium tracking-wide">
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}

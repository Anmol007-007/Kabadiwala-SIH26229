"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle, X } from "lucide-react";

export default function ToastBanner() {
  const { notification, dismissNotification } = useApp();

  if (!notification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-ink-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-ink-700 flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
        <CheckCircle className="w-4 h-4 text-leaf-500 shrink-0" />
        <span>{notification}</span>
      </div>
      <button
        onClick={dismissNotification}
        className="text-ink-400 hover:text-white p-1 rounded-lg hover:bg-ink-800 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

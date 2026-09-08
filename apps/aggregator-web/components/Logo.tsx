"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export default function Logo({ size = "md", showSubtitle = true }: LogoProps) {
  const dimensions = {
    sm: { icon: "w-7 h-7", title: "text-sm", sub: "text-[10px]" },
    md: { icon: "w-9 h-9", title: "text-base", sub: "text-[11px]" },
    lg: { icon: "w-12 h-12", title: "text-xl", sub: "text-xs" },
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${dimensions.icon} flex items-center justify-center flex-shrink-0 group`}>
        <div className="relative w-full h-full rounded-xl bg-gradient-to-b from-leaf-50 to-leaf-100 border border-leaf-600/30 p-1 flex items-center justify-center shadow-sm overflow-hidden">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            <defs>
              <linearGradient id="metalLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#16805c" />
                <stop offset="100%" stopColor="#0b3d2c" />
              </linearGradient>
              <linearGradient id="metalGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b8790a" />
                <stop offset="100%" stopColor="#8a5a06" />
              </linearGradient>
            </defs>

            <circle cx="24" cy="24" r="19" stroke="url(#metalLeaf)" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.85" />
            
            <path
              d="M24 8 L37 15.5 V30.5 L24 38 L11 30.5 V15.5 Z"
              stroke="#16805c"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="rgba(22, 128, 92, 0.12)"
            />

            <path
              d="M24 15 L31 24 L24 33 L17 24 Z"
              fill="url(#metalGold)"
              fillOpacity="0.9"
            />
            
            <circle cx="24" cy="24" r="3.5" fill="#16805c" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold text-ink-900 tracking-tight ${dimensions.title}`}>
            Kabadiwala Connect
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider font-semibold px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100">
            <span className="w-1.5 h-1.5 rounded-full bg-leaf-600 animate-pulse" />
            DPI LIVE
          </span>
        </div>
        {showSubtitle && (
          <p className={`${dimensions.sub} text-ink-500 font-medium tracking-wide flex items-center gap-1.5`}>
            <span>Ministry of Mines / JNARDDC</span>
            <span className="text-ink-300">•</span>
            <span className="text-leaf-700 font-semibold">Urban Mining DPI</span>
          </p>
        )}
      </div>
    </div>
  );
}

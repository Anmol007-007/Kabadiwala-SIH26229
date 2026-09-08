"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Store,
  Factory,
  Scale,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  QrCode,
  FileCheck,
  Sparkles,
  Camera,
} from "lucide-react";
import { ROLES } from "@/components/Navbar";

export default function LandingPage() {
  const steps = [
    {
      num: "01",
      title: "Photograph the lot",
      desc: "The app proposes a material and grade. The collector confirms or corrects it. Weight goes in on a big numeric pad — no keyboard, ever.",
      actor: "Ramesh (Collector)",
      icon: Camera,
    },
    {
      num: "02",
      title: "See who is buying",
      desc: "Authorised recyclers and registered aggregators nearby, ranked by what actually reaches his hand after cartage — not by headline rate.",
      actor: "Live Rates & Matching",
      icon: TrendingUp,
    },
    {
      num: "03",
      title: "Hand over on a QR",
      desc: "Weigh together. Both sides confirm on one code. GPS, timestamp and two signatures — with no network.",
      actor: "Wadi Aggregators",
      icon: QrCode,
    },
    {
      num: "04",
      title: "Keep the receipt",
      desc: "A verifiable record for him, and a traceable line in the buyer's EPR return for the quarter.",
      actor: "Vidarbha Metal Recovery",
      icon: FileCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-ink-900 font-sans">
      <section className="relative pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-8 border-b border-ink-100 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-600 animate-pulse" />
              <span>Clean & Green Technology &bull; Ministry of Mines / JNARDDC Oversight</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 tracking-tight leading-[1.15]">
              The kabadiwala already collects India&rsquo;s e-waste.{" "}
              <span className="text-leaf-600">
                He just can&rsquo;t see a fair, legal place to sell it.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-ink-600 max-w-2xl font-normal leading-relaxed">
              So we built him one — on a phone, in his language, that works without signal. Four screens take him from a
              pile of scrap to a signed receipt inside the formal recycling chain.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/collector"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition active:scale-[.98] text-sm sm:text-base px-5 py-3.5 bg-leaf-600 text-white shadow-lg shadow-leaf-600/25 hover:bg-leaf-700"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open the demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition active:scale-[.98] text-sm sm:text-base px-5 py-3.5 bg-white text-ink-700 ring-1 ring-ink-100 hover:bg-ink-50"
              >
                See how it works
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-ink-100">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-ink-900">~95%</p>
                <p className="text-xs text-ink-500 mt-1 font-medium">of India&rsquo;s e-waste collected informally</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-clay-700">0</p>
                <p className="text-xs text-ink-500 mt-1 font-medium">of those collectors on the EPR portal</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-leaf-600">4</p>
                <p className="text-xs text-ink-500 mt-1 font-medium">roles, one linked transaction</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-ink-50 border border-ink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-leaf-600 animate-pulse" />
                <span className="font-mono text-xs font-bold text-ink-700 uppercase tracking-wider">
                  One Transaction &bull; Four Parties
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white border border-ink-100 text-ink-600 px-2 py-0.5 rounded-lg shadow-2xs">
                LOT-NGP-84741
              </span>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/collector"
                className="p-3.5 rounded-2xl bg-white border border-ink-100 hover:border-leaf-600 flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-leaf-50 text-leaf-700">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-ink-900 group-hover:text-leaf-700">Ramesh &bull; Kabadiwala</h4>
                    <p className="text-[11px] text-ink-500">8 kg mobile boards, photographed at the door</p>
                  </div>
                </div>
                <span className="font-extrabold text-xs text-leaf-700 font-mono">₹5,407</span>
              </Link>

              <Link
                href="/aggregator"
                className="p-3.5 rounded-2xl bg-white border border-ink-100 hover:border-leaf-600 flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-ink-50 text-ink-700">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-ink-900 group-hover:text-leaf-700">Wadi Aggregators (Shop)</h4>
                    <p className="text-[11px] text-ink-500">Combines 3 small lots into one 28 kg load</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-ink-700 font-mono">28 kg</span>
              </Link>

              <Link
                href="/smelter"
                className="p-3.5 rounded-2xl bg-white border border-ink-100 hover:border-leaf-600 flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-leaf-50 text-leaf-700">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-ink-900 group-hover:text-leaf-700">Vidarbha Metal Recovery</h4>
                    <p className="text-[11px] text-ink-500">Authorised &bull; CPCB MH/EPR/R/2024/00318</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-leaf-700 font-mono">EPR &check;</span>
              </Link>

              <Link
                href="/admin/dashboard"
                className="p-3.5 rounded-2xl bg-white border border-ink-100 hover:border-leaf-600 flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-ink-50 text-ink-700">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-ink-900 group-hover:text-leaf-700">JNARDDC / CPCB Oversight</h4>
                    <p className="text-[11px] text-ink-500">Every kilo traced from door to furnace</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-ink-900 font-mono">100%</span>
              </Link>
            </div>

            <p className="text-[11px] text-ink-500 text-center pt-1 font-medium">
              The same lot, seen from four different logins. Nothing is re-keyed between them.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-ink-900 text-white rounded-3xl p-8 sm:p-12 space-y-10 shadow-xl">
          <div className="space-y-4 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-ink-700 text-leaf-100">
              Not a technology problem. An information problem.
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              India already has EPR regulations, registered recyclers, facilities and a CPCB portal. What is missing is
              the connection between the man with the material and the plant that can process it safely. Four flows are
              broken at once:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-ink-800/80 border border-ink-700/60 rounded-2xl p-5 space-y-2.5 hover:border-leaf-500/50 transition-all">
              <span className="text-xs font-bold text-leaf-500 font-mono">01</span>
              <h3 className="font-bold text-base text-white">Material flow</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Where does the e-waste physically go? Currently lost into informal burning. Traced lot by lot, photograph to facility gate.
              </p>
            </div>

            <div className="bg-ink-800/80 border border-ink-700/60 rounded-2xl p-5 space-y-2.5 hover:border-leaf-500/50 transition-all">
              <span className="text-xs font-bold text-leaf-500 font-mono">02</span>
              <h3 className="font-bold text-base text-white">Money flow</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Who pays whom, and how much? A published rate from a named buyer, not a middleman whisper.
              </p>
            </div>

            <div className="bg-ink-800/80 border border-ink-700/60 rounded-2xl p-5 space-y-2.5 hover:border-leaf-500/50 transition-all">
              <span className="text-xs font-bold text-leaf-500 font-mono">03</span>
              <h3 className="font-bold text-base text-white">Information flow</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Who knows today&rsquo;s price and who is authorised? Everyone, in Marathi, Hindi, Telugu, and English, out loud.
              </p>
            </div>

            <div className="bg-ink-800/80 border border-ink-700/60 rounded-2xl p-5 space-y-2.5 hover:border-leaf-500/50 transition-all">
              <span className="text-xs font-bold text-leaf-500 font-mono">04</span>
              <h3 className="font-bold text-base text-white">Documentation flow</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Who records the weight, handover and payment? Both phones, signed, offline, into the official EPR record.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-b border-ink-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
              Four steps, and none of them need signal.
            </h2>
            <p className="text-sm sm:text-base text-ink-600">
              The entire transaction completes offline on the ground via encrypted local QR sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-ink-100 rounded-3xl p-6 space-y-4 hover:border-leaf-600 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-extrabold text-leaf-600 group-hover:scale-105 transition-transform">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-xl bg-ink-50 text-ink-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-ink-900">{step.title}</h3>
                    <p className="text-xs text-ink-600 mt-2 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-ink-100 text-[11px] font-mono text-leaf-700 font-semibold">
                    &bull; {step.actor}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-leaf-50 border border-leaf-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-leaf-600 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-ink-900">No Internet at the scrap doorstep?</h4>
                <p className="text-xs text-ink-600 mt-0.5">
                  Transactions are cached in IndexedDB and automatically synchronized when either device reaches connectivity.
                </p>
              </div>
            </div>
            <Link
              href="/collector"
              className="inline-flex items-center justify-center font-semibold rounded-2xl text-xs px-3.5 py-2 bg-leaf-600 text-white shadow-sm hover:bg-leaf-700 transition active:scale-[.98] shrink-0"
            >
              Test offline flow
            </Link>
          </div>
        </div>
      </section>

      <section id="roles" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Four logins. One shared record.
          </h2>
          <p className="text-sm sm:text-base text-ink-600">
            Select any portal below to log in with simulated field data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isGreen = role.id === "collector" || role.id === "recycler";
            return (
              <div
                key={role.id}
                className="bg-white border border-ink-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-leaf-600 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-ink-50 border border-ink-100 flex items-center justify-center text-leaf-700 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 font-semibold ring-1 ring-leaf-100">
                      Active
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-ink-900">{role.roleTitle}</h3>
                  <p className="text-xs text-leaf-700 font-semibold mt-1">{role.name}</p>
                  <p className="text-xs text-ink-600 mt-2">{role.org}</p>
                  <p className="text-[11px] font-mono text-ink-400 mt-1">{role.reg}</p>
                </div>

                <Link
                  href={role.path}
                  className={`w-full py-2.5 px-3.5 inline-flex items-center justify-center gap-2 font-semibold text-xs rounded-2xl transition active:scale-[.98] ${
                    isGreen
                      ? "bg-leaf-600 hover:bg-leaf-700 text-white shadow-sm"
                      : "bg-ink-900 hover:bg-ink-800 text-white shadow-sm"
                  }`}
                >
                  <span>Open {role.roleTitle.split(" ")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="py-10 px-4 sm:px-8 border-t border-ink-100 text-center text-xs text-ink-500 space-y-2 bg-ink-50">
        <p className="font-semibold text-ink-700">
          Kabadiwala Connect &bull; Digital Public Infrastructure for Urban Mining & Secondary Critical Minerals
        </p>
        <p className="text-[11px]">
          Client Mandate: Ministry of Mines, Government of India &bull; Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC)
        </p>
        <p className="text-[10px] text-ink-400 font-mono">
          Prototype demonstration &bull; All field transactions simulated for verification & audit.
        </p>
      </footer>
    </div>
  );
}
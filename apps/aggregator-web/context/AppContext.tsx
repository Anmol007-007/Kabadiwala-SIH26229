"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface ScrapLot {
  id: string;
  collector: string;
  collectorId: string;
  location: string;
  material: string;
  category: "PCBs" | "Copper" | "Batteries" | "Motors" | "Aluminium";
  grade: string;
  weight_kg: number;
  ratePerKg: number;
  totalPayout: number;
  status: "PENDING_QUOTE" | "QUOTE_SENT" | "OFFER_ACCEPTED" | "HANDED_OVER" | "BUNDLED";
  timestamp: string;
  hash: string;
  buyerName?: string;
  buyerReg?: string;
  sampleImage?: string;
  notes?: string;
  audioTranscript?: string;
  gps?: string;
}

export interface FloorStockItem {
  id: string;
  lotId?: string;
  grade: string;
  category: string;
  weight_kg: number;
  value: number;
  status: "READY_TO_BUNDLE" | "BUNDLED";
}

export interface BulkLoad {
  loadId: string;
  material: string;
  weight: number;
  destination: string;
  status: "IN_TRANSIT" | "DELIVERED" | "RECONCILED";
  hash: string;
  dispatchedAt: string;
  lotIds: string[];
}

export interface EPRRecord {
  certId: string;
  batchHash: string;
  batchId: string;
  material: string;
  declaredWeight: number;
  receivedWeight: number;
  variance: number;
  carbonSavedMt: number;
  smelterName: string;
  cpcbReg: string;
  timestamp: string;
  status: "VERIFIED" | "DISPUTED";
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: "collector" | "aggregator" | "smelter" | "regulator";
  action: string;
  details: string;
  hash: string;
}

export interface RateItem {
  grade: string;
  category: "PCBs" | "Copper" | "Batteries" | "Motors" | "Aluminium";
  nameHi: string;
  nameEn: string;
  range: string;
  price: number;
  change: string;
  up: boolean;
  minKg: number;
  audioText: string;
}

interface SyncPayload {
  lots: ScrapLot[];
  floorStock: FloorStockItem[];
  loads: BulkLoad[];
  reconciliations: EPRRecord[];
  auditLogs: AuditLogItem[];
}

interface AppContextType {
  lots: ScrapLot[];
  floorStock: FloorStockItem[];
  loads: BulkLoad[];
  reconciliations: EPRRecord[];
  auditLogs: AuditLogItem[];
  rates: RateItem[];
  language: "hi" | "en" | "mr" | "te";
  setLanguage: (lang: "hi" | "en" | "mr" | "te") => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  refreshKey: number;
  addLot: (lot: Omit<ScrapLot, "id" | "timestamp" | "hash">) => ScrapLot;
  sendQuote: (lotId: string, customRate?: number) => void;
  acceptQuote: (lotId: string) => void;
  completeHandover: (lotId: string) => void;
  bundleFloorStock: (stockIds: string[], destination: string) => BulkLoad;
  reconcileLoad: (loadId: string, receivedWeight: number, smelterName?: string, cpcbReg?: string) => EPRRecord;
  resetAllData: () => void;
  refreshData: () => void;
  speak: (text: string) => void;
  notification: string | null;
  dismissNotification: () => void;
}

const SEED_RATES: RateItem[] = [
  {
    grade: "Grade A: Mobile Board",
    category: "PCBs",
    nameHi: "सर्किट बोर्ड (PCBs)",
    nameEn: "Circuit Boards (Mobile PCBs)",
    range: "₹690–₹768/kg",
    price: 720,
    change: "+3.2%",
    up: true,
    minKg: 2,
    audioText: "सर्किट बोर्ड का आज का भाव छह सौ नब्बे से सात सौ अड़सठ रुपये प्रति किलो है।",
  },
  {
    grade: "Grade A: Copper Extrusion",
    category: "Copper",
    nameHi: "तार और केबल (Copper Wire)",
    nameEn: "Wires & Cables (Copper)",
    range: "₹448–₹486/kg",
    price: 480,
    change: "-1.3%",
    up: false,
    minKg: 3,
    audioText: "तांबा तार और केबल का आज का भाव चार सौ अड़तालीस से चार सौ छियासी रुपये है।",
  },
  {
    grade: "Grade A: Li-ion Cells",
    category: "Batteries",
    nameHi: "बैटरी (Li-ion & Lead)",
    nameEn: "Batteries (Li-ion)",
    range: "₹380–₹420/kg",
    price: 410,
    change: "+2.0%",
    up: true,
    minKg: 2,
    audioText: "लिथियम आयन बैटरी का आज का भाव तीन सौ अस्सी से चार सौ बीस रुपये है।",
  },
  {
    grade: "Grade B: Motors & Magnets",
    category: "Motors",
    nameHi: "मोटर और मैग्नेट",
    nameEn: "Motors & Magnets",
    range: "₹255–₹312/kg",
    price: 280,
    change: "+1.0%",
    up: true,
    minKg: 5,
    audioText: "मोटर और मैग्नेट का आज का भाव दो सौ पचपन से तीन सौ बारह रुपये है।",
  },
  {
    grade: "Grade B: Aluminium Scrap",
    category: "Aluminium",
    nameHi: "एल्युमिनियम स्क्रैप",
    nameEn: "Aluminium Castings & Cans",
    range: "₹205–₹225/kg",
    price: 215,
    change: "+1.1%",
    up: true,
    minKg: 5,
    audioText: "एल्युमिनियम स्क्रैप का आज का भाव दो सौ पांच से दो सौ पच्चीस रुपये है।",
  },
];

const SEED_LOTS: ScrapLot[] = [
  {
    id: "LOT-NGP-84741",
    collector: "Ramesh Kumar (रमेश)",
    collectorId: "KC-NGP-4417",
    location: "Kalmna - Wadi Belt, Nagpur (1.2 km away)",
    material: "Circuit Boards (Grade A Mobile PCBs)",
    category: "PCBs",
    grade: "Grade A: Mobile Board",
    weight_kg: 8.0,
    ratePerKg: 720,
    totalPayout: 5760,
    status: "PENDING_QUOTE",
    timestamp: "12 mins ago",
    hash: "a4f89d30c21e56b4f7a10294e09849204918e77a28490a012984908129384910",
    buyerName: "Wadi Scrap Aggregators",
    buyerReg: "CPCB: MH/EPR/A/2024/00522",
    gps: "21.1458° N, 79.0882° E",
    sampleImage: "pcb",
    audioTranscript: "8 kilo circuit board Grade A",
  },
  {
    id: "LOT-NGP-84739",
    collector: "Sunita Bai (सुनीता)",
    collectorId: "KC-NGP-3891",
    location: "MIDC Hingna, Nagpur (2.4 km away)",
    material: "Mobile Boards & Keypads",
    category: "PCBs",
    grade: "Grade A: Mobile Board",
    weight_kg: 3.4,
    ratePerKg: 720,
    totalPayout: 2448,
    status: "QUOTE_SENT",
    timestamp: "35 mins ago",
    hash: "b5f90e41d32f67c5e8b21305f10950315029f88b39501b123095019230495021",
    buyerName: "Wadi Scrap Aggregators",
    buyerReg: "CPCB: MH/EPR/A/2024/00522",
    gps: "21.1214° N, 79.0145° E",
    sampleImage: "pcb",
    audioTranscript: "3.4 kilo mobile board",
  },
  {
    id: "LOT-NGP-84732",
    collector: "Imran Khan (इमरान)",
    collectorId: "KC-NGP-5120",
    location: "Sitabuldi Market, Nagpur (3.8 km away)",
    material: "Copper Extrusion & Cables",
    category: "Copper",
    grade: "Grade A: Copper Extrusion",
    weight_kg: 42.0,
    ratePerKg: 480,
    totalPayout: 20160,
    status: "PENDING_QUOTE",
    timestamp: "1 hour ago",
    hash: "c6e01f52e43a78d6f9c32416a21061426130a99c40612c234106120341506132",
    buyerName: "Wadi Scrap Aggregators",
    buyerReg: "CPCB: MH/EPR/A/2024/00522",
    gps: "21.1498° N, 79.0806° E",
    sampleImage: "copper",
    audioTranscript: "42 kilo copper wire",
  },
  {
    id: "LOT-NGP-84698",
    collector: "Dharmendra Jha (धर्मेंद्र)",
    collectorId: "KC-NGP-2098",
    location: "Wadi Industrial Belt, Nagpur",
    material: "Copper Cable & Extrusion",
    category: "Copper",
    grade: "Grade A: Copper Extrusion",
    weight_kg: 16.6,
    ratePerKg: 480,
    totalPayout: 7968,
    status: "HANDED_OVER",
    timestamp: "Yesterday",
    hash: "d7f12a63f54b89e7a0d43527b32172537241b00d51723d345217231452617243",
    buyerName: "Wadi Scrap Aggregators",
    buyerReg: "CPCB: MH/EPR/A/2024/00522",
    gps: "21.1340° N, 79.0520° E",
    sampleImage: "copper",
    audioTranscript: "16.6 kilo taamba wire",
  },
];

const SEED_FLOOR_STOCK: FloorStockItem[] = [
  { id: "STK-101", lotId: "LOT-NGP-84698", grade: "Circuit Boards (Grade A)", category: "PCBs", weight_kg: 18.4, value: 13248, status: "READY_TO_BUNDLE" },
  { id: "STK-102", grade: "Copper Extrusion Wire", category: "Copper", weight_kg: 22.5, value: 10800, status: "READY_TO_BUNDLE" },
  { id: "STK-103", grade: "Lithium-ion Battery Packs", category: "Batteries", weight_kg: 10.0, value: 4100, status: "READY_TO_BUNDLE" },
];

const SEED_LOADS: BulkLoad[] = [
  {
    loadId: "BULK-NGP-084",
    material: "Circuit Boards (Consolidated Mobile PCBs)",
    weight: 28.0,
    destination: "Vidarbha Metal Recovery Pvt Ltd (MIDC Butibori)",
    status: "IN_TRANSIT",
    hash: "c8f2b414d9b3a099a4c11b023fec9a796e6d78a9c2df3607ba9f1709403db812",
    dispatchedAt: "Today, 09:30 AM",
    lotIds: ["LOT-NGP-84720", "LOT-NGP-84725"],
  },
];

const SEED_RECONCILIATIONS: EPRRecord[] = [
  {
    certId: "EPR-CPCB-2026-00412",
    batchHash: "c8f2b414d9b3a099a4c11b023fec9a796e6d78a9c2df3607ba9f1709403db812",
    batchId: "BULK-NGP-084",
    material: "Circuit Boards (Consolidated Mobile PCBs)",
    declaredWeight: 28.0,
    receivedWeight: 27.8,
    variance: -0.2,
    carbonSavedMt: 0.07,
    smelterName: "Vidarbha Metal Recovery Pvt Ltd",
    cpcbReg: "CPCB: MH/EPR/R/2024/00318",
    timestamp: "Today, 11:45 AM",
    status: "VERIFIED",
  },
];

const SEED_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "AUD-991",
    timestamp: "Just now",
    actor: "JNARDDC / CPCB Engine",
    role: "regulator",
    action: "SYSTEM_INITIALIZED",
    details: "Nagpur Urban Mining District Grid online. SHA-256 verification active.",
    hash: "0x89f...2e1",
  },
  {
    id: "AUD-990",
    timestamp: "Today, 11:45 AM",
    actor: "Vidarbha Metal Recovery Pvt Ltd",
    role: "smelter",
    action: "EPR_CERT_MINTED",
    details: "Certified 27.8 kg received against 28.0 kg declared. Form-4 issued.",
    hash: "c8f2b414...3db812",
  },
  {
    id: "AUD-989",
    timestamp: "Today, 09:30 AM",
    actor: "Wadi Scrap Aggregators",
    role: "aggregator",
    action: "BULK_LOAD_DISPATCHED",
    details: "Consolidated Batch BULK-NGP-084 (28.0 kg) dispatched to MIDC Butibori.",
    hash: "c8f2b414...3db812",
  },
  {
    id: "AUD-988",
    timestamp: "12 mins ago",
    actor: "Ramesh Kumar (Informal)",
    role: "collector",
    action: "SCRAP_LOT_LOGGED",
    details: "Created lot LOT-NGP-84741 (8.0 kg Mobile PCBs). Awaiting quotes.",
    hash: "a4f89d30...84910",
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lots, setLots] = useState<ScrapLot[]>(SEED_LOTS);
  const [floorStock, setFloorStock] = useState<FloorStockItem[]>(SEED_FLOOR_STOCK);
  const [loads, setLoads] = useState<BulkLoad[]>(SEED_LOADS);
  const [reconciliations, setReconciliations] = useState<EPRRecord[]>(SEED_RECONCILIATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(SEED_AUDIT_LOGS);
  const [rates] = useState<RateItem[]>(SEED_RATES);
  const [language, setLanguage] = useState<"hi" | "en" | "mr" | "te">("hi");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  // BroadcastChannel ref for cross-tab real-time sync
  const channelRef = useRef<BroadcastChannel | null>(null);
  // Flag: true while we're applying a received broadcast (prevent re-broadcasting)
  const isSyncingRef = useRef(false);

  // ── Load from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const savedLots = localStorage.getItem("kc_lots");
      if (savedLots) setLots(JSON.parse(savedLots));

      const savedFloorStock = localStorage.getItem("kc_floor_stock");
      if (savedFloorStock) setFloorStock(JSON.parse(savedFloorStock));

      const savedLoads = localStorage.getItem("kc_loads");
      if (savedLoads) setLoads(JSON.parse(savedLoads));

      const savedReconciliations = localStorage.getItem("kc_reconciliations");
      if (savedReconciliations) setReconciliations(JSON.parse(savedReconciliations));

      const savedAudit = localStorage.getItem("kc_audit_logs");
      if (savedAudit) setAuditLogs(JSON.parse(savedAudit));

      const savedLang = localStorage.getItem("kc_lang");
      if (savedLang) setLanguage(savedLang as "hi" | "en" | "mr" | "te");
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
  }, []);

  // ── Persist changes to localStorage ──────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem("kc_lots", JSON.stringify(lots));
      localStorage.setItem("kc_floor_stock", JSON.stringify(floorStock));
      localStorage.setItem("kc_loads", JSON.stringify(loads));
      localStorage.setItem("kc_reconciliations", JSON.stringify(reconciliations));
      localStorage.setItem("kc_audit_logs", JSON.stringify(auditLogs));
      localStorage.setItem("kc_lang", language);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [lots, floorStock, loads, reconciliations, auditLogs, language]);

  // ── BroadcastChannel: cross-tab real-time sync ────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("kc_realtime_v2");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data?.type !== "STATE_SYNC") return;
      const payload: SyncPayload = event.data.payload;

      // Prevent this tab from re-broadcasting what it just received
      isSyncingRef.current = true;

      if (payload.lots !== undefined) setLots(payload.lots);
      if (payload.floorStock !== undefined) setFloorStock(payload.floorStock);
      if (payload.loads !== undefined) setLoads(payload.loads);
      if (payload.reconciliations !== undefined) setReconciliations(payload.reconciliations);
      if (payload.auditLogs !== undefined) setAuditLogs(payload.auditLogs);

      // Save to localStorage immediately (without waiting for useEffect)
      try {
        if (payload.lots) localStorage.setItem("kc_lots", JSON.stringify(payload.lots));
        if (payload.floorStock) localStorage.setItem("kc_floor_stock", JSON.stringify(payload.floorStock));
        if (payload.loads) localStorage.setItem("kc_loads", JSON.stringify(payload.loads));
        if (payload.reconciliations) localStorage.setItem("kc_reconciliations", JSON.stringify(payload.reconciliations));
        if (payload.auditLogs) localStorage.setItem("kc_audit_logs", JSON.stringify(payload.auditLogs));
      } catch (e) { /* silent */ }

      // Release the sync flag after React processes the batch
      setTimeout(() => { isSyncingRef.current = false; }, 80);
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  // ── Broadcast helper — sends new state to all other open tabs ─────────────
  const broadcast = (newState: Partial<SyncPayload>) => {
    if (isSyncingRef.current || !channelRef.current) return;
    channelRef.current.postMessage({
      type: "STATE_SYNC",
      payload: {
        lots: newState.lots ?? lots,
        floorStock: newState.floorStock ?? floorStock,
        loads: newState.loads ?? loads,
        reconciliations: newState.reconciliations ?? reconciliations,
        auditLogs: newState.auditLogs ?? auditLogs,
      } satisfies SyncPayload,
    });
  };

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // ── Text-to-Speech ────────────────────────────────────────────────────────
  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ── addLot ────────────────────────────────────────────────────────────────
  const addLot = (data: Omit<ScrapLot, "id" | "timestamp" | "hash">): ScrapLot => {
    const randomId = "LOT-NGP-" + Math.floor(10000 + Math.random() * 90000);
    const fakeHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    const newLot: ScrapLot = {
      ...data,
      id: randomId,
      timestamp: "Just now",
      hash: fakeHash,
      buyerName: data.buyerName || "Wadi Scrap Aggregators",
      buyerReg: data.buyerReg || "CPCB: MH/EPR/A/2024/00522",
    };

    const logEntry: AuditLogItem = {
      id: "AUD-" + Date.now().toString().slice(-4),
      timestamp: "Just now",
      actor: newLot.collector,
      role: "collector",
      action: "SCRAP_LOT_CREATED",
      details: `New scrap lot ${newLot.id} created: ${newLot.weight_kg} kg ${newLot.material}. Forwarded to Aggregators.`,
      hash: newLot.hash.slice(0, 16) + "...",
    };

    const updatedLots = [newLot, ...lots];
    const updatedAuditLogs = [logEntry, ...auditLogs];

    setLots(updatedLots);
    setAuditLogs(updatedAuditLogs);

    // ← Broadcast to all other open tabs (aggregator, admin, etc.)
    broadcast({ lots: updatedLots, auditLogs: updatedAuditLogs });

    showToast(`✅ नया लॉट ${newLot.id} दर्ज हुआ! एग्रीगेटर इनबाउंड में रियल-टाइम दिखाई देगा।`);
    return newLot;
  };

  // ── sendQuote ─────────────────────────────────────────────────────────────
  const sendQuote = (lotId: string, customRate?: number) => {
    const updatedLots = lots.map((lot) => {
      if (lot.id !== lotId) return lot;
      const updatedRate = customRate || lot.ratePerKg;
      return { ...lot, ratePerKg: updatedRate, totalPayout: Math.round(lot.weight_kg * updatedRate), status: "QUOTE_SENT" as const };
    });

    const logEntry: AuditLogItem = {
      id: "AUD-" + Date.now().toString().slice(-4),
      timestamp: "Just now",
      actor: "Wadi Scrap Aggregators",
      role: "aggregator",
      action: "OFFER_QUOTE_SENT",
      details: `Dispatched formal offer for lot ${lotId} with verified benchmark pricing.`,
      hash: "0x" + Math.random().toString(16).slice(2, 10),
    };
    const updatedAuditLogs = [logEntry, ...auditLogs];

    setLots(updatedLots);
    setAuditLogs(updatedAuditLogs);
    broadcast({ lots: updatedLots, auditLogs: updatedAuditLogs });
    showToast(`✅ लॉट ${lotId} के लिए ऑफर भेज दिया गया! कबाड़ी को कोटेशन मिल चुका है।`);
  };

  // ── acceptQuote ───────────────────────────────────────────────────────────
  const acceptQuote = (lotId: string) => {
    const updatedLots = lots.map((lot) =>
      lot.id === lotId ? { ...lot, status: "OFFER_ACCEPTED" as const } : lot
    );

    const logEntry: AuditLogItem = {
      id: "AUD-" + Date.now().toString().slice(-4),
      timestamp: "Just now",
      actor: "Ramesh Kumar (Collector)",
      role: "collector",
      action: "OFFER_ACCEPTED",
      details: `Collector accepted aggregator's offer for lot ${lotId}. Ready for physical handover.`,
      hash: "0x" + Math.random().toString(16).slice(2, 10),
    };
    const updatedAuditLogs = [logEntry, ...auditLogs];

    setLots(updatedLots);
    setAuditLogs(updatedAuditLogs);
    broadcast({ lots: updatedLots, auditLogs: updatedAuditLogs });
    showToast(`🤝 ऑफर स्वीकार किया गया! हैंडओवर QR कोड तैयार है।`);
  };

  // ── completeHandover ──────────────────────────────────────────────────────
  const completeHandover = (lotId: string) => {
    let completedLot: ScrapLot | undefined;
    const updatedLots = lots.map((lot) => {
      if (lot.id === lotId) {
        completedLot = { ...lot, status: "HANDED_OVER" as const };
        return completedLot;
      }
      return lot;
    });

    let updatedFloorStock = floorStock;
    let updatedAuditLogs = auditLogs;

    if (completedLot) {
      const newStock: FloorStockItem = {
        id: "STK-" + Math.floor(100 + Math.random() * 900),
        lotId: completedLot.id,
        grade: completedLot.material,
        category: completedLot.category,
        weight_kg: completedLot.weight_kg,
        value: completedLot.totalPayout,
        status: "READY_TO_BUNDLE",
      };
      updatedFloorStock = [newStock, ...floorStock];

      const logEntry: AuditLogItem = {
        id: "AUD-" + Date.now().toString().slice(-4),
        timestamp: "Just now",
        actor: "Wadi Scrap Aggregators & Collector",
        role: "aggregator",
        action: "HANDOVER_COMPLETED",
        details: `Dual QR handshake confirmed for ${completedLot.id}. ₹${completedLot.totalPayout} disbursed. Added to floor stock.`,
        hash: completedLot.hash.slice(0, 16) + "...",
      };
      updatedAuditLogs = [logEntry, ...auditLogs];
    }

    setLots(updatedLots);
    setFloorStock(updatedFloorStock);
    setAuditLogs(updatedAuditLogs);
    broadcast({ lots: updatedLots, floorStock: updatedFloorStock, auditLogs: updatedAuditLogs });
    showToast(`📦 हैंडओवर पूर्ण! भुगतान दर्ज हो चुका है और सामग्री एग्रीगेटर फ्लोर स्टॉक में जुड़ गई।`);
  };

  // ── bundleFloorStock ──────────────────────────────────────────────────────
  const bundleFloorStock = (stockIds: string[], destination: string): BulkLoad => {
    const selectedItems = floorStock.filter((s) => stockIds.includes(s.id));
    const totalWeight = Number(selectedItems.reduce((acc, curr) => acc + curr.weight_kg, 0).toFixed(1));
    const primaryMaterial = selectedItems[0]?.grade || "Consolidated Secondary Metals";
    const newLoadId = "BULK-NGP-" + Math.floor(100 + Math.random() * 900);
    const batchHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const newLoad: BulkLoad = {
      loadId: newLoadId,
      material: primaryMaterial,
      weight: totalWeight,
      destination: destination || "Vidarbha Metal Recovery Pvt Ltd (MIDC Butibori)",
      status: "IN_TRANSIT",
      hash: batchHash,
      dispatchedAt: "Just now",
      lotIds: selectedItems.map((s) => s.id),
    };

    const logEntry: AuditLogItem = {
      id: "AUD-" + Date.now().toString().slice(-4),
      timestamp: "Just now",
      actor: "Wadi Scrap Aggregators",
      role: "aggregator",
      action: "BULK_BATCH_CREATED",
      details: `Industrial Load ${newLoad.loadId} created with ${totalWeight} kg. Dispatched with SHA-256 seal.`,
      hash: newLoad.hash.slice(0, 16) + "...",
    };

    const updatedLoads = [newLoad, ...loads];
    const updatedFloorStock = floorStock.filter((s) => !stockIds.includes(s.id));
    const updatedAuditLogs = [logEntry, ...auditLogs];

    setLoads(updatedLoads);
    setFloorStock(updatedFloorStock);
    setAuditLogs(updatedAuditLogs);
    broadcast({ loads: updatedLoads, floorStock: updatedFloorStock, auditLogs: updatedAuditLogs });
    showToast(`🚚 औद्योगिक बैच ${newLoad.loadId} (${totalWeight} kg) तैयार व रिसाइक्लर को प्रेषित!`);
    return newLoad;
  };

  // ── reconcileLoad ─────────────────────────────────────────────────────────
  const reconcileLoad = (
    loadId: string,
    receivedWeight: number,
    smelterName = "Vidarbha Metal Recovery Pvt Ltd",
    cpcbReg = "CPCB: MH/EPR/R/2024/00318"
  ): EPRRecord => {
    const targetLoad = loads.find((l) => l.loadId === loadId) || loads[0];
    const declaredWeight = targetLoad ? targetLoad.weight : receivedWeight;
    const diff = Number((receivedWeight - declaredWeight).toFixed(2));
    const carbonSaved = Number(((receivedWeight * 2.5) / 1000).toFixed(3));
    const certNumber = "EPR-CPCB-2026-" + Math.floor(10000 + Math.random() * 90000);

    const newEpr: EPRRecord = {
      certId: certNumber,
      batchHash: targetLoad?.hash || "0x89e289f81a70c32d4b",
      batchId: loadId,
      material: targetLoad?.material || "Secondary Metals Yield",
      declaredWeight,
      receivedWeight,
      variance: diff,
      carbonSavedMt: carbonSaved,
      smelterName,
      cpcbReg,
      timestamp: "Just now",
      status: Math.abs(diff) <= declaredWeight * 0.05 ? "VERIFIED" : "DISPUTED",
    };

    const updatedLoads = loads.map((l) => (l.loadId === loadId ? { ...l, status: "RECONCILED" as const } : l));
    const logEntry: AuditLogItem = {
      id: "AUD-" + Date.now().toString().slice(-4),
      timestamp: "Just now",
      actor: smelterName,
      role: "smelter",
      action: "EPR_FORM4_GENERATED",
      details: `Weighbridge verified: ${receivedWeight} kg (Variance: ${diff} kg). Certificate ${certNumber} minted.`,
      hash: newEpr.batchHash.slice(0, 16) + "...",
    };

    const updatedReconciliations = [newEpr, ...reconciliations];
    const updatedAuditLogs = [logEntry, ...auditLogs];

    setReconciliations(updatedReconciliations);
    setLoads(updatedLoads);
    setAuditLogs(updatedAuditLogs);
    broadcast({ reconciliations: updatedReconciliations, loads: updatedLoads, auditLogs: updatedAuditLogs });
    showToast(`📜 वैधानिक EPR प्रमाणपत्र ${certNumber} जारी किया गया! ऑडिट लेजर अपडेट हुआ।`);
    return newEpr;
  };

  // ── resetAllData ──────────────────────────────────────────────────────────
  const resetAllData = () => {
    const payload: SyncPayload = {
      lots: SEED_LOTS,
      floorStock: SEED_FLOOR_STOCK,
      loads: SEED_LOADS,
      reconciliations: SEED_RECONCILIATIONS,
      auditLogs: SEED_AUDIT_LOGS,
    };

    setLots(SEED_LOTS);
    setFloorStock(SEED_FLOOR_STOCK);
    setLoads(SEED_LOADS);
    setReconciliations(SEED_RECONCILIATIONS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setLanguage("hi");
    setIsOnline(true);

    try {
      localStorage.setItem("kc_lots", JSON.stringify(SEED_LOTS));
      localStorage.setItem("kc_floor_stock", JSON.stringify(SEED_FLOOR_STOCK));
      localStorage.setItem("kc_loads", JSON.stringify(SEED_LOADS));
      localStorage.setItem("kc_reconciliations", JSON.stringify(SEED_RECONCILIATIONS));
      localStorage.setItem("kc_audit_logs", JSON.stringify(SEED_AUDIT_LOGS));
    } catch (e) { /* silent */ }

    // Broadcast the reset to all other tabs
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "STATE_SYNC", payload });
    }

    setRefreshKey((k) => k + 1);
    showToast("🔄 सारा डेटा आधिकारिक बेंचमार्क (Default Dataset) पर रीसेट कर दिया गया है!");
  };

  // ── refreshData ───────────────────────────────────────────────────────────
  const refreshData = () => {
    setRefreshKey((k) => k + 1);
    showToast("⚡ डेटा नवीनतम स्थिति से रिफ्रेश हो गया!");
  };

  return (
    <AppContext.Provider
      value={{
        lots,
        floorStock,
        loads,
        reconciliations,
        auditLogs,
        rates,
        language,
        setLanguage,
        isOnline,
        setIsOnline,
        refreshKey,
        addLot,
        sendQuote,
        acceptQuote,
        completeHandover,
        bundleFloorStock,
        reconcileLoad,
        resetAllData,
        refreshData,
        speak,
        notification,
        dismissNotification: () => setNotification(null),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

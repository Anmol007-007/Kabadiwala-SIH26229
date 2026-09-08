"use client";

import React, { useState } from "react";
import {
  Volume2,
  Camera,
  CheckCircle2,
  QrCode,
  Wifi,
  WifiOff,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function CollectorPWA() {
  const [lang, setLang] = useState<"mr" | "hi" | "te" | "en">("hi");
  const [activeTab, setActiveTab] = useState<"rates" | "inventory" | "newlot" | "earnings" | "safety">("rates");
  const [isOnline, setIsOnline] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState("Circuit boards");
  const [selectedGrade, setSelectedGrade] = useState("Grade A: Mobile Board");
  const [weightStr, setWeightStr] = useState("8");
  const [condition, setCondition] = useState("Clean & Sorted");
  const [matchedOffer, setMatchedOffer] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);
  const [handoverDone, setHandoverDone] = useState(false);
  const [showCustodyDialog, setShowCustodyDialog] = useState(false);

  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);

  const scrapRates = [
    {
      nameHi: "सर्किट बोर्ड (PCBs)",
      nameEn: "Circuit Boards",
      range: "₹690–₹768/kg",
      change: "+3.2%",
      up: true,
      audioText: "सर्किट बोर्ड का आज का भाव छह सौ नब्बे से सात सौ अड़सठ रुपये प्रति किलो है।",
    },
    {
      nameHi: "तार और केबल (Copper Wire)",
      nameEn: "Wires & Cables",
      range: "₹448–₹486/kg",
      change: "-1.3%",
      up: false,
      audioText: "तार और केबल का आज का भाव चार सौ अड़तालीस से चार सौ छियासी रुपये है।",
    },
    {
      nameHi: "बैटरी (Li-ion & Lead)",
      nameEn: "Batteries",
      range: "₹176–₹205/kg",
      change: "-2.2%",
      up: false,
      audioText: "बैटरी का आज का भाव एक सौ छिहत्तर से दो सौ पांच रुपये है।",
    },
    {
      nameHi: "मोटर और मैग्नेट",
      nameEn: "Motors & Magnets",
      range: "₹255–₹312/kg",
      change: "+1.0%",
      up: true,
      audioText: "मोटर और मैग्नेट का आज का भाव दो सौ पचपन से तीन सौ बारह रुपये है।",
    },
  ];

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const sampleScrapPresets = [
    { name: "Circuit boards", label: "सर्किट बोर्ड", conf: "94%" },
    { name: "Cables & wires", label: "तार / केबल", conf: "91%" },
    { name: "Batteries", label: "बैटरी", conf: "89%" },
    { name: "Motors & magnets", label: "मोटर", conf: "92%" },
    { name: "LCD panels", label: "स्क्रीन / LCD", conf: "86%" },
    { name: "Mixed plastics", label: "प्लास्टिक", conf: "84%" },
  ];

  const handleKeypadPress = (val: string) => {
    if (val === "C") {
      setWeightStr("");
    } else if (val === "⌫") {
      setWeightStr((prev) => prev.slice(0, -1));
    } else {
      if (weightStr.length < 5) {
        setWeightStr((prev) => (prev === "0" ? val : prev + val));
      }
    }
  };

  const handleFindBuyers = () => {
    const w = parseFloat(weightStr) || 8;
    const ratePerKg = selectedGrade.includes("Grade A") ? 720 : 380;
    const condMultiplier = condition === "Clean & Sorted" ? 1.0 : condition === "Mixed" ? 0.88 : 0.74;
    const totalEst = Math.round(w * ratePerKg * condMultiplier);

    setMatchedOffer({
      buyerName: "Wadi Scrap Aggregators",
      buyerReg: "CPCB: MH/EPR/A/2024/00522",
      distance: "1.2 km away",
      ratePerKg,
      totalPayout: totalEst,
      trxId: "TRX-84741",
    });
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-ink-50/60 text-ink-900 p-3 sm:p-6 font-sans">
      <div className="max-w-md mx-auto bg-white border border-ink-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[780px]">
        <div className="p-4 bg-white border-b border-ink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-leaf-50 border border-leaf-100 text-leaf-700 flex items-center justify-center font-bold text-sm">
              RK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs text-ink-900">Ramesh Kumar (रमेश)</h3>
                <span className="text-[9px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-1.5 py-0.2 rounded-full font-mono">
                  KC-NGP-4417
                </span>
              </div>
              <p className="text-[10px] text-ink-500">Kalmna - Wadi Belt, Nagpur</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-ink-50 border border-ink-100 text-[11px] font-bold text-ink-700 rounded-xl px-2 py-1 focus:outline-none"
            >
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="te">తెలుగు</option>
              <option value="en">English</option>
            </select>

            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`p-1.5 rounded-xl border text-[10px] font-semibold flex items-center gap-1 ${
                isOnline
                  ? "bg-leaf-50 text-leaf-700 border-leaf-100"
                  : "bg-clay-100 text-clay-700 border-clay-100"
              }`}
              title="Toggle Online/Offline mode"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-around bg-ink-50/70 border-b border-ink-100 p-1.5 text-xs font-bold">
          {[
            { id: "rates", label: "भाव (Rates)" },
            { id: "inventory", label: "मेरा माल" },
            { id: "newlot", label: "+ नया माल" },
            { id: "earnings", label: "कमाई" },
            { id: "safety", label: "सुरक्षा" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-ink-900 text-white font-semibold shadow-sm"
                  : "text-ink-600 hover:text-ink-900 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeTab === "rates" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="font-extrabold text-sm text-ink-900">आज के लाइव भाव (Nagpur District)</h3>
                  <p className="text-[11px] text-ink-500">नागपुर अधिकृत खरीददारों द्वारा अपडेट</p>
                </div>
                <button
                  onClick={() => speakText("आज के सभी मुख्य कबाड़ भाव इस प्रकार हैं...")}
                  className="px-2.5 py-1 bg-leaf-50 hover:bg-leaf-100 text-leaf-700 rounded-xl flex items-center gap-1 text-[11px] font-bold ring-1 ring-leaf-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>सुनें</span>
                </button>
              </div>

              {scrapRates.map((rate, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-ink-100 rounded-2xl flex items-center justify-between hover:border-leaf-600 transition-all shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-ink-900">{lang === "hi" ? rate.nameHi : rate.nameEn}</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-ink-900 font-mono">{rate.range}</span>
                      <span className={`text-[10px] font-bold ${rate.up ? "text-leaf-600" : "text-clay-700"}`}>
                        {rate.change}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => speakText(rate.audioText)}
                    className="w-9 h-9 rounded-full bg-leaf-50 hover:bg-leaf-100 text-leaf-700 ring-1 ring-leaf-100 flex items-center justify-center transition-colors"
                    title="Speak this rate"
                  >
                    <Volume2 className="w-4 h-4 text-leaf-700" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-extrabold text-sm text-ink-900">सक्रिय माल और सौदे</h3>
              <div className="p-4 bg-white border border-ink-100 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink-700 bg-ink-50 px-2 py-0.5 rounded-full font-bold ring-1 ring-ink-100">
                    LOT-NGP-84741
                  </span>
                  <span className="text-[10px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-bold">
                    OFFER ACCEPTED
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ink-900">8 kg Mobile Circuit Boards</h4>
                  <p className="text-xs text-ink-500">Buyer: Wadi Scrap Aggregators</p>
                  <p className="font-mono text-base font-extrabold text-leaf-600 mt-1">₹4,858 Total Agreed</p>
                </div>
                <button
                  onClick={() => {
                    setMatchedOffer({
                      buyerName: "Wadi Scrap Aggregators",
                      buyerReg: "CPCB: MH/EPR/A/2024/00522",
                      distance: "1.2 km away",
                      totalPayout: 4858,
                      trxId: "TRX-84741",
                    });
                    setAccepted(true);
                    setActiveTab("newlot");
                    setStep(4);
                  }}
                  className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>माल देने का QR कोड दिखाएं</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "newlot" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 pb-2 border-b border-ink-100">
                <span>चरण {step} / 4</span>
                <span className="text-leaf-700 font-bold">
                  {step === 1 ? "फोटो खींचें" : step === 2 ? "पहचान व ग्रेड" : step === 3 ? "वजन डालें" : "खरीदार और रसीद"}
                </span>
              </div>

              {step === 1 && (
                <div className="space-y-4 text-center">
                  <div className="p-8 bg-ink-50 border-2 border-dashed border-ink-100 rounded-3xl flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white ring-1 ring-ink-100 text-leaf-700 flex items-center justify-center shadow-2xs">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink-900">कबाड़ के ढेर की फोटो लें</h4>
                      <p className="text-[11px] text-ink-500">कैमरा चालू करें या त्वरित नमूना चुनें</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-ink-600 font-semibold mb-2 text-left">नमूना सामग्री चुनें:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleScrapPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setSelectedPreset(preset.name);
                            setStep(2);
                          }}
                          className={`p-2.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                            selectedPreset === preset.name
                              ? "bg-leaf-50 border-leaf-600 text-leaf-700 ring-1 ring-leaf-600"
                              : "bg-white border-ink-100 text-ink-700 hover:bg-ink-50"
                          }`}
                        >
                          <p>{preset.label}</p>
                          <span className="text-[9px] text-ink-400 font-mono font-normal">AI: {preset.conf}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-leaf-50 border border-leaf-100 rounded-2xl text-xs text-leaf-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>AI द्वारा पहचाना गया: <strong>{selectedPreset} (94% विश्वास)</strong></span>
                  </div>

                  <p className="text-xs font-bold text-ink-900">सामग्री की गुणवत्ता (Grade) चुनें:</p>
                  <div className="space-y-2">
                    {[
                      { g: "Grade A: Mobile Board", desc: "उच्च श्रेणी मोबाइल पीसीबी", rate: "₹620–₹780/kg" },
                      { g: "Grade B: Computer Board", desc: "मदरबोर्ड व भारी कार्ड", rate: "₹230–₹290/kg" },
                      { g: "Grade C: TV & Power Board", desc: "साधारण भूरे बोर्ड", rate: "₹95–₹140/kg" },
                    ].map((item) => (
                      <button
                        key={item.g}
                        onClick={() => setSelectedGrade(item.g)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          selectedGrade === item.g
                            ? "bg-leaf-50 border-leaf-600 text-ink-900 ring-1 ring-leaf-600"
                            : "bg-white border-ink-100 text-ink-700 hover:bg-ink-50"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-ink-900">{item.g}</p>
                          <p className="text-[10px] text-ink-500">{item.desc}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-leaf-700">{item.rate}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-2xl transition-colors shadow-sm"
                  >
                    आगे बढ़ें: वजन दर्ज करें &rarr;
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-ink-50 rounded-2xl border border-ink-100">
                    <p className="text-[10px] text-ink-500 uppercase font-semibold">अनुमानित वजन (Weight)</p>
                    <p className="text-3xl font-extrabold text-ink-900 font-mono mt-1">
                      {weightStr || "0"} <span className="text-lg text-ink-500 font-normal">kg</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {["5", "10", "15", "25", "50"].map((w) => (
                      <button
                        key={w}
                        onClick={() => setWeightStr(w)}
                        className="flex-1 py-1.5 bg-white border border-ink-100 hover:bg-ink-50 text-ink-700 rounded-xl text-xs font-bold font-mono shadow-2xs"
                      >
                        +{w}kg
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
                      <button
                        key={k}
                        onClick={() => handleKeypadPress(k)}
                        className="py-3 bg-white hover:bg-ink-50 border border-ink-100 rounded-2xl font-bold font-mono text-base text-ink-900 active:scale-95 transition-transform shadow-2xs"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleFindBuyers}
                    disabled={!weightStr || parseFloat(weightStr) <= 0}
                    className="w-full py-3 bg-leaf-600 hover:bg-leaf-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition-all"
                  >
                    पास के खरीददार खोजें &rarr;
                  </button>
                </div>
              )}

              {step === 4 && matchedOffer && (
                <div className="space-y-4">
                  {!accepted ? (
                    <div className="p-4 bg-white border border-ink-100 rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-leaf-700">सर्वोत्तम ऑफर मिला</span>
                        <span className="text-[10px] font-mono text-ink-500">{matchedOffer.distance}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-ink-900">{matchedOffer.buyerName}</h4>
                        <p className="text-[10px] text-ink-500 font-mono">{matchedOffer.buyerReg}</p>
                        <p className="text-2xl font-black text-leaf-600 font-mono mt-2">
                          ₹{matchedOffer.totalPayout.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <button
                        onClick={() => setAccepted(true)}
                        className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>हाँ मंजूर है (Accept Offer)</span>
                      </button>
                    </div>
                  ) : !handoverDone ? (
                    <div className="text-center p-5 bg-white border border-leaf-600/40 rounded-3xl space-y-4 shadow-sm">
                      <h4 className="font-extrabold text-sm text-ink-900">माल का डिजिटल हैंडओवर (QR Code)</h4>
                      <p className="text-xs text-ink-500">खरीदार की दुकान पर यह QR कोड स्कैन कराएं</p>

                      <div className="p-3 bg-white inline-block rounded-2xl shadow-md border-2 border-leaf-600">
                        <QRCodeSVG
                          value={`https://mines.gov.in/handover?trx=${matchedOffer.trxId}&payout=${matchedOffer.totalPayout}`}
                          size={150}
                        />
                      </div>

                      <p className="font-mono text-xs text-leaf-700 font-bold">सौदा संख्या: {matchedOffer.trxId}</p>

                      <button
                        onClick={() => setHandoverDone(true)}
                        className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm"
                      >
                        हैंडओवर पूरा करें &bull; रसीद प्राप्त करें
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 bg-white border border-leaf-600/40 rounded-3xl space-y-4 shadow-sm animate-fade-in">
                      <div className="text-center pb-3 border-b border-ink-100 space-y-1">
                        <span className="text-[10px] font-mono text-leaf-700 font-bold uppercase bg-leaf-50 px-2 py-0.5 rounded-full ring-1 ring-leaf-100">
                          खान मंत्रालय &bull; डिजिटल पावती
                        </span>
                        <h4 className="font-extrabold text-base text-ink-900 mt-1">सत्यापित कबाड़ खरीद रसीद</h4>
                        <p className="text-[10px] font-mono text-ink-500">{matchedOffer.trxId}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-ink-400 text-[10px]">विक्रेता:</span>
                          <p className="font-bold text-ink-900">Ramesh Kumar</p>
                        </div>
                        <div>
                          <span className="text-ink-400 text-[10px]">खरीदार:</span>
                          <p className="font-bold text-ink-900">Wadi Aggregators</p>
                        </div>
                        <div>
                          <span className="text-ink-400 text-[10px]">कुल भुगतान:</span>
                          <p className="font-extrabold text-leaf-600 text-sm">₹{matchedOffer.totalPayout}</p>
                        </div>
                        <div>
                          <span className="text-ink-400 text-[10px]">भुगतान माध्यम:</span>
                          <p className="font-bold text-ink-900">नकद (Cash)</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => speakText(`रसीद संख्या ${matchedOffer.trxId}. कुल भुगतान ${matchedOffer.totalPayout} रुपये Ramesh Kumar को Wadi Aggregators द्वारा किया गया.`)}
                          className="flex-1 py-2 bg-ink-50 hover:bg-ink-100 text-ink-700 text-xs font-semibold rounded-2xl border border-ink-100 flex items-center justify-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-leaf-700" />
                          <span>सुनाएं</span>
                        </button>

                        <button
                          onClick={() => setShowCustodyDialog(true)}
                          className="flex-1 py-2 bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>ट्रेसबिलिटी देखें</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-white border border-ink-100 rounded-2xl text-center shadow-2xs">
                <p className="text-[10px] text-ink-500 uppercase font-semibold">इस महीने की कुल कमाई</p>
                <p className="text-3xl font-extrabold text-leaf-600 font-mono mt-1">₹10,807</p>
                <p className="text-xs text-leaf-700 font-semibold mt-1">
                  पारंपरिक कबाड़ी से <strong>+₹6,012 अधिक</strong> लाभ मिला!
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink-900">सामग्री अनुसार कमाई:</h4>
                <div className="p-3 bg-white border border-ink-100 rounded-xl flex justify-between text-xs">
                  <span className="text-ink-700">सर्किट बोर्ड (PCBs)</span>
                  <span className="font-mono font-bold text-ink-900">₹6,840 (63%)</span>
                </div>
                <div className="p-3 bg-white border border-ink-100 rounded-xl flex justify-between text-xs">
                  <span className="text-ink-700">तांबा तार (Copper Cable)</span>
                  <span className="font-mono font-bold text-ink-900">₹2,850 (26%)</span>
                </div>
                <div className="p-3 bg-white border border-ink-100 rounded-xl flex justify-between text-xs">
                  <span className="text-ink-700">बैटरी व मोटर</span>
                  <span className="font-mono font-bold text-ink-900">₹1,117 (11%)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "safety" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-gold-50 border border-gold-100 rounded-2xl text-xs text-gold-700 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-gold-600 flex-shrink-0" />
                <span>ई-कचरे से जहरीले रसायनों और आग से बचने के 6 बुनियादी नियम</span>
              </div>

              <div className="space-y-2">
                {[
                  "तारों को कभी खुले में न जलाएं (विषाक्त धुआं निकलता है)",
                  "सर्किट बोर्ड पर तेजाब या एसिड न डालें",
                  "लिथियम बैटरी को कभी न तोड़ें (विस्फोट का खतरा)",
                  "कांच वाली सीआरटी (CRT) ट्यूब को हथौड़े से न फोड़ें",
                  "काम करते समय दस्ताने और मोटे जूते पहनें",
                  "कबाड़ के काम से बच्चों को दूर रखें",
                ].map((rule, idx) => (
                  <div key={idx} className="p-3 bg-white border border-ink-100 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                    <span className="text-ink-700">{idx + 1}. {rule}</span>
                    <button onClick={() => speakText(rule)} className="text-leaf-700 hover:text-leaf-800 ml-2">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border border-ink-100 rounded-2xl space-y-3 shadow-2xs">
                <h4 className="font-bold text-xs text-ink-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-leaf-600" />
                  <span>सुरक्षा जाँच सवाल:</span>
                </h4>
                <p className="text-xs text-ink-700">
                  क्या तांबे का तार निकालने के लिए प्लास्टिक जलाना सही है?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizAnswered(false)}
                    className="flex-1 py-2 bg-ink-50 hover:bg-ink-100 border border-ink-100 text-xs font-semibold rounded-xl text-ink-700"
                  >
                    हाँ
                  </button>
                  <button
                    onClick={() => setQuizAnswered(true)}
                    className="flex-1 py-2 bg-leaf-600 hover:bg-leaf-700 text-xs font-semibold rounded-xl text-white shadow-sm"
                  >
                    नहीं (गलत है)
                  </button>
                </div>
                {quizAnswered !== null && (
                  <p className={`text-xs font-bold ${quizAnswered ? "text-leaf-600" : "text-clay-700"}`}>
                    {quizAnswered ? "✅ बिल्कुल सही! तार छीलने के लिए वायर स्ट्रिपर इस्तेमाल करें।" : "❌ गलत! तार जलाने से फेफड़ों का कैंसर हो सकता है।"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {showCustodyDialog && (
          <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-ink-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-ink-100">
                <h4 className="font-bold text-sm text-ink-900">चैन ऑफ कस्टडी (ट्रेसबिलिटी)</h4>
                <button onClick={() => setShowCustodyDialog(false)} className="text-ink-500 hover:text-ink-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-ink-50 rounded-xl border border-ink-100">
                  <p className="font-bold text-ink-900">1. कबाड़ी संकलन</p>
                  <p className="text-ink-500">Ramesh Kumar &bull; 8 kg Mobile Boards</p>
                </div>
                <div className="p-2.5 bg-ink-50 rounded-xl border border-ink-100">
                  <p className="font-bold text-ink-900">2. पंजीकृत एग्रीगेटर</p>
                  <p className="text-ink-500">Wadi Aggregators (CPCB: MH/EPR/A/2024/00522)</p>
                </div>
                <div className="p-2.5 bg-ink-50 rounded-xl border border-ink-100">
                  <p className="font-bold text-leaf-700">3. अधिकृत रिसाइक्लर</p>
                  <p className="text-ink-500">Vidarbha Metal Recovery (CPCB: MH/EPR/R/2024/00318)</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustodyDialog(false)}
                className="w-full py-2 bg-ink-50 hover:bg-ink-100 text-ink-700 text-xs font-semibold rounded-2xl border border-ink-100"
              >
                बंद करें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
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
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useApp, ScrapLot } from "@/context/AppContext";

export default function CollectorPWA() {
  const {
    lots,
    rates,
    language,
    setLanguage,
    isOnline,
    setIsOnline,
    addLot,
    acceptQuote,
    completeHandover,
    speak,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"rates" | "inventory" | "newlot" | "earnings" | "safety">("rates");

  // Lot Creation Wizard State
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<"PCBs" | "Copper" | "Batteries" | "Motors" | "Aluminium">("PCBs");
  const [selectedPreset, setSelectedPreset] = useState("Circuit boards (PCBs)");
  const [selectedGrade, setSelectedGrade] = useState("Grade A: Mobile Board");
  const [weightStr, setWeightStr] = useState("8");
  const [condition, setCondition] = useState("Clean & Sorted");
  const [activeCreatedLot, setActiveCreatedLot] = useState<ScrapLot | null>(null);
  const [showCustodyDialog, setShowCustodyDialog] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);

  // Audio / Speech-to-Text State
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState("");
  const [audioSuccessMsg, setAudioSuccessMsg] = useState("");
  const recognitionRef = useRef<any>(null);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sample Scrap presets
  const sampleScrapPresets = [
    { name: "Circuit boards (PCBs)", category: "PCBs", labelHi: "सर्किट बोर्ड (PCBs)", labelEn: "Circuit Boards", conf: "96%", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    { name: "Copper Wires & Cables", category: "Copper", labelHi: "तांबा तार और केबल", labelEn: "Copper Wires & Cables", conf: "94%", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { name: "Lithium-ion Batteries", category: "Batteries", labelHi: "लिथियम बैटरी पैक्स", labelEn: "Li-ion Battery Packs", conf: "91%", color: "bg-blue-50 text-blue-800 border-blue-200" },
    { name: "Electric Motors", category: "Motors", labelHi: "इलेक्ट्रिक मोटर / मैग्नेट", labelEn: "Electric Motors", conf: "93%", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    { name: "Aluminium Scrap", category: "Aluminium", labelHi: "एल्युमिनियम स्क्रैप", labelEn: "Aluminium Castings", conf: "89%", color: "bg-slate-100 text-slate-800 border-slate-200" },
  ];

  // Quick Voice Simulation Prompts
  const quickVoicePrompts = [
    {
      text: "8 किलो मोबाइल सर्किट बोर्ड",
      enText: "8 kg Mobile Circuit Boards",
      cat: "PCBs" as const,
      grade: "Grade A: Mobile Board",
      weight: "8",
      rate: 720,
    },
    {
      text: "15 किलो तांबा तार ₹480 का भाव",
      enText: "15 kg Copper Wire at ₹480/kg",
      cat: "Copper" as const,
      grade: "Grade A: Copper Extrusion",
      weight: "15",
      rate: 480,
    },
    {
      text: "10 किलो लिथियम बैटरी",
      enText: "10 kg Lithium-ion Battery",
      cat: "Batteries" as const,
      grade: "Grade A: Li-ion Cells",
      weight: "10",
      rate: 410,
    },
  ];

  // Start Real Browser Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser does not support speech recognition, use simulation
      simulateVoiceInput("8 किलो मोबाइल सर्किट बोर्ड दर्ज करें", "PCBs", "Grade A: Mobile Board", "8", 720);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setAudioTranscript("सुन रहा हूँ... बोलिए (उदा: '10 किलो तांबा' या '8 किलो सर्किट बोर्ड')");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAudioTranscript(transcript);
        parseVoiceCommand(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        // Fallback gracefully to default sample prompt so user experience is not broken
        simulateVoiceInput("8 किलो मोबाइल सर्किट बोर्ड", "PCBs", "Grade A: Mobile Board", "8", 720);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      simulateVoiceInput("8 किलो मोबाइल सर्किट बोर्ड", "PCBs", "Grade A: Mobile Board", "8", 720);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Parse transcribed voice text into structured data
  const parseVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    let detectedCat: "PCBs" | "Copper" | "Batteries" | "Motors" | "Aluminium" = "PCBs";
    let detectedGrade = "Grade A: Mobile Board";
    let detectedRate = 720;
    let detectedWeight = "8";

    // Extract numbers from speech
    const numbers = text.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length > 0) {
      detectedWeight = numbers[0];
    }

    if (lower.includes("तांबा") || lower.includes("copper") || lower.includes("wire") || lower.includes("तार")) {
      detectedCat = "Copper";
      detectedGrade = "Grade A: Copper Extrusion";
      detectedRate = 480;
    } else if (lower.includes("बैटरी") || lower.includes("battery") || lower.includes("li-ion")) {
      detectedCat = "Batteries";
      detectedGrade = "Grade A: Li-ion Cells";
      detectedRate = 410;
    } else if (lower.includes("मोटर") || lower.includes("motor") || lower.includes("magnet")) {
      detectedCat = "Motors";
      detectedGrade = "Grade B: Motors & Magnets";
      detectedRate = 280;
    } else if (lower.includes("एल्युमिनियम") || lower.includes("aluminium") || lower.includes("aluminum")) {
      detectedCat = "Aluminium";
      detectedGrade = "Grade B: Aluminium Scrap";
      detectedRate = 215;
    } else {
      detectedCat = "PCBs";
      detectedGrade = "Grade A: Mobile Board";
      detectedRate = 720;
    }

    setSelectedCategory(detectedCat);
    setSelectedGrade(detectedGrade);
    setWeightStr(detectedWeight);
    setAudioSuccessMsg(`पहचान सफल: ${detectedWeight} kg ${detectedGrade}`);
    speak(`पहचाना गया: ${detectedWeight} किलो ${detectedCat}. आज का भाव ₹${detectedRate} प्रति किलो.`);
  };

  const simulateVoiceInput = (
    text: string,
    cat: "PCBs" | "Copper" | "Batteries" | "Motors" | "Aluminium",
    grade: string,
    weight: string,
    rate: number
  ) => {
    setIsRecording(true);
    setAudioTranscript("ऑडियो प्रोसेस हो रहा है...");
    setTimeout(() => {
      setIsRecording(false);
      setAudioTranscript(`"${text}"`);
      setSelectedCategory(cat);
      setSelectedGrade(grade);
      setWeightStr(weight);
      setAudioSuccessMsg(`ऑडियो से निकाला गया: ${weight} kg ${grade}`);
      speak(`आवाज़ से दर्ज: ${weight} किलो ${grade}`);
    }, 700);
  };

  // Camera Management
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn("Webcam access unavailable, using sample camera presets:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedPhotoUrl(dataUrl);
      }
    } else {
      setCapturedPhotoUrl("captured-preset");
    }
    stopCamera();
    setStep(2);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Keypad Weight input
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

  // Submit Lot Creation
  const handleCreateLot = () => {
    const w = parseFloat(weightStr) || 8;
    const currentRateObj = rates.find((r) => r.category === selectedCategory) || rates[0];
    const baseRate = currentRateObj.price;
    const condMult = condition === "Clean & Sorted" ? 1.0 : condition === "Mixed" ? 0.88 : 0.75;
    const finalRate = Math.round(baseRate * condMult);
    const totalEst = Math.round(w * finalRate);

    const newLot = addLot({
      collector: "Ramesh Kumar (रमेश)",
      collectorId: "KC-NGP-4417",
      location: "Kalmna - Wadi Belt, Nagpur (1.2 km away)",
      material: `${selectedGrade} (${selectedCategory})`,
      category: selectedCategory,
      grade: selectedGrade,
      weight_kg: w,
      ratePerKg: finalRate,
      totalPayout: totalEst,
      status: "PENDING_QUOTE",
      gps: "21.1458° N, 79.0882° E",
      audioTranscript: audioTranscript || undefined,
    });

    setActiveCreatedLot(newLot);
    setStep(4);
  };

  // Find user's active lot if one was just created or from list
  const currentLot = activeCreatedLot || lots[0];

  return (
    <div className="min-h-screen bg-ink-50/50 text-ink-900 p-3 sm:p-6 font-sans">
      <div className="max-w-md mx-auto bg-white border border-ink-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[780px]">
        {/* Collector Header */}
        <div className="p-4 bg-white border-b border-ink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-leaf-50 border border-leaf-100 text-leaf-700 flex items-center justify-center font-bold text-sm">
              RK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs text-ink-900">Ramesh Kumar (रमेश)</h3>
                <span className="text-[9px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  KC-NGP-4417
                </span>
              </div>
              <p className="text-[10px] text-ink-500">Kalmna - Wadi Belt, Nagpur</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`p-1.5 rounded-xl border text-[10px] font-semibold flex items-center gap-1 transition ${
                isOnline
                  ? "bg-leaf-50 text-leaf-700 border-leaf-100"
                  : "bg-clay-100 text-clay-700 border-clay-100"
              }`}
              title="Toggle Online/Offline mode"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? "ऑनलाइन" : "ऑफलाइन"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
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
                  ? "bg-ink-900 text-white font-semibold shadow-xs"
                  : "text-ink-600 hover:text-ink-900 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* TAB 1: LIVE RATES */}
          {activeTab === "rates" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="font-extrabold text-sm text-ink-900">आज के लाइव भाव (Nagpur District)</h3>
                  <p className="text-[11px] text-ink-500">नागपुर अधिकृत खरीददारों द्वारा अपडेट</p>
                </div>
                <button
                  onClick={() => speak("आज के सभी मुख्य कबाड़ भाव इस प्रकार हैं...")}
                  className="px-2.5 py-1 bg-leaf-50 hover:bg-leaf-100 text-leaf-700 rounded-xl flex items-center gap-1 text-[11px] font-bold ring-1 ring-leaf-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>सुनें</span>
                </button>
              </div>

              {rates.map((rate, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-ink-100 rounded-2xl flex items-center justify-between hover:border-leaf-600 transition-all shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-ink-900">
                      {language === "hi" ? rate.nameHi : rate.nameEn}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-ink-900 font-mono">{rate.range}</span>
                      <span className={`text-[10px] font-bold ${rate.up ? "text-leaf-600" : "text-clay-700"}`}>
                        {rate.change}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => speak(rate.audioText)}
                    className="w-9 h-9 rounded-full bg-leaf-50 hover:bg-leaf-100 text-leaf-700 ring-1 ring-leaf-100 flex items-center justify-center transition-colors"
                    title="Speak rate aloud"
                  >
                    <Volume2 className="w-4 h-4 text-leaf-700" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MY LOTS / INVENTORY */}
          {activeTab === "inventory" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-extrabold text-sm text-ink-900">सक्रिय माल और सौदे ({lots.length})</h3>
                <button
                  onClick={() => {
                    setStep(1);
                    setActiveTab("newlot");
                  }}
                  className="px-2.5 py-1 bg-leaf-600 hover:bg-leaf-700 text-white rounded-xl text-[11px] font-bold transition shadow-xs flex items-center gap-1"
                >
                  <span>+ नया लॉट</span>
                </button>
              </div>

              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 bg-white border border-ink-100 rounded-2xl space-y-2.5 shadow-2xs hover:border-leaf-600 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink-700 bg-ink-50 px-2 py-0.5 rounded-full font-bold ring-1 ring-ink-100">
                      {lot.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        lot.status === "OFFER_ACCEPTED" || lot.status === "HANDED_OVER"
                          ? "bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100"
                          : lot.status === "QUOTE_SENT"
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      }`}
                    >
                      {lot.status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-ink-900">
                      {lot.weight_kg} kg {lot.material}
                    </h4>
                    <p className="text-[11px] text-ink-500">खरीदार: {lot.buyerName}</p>
                    <p className="font-mono text-sm font-extrabold text-leaf-600 mt-1">
                      ₹{lot.totalPayout.toLocaleString("en-IN")} (₹{lot.ratePerKg}/kg)
                    </p>
                  </div>

                  {lot.status === "QUOTE_SENT" && (
                    <button
                      onClick={() => acceptQuote(lot.id)}
                      className="w-full py-2 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ऑफर स्वीकार करें (Accept ₹{lot.totalPayout})</span>
                    </button>
                  )}

                  {lot.status === "OFFER_ACCEPTED" && (
                    <button
                      onClick={() => {
                        setActiveCreatedLot(lot);
                        setActiveTab("newlot");
                        setStep(4);
                      }}
                      className="w-full py-2 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>हैंडओवर QR कोड दिखाएं</span>
                    </button>
                  )}

                  {lot.status === "HANDED_OVER" && (
                    <div className="pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-leaf-700 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        हैंडओवर पूर्ण &bull; भुगतान सफल
                      </span>
                      <button
                        onClick={() => setShowCustodyDialog(true)}
                        className="text-ink-500 hover:text-ink-900 underline text-[10px]"
                      >
                        ट्रेसबिलिटी
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: NEW LOT CREATION (AUDIO + CAMERA WIZARD) */}
          {activeTab === "newlot" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 pb-2 border-b border-ink-100">
                <span>चरण {step} / 4</span>
                <span className="text-leaf-700 font-bold">
                  {step === 1 ? "फोटो व आवाज़" : step === 2 ? "पहचान व ग्रेड" : step === 3 ? "वजन व कीमत" : "खरीदार और QR हैंडओवर"}
                </span>
              </div>

              {/* STEP 1: CAMERA & VOICE INPUT */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Voice-First Input Section */}
                  <div className="p-4 bg-leaf-50/70 border border-leaf-100 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-leaf-700" />
                        <h4 className="font-extrabold text-xs text-ink-900">आवाज़ से माल दर्ज करें (Voice Logging)</h4>
                      </div>
                      <span className="text-[10px] font-mono text-leaf-700 font-bold">हिन्दी / English</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
                          isRecording
                            ? "bg-clay-700 text-white animate-pulse ring-4 ring-clay-100"
                            : "bg-leaf-600 hover:bg-leaf-700 text-white ring-2 ring-leaf-100"
                        }`}
                        title="Click to speak scrap details"
                      >
                        {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>

                      <div className="flex-1 text-left space-y-1">
                        <p className="text-xs font-bold text-ink-900">
                          {isRecording ? "बोलिए... सुन रहा हूँ" : "माइक दबाएं और बोलें"}
                        </p>
                        <p className="text-[11px] text-ink-600 leading-tight">
                          उदा: &quot;8 किलो मोबाइल सर्किट बोर्ड&quot; या &quot;15 किलो तांबा तार&quot;
                        </p>
                      </div>
                    </div>

                    {audioTranscript && (
                      <div className="p-2.5 bg-white border border-leaf-100 rounded-xl text-xs text-ink-800 font-mono">
                        <span className="text-[10px] text-leaf-700 font-bold block">पहचाना गया भाषण:</span>
                        {audioTranscript}
                      </div>
                    )}

                    {audioSuccessMsg && (
                      <div className="p-2 bg-leaf-100/70 text-leaf-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                        <span>{audioSuccessMsg}</span>
                        <button
                          onClick={() => setStep(3)}
                          className="px-2 py-0.5 bg-leaf-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          आगे बढ़ें &rarr;
                        </button>
                      </div>
                    )}

                    {/* Quick Voice Simulation Buttons */}
                    <div className="pt-2 border-t border-leaf-100 space-y-1.5">
                      <p className="text-[10px] font-semibold text-leaf-800">त्वरित आवाज़ नमूने (One-Click Testing):</p>
                      <div className="flex flex-col gap-1.5">
                        {quickVoicePrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => simulateVoiceInput(p.text, p.cat, p.grade, p.weight, p.rate)}
                            className="p-2 text-left bg-white hover:bg-leaf-100/50 border border-leaf-100 rounded-xl text-[11px] text-ink-800 font-medium flex items-center justify-between transition"
                          >
                            <span>🎤 {p.text}</span>
                            <span className="text-[10px] text-leaf-700 font-bold">{p.weight} kg</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Camera / Visual Classification Section */}
                  <div className="p-4 bg-ink-50/70 border border-ink-100 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-ink-700" />
                        <h4 className="font-extrabold text-xs text-ink-900">कबाड़ की फोटो खींचें (AI Camera)</h4>
                      </div>
                      <span className="text-[10px] font-mono text-ink-500">Automatic Grade Detection</span>
                    </div>

                    {isCameraActive ? (
                      <div className="space-y-2">
                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-ink-200">
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="absolute inset-4 border-2 border-dashed border-leaf-500/70 rounded-xl pointer-events-none flex items-center justify-center">
                            <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md font-mono">
                              कबाड़ को फ्रेम में रखें
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={capturePhoto}
                            className="flex-1 py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-bold text-xs rounded-xl shadow-xs"
                          >
                            फोटो लें (Capture)
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-3 py-2.5 bg-white border border-ink-100 text-ink-700 font-bold text-xs rounded-xl"
                          >
                            रद्द
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={startCamera}
                        className="w-full p-4 bg-white border border-dashed border-ink-200 rounded-2xl hover:border-leaf-600 hover:bg-leaf-50/20 transition flex flex-col items-center justify-center space-y-2"
                      >
                        <div className="w-10 h-10 rounded-xl bg-ink-50 text-leaf-700 flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-ink-900">कैमरा चालू करें</p>
                          <p className="text-[10px] text-ink-500">या नीचे दिए गए नमूने से तुरंत चुनें</p>
                        </div>
                      </button>
                    )}

                    {/* Realistic Sample Scrap Presets */}
                    <div className="pt-2">
                      <p className="text-[11px] text-ink-600 font-semibold mb-2 text-left">
                        या त्वरित नमूना सामग्री चुनें:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {sampleScrapPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              setSelectedCategory(preset.category as any);
                              setSelectedPreset(preset.name);
                              setStep(2);
                            }}
                            className={`p-2.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                              selectedCategory === preset.category
                                ? "bg-leaf-50 border-leaf-600 text-leaf-700 ring-1 ring-leaf-600"
                                : "bg-white border-ink-100 text-ink-700 hover:bg-ink-50"
                            }`}
                          >
                            <p>{preset.labelHi}</p>
                            <span className="text-[9px] text-ink-400 font-mono font-normal">
                              AI: {preset.conf}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: QUALITY & GRADE SELECTION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-leaf-50 border border-leaf-100 rounded-2xl text-xs text-leaf-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      AI द्वारा पहचाना गया: <strong>{selectedPreset} (96% विश्वास)</strong>
                    </span>
                  </div>

                  <p className="text-xs font-bold text-ink-900">सामग्री की गुणवत्ता (Grade) चुनें:</p>
                  <div className="space-y-2">
                    {[
                      { g: "Grade A: Mobile Board", desc: "उच्च श्रेणी मोबाइल पीसीबी (सोना/तांबा)", rate: "₹690–₹768/kg" },
                      { g: "Grade B: Computer Board", desc: "मदरबोर्ड व सर्वर कार्ड", rate: "₹250–₹290/kg" },
                      { g: "Grade C: TV & Power Board", desc: "साधारण ब्राउन पावर बोर्ड", rate: "₹95–₹140/kg" },
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

                  <div className="pt-2">
                    <p className="text-xs font-bold text-ink-900 mb-1.5">सॉर्टिंग स्थिति (Sorting Condition):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Clean & Sorted", "Mixed", "Unsorted"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setCondition(c)}
                          className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition ${
                            condition === c
                              ? "bg-leaf-600 text-white border-leaf-600 shadow-2xs"
                              : "bg-white border-ink-100 text-ink-700 hover:bg-ink-50"
                          }`}
                        >
                          {c === "Clean & Sorted" ? "साफ व छांटा हुआ" : c === "Mixed" ? "मिश्रित" : "बिना छांटा"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-2xl transition shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>आगे बढ़ें: वजन दर्ज करें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 3: WEIGHT KEYPAD & PRICE ESTIMATION */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-ink-50 rounded-2xl border border-ink-100">
                    <p className="text-[10px] text-ink-500 uppercase font-semibold">अनुमानित वजन (Weight)</p>
                    <p className="text-3xl font-extrabold text-ink-900 font-mono mt-1">
                      {weightStr || "0"} <span className="text-lg text-ink-500 font-normal">kg</span>
                    </p>
                    <p className="text-[11px] text-leaf-700 font-bold mt-1">
                      अनुमानित भुगतान: ₹{Math.round((parseFloat(weightStr) || 0) * 720).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {["5", "8", "10", "15", "25"].map((w) => (
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
                        className="py-3 bg-white hover:bg-ink-50 border border-ink-100 rounded-2xl font-bold font-mono text-base text-ink-900 active:scale-95 transition shadow-2xs"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCreateLot}
                    disabled={!weightStr || parseFloat(weightStr) <= 0}
                    className="w-full py-3 bg-leaf-600 hover:bg-leaf-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition-all"
                  >
                    लॉट बनाएं और पास के खरीददार को भेजें &rarr;
                  </button>
                </div>
              )}

              {/* STEP 4: BUYER QUOTE & DUAL QR HANDOVER */}
              {step === 4 && (
                <div className="space-y-4">
                  {currentLot.status === "PENDING_QUOTE" ? (
                    <div className="p-5 bg-white border border-ink-100 rounded-3xl space-y-4 shadow-2xs text-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-1 ring-amber-100">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                      <div>
                        <span className="font-mono text-xs text-ink-500 font-bold">{currentLot.id}</span>
                        <h4 className="font-bold text-base text-ink-900 mt-1">एग्रीगेटर से कोटेशन की प्रतीक्षा है...</h4>
                        <p className="text-xs text-ink-500 mt-1">
                          यह लॉट रियल-टाइम में &apos;Wadi Scrap Aggregators&apos; के डैशबोर्ड पर पहुँच चुका है।
                        </p>
                      </div>

                      <div className="p-3 bg-ink-50 rounded-2xl text-xs space-y-1 text-left">
                        <p className="text-ink-700">सामग्री: <strong>{currentLot.material}</strong></p>
                        <p className="text-ink-700">वजन: <strong>{currentLot.weight_kg} kg</strong></p>
                        <p className="text-ink-700">अनुमानित दर: <strong>₹{currentLot.ratePerKg}/kg</strong></p>
                      </div>

                      <button
                        onClick={() => acceptQuote(currentLot.id)}
                        className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                      >
                        (डेमो) एग्रीगेटर का आधिकारिक ऑफर स्वीकार करें &rarr;
                      </button>
                    </div>
                  ) : currentLot.status === "OFFER_ACCEPTED" ? (
                    <div className="text-center p-5 bg-white border border-leaf-600/40 rounded-3xl space-y-4 shadow-sm">
                      <h4 className="font-extrabold text-sm text-ink-900">माल का डिजिटल हैंडओवर (Dual QR Handshake)</h4>
                      <p className="text-xs text-ink-500">खरीदार की दुकान पर यह QR कोड स्कैन कराएं</p>

                      <div className="p-3 bg-white inline-block rounded-2xl shadow-md border-2 border-leaf-600">
                        <QRCodeSVG
                          value={`https://mines.gov.in/handover?lot=${currentLot.id}&payout=${currentLot.totalPayout}&hash=${currentLot.hash}`}
                          size={160}
                        />
                      </div>

                      <p className="font-mono text-xs text-leaf-700 font-bold">सौदा संख्या: {currentLot.id}</p>
                      <p className="text-xl font-extrabold text-leaf-600 font-mono">₹{currentLot.totalPayout}</p>

                      <button
                        onClick={() => completeHandover(currentLot.id)}
                        className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition"
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
                        <p className="text-[10px] font-mono text-ink-500">{currentLot.id}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-ink-400 text-[10px]">विक्रेता:</span>
                          <p className="font-bold text-ink-900">{currentLot.collector}</p>
                        </div>
                        <div>
                          <span className="text-ink-400 text-[10px]">खरीदार:</span>
                          <p className="font-bold text-ink-900">{currentLot.buyerName}</p>
                        </div>
                        <div>
                          <span className="text-ink-400 text-[10px]">कुल भुगतान:</span>
                          <p className="font-extrabold text-leaf-600 text-sm">₹{currentLot.totalPayout}</p>
                        </div>
                        <div>
                          <span className="text-ink-400 text-[10px]">भुगतान माध्यम:</span>
                          <p className="font-bold text-ink-900">नकद / DBT Transfer</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() =>
                            speak(
                              `रसीद संख्या ${currentLot.id}. कुल भुगतान ${currentLot.totalPayout} रुपये रमेश कुमार को दिया गया.`
                            )
                          }
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

          {/* TAB 4: EARNINGS BREAKDOWN */}
          {activeTab === "earnings" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-white border border-ink-100 rounded-2xl text-center shadow-2xs">
                <p className="text-[10px] text-ink-500 uppercase font-semibold">इस महीने की कुल कमाई</p>
                <p className="text-3xl font-extrabold text-leaf-600 font-mono mt-1">₹14,560</p>
                <p className="text-xs text-leaf-700 font-semibold mt-1">
                  पारंपरिक कबाड़ी से <strong>+₹6,012 अधिक</strong> लाभ मिला!
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink-900">सामग्री अनुसार कमाई:</h4>
                <div className="p-3 bg-white border border-ink-100 rounded-xl flex justify-between text-xs">
                  <span className="text-ink-700">सर्किट बोर्ड (PCBs)</span>
                  <span className="font-mono font-bold text-ink-900">₹8,640 (59%)</span>
                </div>
                <div className="p-3 bg-white border border-ink-100 rounded-xl flex justify-between text-xs">
                  <span className="text-ink-700">तांबा तार (Copper Cable)</span>
                  <span className="font-mono font-bold text-ink-900">₹4,800 (33%)</span>
                </div>
                <div className="p-3 bg-white border border-ink-100 rounded-xl flex justify-between text-xs">
                  <span className="text-ink-700">बैटरी व मोटर</span>
                  <span className="font-mono font-bold text-ink-900">₹1,120 (8%)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY RULES & AUDIO */}
          {activeTab === "safety" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-gold-50 border border-gold-100 rounded-2xl text-xs text-gold-700 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-gold-600 shrink-0" />
                <span>ई-कचरे से जहरीले रसायनों और आग से बचने के बुनियादी सुरक्षा नियम</span>
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
                  <div
                    key={idx}
                    className="p-3 bg-white border border-ink-100 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                  >
                    <span className="text-ink-700">{idx + 1}. {rule}</span>
                    <button onClick={() => speak(rule)} className="text-leaf-700 hover:text-leaf-800 ml-2">
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
                    className="flex-1 py-2 bg-leaf-600 hover:bg-leaf-700 text-xs font-semibold rounded-xl text-white shadow-xs"
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

        {/* Chain of Custody Dialog */}
        {showCustodyDialog && (
          <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                  <p className="text-ink-500">Ramesh Kumar &bull; Verified Doorstep Deposit</p>
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

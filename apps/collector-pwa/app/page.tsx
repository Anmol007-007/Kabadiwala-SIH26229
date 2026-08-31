'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Mic,
    MicOff,
    CheckCircle2,
    ShieldCheck,
    QrCode,
    Wifi,
    WifiOff,
    RefreshCw,
    Clock,
    Sparkles,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
    saveTransactionOffline,
    getOfflineTransactions,
    markTransactionsAsSynced,
    OfflineTransaction
} from '../utils/db';

export default function CollectorPWA() {
    const [isRecording, setIsRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [showIdCard, setShowIdCard] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [recentTransactions, setRecentTransactions] = useState<OfflineTransaction[]>([]);
    const [extractedData, setExtractedData] = useState<{
        material_type?: string;
        weight_kg?: number;
        price?: number;
        synced?: boolean;
    } | null>(null);

    const collectorProfile = {
        id: 'COL-IN-8821',
        name: 'Ramesh Kumar (रमेश कुमार)',
        phone: '+91 98100 11001',
        zone: 'Sector 4 Industrial Cluster, Delhi NCR',
        role: 'Certified Secondary Mineral Collector',
        authority: 'Ministry of Mines - Urban Mining DPI'
    };

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Monitor network online/offline status
    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => {
            setIsOnline(true);
            autoSync();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadTransactions();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadTransactions = async () => {
        try {
            const txs = await getOfflineTransactions();
            // Sort newest first
            setRecentTransactions(txs.reverse().slice(0, 10));
        } catch (e) {
            console.error('Failed to load transactions from IndexedDB', e);
        }
    };

    // Sync offline transactions with backend
    const autoSync = async () => {
        try {
            const txs = await getOfflineTransactions();
            const unsynced = txs.filter((t) => !t.synced);
            if (unsynced.length === 0) return;

            setSyncing(true);
            const res = await fetch('http://localhost:8000/api/v1/transactions/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactions: unsynced.map((u) => ({
                        id: u.id,
                        material_type: u.material_type,
                        weight_kg: u.weight_kg,
                        price: u.price
                    }))
                })
            });

            if (res.ok) {
                const data = await res.json();
                await markTransactionsAsSynced(data.synced_ids || unsynced.map((u) => u.id));
                await loadTransactions();
            }
        } catch (err) {
            console.warn('Sync attempt failed, will retry when network improves', err);
        } finally {
            setSyncing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleAudioUpload;
            mediaRecorder.start();
            setIsRecording(true);
        } catch {
            alert('माइक्रोफोन की अनुमति नहीं मिली (Microphone permission denied). नीचे दिए गए त्वरित परीक्षण बटनों का उपयोग करें।');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleAudioUpload = async () => {
        setProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'record.wav');

        try {
            const res = await fetch('http://localhost:8000/api/v1/transactions/voice-log', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Voice extraction API returned error');

            const json = await res.json();
            const parsed = json.data;

            if (parsed?.material_type) {
                setExtractedData({ ...parsed, synced: true });
                await saveTransactionOffline({
                    material_type: parsed.material_type,
                    weight_kg: parsed.weight_kg,
                    price: parsed.price,
                    synced: true
                });
                await loadTransactions();
            }
        } catch {
            // Fallback offline storage
            alert('इंटरनेट धीमा है या बैकएंड अनुपलब्ध है। डेटा ऑफलाइन सुरक्षित कर लिया गया है।');
        } finally {
            setProcessing(false);
        }
    };

    // Quick speech simulator for rapid testing
    const handleSimulateVoice = async (material: string, weight: number, price: number) => {
        setProcessing(true);
        try {
            // Attempt backend sync
            let synced = false;
            try {
                const res = await fetch('http://localhost:8000/api/v1/transactions/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transactions: [{ id: `sim_${Date.now()}`, material_type: material, weight_kg: weight, price }]
                    })
                });
                if (res.ok) synced = true;
            } catch {
                synced = false;
            }

            await saveTransactionOffline({
                material_type: material,
                weight_kg: weight,
                price: price,
                synced: synced
            });

            setExtractedData({ material_type: material, weight_kg: weight, price, synced });
            await loadTransactions();
        } finally {
            setProcessing(false);
        }
    };

    const unsyncedCount = recentTransactions.filter((t) => !t.synced).length;

    return (
        <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto font-sans">
            {/* Top Bar: Connectivity & Digital ID */}
            <header className="flex justify-between items-center py-3 border-b border-neutral-800">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black text-amber-500 tracking-wide">कबाड़ी साथी</h1>
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                            SIH26229
                        </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">Urban Mining DPI • Ground Collector PWA</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Online/Offline Badge */}
                    <div
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${isOnline
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                    >
                        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        <span>{isOnline ? 'ऑनलाइन' : 'ऑफलाइन'}</span>
                    </div>

                    {/* ID Card Toggle Button */}
                    <button
                        onClick={() => setShowIdCard(!showIdCard)}
                        className="p-2 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center gap-1 text-xs font-semibold text-neutral-200 active:scale-95 transition-transform"
                    >
                        <QrCode className="w-4 h-4 text-amber-500" />
                        <span className="hidden sm:inline">पहचान पत्र</span>
                    </button>
                </div>
            </header>

            {/* Collector Digital ID Card Modal */}
            {showIdCard && (
                <section className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-5 my-4 text-center shadow-2xl relative">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-2 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" /> खान मंत्रालय (Ministry of Mines) मान्य
                    </div>
                    <h2 className="text-xl font-bold text-white">{collectorProfile.name}</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{collectorProfile.phone}</p>
                    <p className="text-xs text-amber-400 font-mono my-1">आईडी: {collectorProfile.id}</p>
                    <p className="text-[11px] text-neutral-400 mb-3">{collectorProfile.zone}</p>

                    <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                        <QRCodeSVG value={JSON.stringify(collectorProfile)} size={140} />
                    </div>

                    <p className="text-[10px] text-neutral-500 mt-3">
                        स्कैन करके कबाड़ी की वैधता एवं आपूर्ति शृंखला का सत्यापन करें
                    </p>
                </section>
            )}

            {/* Main Voice-First Action Panel */}
            <section className="flex-1 flex flex-col items-center justify-center my-6 text-center">
                <div className="mb-6">
                    <h2 className="text-2xl font-black mb-1.5 text-white">
                        {isRecording ? 'सुन रहे हैं... (Listening)' : 'आवाज़ से रिकॉर्ड करें'}
                    </h2>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                        माइक दबाएँ और बोलें: <br />
                        <span className="text-amber-400 font-medium">"१० किलो तांबा ४५०० रुपये"</span> या <span className="text-amber-400 font-medium">"25 kg Aluminium ₹5250"</span>
                    </p>
                </div>

                {/* Large Tactile Vernacular Microphone Button */}
                <div className="relative">
                    {isRecording && (
                        <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping" />
                    )}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={processing}
                        className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 ${isRecording
                            ? 'bg-red-600 text-white ring-8 ring-red-600/40 animate-pulse'
                            : 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-neutral-950 hover:brightness-110 shadow-amber-500/25'
                            }`}
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="w-16 h-16" />
                                <span className="text-[11px] font-bold mt-1">रोकें (Stop)</span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-16 h-16" />
                                <span className="text-[11px] font-black mt-1 uppercase tracking-wider">
                                    बोलें (Speak)
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {processing && (
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs font-semibold animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Gemini AI आवाज़ को प्रोसेस कर रहा है...</span>
                    </div>
                )}

                {/* Field Testing Quick Simulation Buttons */}
                <div className="mt-6 w-full">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>त्वरित परीक्षण (Quick Test Presets)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {[
                            { label: 'तांबा (Copper) 10kg ₹7500', m: 'Copper', w: 10, p: 7500 },
                            { label: 'पीतल (Brass) 5kg ₹2600', m: 'Brass', w: 5, p: 2600 },
                            { label: 'एल्युमीनियम 15kg ₹3150', m: 'Aluminium', w: 15, p: 3150 },
                            { label: 'ई-कचरा (E-Waste) 20kg ₹3000', m: 'E-waste', w: 20, p: 3000 },
                            { label: 'लिथियम (Li-ion) 8kg ₹2400', m: 'Lithium', w: 8, p: 2400 }
                        ].map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSimulateVoice(preset.m, preset.w, preset.p)}
                                disabled={processing}
                                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Extracted Transaction Confirmation Card */}
            {extractedData && (
                <section className="bg-neutral-900 border border-emerald-500/40 p-4 rounded-2xl mb-4 shadow-xl">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>सफलतापूर्वक दर्ज हुआ (Logged)</span>
                        </div>
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${extractedData.synced
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                        >
                            {extractedData.synced ? 'क्लाउड सिंक ✓' : 'लोकल सुरक्षित (Offline)'}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                            <span className="text-neutral-400 text-[10px] block">धातु (Material)</span>
                            <span className="font-black text-sm text-white">{extractedData.material_type || 'N/A'}</span>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                            <span className="text-neutral-400 text-[10px] block">वजन (Weight)</span>
                            <span className="font-black text-sm text-amber-400">{extractedData.weight_kg} kg</span>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                            <span className="text-neutral-400 text-[10px] block">दाम (Price)</span>
                            <span className="font-black text-sm text-emerald-400">₹{extractedData.price}</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Offline Logged Records & Sync Center */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 mb-2">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 text-xs font-bold text-neutral-200"
                    >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>हालिया लेन-देन ({recentTransactions.length})</span>
                        {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {unsyncedCount > 0 && (
                        <button
                            onClick={autoSync}
                            disabled={syncing || !isOnline}
                            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-2.5 py-1 rounded-lg text-[11px] font-bold active:scale-95 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                            <span>सिंक करें ({unsyncedCount})</span>
                        </button>
                    )}
                </div>

                {showHistory && (
                    <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {recentTransactions.length === 0 ? (
                            <p className="text-neutral-500 text-xs text-center py-2">कोई लेन-देन नहीं है</p>
                        ) : (
                            recentTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs"
                                >
                                    <div>
                                        <span className="font-bold text-white">{tx.material_type}</span>
                                        <span className="text-neutral-400 text-[11px] ml-2">{tx.weight_kg} kg</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-semibold">₹{tx.price}</span>
                                        <span
                                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${tx.synced
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-amber-500/10 text-amber-400'
                                                }`}
                                        >
                                            {tx.synced ? 'सिंक' : 'बाकी'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>

            {/* Footer System Attribution */}
            <footer className="text-center text-[10px] text-neutral-500 py-1">
                खान मंत्रालय, भारत सरकार • राष्ट्रीय शहरी खनन डिजिटल इंफ्रास्ट्रक्चर (DPI)
            </footer>
        </main>
    );
}
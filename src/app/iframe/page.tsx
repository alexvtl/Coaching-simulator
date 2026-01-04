"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Phone, PhoneOff, Loader2, AlertCircle, Waves, Volume2, Camera, VideoOff, MicOff } from "lucide-react";
import { prepareIframeSession, type IframeSessionConfig } from "./actions";
import type { VoiceId } from "@/types";

type SessionStatus = "loading" | "ready" | "connecting" | "connected" | "error" | "ended";

interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface IframeClientProps {
    scenarioId: string;
    mode: string;
    refSessionId?: string;
    model: string;
}

function IframeClient({ scenarioId, mode, refSessionId, model }: IframeClientProps) {
    const [status, setStatus] = useState<SessionStatus>("loading");
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<IframeSessionConfig | null>(null);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

    // WebRTC refs
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Conversation tracking
    const conversationRef = useRef<ConversationMessage[]>([]);
    const processedEventIds = useRef<Set<string>>(new Set());
    const sessionDurationRef = useRef<number>(0);
    const initCalledRef = useRef(false);

    // Initialize on mount - with guard to prevent double init (React Strict Mode)
    // Initialize on mount - prepare config (NO session created yet)
    useEffect(() => {
        if (initCalledRef.current) return;
        initCalledRef.current = true;

        async function init() {
            const result = await prepareIframeSession({
                scenarioId,
                mode,
                refSessionId,
                model,
            });

            if (result.success && result.data) {
                setConfig(result.data);
                setStatus("ready");
            } else {
                setError(result.error || "Failed to initialize");
                setStatus("error");
            }
        }
        init();
    }, [scenarioId, mode, refSessionId, model]);

    const cleanup = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (audioElementRef.current) {
            audioElementRef.current.srcObject = null;
        }
        setIsAiSpeaking(false);
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    // Add message to ref (no DB save - done at the end)
    const addMessageToRef = useCallback((role: "user" | "assistant", content: string, eventId?: string) => {
        if (!content?.trim()) return;
        if (eventId && processedEventIds.current.has(eventId)) return;
        if (eventId) processedEventIds.current.add(eventId);

        const trimmedContent = content.trim();
        const lastMessage = conversationRef.current[conversationRef.current.length - 1];
        if (lastMessage && lastMessage.role === role && lastMessage.content === trimmedContent) return;

        conversationRef.current.push({
            role,
            content: trimmedContent,
            timestamp: new Date().toISOString(),
        });

        console.log(`💬 ${role === "user" ? "👤 User" : "🤖 AI"}: ${trimmedContent.substring(0, 50)}...`);
    }, []);

    const handleRealtimeEvent = useCallback((event: { type: string;[key: string]: unknown }) => {
        const eventId = (event as { event_id?: string }).event_id;

        switch (event.type) {
            case "conversation.item.input_audio_transcription.completed": {
                const transcript = (event as { transcript?: string }).transcript;
                if (transcript) addMessageToRef("user", transcript, eventId);
                break;
            }
            case "response.audio_transcript.done": {
                const transcript = (event as { transcript?: string }).transcript;
                if (transcript) addMessageToRef("assistant", transcript, eventId);
                break;
            }
            case "response.audio.delta":
                setIsAiSpeaking(true);
                break;
            case "response.audio.done":
            case "response.done":
                setIsAiSpeaking(false);
                break;
            case "error":
                setError(String((event as { error?: { message?: string } }).error?.message) || "Error");
                break;
        }
    }, [addMessageToRef]);

    const startSession = async () => {
        if (!config) return;

        try {
            setStatus("connecting");
            setError(null);
            conversationRef.current = [];
            processedEventIds.current.clear();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });
            localStreamRef.current = stream;

            // Get ephemeral key with custom instructions
            console.log("📜 System Instructions (Iframe):", config.systemInstructions);
            const response = await fetch("/api/realtime-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instructions: config.systemInstructions,
                    voice: config.voiceId as VoiceId,
                    model: config.model,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get session token");
            }

            const { data } = await response.json();
            const ephemeralKey = data.client_secret.value;

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });
            peerConnectionRef.current = pc;

            const audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            audioElementRef.current = audioEl;

            pc.ontrack = (event) => {
                audioEl.srcObject = event.streams[0];
            };

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const dataChannel = pc.createDataChannel("oai-events");
            dataChannelRef.current = dataChannel;

            dataChannel.onopen = () => {
                // Trigger AI to start
                const initialMessage = {
                    type: "conversation.item.create",
                    item: {
                        type: "message",
                        role: "user",
                        content: [{
                            type: "input_text",
                            text: config.mode === "coach"
                                ? "Bonjour Coach, je viens de terminer ma session de coaching et j'aimerais avoir ton feedback."
                                : "La simulation commence. Mets-toi directement dans ton personnage et commence la scène. Joue ton rôle immédiatement."
                        }]
                    }
                };
                dataChannel.send(JSON.stringify(initialMessage));
                dataChannel.send(JSON.stringify({ type: "response.create" }));
            };

            dataChannel.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleRealtimeEvent(message);
                } catch (e) {
                    console.error("Failed to parse message:", e);
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const sdpResponse = await fetch(
                `https://api.openai.com/v1/realtime?model=${config.model}`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${ephemeralKey}`,
                        "Content-Type": "application/sdp",
                    },
                    body: offer.sdp,
                }
            );

            if (!sdpResponse.ok) throw new Error(`Failed to connect: ${sdpResponse.status}`);

            const answerSdp = await sdpResponse.text();
            await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === "connected") {
                    setStatus("connected");
                    durationIntervalRef.current = setInterval(() => {
                        sessionDurationRef.current += 1;
                        setSessionDuration(prev => prev + 1);
                    }, 1000);
                } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
                    endSession();
                }
            };

        } catch (err) {
            console.error("Session error:", err);
            setError(err instanceof Error ? err.message : "Failed to start session");
            setStatus("error");
            cleanup();
        }
    };

    const endSession = async () => {
        const finalConversation = [...conversationRef.current];
        const finalDuration = sessionDurationRef.current;

        cleanup();
        setStatus("ended");

        // Save session to DB at the end (like VoiceSession)
        if (config && finalConversation.length > 0) {
            try {
                const response = await fetch("/api/save-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scenario_id: config.scenarioId,
                        duration_seconds: finalDuration,
                        messages: finalConversation,
                    }),
                });

                const result = await response.json();
                if (result.success) {
                    setSavedSessionId(result.session_id);
                    console.log("✅ Session saved:", result.session_id, `(${finalConversation.length} messages, ${finalDuration}s)`);
                } else {
                    console.error("Failed to save session:", result.error);
                }
            } catch (err) {
                console.error("Failed to save session:", err);
            }
        } else {
            console.log("⏭️ No conversation to save");
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Sound wave animation
    const SoundWave = () => (
        <div className="flex items-center justify-center gap-1 h-20">
            {[...Array(5)].map((_, i) => (
                <span
                    key={i}
                    className="w-1.5 bg-white rounded-full animate-pulse"
                    style={{
                        height: `${Math.random() * 40 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "0.5s",
                    }}
                />
            ))}
        </div>
    );

    // Loading state
    if (status === "loading" || !config) {
        return (
            <div className="h-screen w-full bg-[#E8EEFF] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    // Error state
    if (status === "error") {
        return (
            <div className="h-screen w-full bg-[#E8EEFF] flex flex-col items-center justify-center gap-4 p-6">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <p className="text-red-500 text-center max-w-md">{error}</p>
            </div>
        );
    }

    // Ended state
    if (status === "ended") {
        return (
            <div className="h-screen w-full bg-[#E8EEFF] flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <span className="text-5xl text-white">✓</span>
                </div>
                <div className="text-center">
                    <p className="text-gray-900 text-2xl font-bold mb-2">Appel terminé</p>
                    <p className="text-gray-500 text-lg">Durée : {formatDuration(sessionDuration)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full bg-[#E8EEFF] flex items-center justify-center overflow-hidden font-sans">

            {/* Top Left: Persona Badge */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-[#333C4E] text-white px-4 py-3 rounded-lg shadow-lg">
                <Volume2 className="w-5 h-5 text-gray-300" />
                <span className="font-medium text-lg">{config.personaName}</span>
            </div>

            {/* Ready State - Call Card Overlay */}
            {status === "ready" && (
                <div className="relative z-30 bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center text-center max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">

                    {/* Green Phone Icon */}
                    <div className="mb-6">
                        <Phone className="w-16 h-16 text-green-500 fill-current" />
                    </div>

                    <h2 className="text-3xl text-gray-900 font-medium mb-2">Appel sortant</h2>

                    <div className="text-gray-500 text-lg mb-1">
                        {config.personaName.split(' ')[0]}
                    </div>
                    <div className="text-gray-900 text-2xl font-bold uppercase mb-8">
                        {config.personaName.split(' ').slice(1).join(' ') || config.personaName.split(' ')[0]}
                    </div>

                    <button
                        onClick={startSession}
                        className="w-full bg-[#00D64F] hover:bg-[#00c046] text-white text-xl font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-500/20 mb-6"
                    >
                        <Phone className="w-6 h-6 fill-current" />
                        Démarrer la conversation
                    </button>

                    <p className="text-gray-400 text-sm">
                        Préparez-vous, la conversation démarrera immédiatement
                    </p>
                </div>
            )}

            {/* Connected State - Avatar & Controls */}
            {(status === "connecting" || status === "connected") && (
                <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-500">

                    {/* Central Avatar */}
                    <div className="relative">
                        {/* Pulse Effect */}
                        {isAiSpeaking && (
                            <div className="absolute inset-0 rounded-full border-4 border-blue-400/30 animate-ping scale-110"></div>
                        )}
                        <div className={`w-64 h-64 rounded-full border-[6px] transition-colors duration-300 overflow-hidden shadow-2xl ${isAiSpeaking ? 'border-[#8B9CFF]' : 'border-white'}`}>
                            {/* Placeholder Avatar Image - Using a generic professional one if none provided */}
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256"
                                alt={config.personaName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {status === "connecting" && (
                        <div className="mt-8 flex items-center gap-3 text-gray-500 bg-white/50 px-6 py-2 rounded-full backdrop-blur-sm">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Connexion en cours...</span>
                        </div>
                    )}

                    {status === "connected" && (
                        <div className="mt-8 flex flex-col items-center gap-6">
                            {/* Timer */}
                            <div className="text-gray-400 text-xl font-mono tabular-nums bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm">
                                {formatDuration(sessionDuration)}
                            </div>

                            {/* Hangup Button */}
                            <button
                                onClick={endSession}
                                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-lg shadow-red-500/30"
                            >
                                <PhoneOff className="w-8 h-8 fill-current" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Right: User Video Preview */}
            <div className="absolute bottom-6 right-6 z-20 w-64 h-48 bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-gray-800">
                {/* User Camera Badge */}
                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-2 py-1 rounded flex items-center gap-2">
                    <Camera className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-medium">Vous</span>
                </div>

                {/* Camera Off Icon */}
                <div className="relative">
                    <VideoOff className="w-12 h-12 text-gray-600" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-[#0F172A]"></div>
                </div>

                {/* Mute Indicator */}
                <div className="absolute bottom-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <MicOff className="w-4 h-4 text-white" />
                </div>
            </div>

            {/* Background Blur Overlay for Ready State */}
            {status === "ready" && (
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] z-20 pointer-events-none" />
            )}
        </div>
    );
}

// Main page component
export default function IframePage({
    searchParams,
}: {
    searchParams: Promise<{ scenario_id?: string; mode?: string; ref_session_id?: string; model?: string }>;
}) {
    const [params, setParams] = useState<{
        scenarioId?: string;
        mode: string;
        refSessionId?: string;
        model: string;
    } | null>(null);

    useEffect(() => {
        searchParams.then((p) => {
            setParams({
                scenarioId: p.scenario_id,
                mode: p.mode || "standard",
                refSessionId: p.ref_session_id,
                model: p.model || "gpt-4o-mini-realtime-preview",
            });
        });
    }, [searchParams]);

    if (!params) {
        return (
            <div className="h-screen w-full bg-[#E8EEFF] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!params.scenarioId) {
        return (
            <div className="h-screen w-full bg-[#E8EEFF] flex flex-col items-center justify-center gap-4 p-6">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <p className="text-red-500 text-center">Paramètre manquant : scenario_id</p>
                <code className="text-xs text-gray-500 bg-white px-3 py-2 rounded border border-gray-200">
                    ?scenario_id=UUID&mode=coach&ref_session_id=UUID
                </code>
            </div>
        );
    }

    return <IframeClient {...params} scenarioId={params.scenarioId} />;
}

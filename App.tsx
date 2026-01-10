import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  FunctionCall,
} from '@google/genai';
import Sidebar from './components/Sidebar';
import LiveIntakePanel from './components/LiveIntakePanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import CaseHistoryPanel from './components/CaseHistoryPanel';
import StatusBar from './components/StatusBar';
import { FullPageLoader } from './components/LoadingIndicator';

import {
  CallState,
  ClientInfo,
  Transcription,
  LawyerReport,
  LiveSessionPromise,
  BrandingConfig,
  CRMExportStatus,
  CRMIntegrationsState,
  ReceptionistSettings
} from './types';
import {
  getSystemInstruction,
  updateClientInfoDeclaration,
  updateCaseDetailsDeclaration,
  requestDocumentsDeclaration,
  flagCaseAsUrgentDeclaration,
  bookAppointmentDeclaration,
  sendFollowUpEmailDeclaration,
  decode,
  decodeAudioData,
  encode,
  generateLawyerReport,
  generateFollowUpActions
} from './services/geminiService';

const DEFAULT_SETTINGS: ReceptionistSettings = {
    aiName: 'Sarah',
    firmName: 'Ted Law Firm',
    tone: 'Professional and Empathetic',
    languageStyle: 'calm, clear, and natural human voice',
    responseDelay: 0,
    openingLine: "Hi thank you for calling Ted Law Firm. My name is Sarah, may I ask who is calling today?",
    urgencyKeywords: ['court date', 'deadline', 'statute of limitations', 'served papers', 'arrested', 'police'],
    voiceName: 'Kore',
    firmBio: "We are a boutique law firm specializing in Personal Injury and Family Law. Located at 100 Legal Way, New York, NY."
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({});
  const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgencyReason, setUrgencyReason] = useState('');

  // Settings State
  const [settings, setSettings] = useState<ReceptionistSettings>(() => {
      try {
          const saved = localStorage.getItem('receptionistSettings');
          return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
      } catch (e) {
          return DEFAULT_SETTINGS;
      }
  });

  // Refs
  const liveSessionRef = useRef<LiveSessionPromise | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mixedAudioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  useEffect(() => {
      localStorage.setItem('receptionistSettings', JSON.stringify(settings));
  }, [settings]);

  const stateRef = useRef({
      callState,
      clientInfo,
      transcriptionHistory,
      currentInputTranscription,
      currentOutputTranscription,
      isUrgent,
      urgencyReason,
      settings
  });

  useEffect(() => {
    stateRef.current = {
      callState,
      clientInfo,
      transcriptionHistory,
      currentInputTranscription,
      currentOutputTranscription,
      isUrgent,
      urgencyReason,
      settings
    };
  }, [callState, clientInfo, transcriptionHistory, currentInputTranscription, currentOutputTranscription, isUrgent, urgencyReason, settings]);

  const cleanup = useCallback(() => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }

    liveSessionRef.current?.then(session => session.close()).catch(console.error);
    liveSessionRef.current = null;
    
    micStreamRef.current?.getTracks().forEach(track => track.stop());
    micStreamRef.current = null;

    if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
    }

    inputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    mixedAudioDestinationRef.current = null;
    
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextAudioStartTimeRef.current = 0;
  }, []);

  const handleToolCall = useCallback((fc: FunctionCall) => {
    console.log("Handling tool call:", fc.name, fc.args);
    const result = "ok";

    switch (fc.name) {
      case 'update_client_info':
        setClientInfo(prev => ({ ...prev, ...fc.args }));
        break;
      case 'update_case_details':
        setClientInfo(prev => ({ ...prev, caseDetails: (fc.args as any).summary }));
        break;
      case 'request_documents':
        setClientInfo(prev => ({ ...prev, requestedDocuments: (fc.args as any).documents }));
        break;
      case 'flag_case_as_urgent':
        setIsUrgent(true);
        setUrgencyReason((fc.args as any).reason);
        break;
      case 'book_appointment':
        setClientInfo(prev => ({ ...prev, appointment: (fc.args as any).dateTime }));
        break;
      case 'send_follow_up_email':
        break;
      default:
        console.warn("Unknown function call:", fc.name);
    }

    liveSessionRef.current?.then(session => {
        session.sendToolResponse({
            functionResponses: {
                id: fc.id,
                name: fc.name,
                response: { result },
            }
        });
    });
  }, []);

  const startCall = useCallback(async () => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      setErrorMessage("API Key Configuration Error: Please set VITE_API_KEY in your Vercel environment variables.");
      setCallState(CallState.ERROR);
      return;
    }

    if (!navigator.onLine) {
        setErrorMessage("Network Error");
        setCallState(CallState.ERROR);
        return;
    }

    setCallState(CallState.CONNECTING);
    setErrorMessage(null);
    setClientInfo({});
    setTranscriptionHistory([]);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    setIsUrgent(false);
    setUrgencyReason('');
    audioChunksRef.current = [];

    try {
      const ai = new GoogleGenAI({ apiKey });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputAudioContext;
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputAudioContext;

      // --- Audio Recording Setup ---
      const mixedDest = outputAudioContext.createMediaStreamDestination();
      mixedAudioDestinationRef.current = mixedDest;

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      } catch (err: any) {
        setErrorMessage("Microphone Error");
        setCallState(CallState.ERROR);
        cleanup();
        return;
      }

      // Connect Mic to Recorder (via output context to mix)
      const micSourceForRecord = outputAudioContext.createMediaStreamSource(stream);
      micSourceForRecord.connect(mixedDest);

      const recorder = new MediaRecorder(mixedDest.stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
          }
      };
      recorder.start();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log("Session opened.");
            setCallState(CallState.ACTIVE);
            setTimeout(() => {
                sessionPromise.then(session => {
                    const silentFrame = new Int16Array(1600);
                    const pcmBlob = {
                        data: encode(new Uint8Array(silentFrame.buffer)),
                        mimeType: 'audio/pcm;rate=16000',
                    };
                    session.sendRealtimeInput({ media: pcmBlob });
                }).catch(e => console.error("Failed to send initial silent frame:", e));
            }, 800);

            // --- Worklet Setup ---
            const audioProcessorCode = `
              class AudioProcessor extends AudioWorkletProcessor {
                process(inputs, outputs, parameters) {
                  const input = inputs[0];
                  const channel = input[0];
                  if (!channel) return true;
                  const int16 = new Int16Array(channel.length);
                  for (let i = 0; i < channel.length; i++) {
                    int16[i] = channel[i] * 32768;
                  }
                  this.port.postMessage(int16, [int16.buffer]);
                  return true;
                }
              }
              registerProcessor('audio-processor', AudioProcessor);
            `;
            const blob = new Blob([audioProcessorCode], { type: 'application/javascript' });
            const workletURL = URL.createObjectURL(blob);

            try {
              await inputAudioContext.audioWorklet.addModule(workletURL);
            } catch (e) {
              setErrorMessage("Audio Engine Error");
              setCallState(CallState.ERROR);
              cleanup();
              return;
            } finally {
              URL.revokeObjectURL(workletURL);
            }
            
            const micSource = inputAudioContext.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(inputAudioContext, 'audio-processor');
            audioWorkletNodeRef.current = workletNode;

            workletNode.port.onmessage = (event) => {
              try {
                if (!event.data || !event.data.buffer) {
                  console.warn('[DEBUG] Received invalid audio data from worklet');
                  return;
                }
                const pcmBlob = {
                  data: encode(new Uint8Array(event.data.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                sessionPromise.then((session) => {
                   if (session && typeof session.sendRealtimeInput === 'function') {
                     session.sendRealtimeInput({ media: pcmBlob });
                   }
                }).catch((err) => {
                  console.error('[DEBUG] Error sending audio to session:', err);
                });
              } catch (error) {
                console.error('[DEBUG] Error processing worklet message:', error);
              }
            };

            workletNode.port.onerror = (error) => {
              console.error('[DEBUG] AudioWorklet error:', error);
            };

            micSource.connect(workletNode);
            workletNode.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Use unstable_batchedUpdates to batch multiple state updates
            // This prevents excessive re-renders from rapid transcription updates
            if (message.serverContent?.outputTranscription) {
              setCurrentOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            } else if (message.serverContent?.inputTranscription) {
              setCurrentInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
                const { currentInputTranscription: finalInput, currentOutputTranscription: finalOutput } = stateRef.current;
                setTranscriptionHistory(prev => {
                    const newHistory = [...prev];
                    if (finalInput) newHistory.push({ speaker: 'user', text: finalInput });
                    if (finalOutput) newHistory.push({ speaker: 'ai', text: finalOutput });
                    return newHistory;
                });
                setCurrentInputTranscription('');
                setCurrentOutputTranscription('');
            }

            if (message.toolCall?.functionCalls) {
              message.toolCall.functionCalls.forEach(handleToolCall);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const audioContext = outputAudioContextRef.current;
              
              if (stateRef.current.settings.responseDelay > 0) {
                 const now = audioContext.currentTime;
                 if (nextAudioStartTimeRef.current < now) {
                     nextAudioStartTimeRef.current = now + (stateRef.current.settings.responseDelay / 1000);
                 }
              }

              nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, audioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
               if (audioBuffer.length > 0) {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                if (mixedAudioDestinationRef.current) {
                    source.connect(mixedAudioDestinationRef.current);
                }

                source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                source.start(nextAudioStartTimeRef.current);
                nextAudioStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
              }
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextAudioStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("Gemini Live API Error:", e);
            setErrorMessage("Connection Error");
            setCallState(CallState.ERROR);
            cleanup();
          },
          onclose: (e: CloseEvent) => {
            if (stateRef.current.callState === CallState.ACTIVE) {
                 setErrorMessage(`Session Ended`);
                 setCallState(CallState.ERROR);
            } else if (stateRef.current.callState !== CallState.PROCESSING) {
                setCallState(CallState.ENDED);
            }
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voiceName } } },
          systemInstruction: getSystemInstruction(settings),
          tools: [{ functionDeclarations: [ updateClientInfoDeclaration, updateCaseDetailsDeclaration, requestDocumentsDeclaration, flagCaseAsUrgentDeclaration, bookAppointmentDeclaration, sendFollowUpEmailDeclaration ] }],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      liveSessionRef.current = sessionPromise;

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Startup Error: ${message}`);
      setCallState(CallState.ERROR);
      cleanup();
    }
  }, [cleanup, handleToolCall, settings]);

  const endCall = useCallback(async () => {
    if (stateRef.current.callState === CallState.PROCESSING || stateRef.current.callState === CallState.ENDED) return;
    setCallState(CallState.ENDED);
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden">
        {/* Loading Overlay */}
        {(callState === CallState.CONNECTING || callState === CallState.PROCESSING) && (
          <FullPageLoader
            message={callState === CallState.CONNECTING ? 'Connecting to Gemini Live API...' : 'Generating Report...'}
          />
        )}

        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area - Conditional Rendering Based on Active Tab */}
        <main className="flex-1 flex flex-col p-8 overflow-hidden relative">

            {/* Dashboard View - Default */}
            {activeTab === 'dashboard' && (
                <div className="flex-1 grid grid-cols-12 gap-8 h-full">
                    {/* Left Column: Live Intake */}
                    <div className="col-span-7 h-full flex flex-col gap-6">
                        {errorMessage && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {errorMessage}
                                <button onClick={() => setErrorMessage(null)} className="ml-auto hover:text-white">✕</button>
                            </div>
                        )}
                        <div className="flex-1">
                            <LiveIntakePanel
                                callState={callState}
                                startCall={startCall}
                                endCall={endCall}
                                transcriptHistory={transcriptionHistory}
                                currentInput={currentInputTranscription}
                                currentOutput={currentOutputTranscription}
                            />
                        </div>
                    </div>
                    {/* Right Column: Analytics & Case History */}
                    <div className="col-span-5 h-full flex flex-col gap-8">
                        <div className="h-[45%]">
                            <AnalyticsPanel />
                        </div>
                        <div className="flex-1">
                            <CaseHistoryPanel currentClient={clientInfo} />
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Full View */}
            {activeTab === 'analytics' && (
                <div className="flex flex-col gap-6 w-full">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Performance</h1>
                        <p className="text-gray-400">Real-time metrics and performance analytics</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <AnalyticsPanel />
                    </div>
                </div>
            )}

            {/* Case History Full View */}
            {activeTab === 'history' && (
                <div className="flex flex-col gap-6 w-full">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Case History</h1>
                        <p className="text-gray-400">Complete record of all client intakes and cases</p>
                    </div>
                    <div className="flex-1">
                        <CaseHistoryPanel currentClient={clientInfo} />
                    </div>
                </div>
            )}

            {/* Compliance View */}
            {activeTab === 'compliance' && (
                <div className="flex flex-col gap-6 w-full">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Compliance & Documentation</h1>
                        <p className="text-gray-400">HIPAA compliance, audit logs, and documentation</p>
                    </div>
                    <div className="bg-[#1E2128] border border-[#2D3139] rounded-lg p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-lg bg-[#00FFA3]/10 border border-[#00FFA3] flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#00FFA3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">HIPAA Compliance</h2>
                                <p className="text-sm text-gray-400">✓ Fully Compliant</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
                                <span className="text-gray-300">Data Encryption</span>
                                <span className="text-[#00FFA3] font-semibold">AES-256</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
                                <span className="text-gray-300">Authentication</span>
                                <span className="text-[#00FFA3] font-semibold">OAuth 2.0</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
                                <span className="text-gray-300">Audit Logging</span>
                                <span className="text-[#00FFA3] font-semibold">Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings View - NOW EDITABLE */}
            {activeTab === 'settings' && (
                <div className="flex flex-col gap-6 w-full overflow-y-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Settings & Configuration</h1>
                        <p className="text-gray-400">Configure AI personality, integrations, and preferences</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                        {/* AI Personality Settings */}
                        <div className="bg-[#1E2128] border border-[#2D3139] rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-4">AI Personality</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">AI Name</label>
                                    <input
                                        type="text"
                                        value={settings.aiName}
                                        onChange={(e) => setSettings({...settings, aiName: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                        placeholder="Enter AI name"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Voice Tone</label>
                                    <select
                                        value={settings.tone}
                                        onChange={(e) => setSettings({...settings, tone: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                    >
                                        <option value="Professional">Professional</option>
                                        <option value="Friendly">Friendly</option>
                                        <option value="Formal">Formal</option>
                                        <option value="Conversational">Conversational</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Voice Name</label>
                                    <select
                                        value={settings.voiceName}
                                        onChange={(e) => setSettings({...settings, voiceName: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                    >
                                        <option value="Kore">Kore</option>
                                        <option value="Aoede">Aoede</option>
                                        <option value="Charon">Charon</option>
                                        <option value="Fenrir">Fenrir</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Response Delay (ms)</label>
                                    <input
                                        type="number"
                                        value={settings.responseDelay}
                                        onChange={(e) => setSettings({...settings, responseDelay: parseInt(e.target.value) || 0})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                        placeholder="e.g., 500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Firm Information Settings */}
                        <div className="bg-[#1E2128] border border-[#2D3139] rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Firm Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Firm Name</label>
                                    <input
                                        type="text"
                                        value={settings.firmName}
                                        onChange={(e) => setSettings({...settings, firmName: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                        placeholder="Enter firm name"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Firm Bio</label>
                                    <textarea
                                        value={settings.firmBio}
                                        onChange={(e) => setSettings({...settings, firmBio: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm h-24 focus:border-[#00FFA3] focus:outline-none transition resize-none"
                                        placeholder="Enter firm bio/description"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Practice Areas</label>
                                    <input
                                        type="text"
                                        value={settings.practiceAreas}
                                        onChange={(e) => setSettings({...settings, practiceAreas: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                        placeholder="e.g., Corporate, Family, IP Law"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="bg-[#1E2128] border border-[#2D3139] rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Advanced Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Language</label>
                                    <select
                                        value={settings.language || 'en'}
                                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Timezone</label>
                                    <input
                                        type="text"
                                        value={settings.timezone || 'UTC'}
                                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                        placeholder="e.g., EST, PST"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="recordCalls"
                                        checked={settings.recordCalls || false}
                                        onChange={(e) => setSettings({...settings, recordCalls: e.target.checked})}
                                        className="w-4 h-4 rounded border-[#2D3139] bg-[#0F1115] text-[#00FFA3] cursor-pointer"
                                    />
                                    <label htmlFor="recordCalls" className="text-sm text-gray-400 cursor-pointer">
                                        Enable Call Recording
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Integration Settings */}
                        <div className="bg-[#1E2128] border border-[#2D3139] rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Integrations</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Default CRM</label>
                                    <select
                                        value={settings.defaultCRM || 'none'}
                                        onChange={(e) => setSettings({...settings, defaultCRM: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                    >
                                        <option value="none">None</option>
                                        <option value="clio">Clio</option>
                                        <option value="mycase">MyCase</option>
                                        <option value="lawmatics">Lawmatics</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Email Service</label>
                                    <select
                                        value={settings.emailService || 'none'}
                                        onChange={(e) => setSettings({...settings, emailService: e.target.value})}
                                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm focus:border-[#00FFA3] focus:outline-none transition"
                                    >
                                        <option value="none">None</option>
                                        <option value="gmail">Gmail</option>
                                        <option value="office365">Office 365</option>
                                        <option value="smtp">Custom SMTP</option>
                                    </select>
                              <input type="text" value={settings.firmName} className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm" readOnly />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Firm Bio</label>
                                    <textarea value={settings.firmBio} className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-white text-sm h-20" readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Status Bar - Only on Dashboard */}
            {activeTab === 'dashboard' && <StatusBar />}
        </main>
    </div>
  );
};

export default App;
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
import CompliancePanel from './components/CompliancePanel';
import WorkflowPanel from './components/WorkflowPanel';
import SettingsPanel from './components/SettingsPanel';
import StatusBar from './components/StatusBar';
import { FullPageLoader } from './components/LoadingIndicator';
import ConsentModal, { ConsentData } from './components/ConsentModal';
import AIDisclaimerBanner from './components/AIDisclaimerBanner';
import ThemeProvider from './components/ThemeProvider';
import LoginPage from './components/LoginPage';
import { initSentry, captureException, setUser } from './lib/sentry';
import { getCurrentUser, logout, type User } from './lib/auth';

// Initialize Sentry for error tracking
initSentry();

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
import { marked } from 'marked';
import { logger } from './utils/logger';
import { validateEmail, validatePhone, validateName } from './utils/validators';
import { validateEmail as validateEmailForm, validatePhone as validatePhoneForm } from './utils/formValidation';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentIcon,
  ChatIcon,
  ShieldIcon,
  AlertIcon,
  DownloadIcon,
  CheckIcon,
  RefreshIcon,
  SettingsIcon,
} from './utils/icons';
import {
  AppError,
  MicrophonePermissionError,
  MicrophoneNotFoundError,
  MicrophoneNotReadableError,
  AudioContextError,
  APIError,
  ErrorCode,
  getUserFriendlyMessage
} from './types/errors';

const availableVoices = {
  'Kore': 'Kore (Professional, Clear)',
  'Puck': 'Puck (Warm, Engaging)',
  'Charon': 'Charon (Deep, Authoritative)',
  'Fenrir': 'Fenrir (Calm, Reassuring)',
  'Zephyr': 'Zephyr (Friendly, Bright)',
};

const crmIntegrations = {
    clio: { name: 'Clio', logo: 'https://images.ctfassets.net/5d820s2s4c2v/513522325/687352378a5e8006456a099d363b9842/Clio-white.svg' },
    myCase: { name: 'MyCase', logo: 'https://www.mycase.com/wp-content/uploads/2021/05/mycase-logo-white.svg' },
    lawmatics: { name: 'Lawmatics', logo: 'https://lawmatics.com/wp-content/uploads/2023/10/LM_Logo_White_Horizontal.svg' },
};

const DEFAULT_SETTINGS: ReceptionistSettings = {
    aiName: 'Sarah',
    firmName: 'Ted Law Firm',
    tone: 'Professional and Empathetic',
    languageStyle: 'calm, clear, and natural human voice',
    responseDelay: 0,
    openingLine: "Hi thank you for calling Ted Law Firm. My name is Sarah, may I ask who is calling today?",
    urgencyKeywords: ['court date', 'deadline', 'statute of limitations', 'served papers', 'arrested', 'police'],
    voiceName: 'Kore',
    firmBio: "We are a boutique law firm specializing in Personal Injury and Family Law. Located at 100 Legal Way, New York, NY.",
    // Extended defaults
    hipaaMode: false,
    legalDisclaimer: true,
    auditLogging: true,
    callRecording: false,
    emailNotifications: true,
    smsNotifications: false,
    language: 'en',
    timezone: 'America/New_York',
    apiKeyConfigured: true,
};

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [requireAuth, setRequireAuth] = useState(() => {
    // Check if auth is required (can be configured per tenant)
    const authRequired = localStorage.getItem('requireAuth');
    return authRequired === 'true';
  });

  // Check for existing session on mount
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Set user context in Sentry
        setUser({ id: user.id, email: user.email, tenantId: user.tenantId });
      }
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  // Handle login
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    setUser({ id: user.id, email: user.email, tenantId: user.tenantId });
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    await logout();
    setCurrentUser(null);
    setUser(undefined);
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({});
  const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgencyReason, setUrgencyReason] = useState('');

  // Consent State
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentData, setConsentData] = useState<ConsentData | null>(() => {
    try {
      const saved = localStorage.getItem('intakeConsent');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if consent was given within the last 24 hours
        const consentTime = new Date(parsed.disclaimerAcceptedAt).getTime();
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (now - consentTime < twentyFourHours) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [showDisclaimerExpanded, setShowDisclaimerExpanded] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<ReceptionistSettings>(() => {
      try {
          const saved = localStorage.getItem('receptionistSettings');
          return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
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

  // Handle consent acceptance
  const handleConsentAccept = useCallback((consent: ConsentData) => {
    setConsentData(consent);
    localStorage.setItem('intakeConsent', JSON.stringify(consent));
    setShowConsentModal(false);
  }, []);

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

  const initiateCrmExport = useCallback((crmName: keyof CRMIntegrationsState) => {
      setPendingCrm(crmName);
      setShowCrmModal(true);
  }, []);

  const confirmCrmExport = useCallback(() => {
    if (!pendingCrm) return;

    // Validate client data before export
    if (!lawyerReport?.clientDetails) {
      setErrorMessage('Cannot export: Missing client details');
      setShowCrmModal(false);
      logger.error('CRM export attempted with missing client details', undefined, 'crm');
      return;
    }

    const { name, email, phone } = lawyerReport.clientDetails;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      setErrorMessage('Cannot export: Client name is required');
      setShowCrmModal(false);
      logger.warn('CRM export validation failed for name', 'Missing name', 'crm');
      return;
    }

    const emailValidation = validateEmailForm(email || '');
    const phoneValidation = validatePhoneForm(phone || '');

    if (!emailValidation.isValid) {
      setErrorMessage(`Cannot export: ${emailValidation.error}`);
      setShowCrmModal(false);
      logger.warn('CRM export validation failed for email', emailValidation.error, 'crm');
      return;
    }

    if (!phoneValidation.isValid) {
      setErrorMessage(`Cannot export: ${phoneValidation.error}`);
      setShowCrmModal(false);
      logger.warn('CRM export validation failed for phone', phoneValidation.error, 'crm');
      return;
    }

    const crmName = pendingCrm;
    setShowCrmModal(false);
    setCrmExportStatus(prev => ({ ...prev, [crmName]: CRMExportStatus.EXPORTING }));

    logger.info(`Starting CRM export to ${crmName}`, { clientName: name }, 'crm');

    // Simulate API call
    setTimeout(() => {
      setCrmExportStatus(prev => ({ ...prev, [crmName]: CRMExportStatus.SUCCESS }));
      setErrorMessage(null);
      logger.info(`Successfully exported to ${crmName}`, undefined, 'crm');
    }, 1500);
  }, [pendingCrm, lawyerReport]);

  const clearCrmLogs = useCallback(() => {
      setCrmExportStatus({
        clio: CRMExportStatus.IDLE,
        myCase: CRMExportStatus.IDLE,
        lawmatics: CRMExportStatus.IDLE,
      });
  }, []);

  const toggleAction = (index: number) => {
      setCompletedActions(prev => ({
          ...prev,
          [index]: !prev[index]
      }));
  };

  const startCallInternal = useCallback(async () => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      setErrorMessage("API Key Configuration Error: Please set VITE_API_KEY in your Vercel environment variables.");
      setCallState(CallState.ERROR);
      logger.error('API Key not found in environment variables', undefined, 'auth');
      return;
    }

    if (!navigator.onLine) {
        setErrorMessage("Network Error");
        setCallState(CallState.ERROR);
        return;
    }

    setCallState(CallState.CONNECTING);
    setErrorMessage(null);
    // Initialize client info with consent data (jurisdiction, contact preferences)
    setClientInfo({
      jurisdiction: consentData?.jurisdictionState || undefined,
      smsOptIn: consentData?.smsOptIn || false,
      emailOptIn: consentData?.emailOptIn || true,
    });
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

  // Wrapper function that checks for consent before starting
  const startCall = useCallback(async () => {
    if (!consentData) {
      setShowConsentModal(true);
      return;
    }
    await startCallInternal();
  }, [consentData, startCallInternal]);

  // Effect to start call after consent is given (when modal was shown from start button)
  useEffect(() => {
    if (consentData && showConsentModal === false && callState === CallState.IDLE) {
      // Consent was just given, check if we should auto-start
      // Only auto-start if the consent was just given (within last second)
      const consentTime = new Date(consentData.disclaimerAcceptedAt).getTime();
      const now = Date.now();
      if (now - consentTime < 1000) {
        startCallInternal();
      }
    }
  }, [consentData, showConsentModal, callState, startCallInternal]);

  const endCall = useCallback(async () => {
    if (stateRef.current.callState === CallState.PROCESSING || stateRef.current.callState === CallState.ENDED) return;
    setCallState(CallState.ENDED);
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <ThemeProvider settings={settings}>
        <div className="flex items-center justify-center h-screen w-full bg-[#050505]">
          <div className="flex flex-col items-center gap-4">
            <svg className="w-12 h-12 animate-spin" style={{ color: 'var(--primary-accent, #00FFC8)' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[#6B7280]">Loading...</span>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#2D3139] flex justify-end">
               <button 
                  onClick={() => setActiveTab('LIVE_INTAKE')} 
                  className="bg-[#00FFA3] hover:bg-[#00D88A] text-black font-bold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                   Save & Return to Dashboard
               </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Loading Overlay */}
      {(callState === CallState.CONNECTING || callState === CallState.PROCESSING) && (
          <FullPageLoader
            message={callState === CallState.CONNECTING ? 'Connecting to Gemini Live API...' : 'Generating Report...'}
          />
      )}

      {/* Error Banner */}
      {errorMessage && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-8 py-3 flex items-center justify-between animate-fade-in-down sticky top-0 z-50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                  <AlertIcon />
                  <span className="text-sm font-medium text-red-200">{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white transition-colors">
                  <span className="text-xs font-bold uppercase">Dismiss</span>
              </button>
          </div>
      )}

      {/* Header */}
      <header className="bg-[#0F1115] border-b border-[#2D3139] h-20 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
             <img src={brandingConfig.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
             <div className="flex flex-col">
                 <h1 className="text-xl font-bold tracking-tight text-white leading-none">TED LAW FIRM</h1>
                 <span className="text-[10px] font-bold tracking-[0.2em] text-[#00FFA3] mt-1">AI LEGAL RECEPTIONIST</span>
             </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show login page if auth is required and user is not logged in
  if (requireAuth && !currentUser) {
    return (
      <ThemeProvider settings={settings}>
        <LoginPage
          onLogin={handleLogin}
          branding={{
            firmName: settings.firmName,
            logoUrl: settings.brandLogoUrl,
            primaryColor: settings.brandPrimaryColor,
          }}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider settings={settings}>
    <div className="flex flex-col h-screen w-full bg-[#050505] text-white overflow-hidden">
        {/* AI Disclaimer Banner - Always Visible */}
        <AIDisclaimerBanner
          firmName={settings.firmName}
          primaryColor={settings.brandPrimaryColor || '#00FFC8'}
          variant="full"
          onLearnMore={() => setShowDisclaimerExpanded(true)}
        />

        {/* Main Content Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Loading Overlay */}
          {(callState === CallState.CONNECTING || callState === CallState.PROCESSING) && (
            <FullPageLoader
              message={callState === CallState.CONNECTING ? 'Connecting to Gemini Live API...' : 'Generating Report...'}
            />
          )}

          {/* Consent Modal */}
          {showConsentModal && (
            <ConsentModal
              onAccept={handleConsentAccept}
              firmName={settings.firmName}
              primaryColor={settings.brandPrimaryColor || '#00FFC8'}
            />
          )}

          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={currentUser}
            onLogout={handleLogout}
            settings={settings}
          />

        {/* Main Content Area - Conditional Rendering Based on Active Tab */}
        <main className="flex-1 flex flex-col p-8 overflow-hidden relative">

            {/* Dashboard View - Default */}
            {activeTab === 'dashboard' && (
                <div className="flex-1 grid grid-cols-12 gap-8 h-full">
                    {/* Left Column: Live Intake */}
                    <div className="col-span-7 h-full flex flex-col gap-6">
                        {errorMessage && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
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
                            <CaseHistoryPanel currentClient={clientInfo} onNavigate={setActiveTab} />
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Full View */}
            {activeTab === 'analytics' && (
                <AnalyticsPanel fullPage={true} />
            )}

            {/* Case History Full View */}
            {activeTab === 'history' && (
                <CaseHistoryPanel currentClient={clientInfo} fullPage={true} />
            )}

            {/* Workflow View */}
            {activeTab === 'workflow' && (
                <WorkflowPanel />
            )}

            {/* Compliance View */}
            {activeTab === 'compliance' && (
                <CompliancePanel />
            )}

            {/* Settings View */}
            {activeTab === 'settings' && (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Settings & Configuration</h1>
                        <p className="text-lg text-gray-400">Configure AI personality, integrations, and preferences</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <SettingsPanel settings={settings} setSettings={setSettings} />
                    </div>
                </div>
            )}

            {/* Bottom Status Bar - Only on Dashboard */}
            {activeTab === 'dashboard' && <StatusBar />}
        </main>
        </div>
    </div>
    </ThemeProvider>
  );
};

export default App;

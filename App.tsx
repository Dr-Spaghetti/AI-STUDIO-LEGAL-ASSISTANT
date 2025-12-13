import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  FunctionCall,
} from '@google/genai';
import CallControl from './components/CallControl';
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

// --- SVG Icons ---
interface IconProps { className?: string; }
const UserIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const MailIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const CalendarIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const DocumentIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
const ChatIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-gray-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ShieldIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-3 w-3 mr-1"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" /></svg>;
const AlertIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 text-red-400"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const DownloadIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CheckIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const RefreshIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-3 w-3"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const SettingsIcon = ({ className }: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

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
  const [activeTab, setActiveTab] = useState('LIVE_INTAKE');
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({});
  const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgencyReason, setUrgencyReason] = useState('');
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    firmName: 'Ted Law Firm',
    logoUrl: 'https://i.ibb.co/L6V2L1j/ted-law-logo-2.png',
    primaryColor: '#00FFA3',
  });
  const [crmExportStatus, setCrmExportStatus] = useState<CRMIntegrationsState>({
    clio: CRMExportStatus.IDLE,
    myCase: CRMExportStatus.IDLE,
    lawmatics: CRMExportStatus.IDLE,
  });

  // Settings State
  const [settings, setSettings] = useState<ReceptionistSettings>(() => {
      try {
          const saved = localStorage.getItem('receptionistSettings');
          return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
      } catch (e) {
          return DEFAULT_SETTINGS;
      }
  });

  // Persisted State
  const [lawyerReport, setLawyerReport] = useState<LawyerReport | null>(() => {
    try {
        const saved = localStorage.getItem('lawyerReport');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
  });
  
  const [followUpActions, setFollowUpActions] = useState<string>(() => {
      return localStorage.getItem('followUpActions') || '';
  });

  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('completedActions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Recording State
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  // CRM Modal State
  const [showCrmModal, setShowCrmModal] = useState(false);
  const [pendingCrm, setPendingCrm] = useState<keyof CRMIntegrationsState | null>(null);

  // Refs
  const liveSessionRef = useRef<LiveSessionPromise | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionContainerRef = useRef<HTMLDivElement>(null);
  
  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mixedAudioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Persistence Effects
  useEffect(() => {
    if (lawyerReport) {
        localStorage.setItem('lawyerReport', JSON.stringify(lawyerReport));
    } else {
        localStorage.removeItem('lawyerReport');
    }
  }, [lawyerReport]);

  useEffect(() => {
      if (followUpActions) {
          localStorage.setItem('followUpActions', followUpActions);
      } else {
          localStorage.removeItem('followUpActions');
      }
  }, [followUpActions]);

  useEffect(() => {
    localStorage.setItem('completedActions', JSON.stringify(completedActions));
  }, [completedActions]);

  useEffect(() => {
      localStorage.setItem('receptionistSettings', JSON.stringify(settings));
  }, [settings]);

  // Scroll to bottom of transcription
  useEffect(() => {
    if (transcriptionContainerRef.current) {
        transcriptionContainerRef.current.scrollTop = transcriptionContainerRef.current.scrollHeight;
    }
  }, [transcriptionHistory, currentInputTranscription, currentOutputTranscription]);

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
    
    const crmName = pendingCrm;
    setShowCrmModal(false);
    setCrmExportStatus(prev => ({ ...prev, [crmName]: CRMExportStatus.EXPORTING }));
    
    // Simulate API call
    setTimeout(() => {
      setCrmExportStatus(prev => ({ ...prev, [crmName]: CRMExportStatus.SUCCESS }));
    }, 1500);
  }, [pendingCrm]);

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

  const startCall = useCallback(async () => {
    if (!process.env.API_KEY) {
      setErrorMessage("API Key Configuration Error: Please check your environment variables.");
      setCallState(CallState.ERROR);
      return;
    }

    if (!navigator.onLine) {
        setErrorMessage("Network Error: No internet connection detected.");
        setCallState(CallState.ERROR);
        return;
    }
    
    setCallState(CallState.CONNECTING);
    setErrorMessage(null);
    setLawyerReport(null);
    setFollowUpActions('');
    setCompletedActions({});
    
    setClientInfo({});
    setTranscriptionHistory([]);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    setIsUrgent(false);
    setUrgencyReason('');
    setRecordingUrl(null);
    setCrmExportStatus({
        clio: CRMExportStatus.IDLE,
        myCase: CRMExportStatus.IDLE,
        lawmatics: CRMExportStatus.IDLE,
    });
    audioChunksRef.current = [];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        let errorMsg = "Microphone Access Error";
        let detailedMsg = "Please check your browser settings.";
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             errorMsg = "Microphone Access Denied";
             detailedMsg = "Please allow microphone access in your browser address bar to proceed.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
             errorMsg = "Microphone Not Found";
             detailedMsg = "No audio input device detected. Please check your system settings.";
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
             errorMsg = "Microphone Unreadable";
             detailedMsg = "Your microphone might be in use by another application.";
        }
        
        setErrorMessage(`${errorMsg}: ${detailedMsg}`);
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
              setErrorMessage("Audio Engine Error: Failed to initialize audio processor. Please check that your browser supports AudioWorklet.");
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
              const pcmBlob = {
                data: encode(new Uint8Array(event.data.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                 session.sendRealtimeInput({ media: pcmBlob });
              }).catch(console.error);
            };
            
            micSource.connect(workletNode);
            workletNode.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
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
            const isInitial = stateRef.current.callState === CallState.CONNECTING;
            const msg = isInitial 
                ? "Failed to connect to AI Service. Please check your network connection and try again."
                : "Connection to AI Service lost. Please restart the session.";
            
            setErrorMessage(msg);
            setCallState(CallState.ERROR);
            cleanup();
          },
          onclose: (e: CloseEvent) => {
            if (stateRef.current.callState === CallState.ACTIVE) {
                 const reason = e.reason ? ` Reason: ${e.reason}` : "";
                 setErrorMessage(`Session Ended Unexpectedly: The connection was closed.${reason} (Code: ${e.code})`);
                 setCallState(CallState.ERROR);
            } else if (stateRef.current.callState !== CallState.PROCESSING) {
                setCallState(CallState.ENDED);
            }
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Use settings.voiceName here
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
    
    // Stop Recorder & Prepare Download
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.requestData();
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
    }

    setCallState(CallState.PROCESSING);
    cleanup();

    const { clientInfo, transcriptionHistory, currentInputTranscription, currentOutputTranscription, isUrgent, urgencyReason } = stateRef.current;
    
    const fullTranscript = transcriptionHistory
      .concat( currentInputTranscription ? [{speaker: 'user', text: currentInputTranscription}] : [])
      .concat( currentOutputTranscription ? [{speaker: 'ai', text: currentOutputTranscription}] : [])
      .map(t => `${t.speaker === 'user' ? 'Client' : 'Sarah'}: ${t.text}`)
      .join('\n');

    if (!fullTranscript || Object.keys(clientInfo).length < 2) {
        setErrorMessage("Report Error: Insufficient data gathered during the call. Please ensure the conversation is captured.");
        setCallState(CallState.ENDED);
        return;
    }

    try {
        const report = await generateLawyerReport(clientInfo, fullTranscript, isUrgent, urgencyReason);
        setLawyerReport(report);
        try {
            const actionsResponse = await generateFollowUpActions(report);
            setFollowUpActions(actionsResponse.text);
        } catch (actionError) {
             setErrorMessage("Action Generation Warning: Could not generate follow-up checklist, but the main report is saved.");
        }
    } catch (error) {
        let msg = "Report Generation Error: An unexpected error occurred.";
        if (error instanceof Error) {
            if (error.message.includes('429')) msg = "Service Busy: Too many requests. Please try again later.";
            else if (error.message.includes('503')) msg = "Service Unavailable: The AI service is currently down.";
            else if (error.message.includes('API key')) msg = "Configuration Error: Invalid API Key.";
            else msg = `Report Error: ${error.message}`;
        }
        setErrorMessage(msg);
    } finally {
        setCallState(CallState.ENDED);
    }
  }, [cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // --- Sub-Components ---

  const IntakeField = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
    <div className="relative group">
        <label className="text-[11px] font-medium text-gray-500 uppercase mb-1 block">{label}</label>
        <div className={`
            flex items-center gap-3 bg-[#ffffff05] border border-[#2D3139] rounded-lg p-3.5 
            group-hover:border-[#00FFA3] transition-all duration-200 group-hover:shadow-[0_0_10px_rgba(0,255,163,0.1)]
        `}>
            <Icon className="w-5 h-5 text-gray-500 group-hover:text-[#00FFA3] transition-colors" />
            <div className="flex-1 text-sm font-medium text-white truncate">
                {value || <span className="text-gray-600">---</span>}
            </div>
        </div>
    </div>
  );

  const SettingsPanel = () => (
      <div className="col-span-1 lg:col-span-9 bg-[#1E2128] border border-[#2D3139] rounded-2xl p-8 shadow-xl overflow-y-auto">
          <div className="flex items-center gap-3 mb-8 border-b border-[#2D3139] pb-4">
              <div className="bg-[#00FFA3]/10 p-2 rounded-lg">
                <SettingsIcon />
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">RECEPTIONIST CONFIGURATION</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Identity Section */}
              <div className="space-y-6">
                  <h3 className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider mb-2">AI Persona</h3>
                  
                  <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Assistant Name</label>
                      <input 
                        type="text" 
                        value={settings.aiName}
                        onChange={e => setSettings({...settings, aiName: e.target.value})}
                        className="w-full bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm focus:border-[#00FFA3] outline-none transition-colors"
                      />
                  </div>

                  <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Voice & Tone</label>
                      <div className="grid grid-cols-2 gap-3">
                          <select 
                             value={settings.tone}
                             onChange={e => setSettings({...settings, tone: e.target.value})}
                             className="bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm outline-none"
                          >
                              <option value="Professional and Empathetic">Professional & Empathetic</option>
                              <option value="Strict and Formal">Strict & Formal</option>
                              <option value="Casual and Friendly">Casual & Friendly</option>
                              <option value="Urgent and Direct">Urgent & Direct</option>
                          </select>
                           <select 
                             value={settings.voiceName}
                             onChange={e => setSettings({...settings, voiceName: e.target.value})}
                             className="bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm outline-none"
                          >
                             {Object.entries(availableVoices).map(([key, name]) => (
                                <option key={key} value={key}>{name}</option>
                             ))}
                          </select>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Speech Pace & Style</label>
                       <select 
                            value={settings.languageStyle}
                            onChange={e => setSettings({...settings, languageStyle: e.target.value})}
                            className="w-full bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm outline-none"
                        >
                            <option value="calm, clear, and natural human voice">Calm & Natural</option>
                            <option value="slow and deliberate pace">Slow & Deliberate</option>
                            <option value="fast and efficient pace">Fast & Efficient</option>
                        </select>
                  </div>

                  <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Thinking Delay (Response Time)</label>
                      <div className="flex items-center gap-4 bg-[#16181D] border border-[#2D3139] rounded-lg p-3">
                           <input 
                             type="range" 
                             min="0" 
                             max="2000" 
                             step="100" 
                             value={settings.responseDelay} 
                             onChange={e => setSettings({...settings, responseDelay: parseInt(e.target.value)})}
                             className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00FFA3]"
                           />
                           <span className="text-xs font-mono text-[#00FFA3] w-12 text-right">{(settings.responseDelay / 1000).toFixed(1)}s</span>
                      </div>
                  </div>
              </div>

              {/* Script Section */}
              <div className="space-y-6">
                   <h3 className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider mb-2">Script & Knowledge</h3>
                   
                   <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Opening Greeting Script</label>
                      <textarea 
                        rows={3}
                        value={settings.openingLine}
                        onChange={e => setSettings({...settings, openingLine: e.target.value})}
                        className="w-full bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm focus:border-[#00FFA3] outline-none transition-colors resize-none"
                      />
                  </div>

                  <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Firm Knowledge Base (Bio & Services)</label>
                      <textarea 
                        rows={4}
                        value={settings.firmBio}
                        onChange={e => setSettings({...settings, firmBio: e.target.value})}
                        placeholder="We specialize in..."
                        className="w-full bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm focus:border-[#00FFA3] outline-none transition-colors resize-none"
                      />
                  </div>

                  <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Urgency Triggers (Keywords)</label>
                      <textarea 
                        rows={2}
                        value={settings.urgencyKeywords.join(', ')}
                        onChange={e => setSettings({...settings, urgencyKeywords: e.target.value.split(',').map(s => s.trim())})}
                        placeholder="court date, deadline, police..."
                        className="w-full bg-[#16181D] border border-[#2D3139] rounded-lg p-3 text-white text-sm focus:border-[#00FFA3] outline-none transition-colors resize-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Separate keywords with commas. These trigger the 'High Urgency' flag.</p>
                  </div>
              </div>
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
        
        <nav className="hidden lg:flex items-center gap-1 bg-[#1A1C20] p-1 rounded-lg border border-[#2D3139]">
            {['LIVE_INTAKE', 'SETTINGS'].map((tab) => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === tab ? 'bg-[#00FFA3] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    {tab.replace('_', ' ')}
                </button>
            ))}
        </nav>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:overflow-hidden lg:max-h-[calc(100vh-80px)] h-auto pb-24 lg:pb-8">
        
        {activeTab === 'SETTINGS' ? (
             <>
                <div className="hidden lg:block lg:col-span-3">
                   {/* Placeholder for Left Nav if needed in settings, currently just keeping layout grid */}
                   <div className="bg-[#1E2128] border border-[#2D3139] rounded-2xl p-6 h-full opacity-50 flex items-center justify-center">
                       <p className="text-xs text-gray-500 font-medium uppercase tracking-widest text-center">Settings Mode Active</p>
                   </div>
                </div>
                <SettingsPanel />
             </>
        ) : (
            <>
            {/* Left Column: Controls & Intake Form */}
            <div className="lg:col-span-3 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2">
                <CallControl 
                    callState={callState}
                    startCall={startCall}
                    endCall={endCall}
                    errorMessage={null} // Handled by global banner
                    selectedVoice={settings.voiceName} // Use settings voice
                    onVoiceChange={(v) => setSettings(prev => ({...prev, voiceName: v}))} // Sync directly
                    availableVoices={availableVoices}
                />

                {/* Client Intake Card */}
                <div className="bg-[#1E2128] border border-[#2D3139] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#2D3139] pb-4">
                        <div className="flex items-center gap-2">
                            <UserIcon />
                            <h3 className="text-base font-semibold text-white">CLIENT PROFILE</h3>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#00FFA3]/10 rounded-md border border-[#00FFA3]/20">
                            <ShieldIcon />
                            <span className="text-[10px] font-bold text-[#00FFA3] tracking-wide">HIPAA SECURE</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <IntakeField icon={UserIcon} label="Full Name" value={clientInfo.name} />
                        <IntakeField icon={MailIcon} label="Email Address" value={clientInfo.email} />
                        <IntakeField icon={PhoneIcon} label="Phone Number" value={clientInfo.phone} />
                        <IntakeField icon={CalendarIcon} label="Appointment" value={clientInfo.appointment ? new Date(clientInfo.appointment).toLocaleString() : undefined} />
                        
                        <div className="relative group">
                            <label className="text-[11px] font-medium text-gray-500 uppercase mb-1 block">Live Case Notes</label>
                            <div className="bg-[#ffffff05] border border-[#2D3139] rounded-lg p-3.5 min-h-[80px] text-sm text-gray-300">
                                {clientInfo.caseDetails || <span className="text-gray-600 italic">Listening for details...</span>}
                            </div>
                        </div>

                        {clientInfo.requestedDocuments && clientInfo.requestedDocuments.length > 0 && (
                            <div className="relative group">
                                <label className="text-[11px] font-medium text-gray-500 uppercase mb-1 block">Requested Docs</label>
                                <ul className="bg-[#ffffff05] border border-[#2D3139] rounded-lg p-3.5 space-y-1">
                                    {clientInfo.requestedDocuments.map((doc, i) => (
                                        <li key={i} className="text-sm text-[#00FFA3] flex items-center gap-2">
                                            <DocumentIcon /> {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    {isUrgent && (
                        <div className="mt-2 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex gap-3 animate-pulse">
                            <AlertIcon />
                            <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Urgent Priority</p>
                                <p className="text-xs text-red-300 mt-1">{urgencyReason}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Center Column: Transcript */}
            <div className="lg:col-span-5 flex flex-col bg-[#16181D] border border-[#2D3139] rounded-2xl overflow-hidden shadow-2xl h-[600px] lg:h-auto relative">
                <div className="h-14 border-b border-[#2D3139] bg-[#1E2128] px-6 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">LIVE TRANSCRIPT</h2>
                        <p className="text-[10px] text-gray-500 font-medium">REAL-TIME CONVERSATION LOG</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {recordingUrl && (
                            <a 
                            href={recordingUrl} 
                            download={`recording-${Date.now()}.webm`}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 border border-[#00FFA3]/30 rounded-full transition-all group"
                            >
                                <DownloadIcon />
                                <span className="text-[10px] font-bold text-[#00FFA3] uppercase tracking-wide group-hover:text-[#00FFA3]">Download Recording</span>
                            </a>
                        )}
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${callState === CallState.ACTIVE ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
                            <span className="text-[10px] text-gray-400 font-mono">REC</span>
                        </div>
                    </div>
                </div>
                
                <div ref={transcriptionContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    {transcriptionHistory.length === 0 && !currentInputTranscription && !currentOutputTranscription && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <ChatIcon />
                            <p className="mt-4 text-sm font-medium">Start a session to view transcript</p>
                        </div>
                    )}
                    
                    {transcriptionHistory.map((t, i) => (
                        <div key={i} className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                                ${t.speaker === 'user' 
                                    ? 'bg-[#2D3139] text-gray-200 rounded-tr-none border-l-2 border-transparent' 
                                    : 'bg-[#1E2128] text-white rounded-tl-none border-l-2 border-[#00FFA3]'
                                }
                            `}>
                                <p>{t.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* Real-time Streaming Bubbles */}
                    {currentInputTranscription && (
                        <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-2xl rounded-tr-none p-4 text-sm leading-relaxed bg-[#2D3139]/70 text-gray-300 border-l-2 border-transparent animate-pulse">
                                <p>{currentInputTranscription} <span className="inline-block w-1 h-3 bg-gray-400 ml-1 animate-bounce"></span></p>
                            </div>
                        </div>
                    )}
                    {currentOutputTranscription && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed bg-[#1E2128]/70 text-gray-200 border-l-2 border-[#00FFA3]/50 animate-pulse">
                                <p>{currentOutputTranscription} <span className="inline-block w-1 h-3 bg-[#00FFA3] ml-1 animate-bounce"></span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Reports & Actions */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto">
                
                {/* Read-Only Case Report */}
                <div className={`bg-[#1E2128] border border-[#2D3139] rounded-2xl overflow-hidden shadow-xl transition-opacity duration-500 ${lawyerReport ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                    <div className="bg-[#16181D] px-6 py-4 border-b border-[#2D3139] flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white tracking-wide">LEGAL REPORT</h2>
                        {lawyerReport?.urgencyLevel && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                lawyerReport.urgencyLevel === 'High' ? 'bg-red-500 text-white' : 
                                lawyerReport.urgencyLevel === 'Medium' ? 'bg-yellow-500 text-black' : 
                                'bg-green-500 text-black'
                            }`}>
                                {lawyerReport.urgencyLevel}
                            </span>
                        )}
                    </div>

                    <div className="p-6 space-y-6">
                        {!lawyerReport ? (
                            <div className="flex flex-col items-center justify-center text-gray-600 py-10">
                                <p className="text-xs uppercase tracking-widest font-semibold">Report Pending</p>
                            </div>
                        ) : (
                            <>
                                {/* Read-Only Client Details */}
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Client</label>
                                    <div className="text-sm text-white font-medium bg-[#16181D] border border-[#2D3139] rounded px-3 py-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[#00FFA3]">{lawyerReport.clientDetails.name}</span>
                                            <span className="text-gray-500 text-xs">{lawyerReport.clientDetails.phone}</span>
                                        </div>
                                        <div className="text-gray-400 text-xs border-t border-[#2D3139] pt-1">
                                            {lawyerReport.clientDetails.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Case Summary */}
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Case Summary</label>
                                    <div className="text-sm text-gray-300 leading-relaxed bg-[#16181D] border border-[#2D3139] rounded px-3 py-2 max-h-32 overflow-y-auto">
                                        {lawyerReport.caseSummary}
                                    </div>
                                </div>

                                {/* Assessment */}
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="text-[10px] font-bold text-[#00FFA3] uppercase">Initial Assessment</label>
                                    <div className="text-sm text-gray-300 prose prose-invert prose-p:my-1 prose-strong:text-white bg-[#16181D] border-l-2 border-[#00FFA3] rounded-r px-3 py-2 text-xs" dangerouslySetInnerHTML={{ __html: marked.parse(lawyerReport.initialAssessment)}}></div>
                                </div>

                                {/* Actionable Next Steps */}
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Strategic Next Steps</label>
                                    <div className="text-sm text-gray-300 prose prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 bg-[#16181D] border border-[#2D3139] rounded px-3 py-2 max-h-40 overflow-y-auto text-xs" dangerouslySetInnerHTML={{ __html: marked.parse(lawyerReport.actionableNextSteps)}}></div>
                                </div>

                                {/* Docs Link */}
                                <div className="flex items-center justify-between bg-[#16181D] rounded p-3 border border-[#2D3139]">
                                    <span className="text-xs text-gray-400 font-medium">Evidence Folder</span>
                                    <a href={lawyerReport.documentCollection.uploadLink} target="_blank" rel="noreferrer" className="text-xs text-[#00FFA3] font-bold hover:underline flex items-center gap-1">
                                        ACCESS FILES &rarr;
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Follow Up Checklists */}
                {followUpActions && (
                    <div className="bg-[#1E2128] border border-[#2D3139] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#2D3139] pb-2">Action Checklist</h3>
                        <div className="space-y-2">
                            {/* We parse the markdown list into items manually for custom checkbox UI */}
                            {followUpActions.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')).map((line, idx) => {
                                const text = line.replace(/^[-*]\s/, '');
                                const isChecked = !!completedActions[idx];
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => toggleAction(idx)}
                                        className={`
                                            flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all
                                            ${isChecked ? 'bg-[#00FFA3]/5 border border-[#00FFA3]/20' : 'bg-[#16181D] border border-transparent hover:border-gray-700'}
                                        `}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-[#00FFA3] border-[#00FFA3]' : 'border-gray-600'}`}>
                                            {isChecked && <CheckIcon className="text-black w-3 h-3" />}
                                        </div>
                                        <span className={`text-xs ${isChecked ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* CRM Integration */}
                <div className={`bg-[#1E2128] border border-[#2D3139] rounded-2xl p-6 shadow-xl ${!lawyerReport ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between mb-4 border-b border-[#2D3139] pb-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">CRM Export</h3>
                        <button onClick={clearCrmLogs} className="p-1 hover:bg-gray-700 rounded transition-colors group" title="Reset Logs">
                            <RefreshIcon />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {(Object.keys(crmIntegrations) as Array<keyof typeof crmIntegrations>).map(key => {
                            const status = crmExportStatus[key];
                            return (
                                <div key={key} className="flex items-center justify-between p-3 bg-[#16181D] rounded-lg group hover:bg-[#252830] transition-colors border border-transparent hover:border-[#2D3139]">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center p-1.5 shrink-0">
                                            <img src={crmIntegrations[key].logo} alt={crmIntegrations[key].name} className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors truncate">{crmIntegrations[key].name}</span>
                                    </div>
                                    <button
                                        onClick={() => initiateCrmExport(key)}
                                        disabled={status !== CRMExportStatus.IDLE}
                                        className={`
                                            px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all shrink-0 ml-3
                                            ${status === CRMExportStatus.SUCCESS 
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                : status === CRMExportStatus.EXPORTING 
                                                    ? 'bg-gray-700 text-gray-400 animate-pulse' 
                                                    : 'bg-[#00FFA3] text-[#0A0B0D] hover:bg-[#00D88A] shadow-[0_0_15px_rgba(0,255,163,0.1)] hover:shadow-[0_0_20px_rgba(0,255,163,0.3)]'}
                                        `}
                                    >
                                        {status === CRMExportStatus.SUCCESS ? 'Synced' : status === CRMExportStatus.EXPORTING ? 'Syncing' : 'Export'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            </>
        )}

      </main>

      {/* CRM Confirmation Modal */}
      {showCrmModal && pendingCrm && lawyerReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1E2128] border border-[#2D3139] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                  <h3 className="text-lg font-bold text-white mb-4">Confirm CRM Export</h3>
                  <div className="bg-[#16181D] p-4 rounded-lg border border-[#2D3139] mb-6">
                      <p className="text-xs text-gray-500 uppercase mb-1">Destination</p>
                      <div className="flex items-center gap-2 mb-4">
                          <img src={crmIntegrations[pendingCrm].logo} className="h-4" alt="logo" />
                          <span className="text-sm font-semibold text-white">{crmIntegrations[pendingCrm].name}</span>
                      </div>
                      
                      <p className="text-xs text-gray-500 uppercase mb-1">Data to Transfer</p>
                      <ul className="text-sm text-gray-300 space-y-1 list-disc pl-4">
                          <li>Client Profile: <span className="text-white">{lawyerReport.clientDetails.name}</span></li>
                          <li>Contact: <span className="text-white">{lawyerReport.clientDetails.email}</span></li>
                          <li>Case Analysis & Assessment</li>
                          <li>Transcript Log</li>
                      </ul>
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowCrmModal(false)}
                        className="flex-1 py-3 rounded-lg border border-[#2D3139] text-gray-400 hover:text-white hover:bg-[#2D3139] transition-all font-medium text-sm"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmCrmExport}
                        className="flex-1 py-3 rounded-lg bg-[#00FFA3] text-black hover:bg-[#00D88A] transition-all font-bold text-sm"
                      >
                          Confirm Export
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
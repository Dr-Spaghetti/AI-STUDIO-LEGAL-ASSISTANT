import { useState, useEffect, useCallback } from 'react';
import { ReceptionistSettings } from '../types';

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
  logoUrl: 'https://i.ibb.co/L6V2L1j/ted-law-logo-2.png',
  practiceArea: 'General Practice',
  firmTagline: 'Your trusted legal partner',
  demoMode: false,
  conversationTone: 'Professional',
  responseLength: 'Balanced',
  empathyLevel: 'Medium',
  callRecording: true,
  waveformStyle: 'Standard',
  afterHoursMode: false,
  warmTransfer: false,
  voiceMailTranscription: true,
  callbackQueue: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<ReceptionistSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('receptionistSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('receptionistSettings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const updateSettings = useCallback((updates: Partial<ReceptionistSettings>) => {
    setSettings(prev => ({...prev, ...updates}));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('receptionistSettings');
  }, []);

  return { settings, updateSettings, resetSettings, isLoading };
};

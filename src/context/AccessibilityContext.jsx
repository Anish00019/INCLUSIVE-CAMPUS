import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import dataApi from '../services/api';

const AccessibilityContext = createContext(null);

const DEFAULTS = {
  fontScale: 1,
  theme: 'light',            // light | dark
  highContrast: false,
  dyslexic: false,
  highlightLinks: false,
  reduceMotion: false,
  readingMode: false,
  captionsOn: true,
  visualAlerts: true,
  voiceNav: false,
  speechRate: 1,
};

export function AccessibilityProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    const saved=dataApi.loadPrefs() || {};
    const cleaned={...DEFAULTS};
    for(const [key,value] of Object.entries(DEFAULTS)) {
      if(typeof saved[key]===typeof value)cleaned[key]=saved[key];
    }
    cleaned.fontScale=Math.min(1.4,Math.max(0.85,Number(cleaned.fontScale)||1));
    cleaned.speechRate=Math.min(1.6,Math.max(0.6,Number(cleaned.speechRate)||1));
    if(!['light','dark'].includes(cleaned.theme))cleaned.theme='light';
    return cleaned;
  });
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  /* apply preferences to <html> */
  useEffect(() => {
    const el = document.documentElement;
    const active = ['dark', 'high-contrast', 'dyslexic', 'highlight-links', 'reduce-motion', 'reading-mode'];
    active.forEach((c) => el.classList.remove(c));

    if (prefs.theme === 'dark') el.classList.add('dark');
    if (prefs.highContrast) el.classList.add('high-contrast', 'dark');
    if (prefs.dyslexic) el.classList.add('dyslexic');
    if (prefs.highlightLinks) el.classList.add('highlight-links');
    if (prefs.reduceMotion) el.classList.add('reduce-motion');
    if (prefs.readingMode) el.classList.add('reading-mode');
    el.style.setProperty('--font-scale', prefs.fontScale);
    el.style.colorScheme = prefs.theme === 'dark' || prefs.highContrast ? 'dark' : 'light';
    try {dataApi.savePrefs(prefs);}catch(error){console.warn('Preferences apply for this session but could not be saved:',error.message);}
  }, [prefs]);

  const set = useCallback((key, value) => setPrefs((p) => ({ ...p, [key]: value })), []);
  const toggle = useCallback((key) => setPrefs((p) => ({ ...p, [key]: !p[key] })), []);
  const increaseFont = useCallback(() => setPrefs((p) => ({ ...p, fontScale: Math.min(1.4, +(p.fontScale + 0.1).toFixed(2)) })), []);
  const decreaseFont = useCallback(() => setPrefs((p) => ({ ...p, fontScale: Math.max(0.85, +(p.fontScale - 0.1).toFixed(2)) })), []);
  const reset = useCallback(() => setPrefs({ ...DEFAULTS }), []);

  /* ----- speech synthesis ----- */
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback((text) => {
    if (!supported || !text) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).slice(0, 4000));
    u.rate = prefs.speechRate;
    u.pitch = 1;
    u.lang = 'en-IN';
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    return true;
  }, [prefs.speechRate, supported]);

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  const value = useMemo(() => ({
    prefs, set, toggle, increaseFont, decreaseFont, reset, speak, stop, speaking, speechSupported: supported,
  }), [prefs, set, toggle, increaseFont, decreaseFont, reset, speak, stop, speaking, supported]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export const useA11y = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useA11y must be used inside AccessibilityProvider');
  return ctx;
};

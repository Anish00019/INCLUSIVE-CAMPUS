import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { useA11y } from '../../context/AccessibilityContext';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function VoiceNavigation() {
  const { prefs } = useA11y();
  const { role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  useEffect(() => () => recognition.current?.abort(), []);
  if (!prefs.voiceNav || !SR) return null;
  const start = () => {
    if (listening) { recognition.current?.abort(); setListening(false); return; }
    const rec = new SR(); rec.lang = 'en-IN';
    rec.onresult = e => {
      const command = e.results[0][0].transcript.toLowerCase().replace(/[.!?]/g, '').trim().replace(/^(go to |open |show )/, '');
      const targets = { dashboard: ROLE_HOME[role], home: ROLE_HOME[role], messages: '/messages', notifications: '/notifications', profile: '/profile', settings: '/settings', accessibility: '/accessibility-settings', timetable: role==='student'?'/timetable':ROLE_HOME[role], assignments: role==='faculty'?'/faculty/assignments':'/assignments', support: role==='student'?'/support':'/support-admin/requests', 'learning hub':'/assistive-hub' };
      if (targets[command]) { navigate(targets[command]); toast.success(`Opening ${command}`); }
      else toast.info(`Heard: “${command}”`, 'Try “open dashboard”, “messages”, “profile”, or “accessibility”.');
    };
    rec.onerror = e => { setListening(false); toast.error('Voice navigation unavailable', e.error==='not-allowed'?'Allow microphone access in your browser.':'Please try again, or use the keyboard.'); };
    rec.onend = () => setListening(false);
    recognition.current = rec;
    try { rec.start(); setListening(true); } catch { toast.info('Microphone is busy', 'Finish dictation before starting voice navigation.'); }
  };
  return <button className="fixed bottom-20 right-4 z-40 btn-primary text-xs shadow-lg" aria-pressed={listening} aria-label={listening?'Stop voice navigation':'Start voice navigation'} onClick={start}>{listening?<MicOff className="h-4 w-4"/>:<Mic className="h-4 w-4"/>}{listening?'Listening…':'Navigate by voice'}</button>;
}

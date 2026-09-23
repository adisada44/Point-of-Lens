import {useEffect, useRef, useState} from 'react';
import {MicrophoneIcon} from '@phosphor-icons/react/dist/csr/Microphone';
import {XIcon} from '@phosphor-icons/react/dist/csr/X';
import {FEEDBACK_EMAIL, MAX_FEEDBACK_LENGTH, feedbackMailto} from './feedback';

type SpeechResult = {isFinal: boolean; 0: {transcript: string}};
type SpeechSession = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: {resultIndex: number; results: ArrayLike<SpeechResult>}) => void) | null;
  onerror: ((event: {error: string}) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type SpeechConstructor = new () => SpeechSession;
function speechConstructor() {
  const speechWindow = window as Window & {SpeechRecognition?: SpeechConstructor; webkitSpeechRecognition?: SpeechConstructor};
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

export function FeedbackDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const recognition = useRef<SpeechSession | null>(null);
  const voiceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const supported = Boolean(speechConstructor());
  function stopVoice() {
    clearTimeout(voiceTimer.current);
    const session = recognition.current;
    recognition.current = null;
    if (session) {session.onresult = null; session.onerror = null; session.onend = null; session.abort();}
    setListening(false);
  }
  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal(); dialog.current?.querySelector('textarea')?.focus(); setStatus('');
    } else {
      stopVoice();
      if (dialog.current?.open) {dialog.current.close(); previousFocus.current?.focus();}
    }
  }, [open]);
  useEffect(() => {
    const hidden = () => {if (document.hidden) stopVoice();};
    document.addEventListener('visibilitychange', hidden);
    return () => {document.removeEventListener('visibilitychange', hidden); stopVoice();};
  }, []);
  function dictate() {
    if (recognition.current) {recognition.current.stop(); return;}
    const Constructor = speechConstructor();
    if (!Constructor) return;
    const session = new Constructor();
    recognition.current = session;
    session.lang = navigator.language || 'en-US'; session.continuous = false; session.interimResults = false;
    session.onresult = event => {
      if (recognition.current !== session) return;
      const transcript = Array.from(event.results).slice(event.resultIndex).filter(result => result.isFinal).map(result => result[0].transcript).join(' ');
      if (transcript) {setText(current => `${current}${current ? ' ' : ''}${transcript}`.slice(0, MAX_FEEDBACK_LENGTH)); setStatus('Voice added. You can edit it before sending.');}
    };
    session.onerror = event => {
      if (recognition.current !== session) return;
      setStatus(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'Microphone access was not allowed. You can type instead.' : 'Voice input is unavailable right now. Please try again or type.');
      stopVoice();
    };
    session.onend = () => {if (recognition.current === session) {recognition.current = null; clearTimeout(voiceTimer.current); setListening(false); setStatus(current => current === 'Listening…' ? 'Dictation ended. You can type or try again.' : current);}};
    try {
      session.start(); setListening(true); setStatus('Listening…');
      voiceTimer.current = setTimeout(() => {stopVoice(); setStatus('Voice input stopped. You can type or try again.');}, 60000);
    } catch {stopVoice(); setStatus('Voice input could not start. You can type instead.');}
  }
  return <dialog className="feedback-dialog" ref={dialog} aria-labelledby="feedback-title" onCancel={onClose}
    onClick={event => {if (event.target === event.currentTarget) onClose();}}>
    <div className="dialog-head"><h2 id="feedback-title">A little feedback?</h2><button type="button" aria-label="Close feedback" onClick={onClose}><XIcon size={18} aria-hidden="true"/></button></div>
    <p>What worked? What could feel better?</p>
    <label className="sr-only" htmlFor="feedback-message">Your feedback</label>
    <textarea id="feedback-message" autoFocus value={text} maxLength={MAX_FEEDBACK_LENGTH} rows={6}
      placeholder="Your thoughts go here…" onChange={event => setText(event.target.value)} aria-describedby="feedback-privacy"/>
    <div className="feedback-meta"><button type="button" className="voice-button" onClick={dictate} disabled={!supported || text.length >= MAX_FEEDBACK_LENGTH && !listening} aria-pressed={listening}>
      <MicrophoneIcon size={16} aria-hidden="true"/>{listening ? 'Stop dictation' : 'Use voice'}</button><span>{text.length}/{MAX_FEEDBACK_LENGTH}</span></div>
    <p className="feedback-privacy" id="feedback-privacy">{supported ? 'Voice is optional. Your browser may send audio to its speech service.' : 'Voice input isn’t available in this browser. You can still type your feedback.'} This page does not save your message.</p>
    <p className="feedback-status" role="status">{status}</p>
    <div className="feedback-send"><span>To {FEEDBACK_EMAIL}</span><a className="button-link" href={text.trim() ? feedbackMailto(text) : undefined}
      aria-disabled={!text.trim()} onClick={event => {
        if (!text.trim()) {event.preventDefault(); return;}
        stopVoice(); setStatus('Continue in your email app to send. If it did not open, copy your message and email it to the address below.');
      }}>Open email draft</a></div>
  </dialog>;
}

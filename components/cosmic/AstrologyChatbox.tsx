'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AiDisclaimer } from '@/components/ui/AiDisclaimer';
import { generateAstrologicalConsultation } from '@/lib/ai/astrologyConsultation';
import { CelestialSkyImageCard } from './CelestialSkyImageCard';

export type ChatboxType = 'horoscope' | 'birth-chart';

const SUGGESTED_INQUIRIES = [
  '✨ Generate an image of today’s stars',
  '🌌 Generate an image of yesterday’s stars',
  'Is starting a new business venture favorable today?',
  'How do today’s planetary transits affect my career & finances?',
  'What do the stars indicate about my love life & relationships?',
  'What are my most auspicious hours and timings today?',
  'Which zodiac archetypes harmonize best with my energy?',
  'How can I best align with my Sun, Moon & Rising triad?',
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Strips markdown asterisks, hashes, backticks and formatting marks
 * so text displays and sounds clean, without '**' before words.
 */
function cleanPlainText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`/g, '')
    .replace(/^[\t ]*[-+]\s+/gm, '• ')
    .trim();
}

// Helper to find the softest, sweetest female voice available on the device
function getSoftFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  // Prioritized list of known soft, sweet, pleasant female voices
  const softFemalePriorities = [
    'jenny',              // Microsoft Jenny (Natural) - very soft, warm & sweet
    'aria',               // Microsoft Aria (Natural) - melodic, gentle female
    'samantha',           // Apple Samantha - clear, warm female
    'serena',             // Apple Serena - calm, soft female
    'victoria',           // Apple Victoria
    'karen',              // Apple Karen
    'sonia',              // UK Natural female
    'libby',              // UK Natural female
    'mia',                // Natural female
    'google us english',  // Chrome default smooth female
    'zira',               // Microsoft Zira - female
  ];

  for (const keyword of softFemalePriorities) {
    const match = englishVoices.find((v) => v.name.toLowerCase().includes(keyword));
    if (match) return match;
  }

  // Fallback to any voice with 'female' in the name
  const anyFemale = englishVoices.find((v) => v.name.toLowerCase().includes('female'));
  if (anyFemale) return anyFemale;

  // Filter out known male voices if possible
  const maleKeywords = ['david', 'george', 'mark', 'guy', 'ryan', 'male'];
  const nonMale = englishVoices.find(
    (v) => !maleKeywords.some((m) => v.name.toLowerCase().includes(m))
  );
  if (nonMale) return nonMale;

  return englishVoices[0] || voices[0] || null;
}

// Subcomponent for each assistant answer message with voiceover and real-time word highlight
function AssistantAnswerMessage({
  content: rawContent,
  messageIndex,
  activeSpeechIndex,
  setActiveSpeechIndex,
}: {
  content: string;
  messageIndex: number;
  activeSpeechIndex: number | null;
  setActiveSpeechIndex: (idx: number | null) => void;
}) {
  // Parse any celestial image generation tag
  const { celestialParams, content } = useMemo(() => {
    const match = rawContent.match(/\[CELESTIAL_SKY_IMAGE:([^\]]+)\]/);
    if (!match) {
      return { celestialParams: null, content: cleanPlainText(rawContent) };
    }
    const queryStr = match[1];
    const params = new URLSearchParams(queryStr);
    const date = params.get('date') || new Date().toISOString().slice(0, 10);
    const sign = params.get('sign') || 'scorpio';
    const title = params.get('title') || undefined;

    const stripped = rawContent.replace(/\[CELESTIAL_SKY_IMAGE:[^\]]+\]/g, '').trim();
    return {
      celestialParams: { date, sign, title },
      content: cleanPlainText(stripped),
    };
  }, [rawContent]);

  const isThisActive = activeSpeechIndex === messageIndex;
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);

  // Pre-load voices so getVoices is populated immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
    }
  }, []);

  // Stop if another message takes over
  useEffect(() => {
    if (!isThisActive) {
      setSpeechState('idle');
      setHighlightRange(null);
    }
  }, [isThisActive]);

  // Clean speech cancel on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    // Stop previous playback
    window.speechSynthesis.cancel();
    setActiveSpeechIndex(messageIndex);

    // Keep formatting characters as spaces to preserve 1:1 character index mapping
    const speechText = content.replace(/[•✦⭐✨]/g, ' ');

    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Soft, sweet, and calm cadence
    utterance.rate = 0.90;   // Gentle, relaxing tempo
    utterance.pitch = 1.08;  // Soft, warm, melodic feminine pitch

    // Select the softest female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = getSoftFemaleVoice(voices);
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // Real-time word highlight boundary listener
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const start = event.charIndex;
        let end = start;
        while (end < content.length && !/\s|[.,!?;:—\n]/.test(content[end])) {
          end++;
        }
        setHighlightRange({
          start,
          end: end > start ? end : start + (event.charLength || 5),
        });
      }
    };

    utterance.onend = () => {
      setSpeechState('idle');
      setHighlightRange(null);
      setActiveSpeechIndex(null);
    };

    utterance.onerror = () => {
      setSpeechState('idle');
      setHighlightRange(null);
      setActiveSpeechIndex(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeechState('playing');
  }, [content, messageIndex, setActiveSpeechIndex]);

  const handlePause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setSpeechState('paused');
    }
  }, []);

  const handleResume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setSpeechState('playing');
    }
  }, []);

  const handleStop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeechState('idle');
      setHighlightRange(null);
      setActiveSpeechIndex(null);
    }
  }, [setActiveSpeechIndex]);

  // Render text with word-level highlight
  const renderText = () => {
    if (!isThisActive || !highlightRange) {
      return <p className="whitespace-pre-line leading-relaxed">{content}</p>;
    }

    const before = content.slice(0, highlightRange.start);
    const current = content.slice(highlightRange.start, highlightRange.end);
    const after = content.slice(highlightRange.end);

    return (
      <p className="whitespace-pre-line leading-relaxed">
        {before}
        <mark className="bg-gold/35 text-gold-light font-bold px-1 py-0.5 rounded border-b-2 border-gold shadow-[0_0_12px_rgba(255,209,102,0.7)] transition-all duration-75">
          {current}
        </mark>
        {after}
      </p>
    );
  };

  return (
    <div
      className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed transition-all duration-300 ${
        isThisActive && speechState === 'playing'
          ? 'bg-white/[0.07] text-white rounded-tl-none border border-gold/50 shadow-[0_0_24px_rgba(255,209,102,0.25)]'
          : 'bg-white/[0.04] text-silver/95 rounded-tl-none border border-white/10 backdrop-blur-md shadow-lg'
      }`}
    >
      {/* Generated Celestial Star Sky Image (if requested) */}
      {celestialParams && (
        <div className="mb-4">
          <CelestialSkyImageCard
            initialDate={celestialParams.date}
            initialSign={celestialParams.sign}
            title={celestialParams.title}
          />
        </div>
      )}

      {/* Answer Content with Dynamic Highlighting */}
      {renderText()}

      {/* Voiceover Controls Bar */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
        {speechState === 'idle' ? (
          <button
            type="button"
            onClick={handlePlay}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold hover:bg-gold/20 hover:border-gold transition-all"
          >
            <span>🔊</span>
            <span>Listen to Answer</span>
          </button>
        ) : speechState === 'playing' ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gold flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
              Reading aloud...
            </span>
            <button
              type="button"
              onClick={handlePause}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20 transition-all"
            >
              <span>⏸️</span>
              <span>Pause</span>
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <span>⏹️</span>
              <span>Stop</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-300">
              ⏸️ Paused
            </span>
            <button
              type="button"
              onClick={handleResume}
              className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold hover:bg-gold/30 transition-all"
            >
              <span>▶️</span>
              <span>Resume</span>
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <span>⏹️</span>
              <span>Stop</span>
            </button>
          </div>
        )}

        <span className="text-[10px] text-silver/40">Voiceover</span>
      </div>
    </div>
  );
}

export function AstrologyChatbox({ contextData, type }: { contextData: string; type: ChatboxType }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          contextData,
          type,
        }),
      });

      if (!res.ok) throw new Error('API response was not ok');
      const data = await res.json();

      if (data && data.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: cleanPlainText(data.content) }]);
      } else {
        const localAnswer = generateAstrologicalConsultation(userText, contextData, type);
        setMessages((prev) => [...prev, { role: 'assistant', content: cleanPlainText(localAnswer) }]);
      }
    } catch {
      // Direct local astrological synthesis fallback (ensures the chatbox ALWAYS answers)
      const localAnswer = generateAstrologicalConsultation(userText, contextData, type);
      setMessages((prev) => [...prev, { role: 'assistant', content: cleanPlainText(localAnswer) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  return (
    <div
      className="mt-8 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, rgba(16, 21, 52, 0.95) 0%, rgba(9, 13, 33, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
            <span className="font-display text-sm text-gold">✦</span>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-gold">Celestial Oracle Consultation</h3>
            <p className="text-xs text-silver/70">
              {type === 'horoscope'
                ? 'Direct astrological answers regarding your transits, career, business & personal life'
                : 'Direct astrological analysis regarding your natal placements and life destiny'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ephemeris Active</span>
        </div>
      </div>

      {/* Suggested Inquiries Chips Carousel */}
      <div className="border-b border-white/5 bg-black/20 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-gold/80 mb-2">
          <span>✦</span>
          <span>Suggested Contemplations:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {SUGGESTED_INQUIRIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="flex-shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-silver/85 transition-all hover:border-gold/50 hover:bg-gold/15 hover:text-gold hover:scale-[1.02]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area - Full Width */}
      <div className="flex h-[440px] flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-3 px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/5 text-gold text-2xl">
                ✦
              </div>
              <h4 className="font-display text-base text-white">Ask Anything About Your Life & Destiny</h4>
              <p className="max-w-md text-xs leading-relaxed text-silver/65">
                Inquire about starting a business, love & relationships, career decisions, auspicious timing, or your natal transits.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="text-[11px] text-silver/50">Try: &ldquo;Is today a good day to start my business?&rdquo;</span>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-gradient-to-r from-accent-purple/30 to-accent-blue/30 text-white rounded-tr-none border border-accent-blue/25 shadow-md">
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  <AssistantAnswerMessage
                    content={msg.content}
                    messageIndex={idx}
                    activeSpeechIndex={activeSpeechIndex}
                    setActiveSpeechIndex={setActiveSpeechIndex}
                  />
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-silver flex space-x-2 items-center">
                <span className="text-xs text-gold mr-2 font-display">Calculating ephemeris</span>
                <div className="h-1.5 w-1.5 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 bg-black/30 p-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your life question in simple words (e.g. 'Is today a good day to start my business?')..."
              className="w-full rounded-full border border-white/15 bg-primary/80 py-3 pl-5 pr-14 text-sm text-white placeholder-silver/45 transition-colors focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-primary font-bold transition-all hover:bg-gold-light hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Send inquiry"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
          <AiDisclaimer className="mt-2.5 opacity-65 text-center text-[10px]" />
        </div>
      </div>
    </div>
  );
}

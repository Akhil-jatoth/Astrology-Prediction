'use client';

import { useState, useRef, useEffect } from 'react';
import { AiDisclaimer } from '@/components/ui/AiDisclaimer';

export type ChatboxType = 'horoscope' | 'birth-chart';

const HOROSCOPE_QUESTIONS = [
  {
    category: 'Love & Relationship',
    questions: [
      'Who is compatible with my zodiac sign?',
      'Will I find true love?',
      'How is my relationship going to be?',
      'When will I get married?',
      'Is my partner right for me?',
    ],
  },
  {
    category: 'Career & Money',
    questions: [
      'Which career suits my zodiac sign?',
      'Will I get a job soon?',
      'How is my financial future?',
      'Is this a good time to invest?',
      'Will I be successful in life?',
    ],
  },
];

const BIRTH_CHART_QUESTIONS = [
  {
    category: 'Personality',
    questions: [
      'What is my zodiac sign?',
      'What is my rising sign?',
      'What is my moon sign?',
    ],
  },
  {
    category: 'Love ❤️',
    questions: [
      'When will I get married?',
      'Is my relationship good?',
      'Who is compatible with me?',
    ],
  },
  {
    category: 'Career 💼',
    questions: [
      'Which career is best for me?',
      'Will I be successful?',
      'When will I get a job?',
    ],
  },
  {
    category: 'Future 🔮',
    questions: [
      'What will my future be like?',
      'What are my lucky days?',
      'What challenges will I face?',
    ],
  },
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AstrologyChatbox({ contextData, type }: { contextData: string; type: ChatboxType }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = type === 'horoscope' ? HOROSCOPE_QUESTIONS : BIRTH_CHART_QUESTIONS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
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

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'The cosmic signals are disrupted right now. Please try again.' },
      ]);
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
    <div className="mt-8 overflow-hidden rounded-2xl border-white/10" style={{ background: 'rgba(20,24,50,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="border-b border-white/5 p-4 flex items-center gap-3">
        <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">✨</span>
        <div>
          <h3 className="font-display text-lg text-gold">Ask AstraVerse AI</h3>
          <p className="text-xs text-silver/60">
            {type === 'horoscope' ? 'Ask about your horoscope' : 'Ask about your birth chart'}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[500px]">
        {/* Sidebar: Categories & Questions */}
        <div className="w-full md:w-1/3 border-r border-white/5 bg-black/20 p-4 overflow-y-auto hidden md:block hide-scrollbar">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-silver/40">Suggested Questions</p>
          <div className="space-y-6">
            {categories.map((cat, i) => (
              <div key={i}>
                <h4 className="mb-2 text-sm font-medium text-white">{cat.category}</h4>
                <div className="flex flex-col gap-2">
                  {cat.questions.map((q, j) => (
                    <button
                      key={j}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="text-left text-xs text-silver/80 hover:text-gold transition-colors p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Questions Carousel (Visible only on small screens) */}
        <div className="w-full border-b border-white/5 p-3 flex gap-2 overflow-x-auto md:hidden hide-scrollbar whitespace-nowrap">
          {categories.flatMap(c => c.questions).map((q, j) => (
            <button
              key={j}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="flex-shrink-0 text-xs text-silver/80 hover:text-gold transition-colors px-3 py-2 rounded-full bg-white/5 border border-white/10"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-silver/50 space-y-2">
                <span className="text-4xl opacity-50">🔮</span>
                <p className="text-sm">Ask me anything about your {type === 'horoscope' ? 'horoscope' : 'birth chart'}!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600/30 text-white rounded-br-none border border-blue-400/20'
                        : 'bg-white/5 text-silver rounded-bl-none border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl rounded-bl-none border border-white/10 px-4 py-3 text-sm text-silver flex space-x-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-silver/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-silver/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-silver/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-black/20 border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your cosmic question..."
                className="w-full bg-black/40 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center hover:bg-gold/40 transition-colors disabled:opacity-50 disabled:hover:bg-gold/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <AiDisclaimer className="mt-3 opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
}

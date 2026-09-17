import { AI_DISCLAIMER } from '../constants';
import type { CalculatedChart } from '../astro-engine';
import type { ZodiacSign } from '../constants';

export interface InterpretationRequest {
  type: 'birth-chart' | 'daily-horoscope' | 'star-meaning';
  chart?: CalculatedChart;
  sign?: ZodiacSign;
  moonSign?: ZodiacSign;
  date?: string;
  starName?: string;
}

export interface InterpretationResult {
  content: string;
  disclaimer: string;
  provider: string;
}

const SYSTEM_PROMPT = `You are AstraVerse AI, a wise and warm astrological interpreter.
RULES:
1. ONLY reason from the structured chart/placement data provided. NEVER invent planetary positions, house cusps, or signs.
2. ALWAYS end your response with this exact disclaimer on its own line: "${AI_DISCLAIMER}"
3. Use tendency-based language, not certainty. Decline medical, legal, or financial guarantees.
4. Be poetic but concise. Keep daily horoscopes to 3-4 paragraphs. Birth chart readings to 5-6 paragraphs covering sun, moon, ascendant, and notable placements.
5. Write in second person ("you").`;

export class AstrologyInterpreter {
  private provider: 'groq' | 'gemini' | 'openai' | 'mock';

  constructor() {
    if (process.env.GROQ_API_KEY) this.provider = 'groq';
    else if (process.env.GEMINI_API_KEY) this.provider = 'gemini';
    else if (process.env.OPENAI_API_KEY) this.provider = 'openai';
    else this.provider = 'mock';
  }

  async interpret(request: InterpretationRequest): Promise<InterpretationResult> {
    const userPrompt = this.buildPrompt(request);

    try {
      switch (this.provider) {
        case 'groq':
          return await this.callGroq(userPrompt);
        case 'gemini':
          return await this.callGemini(userPrompt);
        case 'openai':
          return await this.callOpenAI(userPrompt);
        default:
          return this.mockInterpret(request);
      }
    } catch (error) {
      console.warn('AI interpretation unavailable, using mock response:', error);
      return this.mockInterpret(request);
    }
  }

  private buildPrompt(request: InterpretationRequest): string {
    if (request.type === 'daily-horoscope' && request.sign) {
      return `Write a daily horoscope for ${request.sign} on ${request.date ?? 'today'}.
Sun sign: ${request.sign}${request.moonSign ? `\nMoon sign context: ${request.moonSign}` : ''}
Cover: general energy, love, career, and a practical tip.`;
    }

    if (request.type === 'birth-chart' && request.chart) {
      const c = request.chart;
      return `Interpret this birth chart:
Sun: ${c.sunSign}
Moon: ${c.moonSign}
Ascendant: ${c.ascendant} (${c.ascendantDegree})
Nakshatra: ${c.nakshatra}
Planet positions: ${c.planetPositions.map((p) => `${p.planet} in ${p.sign} at ${p.degreeFormatted}`).join(', ')}
Houses: ${c.houses.map((h) => `House ${h.house}: ${h.sign}`).join(', ')}`;
    }

    if (request.type === 'star-meaning' && request.starName && request.chart) {
      const c = request.chart;
      return `Interpret the significance of the star ${request.starName} in the constellation of ${c.sunSign} for a person born with Sun in ${c.sunSign}, Moon in ${c.moonSign}, and Ascendant in ${c.ascendant}. How does this star relate to their birth date and time? Keep it concise (2-3 paragraphs) and mystical yet grounded.`;
    }

    return 'Provide a brief cosmic guidance message.';
  }

  private async callGroq(prompt: string): Promise<InterpretationResult> {
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 900,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data = await res.json();
    let content = data.choices?.[0]?.message?.content ?? '';
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    return { content, disclaimer: AI_DISCLAIMER, provider: 'groq' };
  }

  private async callGemini(prompt: string): Promise<InterpretationResult> {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 900 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { content, disclaimer: AI_DISCLAIMER, provider: 'gemini' };
  }

  private async callOpenAI(prompt: string): Promise<InterpretationResult> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    return { content, disclaimer: AI_DISCLAIMER, provider: 'openai' };
  }

  private mockInterpret(request: InterpretationRequest): InterpretationResult {
    if (request.type === 'daily-horoscope' && request.sign) {
      const sign = request.sign.charAt(0).toUpperCase() + request.sign.slice(1);
      return {
        content: `Dear ${sign}, the cosmos aligns to favor reflection and intentional action today. In matters of the heart, openness may reveal unexpected warmth. Career energies suggest steady progress when you focus on one priority at a time. A small ritual—journaling or a mindful walk—can anchor your day.\n\n${AI_DISCLAIMER}`,
        disclaimer: AI_DISCLAIMER,
        provider: 'mock',
      };
    }

    if (request.type === 'star-meaning' && request.starName && request.chart) {
      return {
        content: `The star ${request.starName} in the constellation of ${request.chart.sunSign} holds special meaning for your birth date. Its radiant energy synergizes with your Sun in ${request.chart.sunSign} and Moon in ${request.chart.moonSign}, amplifying your natural strengths. As a guiding light in your natal sky, it reminds you of your unique cosmic signature.\n\n${AI_DISCLAIMER}`,
        disclaimer: AI_DISCLAIMER,
        provider: 'mock',
      };
    }

    if (request.chart) {
      const c = request.chart;
      return {
        content: `Your Sun in ${c.sunSign} illuminates your core identity with characteristic strength of that sign. The Moon in ${c.moonSign} shapes your emotional landscape and inner needs. With ${c.ascendant} rising, others often perceive you through the lens of ${c.ascendant}'s expressive qualities. Your nakshatra ${c.nakshatra} adds a Vedic layer of spiritual temperament. Notable placements include ${c.planetPositions.slice(0, 4).map((p) => `${p.planet} in ${p.sign}`).join(', ')}—each weaving a unique thread into your cosmic tapestry.\n\n${AI_DISCLAIMER}`,
        disclaimer: AI_DISCLAIMER,
        provider: 'mock',
      };
    }

    return {
      content: `The stars whisper of transformation and growth. Trust your intuition as you navigate today's energies.\n\n${AI_DISCLAIMER}`,
      disclaimer: AI_DISCLAIMER,
      provider: 'mock',
    };
  }
}

export const astrologyInterpreter = new AstrologyInterpreter();

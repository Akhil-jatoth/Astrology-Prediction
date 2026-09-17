import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, contextData, type } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    const systemPrompt = `You are AstraVerse AI, a wise and poetic astrological interpreter.
You are helping the user by answering questions based on their astrological data and the field of astrology.
IMPORTANT: You MUST ONLY answer questions related to astrology, horoscopes, zodiac signs, cosmic events, and spiritual guidance. 
If the user asks a question completely unrelated to these topics (e.g., coding, general math, cooking, non-astrological advice), you must politely decline and guide them back to astrological topics. For example: "I am a cosmic guide focusing on the stars and your astrological journey. I cannot answer that, but I can look into your horoscope or chart if you'd like."
Be poetic, comforting, and use tendency-based language (not certainty).
Keep your answers relatively concise but informative (1-3 short paragraphs max).

Context about the user (${type}):
${contextData}

Answer their questions as a cosmic guide.`;

    let content: string | null = null;
    let lastErrorDetails = '';

    // 1. Try Groq if key is present
    if (groqKey) {
      try {
        const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.8,
            max_tokens: 600,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          let rawText = json.choices?.[0]?.message?.content || '';
          rawText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          if (rawText) {
            content = rawText;
          }
        } else {
          const errText = await res.text();
          console.error('Groq API Error:', errText);
          try {
            const errObj = JSON.parse(errText);
            lastErrorDetails += `\n- Groq: ${errObj?.error?.message || 'API Error'}`;
          } catch (e) {
            lastErrorDetails += `\n- Groq Error: ${res.status}`;
          }
        }
      } catch (err: any) {
        console.error('Groq Network Error:', err);
        lastErrorDetails += `\nGroq Network Error: ${err?.message || 'Unknown'}`;
      }
    }

    // 2. Try OpenAI if Groq failed or key is missing
    if (!content && openAiKey) {
      try {
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.8,
            max_tokens: 400,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          content = json.choices?.[0]?.message?.content;
        } else {
          const errText = await res.text();
          console.error('OpenAI API Error:', errText);
          try {
            const errObj = JSON.parse(errText);
            if (errObj?.error?.code === 'insufficient_quota') {
              lastErrorDetails += `\n- OpenAI: Insufficient quota (out of credits or limits reached).`;
            } else {
              lastErrorDetails += `\n- OpenAI: ${errObj?.error?.message || 'API Error'}`;
            }
          } catch (e) {
            lastErrorDetails += `\n- OpenAI Error: ${res.status}`;
          }
        }
      } catch (err: any) {
        console.error('OpenAI Network Error:', err);
        lastErrorDetails += `\nOpenAI Network Error: ${err?.message || 'Unknown'}`;
      }
    }

    // 3. Try Gemini if others failed or key is missing
    if (!content && geminiKey) {
      try {
        const geminiMessages = messages.map((m: any, idx: number) => {
          let text = m.content;
          // Inject system prompt into the very first user message
          if (idx === 0 && m.role === 'user') {
            text = `[SYSTEM CONTEXT]\n${systemPrompt}\n\n[USER QUESTION]\n${text}`;
          }
          return {
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text }],
          };
        });

        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        const maxRetries = 5;
        let attempt = 0;
        let success = false;

        while (attempt <= maxRetries && !success) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: geminiMessages,
                generationConfig: { temperature: 0.8, maxOutputTokens: 600 },
              }),
            });

            if (res.ok) {
              const json = await res.json();
              content = json.candidates?.[0]?.content?.parts?.[0]?.text;
              success = true;
            } else {
              const errText = await res.text();
              
              if (res.status === 429 && attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s, 8s, 16s with +/- 200ms jitter
                const baseWait = 1000;
                const waitTime = baseWait * Math.pow(2, attempt) + (Math.random() * 400 - 200);
                console.log(`Gemini rate limited (429). Retrying in ${Math.round(waitTime)}ms (Attempt ${attempt + 1} of ${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                attempt++;
                continue;
              }

              console.error('Gemini API Error:', errText);
              try {
                const errObj = JSON.parse(errText);
                if (errObj?.error?.code === 429 || errObj?.error?.status === 'RESOURCE_EXHAUSTED') {
                  lastErrorDetails += `\n- Gemini: Quota Exceeded (Resource Exhausted) after ${attempt} retries.`;
                } else {
                  lastErrorDetails += `\n- Gemini: ${errObj?.error?.message || 'API Error'}`;
                }
              } catch (e) {
                lastErrorDetails += `\n- Gemini Error: ${res.status}`;
              }
              break; // Exit loop if not a 429 or max retries reached
            }
          } catch (err: any) {
            console.error('Gemini Network Error:', err);
            lastErrorDetails += `\nGemini Network Error: ${err?.message || 'Unknown'}`;
            break; // Exit loop on network error
          }
        }
      } catch (err: any) {
        console.error('Gemini Execution Error:', err);
        lastErrorDetails += `\nGemini Execution Error: ${err?.message || 'Unknown'}`;
      }
    }

    // 3. Return content or gracefully fallback
    if (content) {
      return NextResponse.json({ content });
    }

    // Graceful fallback for missing or invalid API keys
    return NextResponse.json({
      content: `I am your cosmic guide! However, the cosmic connection is currently disrupted.\n\nDebug Info:${lastErrorDetails}`,
    });
    
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

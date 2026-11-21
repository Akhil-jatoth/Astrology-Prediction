import { NextRequest, NextResponse } from 'next/server';
import { generateAstrologicalConsultation } from '@/lib/ai/astrologyConsultation';

/**
 * Strips markdown asterisks, hashes, and unwanted formatting marks
 * so responses appear in clean, simple, readable plain English.
 */
function cleanPlainEnglish(text: string): string {
  if (!text) return '';
  return text
    // Remove bold/italic markdown asterisks: **word** -> word, *word* -> word
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove markdown headers: # Header -> Header
    .replace(/^#{1,6}\s+/gm, '')
    // Remove backticks
    .replace(/`/g, '')
    // Clean up dash bullets into clean dots
    .replace(/^[\t ]*[-+]\s+/gm, '• ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { messages, contextData = '', type = 'horoscope' } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const lastUserMsg = messages[messages.length - 1]?.content || '';

    // Check if the user is asking to generate a celestial star or sky image
    const isImageRequest =
      /(generate|create|make|show|display|draw|see|render).*(image|picture|photo|map|sky|star)|(image|picture|photo).*(star|sky|constellation|today|yesterday)|(star|sky).*(image|picture|photo|generate)/i.test(
        lastUserMsg
      );

    const isYesterday = /yesterday/i.test(lastUserMsg);
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const targetDate = isYesterday ? yesterdayStr : todayStr;

    // Detect sign from context or query
    const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    let detectedSign = 'scorpio';
    for (const s of signs) {
      if (lastUserMsg.toLowerCase().includes(s) || contextData.toLowerCase().includes(s)) {
        detectedSign = s;
        break;
      }
    }

    const imageTag = isImageRequest ? `[CELESTIAL_SKY_IMAGE:date=${targetDate}&sign=${detectedSign}]\n\n` : '';

    const systemPrompt = `You are a warm, wise, and practical Astrological Consultant.
The user is asking a real question about their life (career, love, finances, decisions, or future) or asking to see the celestial stars and night sky.
Answer directly, simply, and accurately in everyday plain English.

CRITICAL FORMATTING RULES:
1. NEVER use asterisks or markdown bold. DO NOT write **words** or *words*. Plain text ONLY.
2. DO NOT use markdown headers (no # or ##).
3. Directly answer what the user asked in the very first sentence. No filler or fluff.
4. Keep explanations simple, friendly, and practical so anyone can understand them easily.
5. Structure the answer into 3 to 4 simple, numbered points (1. 2. 3.) or short easy-to-read paragraphs.
6. Keep the tone reassuring, clear, and positive.
7. NEVER say "I cannot generate images" or "I am an AI". If asked for an image of stars, confirm that the celestial sky image has been generated above and explain the visible constellations simply.

Astrological Context (${type}):
${contextData}`;

    // 1. Try Groq (Ultra-fast LLM inference)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && groqKey.startsWith('gsk_')) {
      try {
        const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.6,
            max_tokens: 500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          let rawContent = json.choices?.[0]?.message?.content || '';
          if (rawContent) {
            // If LLM said it cannot generate images, replace with reassuring introduction
            if (isImageRequest) {
              rawContent = rawContent.replace(/I (can't|cannot|am unable to) (produce|generate|create|make) (an actual|a|any)? (picture|image).*/i, `Here is the generated celestial sky image of the stars for ${isYesterday ? "yesterday's" : "today's"} sky (${targetDate}).`);
            }
            const finalContent = cleanPlainEnglish(rawContent);
            return NextResponse.json({ content: imageTag + finalContent });
          }
        } else {
          console.warn('Groq response not ok:', res.status, await res.text());
        }
      } catch (groqErr) {
        console.warn('Groq API call failed or timed out:', groqErr);
      }
    }

    // 2. Try OpenAI as fallback if key configured
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.startsWith('sk-') && !openAiKey.includes('your-api-key')) {
      try {
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.7,
            max_tokens: 500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          let rawContent = json.choices?.[0]?.message?.content || '';
          if (rawContent) {
            if (isImageRequest) {
              rawContent = rawContent.replace(/I (can't|cannot|am unable to) (produce|generate|create|make) (an actual|a|any)? (picture|image).*/i, `Here is the generated celestial sky image of the stars for ${isYesterday ? "yesterday's" : "today's"} sky (${targetDate}).`);
            }
            const finalContent = cleanPlainEnglish(rawContent);
            return NextResponse.json({ content: imageTag + finalContent });
          }
        }
      } catch (openAiErr) {
        console.warn('OpenAI fallback failed:', openAiErr);
      }
    }

    // 3. Guaranteed instant local astrological synthesis engine
    if (isImageRequest) {
      const dayLabel = isYesterday ? "yesterday's" : "today's";
      const fallbackContent = `Here is the generated high-resolution celestial sky image of the stars for ${dayLabel} night sky (${targetDate}). You can view the glowing constellations and planets in the image above, or tap Download Image to save it in high definition.

1. Prominent Constellations: The ${detectedSign.toUpperCase()} constellation and major zodiac stars shine brightly near the zenith of the sky dome.
2. Moon and Planets: The Moon and bright wandering planets (Venus, Mars, and Jupiter) are plotted with their exact astronomical positions.
3. Viewing Guidance: The clearest time to observe these stars is 1 to 2 hours after twilight when ambient light fades and the celestial dome reaches peak clarity.`;
      return NextResponse.json({ content: imageTag + fallbackContent });
    }

    const rawContent = generateAstrologicalConsultation(lastUserMsg, contextData, type);
    return NextResponse.json({ content: cleanPlainEnglish(rawContent) });
  } catch (err) {
    console.error('Chat API Error:', err);
    const fallbackContent = generateAstrologicalConsultation('general life guidance', '', 'horoscope');
    return NextResponse.json({ content: cleanPlainEnglish(fallbackContent) });
  }
}

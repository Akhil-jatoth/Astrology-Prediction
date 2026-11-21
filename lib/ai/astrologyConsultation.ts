import { ZODIAC_DATA, type ZodiacSign } from '../constants';

export function generateAstrologicalConsultation(
  userQuery: string,
  contextData: string,
  type: 'horoscope' | 'birth-chart'
): string {
  const query = userQuery.toLowerCase().trim();

  // Extract sign or placements from contextData if available
  let detectedSign: ZodiacSign = 'aries';
  const signs: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
  ];
  for (const s of signs) {
    if (contextData.toLowerCase().includes(s) || query.includes(s)) {
      detectedSign = s;
      break;
    }
  }

  const signInfo = ZODIAC_DATA[detectedSign] || ZODIAC_DATA.aries;
  const capitalizedSign = detectedSign.charAt(0).toUpperCase() + detectedSign.slice(1);

  // 1. BUSINESS, STARTUP, VENTURE, LAUNCH
  if (
    query.includes('business') ||
    query.includes('start') ||
    query.includes('launch') ||
    query.includes('venture') ||
    query.includes('company') ||
    query.includes('shop') ||
    query.includes('deal') ||
    query.includes('contract') ||
    query.includes('enterprise')
  ) {
    return `Yes, starting a business today is very favorable for you! Here is what the stars say for ${capitalizedSign}:

1. Best Timing Today:
The strongest window to take action is between 11:00 AM and 3:00 PM. This is when the Sun and Mars give you maximum confidence, clarity, and leadership to announce your venture or sign documents.

2. What Works in Your Favor:
Your sign is known for being ${signInfo.traits[0]} and ${signInfo.traits[1]}. Use these natural strengths to pitch your ideas and connect with customers.

3. Important Tip for Success:
Double check your numbers and paperwork carefully before committing. When you build on a solid plan, today's planetary energy strongly supports long-term growth and profits.

Go ahead with confidence—the stars are supporting your new journey!`;
  }

  // 2. LOVE, MARRIAGE, RELATIONSHIPS, PARTNER
  if (
    query.includes('love') ||
    query.includes('marry') ||
    query.includes('marriage') ||
    query.includes('partner') ||
    query.includes('relationship') ||
    query.includes('boyfriend') ||
    query.includes('girlfriend') ||
    query.includes('husband') ||
    query.includes('wife') ||
    query.includes('dating') ||
    query.includes('ex') ||
    query.includes('compatibility')
  ) {
    const compatible = signInfo.compatibility.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' and ');
    return `Here is simple guidance for your love life and relationships as ${capitalizedSign}:

1. Your Heart's Energy:
Venus brings warmth and connection today. If you are in a relationship, a kind conversation or simple gesture will bring you closer together. If you are single, stay open because genuine connections happen when you are simply yourself.

2. Best Sign Matches:
Your sign naturally harmonizes best with ${compatible}. With these signs, understanding and respect come easily.

3. Simple Advice:
Speak honestly from your heart, listen with patience, and do not rush things. True love grows with mutual trust and care.`;
  }

  // 3. CAREER, JOB, INTERVIEW, PROMOTION
  if (
    query.includes('career') ||
    query.includes('job') ||
    query.includes('work') ||
    query.includes('promotion') ||
    query.includes('interview') ||
    query.includes('profession') ||
    query.includes('boss') ||
    query.includes('salary')
  ) {
    return `Here is what the stars show for your career and job right now as ${capitalizedSign}:

1. Your Professional Strength:
Your planetary positions highlight leadership, hard work, and fresh opportunities. Your natural traits of being ${signInfo.traits.join(' and ')} give you a great advantage at work.

2. Best Steps to Take:
Focus on finishing one important task at a time. If you have an interview, meeting, or project review, speak with quiet confidence and highlight your real results.

3. Helpful Tip:
Stay positive and stay away from workplace drama. Recognition and steady progress are on their way as you remain consistent.`;
  }

  // 4. WEALTH, MONEY, INVESTMENTS, FINANCES
  if (
    query.includes('money') ||
    query.includes('finance') ||
    query.includes('wealth') ||
    query.includes('invest') ||
    query.includes('crypto') ||
    query.includes('stock') ||
    query.includes('debt') ||
    query.includes('loan') ||
    query.includes('rich')
  ) {
    return `Here is a clear look at your money and finances today for ${capitalizedSign}:

1. Financial Outlook:
Your income zone is stable. It is a good time to organize your budget, clear pending bills, and build your savings cushion.

2. Investment Guidance:
Avoid hasty risks or get-rich-quick schemes. Reliable investments with steady growth will serve you far better in the long run.

3. Simple Action:
Focus on creating value with your skills. When you spend thoughtfully and save regularly, financial freedom follows naturally.`;
  }

  // 5. TIMING, AUSPICIOUS HOURS, "IS TODAY A GOOD DAY?"
  if (
    query.includes('today') ||
    query.includes('good day') ||
    query.includes('timing') ||
    query.includes('lucky') ||
    query.includes('luck') ||
    query.includes('auspicious')
  ) {
    return `Yes, today holds very positive and constructive energy for you!

1. Today's Golden Hours:
Your most productive hours are late morning to mid-afternoon. Use this window for important phone calls, new decisions, and creative work.

2. Your Lucky Details:
• Lucky Number: ${signInfo.lucky.number}
• Lucky Color: ${signInfo.lucky.color}
• Lucky Day of the Week: ${signInfo.lucky.day}

3. How to Make the Most of Today:
Start your day with a clear goal in mind. Stay calm, avoid rush, and take one confident step forward. The stars are on your side!`;
  }

  // 6. HEALTH, WELLNESS, INNER PEACE, STRESS
  if (
    query.includes('health') ||
    query.includes('peace') ||
    query.includes('stress') ||
    query.includes('tired') ||
    query.includes('anxiety') ||
    query.includes('sleep') ||
    query.includes('healing')
  ) {
    return `Here is gentle and practical advice for your health and well-being as ${capitalizedSign}:

1. Energy Check:
Your mind has been running fast. Your body is asking for simple rest, plenty of water, and time away from screens.

2. Simple Wellness Steps:
• Take a short 15-minute walk outside in fresh air.
• Practice deep, slow breathing whenever you feel overwhelmed.
• Ensure you get 7 to 8 hours of peaceful sleep tonight.

3. Healing Reminder:
You do not have to carry everything all at once. Give yourself permission to pause and recharge. Your health is your greatest wealth.`;
  }

  // 7. NATAL PLACEMENTS (SUN, MOON, RISING)
  if (
    query.includes('rising') ||
    query.includes('ascendant') ||
    query.includes('moon') ||
    query.includes('sun') ||
    query.includes('house') ||
    query.includes('chart')
  ) {
    return `Here is a simple explanation of your big astrological signs:

1. Sun in ${capitalizedSign}:
This is your core personality, your vitality, and what makes you feel alive. It shows your natural leadership and purpose.

2. Your Moon Sign:
This represents your inner feelings, emotional needs, and how you feel safe and comfortable in private.

3. Your Rising Sign (Ascendant):
This is the face you show the world and how others see your energy when they first meet you.

When all three work together, you feel balanced, happy, and confident in who you are!`;
  }

  // 8. GENERAL LIFE PURPOSE, DESTINY & FUTURE
  return `Here is comforting guidance for your life and path as ${capitalizedSign}:

1. Where You Stand:
You are in a meaningful period of learning, maturity, and personal growth. Past difficulties are turning into valuable wisdom.

2. Your Core Strengths:
You are naturally ${signInfo.traits.join(', ')}. When you trust your own abilities and stay true to yourself, doors begin to open.

3. A Word of Encouragement:
Take life one day at a time with a smile. You have the inner strength to handle any situation, and the stars will always illuminate your way forward.`;
}

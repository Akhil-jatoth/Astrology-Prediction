export const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const ZODIAC_DATA: Record<
  ZodiacSign,
  {
    name: string;
    symbol: string;
    element: string;
    dates: string;
    traits: string[];
    compatibility: ZodiacSign[];
    lucky: { number: number; color: string; day: string };
  }
> = {
  aries: {
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    dates: 'Mar 21 – Apr 19',
    traits: ['Bold', 'Ambitious', 'Energetic', 'Pioneering'],
    compatibility: ['leo', 'sagittarius', 'gemini'],
    lucky: { number: 9, color: 'Red', day: 'Tuesday' },
  },
  taurus: {
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    dates: 'Apr 20 – May 20',
    traits: ['Reliable', 'Patient', 'Devoted', 'Sensual'],
    compatibility: ['virgo', 'capricorn', 'cancer'],
    lucky: { number: 6, color: 'Green', day: 'Friday' },
  },
  gemini: {
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    dates: 'May 21 – Jun 20',
    traits: ['Curious', 'Adaptable', 'Witty', 'Communicative'],
    compatibility: ['libra', 'aquarius', 'aries'],
    lucky: { number: 5, color: 'Yellow', day: 'Wednesday' },
  },
  cancer: {
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    dates: 'Jun 21 – Jul 22',
    traits: ['Nurturing', 'Intuitive', 'Protective', 'Emotional'],
    compatibility: ['scorpio', 'pisces', 'taurus'],
    lucky: { number: 2, color: 'Silver', day: 'Monday' },
  },
  leo: {
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    dates: 'Jul 23 – Aug 22',
    traits: ['Confident', 'Creative', 'Generous', 'Charismatic'],
    compatibility: ['aries', 'sagittarius', 'gemini'],
    lucky: { number: 1, color: 'Gold', day: 'Sunday' },
  },
  virgo: {
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    dates: 'Aug 23 – Sep 22',
    traits: ['Analytical', 'Practical', 'Diligent', 'Modest'],
    compatibility: ['taurus', 'capricorn', 'cancer'],
    lucky: { number: 5, color: 'Navy', day: 'Wednesday' },
  },
  libra: {
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    dates: 'Sep 23 – Oct 22',
    traits: ['Diplomatic', 'Fair', 'Social', 'Harmonious'],
    compatibility: ['gemini', 'aquarius', 'leo'],
    lucky: { number: 6, color: 'Pink', day: 'Friday' },
  },
  scorpio: {
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    dates: 'Oct 23 – Nov 21',
    traits: ['Passionate', 'Resourceful', 'Intense', 'Loyal'],
    compatibility: ['cancer', 'pisces', 'virgo'],
    lucky: { number: 9, color: 'Maroon', day: 'Tuesday' },
  },
  sagittarius: {
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    dates: 'Nov 22 – Dec 21',
    traits: ['Optimistic', 'Adventurous', 'Philosophical', 'Free-spirited'],
    compatibility: ['aries', 'leo', 'libra'],
    lucky: { number: 3, color: 'Purple', day: 'Thursday' },
  },
  capricorn: {
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    dates: 'Dec 22 – Jan 19',
    traits: ['Disciplined', 'Ambitious', 'Responsible', 'Patient'],
    compatibility: ['taurus', 'virgo', 'scorpio'],
    lucky: { number: 8, color: 'Brown', day: 'Saturday' },
  },
  aquarius: {
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    dates: 'Jan 20 – Feb 18',
    traits: ['Innovative', 'Humanitarian', 'Independent', 'Intellectual'],
    compatibility: ['gemini', 'libra', 'sagittarius'],
    lucky: { number: 4, color: 'Blue', day: 'Saturday' },
  },
  pisces: {
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    dates: 'Feb 19 – Mar 20',
    traits: ['Compassionate', 'Artistic', 'Intuitive', 'Dreamy'],
    compatibility: ['cancer', 'scorpio', 'capricorn'],
    lucky: { number: 7, color: 'Sea Green', day: 'Thursday' },
  },
};

export const AI_DISCLAIMER =
  'This reading is generated for guidance and entertainment purposes only and is not a guaranteed prediction. Astrological calculations are astronomically accurate; interpretations are AI-generated.';

export const PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

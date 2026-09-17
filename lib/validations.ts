import { z } from 'zod';

export const birthProfileSchema = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
  birthPlace: z.object({
    name: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    tzOffset: z.number().min(-12).max(14),
  }),
  gender: z.enum(['male', 'female', 'other', 'prefer-not']).optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  name: z.string().optional(),
});

export const chartInputSchema = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  tzOffset: z.number().min(-12).max(14),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = loginSchema.extend({
  name: z.string().min(1).optional(),
});

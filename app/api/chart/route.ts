import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChart } from '@/lib/astro-engine';
import { astrologyInterpreter } from '@/lib/ai/AstrologyInterpreter';
import { chartInputSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { connectDB, isDbConfigured } from '@/lib/db/connect';
import { ChartReading } from '@/lib/db/models/ChartReading';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chartInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const calculated = calculateBirthChart(parsed.data);
    const interpretation = await astrologyInterpreter.interpret({
      type: 'birth-chart',
      chart: calculated,
    });

    const authUser = await getAuthUser(request);
    if (authUser && isDbConfigured()) {
      try {
        await connectDB();
        await ChartReading.create({
          userId: authUser.uid,
          input: parsed.data,
          calculated,
        });
      } catch (dbErr) {
        console.warn('Chart persistence skipped:', dbErr);
      }
    }

    return NextResponse.json({ calculated, interpretation });
  } catch (err) {
    console.error('Chart generation error:', err);
    return NextResponse.json({ error: 'Failed to generate chart' }, { status: 500 });
  }
}

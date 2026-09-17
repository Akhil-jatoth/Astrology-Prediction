import { NextRequest, NextResponse } from 'next/server';
import { astrologyInterpreter } from '@/lib/ai/AstrologyInterpreter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { starName, chart } = body;

    if (!starName || !chart) {
      return NextResponse.json({ error: 'starName and chart are required' }, { status: 400 });
    }

    const interpretation = await astrologyInterpreter.interpret({
      type: 'star-meaning',
      starName,
      chart,
    });

    return NextResponse.json({ interpretation });
  } catch (err) {
    console.error('Star meaning error:', err);
    return NextResponse.json({ error: 'Failed to generate star meaning' }, { status: 500 });
  }
}

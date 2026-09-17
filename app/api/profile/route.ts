import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { connectDB, isDbConfigured } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { birthProfileSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ user: { firebaseUid: authUser.uid, email: authUser.email } });
  }

  await connectDB();
  const user = await User.findOne({ firebaseUid: authUser.uid });
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = birthProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ user: { ...parsed.data, firebaseUid: authUser.uid } });
  }

  await connectDB();
  const user = await User.findOneAndUpdate(
    { firebaseUid: authUser.uid },
    {
      $set: {
        name: parsed.data.name,
        gender: parsed.data.gender,
        country: parsed.data.country,
        language: parsed.data.language ?? 'en',
        birthProfile: {
          dob: parsed.data.dob,
          birthTime: parsed.data.birthTime,
          birthPlace: parsed.data.birthPlace,
        },
      },
      $setOnInsert: {
        firebaseUid: authUser.uid,
        email: authUser.email,
        authProvider: 'email',
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ user });
}

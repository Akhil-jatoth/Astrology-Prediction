import { NextRequest } from 'next/server';
import { verifyIdToken, isAdminConfigured } from '@/lib/firebase/admin';

export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!isAdminConfigured()) return { uid: 'dev-user', email: 'dev@astraverse.local' };

  try {
    const decoded = await verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? '' };
  } catch {
    return null;
  }
}

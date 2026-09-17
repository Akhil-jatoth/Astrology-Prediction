'use client';

import { useEffect, useState } from 'react';
import { subscribeToAuth, isFirebaseConfigured, type FirebaseUser } from '@/lib/firebase/client';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseEnabled = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [firebaseEnabled]);

  const getIdToken = async () => {
    if (!user) return null;
    return user.getIdToken();
  };

  return { user, loading, firebaseEnabled, getIdToken };
}

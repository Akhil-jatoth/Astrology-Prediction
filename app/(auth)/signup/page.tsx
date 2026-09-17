'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail, signInWithGoogle, isFirebaseConfigured } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        router.push('/dashboard/profile');
        return;
      }
      await signUpWithEmail(email, password);
      router.push('/dashboard/profile');
    } catch {
      setError('Could not create account. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        router.push('/dashboard/profile');
        return;
      }
      await signInWithGoogle();
      router.push('/dashboard/profile');
    } catch {
      setError('Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 font-display text-2xl text-gold">Join AstraVerse</h1>
        <p className="mb-6 text-sm text-silver">Begin your cosmic journey</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs text-silver">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-primary/50 px-4 py-2 text-white focus:border-accent-purple focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-silver">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-primary/50 px-4 py-2 text-white focus:border-accent-purple focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs text-silver">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-primary/50 px-4 py-2 text-white focus:border-accent-purple focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-silver/50">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button variant="secondary" className="w-full" onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-silver">
          Already have an account?{' '}
          <Link href="/login" className="text-gold hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}

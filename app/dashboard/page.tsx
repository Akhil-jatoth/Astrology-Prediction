'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useChartStore } from '@/store/useChartStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { lastChart } = useChartStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <p className="text-silver">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28">
      <h1 className="mb-2 font-display text-3xl text-gold">Dashboard</h1>
      <p className="mb-8 text-silver">
        {user
          ? `Welcome, ${user.displayName ?? user.email?.split('@')[0] ?? 'Cosmic Traveler'}`
          : 'Explore as a guest or sign in to save your profile'}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-display text-lg text-white">Birth Chart</h2>
          {lastChart ? (
            <p className="mb-4 text-sm text-silver">
              Sun in <span className="capitalize text-gold">{lastChart.sunSign}</span>, Moon in{' '}
              <span className="capitalize text-gold">{lastChart.moonSign}</span>
            </p>
          ) : (
            <p className="mb-4 text-sm text-silver">No chart generated yet.</p>
          )}
          <Button href="/chart/generate" variant="secondary" className="!px-4 !py-2 text-xs">
            {lastChart ? 'Generate New' : 'Generate Chart'}
          </Button>
        </Card>

        <Card>
          <h2 className="mb-2 font-display text-lg text-white">Daily Horoscope</h2>
          <p className="mb-4 text-sm text-silver">Read today&apos;s guidance for your sign.</p>
          <Button href="/horoscope/daily" variant="secondary" className="!px-4 !py-2 text-xs">
            Read Horoscope
          </Button>
        </Card>

        <Card>
          <h2 className="mb-2 font-display text-lg text-white">Profile</h2>
          <p className="mb-4 text-sm text-silver">Set your birth details for personalized readings.</p>
          <Button href="/dashboard/profile" variant="secondary" className="!px-4 !py-2 text-xs">
            Edit Profile
          </Button>
        </Card>

        <Card>
          <h2 className="mb-2 font-display text-lg text-white">Zodiac Guide</h2>
          <p className="mb-4 text-sm text-silver">Traits, compatibility, and lucky attributes.</p>
          <Button href="/zodiac" variant="secondary" className="!px-4 !py-2 text-xs">
            Browse Signs
          </Button>
        </Card>
      </div>

      {!user && (
        <Card className="mt-8 text-center">
          <p className="mb-4 text-silver">Sign in to save your birth profile and chart history.</p>
          <div className="flex justify-center gap-4">
            <Button href="/login" variant="secondary">
              Log In
            </Button>
            <Button href="/signup">Sign Up</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

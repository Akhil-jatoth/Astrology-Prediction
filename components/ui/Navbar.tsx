'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './Button';

const navLinks = [
  { href: '/horoscope/daily', label: 'Horoscope' },
  { href: '/chart/generate', label: 'Birth Chart' },
  { href: '/zodiac', label: 'Zodiac' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-primary/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-bold text-gold">
          AstraVerse
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={true}
                className={`text-sm transition-colors hover:text-gold ${
                  pathname.startsWith(link.href) ? 'text-gold' : 'text-silver'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <Button href="/dashboard" variant="secondary" className="!px-4 !py-2 text-xs">
              {user.displayName ?? user.email?.split('@')[0] ?? 'Account'}
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" className="!px-4 !py-2 text-xs">
                Log in
              </Button>
              <Button href="/signup" className="!px-4 !py-2 text-xs">
                Sign up
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

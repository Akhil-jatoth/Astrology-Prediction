import { Cinzel, Manrope } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/ui/Navbar';
import { StarField } from '@/components/cosmic/StarField';

import { ZodiacBackground } from '@/components/cosmic/ZodiacBackground';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AstraVerse — Celestial Observatory & Ephemeris',
  description:
    'Generate astronomically accurate birth charts, daily ephemeris transits, and natal insights powered by real celestial calculations and archetypal astrological wisdom.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AstraVerse',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1026',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body>
        <Providers>
          <ZodiacBackground />
          <StarField />
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

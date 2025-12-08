import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Historical Faith Tracker',
  description:
    'Interactive web application for exploring 2,000 years of religious history through timelines, maps, and scholarly analysis.',
  keywords: [
    'religious history',
    'Christianity',
    'church history',
    'timeline',
    'faith',
    'theology',
    'ecumenical councils',
    'reformation',
  ],
  authors: [{ name: 'Historical Faith Tracker Team' }],
  openGraph: {
    title: 'Historical Faith Tracker',
    description:
      'Explore 2,000 years of religious history through interactive timelines and maps.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-faith-cream text-faith-ink`}
      >
        {children}
      </body>
    </html>
  );
}

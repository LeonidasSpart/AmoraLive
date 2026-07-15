import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Amora - Meaningful Connections',
  description: 'Amora is a premium dating platform designed for meaningful connections. Find your perfect match with AI-powered compatibility matching.',
  keywords: ['dating', 'relationships', 'love', 'matchmaking', 'premium dating'],
  authors: [{ name: 'Amora' }],
  openGraph: {
    title: 'Amora - Meaningful Connections',
    description: "Find your perfect match with Amora's AI-powered dating platform",
    type: 'website',
    locale: 'en_US',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ec4899',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

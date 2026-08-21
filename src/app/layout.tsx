import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { NexusProvider } from '@/lib/store/nexusContext';
import { PWARegister } from '@/components/pwa/PWARegister';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#1B3026',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Yggdron Manager — Centro Operacional Private SaaS',
  description: 'Sistema privado de gestão operacional, fechamento diário, alertas e telemetria financeira da Yggdron.',
  manifest: '/manifest.json',
  applicationName: 'Yggdron Manager',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Yggdron Manager',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full overflow-hidden">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} h-full overflow-hidden bg-[#EEF2EE] dark:bg-[#0B120E] text-[#111D15] dark:text-[#F2F6F3] antialiased selection:bg-[#4D7C5D] selection:text-white overscroll-none`}>
        <NexusProvider>
          <PWARegister />
          <AppShell>{children}</AppShell>
        </NexusProvider>
      </body>
    </html>
  );
}

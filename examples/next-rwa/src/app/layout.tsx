import { Auth0Provider } from '@auth0/nextjs-auth0';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import React from 'react';

import { Navbar } from '@/components/navigation/navbar';
import { Sidebar } from '@/components/navigation/side-bar';
import { ClientProvider } from '@/providers/client-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js RWA - Auth0 Universal Components',
  description: 'Next.js Regular Web App with Auth0 Universal Components',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const preferredTheme = cookieStore.get('theme-mode')?.value === 'dark' ? 'dark' : 'light';

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden bg-background`}>
        <Auth0Provider>
          <ClientProvider initialTheme={preferredTheme}>
            <div className="flex flex-col h-screen bg-background" data-theme={'default'}>
              <Navbar />
              <div className="flex flex-1 overflow-hidden min-h-0">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">{children}</main>
              </div>
            </div>
          </ClientProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}

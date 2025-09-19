import { Auth0Provider } from '@auth0/nextjs-auth0';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import { Navbar } from '@/components/navigation/navbar';
import { ClientProvider } from '@/providers/client-provider';

import './globals.css';
import '@auth0-web-ui-components/react/dist/index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js RWA - Auth0 UI Components',
  description: 'Next.js Regular Web App with Auth0 UI Components',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-white`}>
        <Auth0Provider>
          <ClientProvider>
            <div className="min-h-full bg-white">
              <Navbar />
              <main className="min-h-full bg-white">{children}</main>
            </div>
          </ClientProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}

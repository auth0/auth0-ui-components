import { Auth0Provider } from '@auth0/nextjs-auth0';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import { Navbar } from '@/components/navigation/navbar';
import { Sidebar } from '@/components/navigation/side-bar';
import { ClientProvider } from '@/providers/client-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js RWA - Auth0 UI Components',
  description: 'Next.js Regular Web App with Auth0 UI Components',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Auth0Provider>
          <ClientProvider>
            <div className="flex flex-col h-full min-h-screen">
              <Navbar />
              <div className="flex flex-1">
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

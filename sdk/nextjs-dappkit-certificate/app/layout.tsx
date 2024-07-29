'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
const DAppKitProvider = dynamic(
  async () => {
    const { DAppKitProvider: _DAppKitProvider } = await import(
      '@vechain/dapp-kit-react'
    );
    return _DAppKitProvider;
  },
  {
    ssr: false,
  }
);

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionChallenge, setSessionChallenge] = useState<''>();

  useEffect(() => {
    fetch('/api/challenge', {
      method: 'GET',
    })
      .then((result) => result.json())
      .then(({ message }) => setSessionChallenge(message))
      .catch(() => {
        /* ignore */
      });
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <DAppKitProvider
          nodeUrl="https://mainnet.vechain.org/"
          requireCertificate
          usePersistence
          connectionCertificate={{
            message: {
              purpose: 'identification',
              payload: {
                type: 'text',
                content: sessionChallenge,
              },
            },
          }}
        >
          {children}
        </DAppKitProvider>
      </body>
    </html>
  );
}

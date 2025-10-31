import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Private Renovation Budget',
  description: 'Confidentially calculate renovation costs with encrypted blockchain data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

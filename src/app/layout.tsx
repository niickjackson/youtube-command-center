import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube Command Center',
  description: 'Long-form content pipeline management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-space-black text-white antialiased">
        <div className="starfield" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

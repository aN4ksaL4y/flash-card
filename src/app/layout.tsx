import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth-provider';
import Script from 'next/script';
import { firebaseConfig } from '@/lib/firebase';

export const metadata: Metadata = {
  title: 'FlashZen',
  description: 'A simple, effective flashcard app for memorization and learning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,701&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Script src="https://apis.google.com/js/api.js" async defer />
        <Script src="https://accounts.google.com/gsi/client" async defer />
      </body>
    </html>
  );
}

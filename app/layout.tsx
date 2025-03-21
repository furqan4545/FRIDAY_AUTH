import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friday - AI Voice-to-Text Transcription",
  description: "Command Friday to write effortlessly with just your voice. The fastest AI voice-to-text app for Mac.",
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' },
    { rel: 'icon', url: '/Friday_Icons/icon1.png', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/Friday_Icons/icon1.png' }
  ],
  openGraph: {
    title: "Friday - AI Voice-to-Text Transcription",
    description: "Command Friday to write effortlessly with just your voice. The fastest AI voice-to-text app for Mac.",
    images: ['/Friday_Icons/icon1.png'],
    type: 'website',
    url: 'https://friday.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Friday - AI Voice-to-Text Transcription",
    description: "Command Friday to write effortlessly with just your voice. The fastest AI voice-to-text app for Mac.",
    images: ['/Friday_Icons/icon1.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/Friday_Icons/icon1.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Friday_Icons/icon1.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen h-full`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

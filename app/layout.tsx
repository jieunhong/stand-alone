import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stand-Alone | 온전한 홀로서기를 위한 자립 기록",
  description: "당신의 루틴과 마음을 관리하는 가장 다정한 방법, 스탠드-얼론(Stand-Alone).",
  openGraph: {
    title: "Stand-Alone | 자립 기록",
    description: "오늘의 나를 기록하고, 온전한 홀로서기로 나아가세요.",
    url: "https://stand-alone.bbubbu.me", // Fallback, but ideally should be dynamic
    siteName: "Stand-Alone",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Stand-Alone 서비스 배너",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stand-Alone | 자립 기록",
    description: "오늘의 나를 기록하고, 온전한 홀로서기로 나아가세요.",
    images: ["/banner.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full overflow-x-hidden`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

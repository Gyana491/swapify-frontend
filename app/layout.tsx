import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Swapify - Buy and Sell Used Products Near You!",
    template: "%s | Swapify"
  },
  description: "Buy and sell used items in your local area with Swapify. Find great deals on electronics, vehicles, furniture and more from trusted sellers near you. Join India's fastest growing local marketplace today!",
  keywords: ["swap", "trade", "local marketplace", "community trading", "item exchange", "sustainable shopping"],
  authors: [{ name: "Swapify Team" }],
  creator: "Swapify",
  publisher: "Swapify",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Swapify",
    title: "Swapify - Buy and Sell Used Products Near You!",
    description: "Buy and sell used items in your local area with Swapify. Find great deals on electronics, vehicles, furniture and more from trusted sellers near you. Join India's fastest growing local marketplace today!",
    images: [
      {
        url: "/assets/swapify.jpg",
        width: 1200,
        height: 630,
        alt: "Swapify - Buy and Sell Used Products Near You!"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Swapify - Buy and Sell Used Products Near You!",
    description: "Buy and sell used items in your local area with Swapify. Find great deals on electronics, vehicles, furniture and more from trusted sellers near you. Join India's fastest growing local marketplace today!",
    images: ["/assets/swapify.jpg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
